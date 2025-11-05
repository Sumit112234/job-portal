import { SavedJob } from '@/models/SavedJob';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const savedJobs = await SavedJob.find({ user: session.user.id })
      .populate({
        path: 'job',
        populate: { path: 'company', select: 'name logo' },
      })
      .sort({ createdAt: -1 });

    return NextResponse.json({ savedJobs });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch saved jobs' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { jobId } = await req.json();

    const savedJob = await SavedJob.create({
      user: session.user.id,
      job: jobId,
    });

    return NextResponse.json({
      message: 'Job saved successfully',
      savedJob,
    }, { status: 201 });
  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Job already saved' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to save job' },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const jobId = searchParams.get('jobId');

    await SavedJob.deleteOne({
      user: session.user.id,
      job: jobId,
    });

    return NextResponse.json({
      message: 'Job removed from saved',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to remove saved job' },
      { status: 500 }
    );
  }
}