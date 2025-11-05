export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'employer') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { applicationIds, status, notes } = await req.json();

    if (!applicationIds || !Array.isArray(applicationIds) || !status) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }

    // Verify employer owns these applications
    const user = await User.findById(session.user.id);
    const jobs = await Job.find({ company: user.company });
    const jobIds = jobs.map(j => j._id);

    const applications = await Application.find({
      _id: { $in: applicationIds },
      job: { $in: jobIds },
    }).populate('applicant', 'email')
      .populate('job', 'title');

    if (applications.length !== applicationIds.length) {
      return NextResponse.json(
        { error: 'Some applications not found or access denied' },
        { status: 403 }
      );
    }

    // Update all applications
    await Application.updateMany(
      { _id: { $in: applicationIds } },
      { 
        $set: { 
          status,
          ...(notes && { notes }),
        }
      }
    );

    // Send email notifications
    for (const app of applications) {
      await sendApplicationStatusUpdate(
        app.applicant.email,
        app.job.title,
        status
      );
    }

    return NextResponse.json({
      message: `${applications.length} applications updated successfully`,
      updated: applications.length,
    });
  } catch (error) {
    console.error('Error bulk updating applications:', error);
    return NextResponse.json(
      { error: 'Failed to update applications' },
      { status: 500 }
    );
  }
}