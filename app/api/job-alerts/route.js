import { JobAlert } from '@/models/JobAlert';

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

    const alerts = await JobAlert.find({ user: session.user.id })
      .sort({ createdAt: -1 });

    return NextResponse.json({ alerts });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
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

    const data = await req.json();
    const alert = await JobAlert.create({
      ...data,
      user: session.user.id,
    });

    return NextResponse.json({
      message: 'Job alert created successfully',
      alert,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create alert' },
      { status: 500 }
    );
  }
}
