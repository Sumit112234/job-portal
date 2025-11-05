export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const application = await Application.findById(params.id)
      .populate({
        path: 'job',
        populate: { path: 'company' },
      })
      .populate('applicant', 'name email phone location skills experience resume');

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Check authorization
    const isApplicant = application.applicant._id.toString() === session.user.id;
    const isEmployer = session.user.role === 'employer';
    const isAdmin = session.user.role === 'admin';

    if (!isApplicant && !isEmployer && !isAdmin) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({ application });
  } catch (error) {
    console.error('Error fetching application:', error);
    return NextResponse.json(
      { error: 'Failed to fetch application' },
      { status: 500 }
    );
  }
}

// PATCH - Update application (for applicant to update documents)
export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const application = await Application.findById(params.id);

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Check if user owns this application
    if (application.applicant.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const { resume, coverLetter } = await req.json();

    // Only allow updates for pending applications
    if (application.status !== 'pending') {
      return NextResponse.json(
        { error: 'Cannot update application after it has been reviewed' },
        { status: 400 }
      );
    }

    // Update application
    if (resume) application.resume = resume;
    if (coverLetter !== undefined) application.coverLetter = coverLetter;
    
    await application.save();

    const updatedApplication = await Application.findById(params.id)
      .populate({
        path: 'job',
        populate: { path: 'company', select: 'name logo' },
      });

    return NextResponse.json({
      message: 'Application updated successfully',
      application: updatedApplication,
    });
  } catch (error) {
    console.error('Error updating application:', error);
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    );
  }
}