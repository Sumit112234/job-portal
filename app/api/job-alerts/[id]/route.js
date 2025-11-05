export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    await JobAlert.findOneAndDelete({
      _id: params.id,
      user: session.user.id,
    });

    return NextResponse.json({
      message: 'Alert deleted successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete alert' },
      { status: 500 }
    );
  }
}

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

    const data = await req.json();
    const alert = await JobAlert.findOneAndUpdate(
      { _id: params.id, user: session.user.id },
      data,
      { new: true }
    );

    return NextResponse.json({
      message: 'Alert updated successfully',
      alert,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update alert' },
      { status: 500 }
    );
  }
}
