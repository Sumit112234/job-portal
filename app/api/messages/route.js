import { Message } from '@/models/Message';

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

    const searchParams = req.nextUrl.searchParams;
    const otherUserId = searchParams.get('userId');

    const messages = await Message.find({
      $or: [
        { sender: session.user.id, receiver: otherUserId },
        { sender: otherUserId, receiver: session.user.id },
      ],
    })
      .sort({ createdAt: 1 })
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar');

    // Mark messages as read
    await Message.updateMany(
      { sender: otherUserId, receiver: session.user.id, read: false },
      { read: true }
    );

    return NextResponse.json({ messages });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
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

    const { receiverId, content, applicationId } = await req.json();

    const message = await Message.create({
      sender: session.user.id,
      receiver: receiverId,
      application: applicationId,
      content,
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar');

    return NextResponse.json({
      message: 'Message sent',
      data: populatedMessage,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}