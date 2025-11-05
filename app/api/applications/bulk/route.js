export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'seeker') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { action, applicationIds } = await req.json();

    if (!action || !applicationIds || !Array.isArray(applicationIds)) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'withdraw':
        // Withdraw multiple applications
        result = await Application.deleteMany({
          _id: { $in: applicationIds },
          applicant: session.user.id,
          status: { $in: ['pending', 'reviewing'] },
        });

        // Update job application counts
        const applications = await Application.find({
          _id: { $in: applicationIds },
        });
        
        for (const app of applications) {
          await Job.findByIdAndUpdate(app.job, {
            $inc: { applicationCount: -1 },
          });
        }
        break;

      case 'mark-read':
        // Mark applications as read/viewed
        result = await Application.updateMany(
          {
            _id: { $in: applicationIds },
            applicant: session.user.id,
          },
          {
            $set: { viewed: true },
          }
        );
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      message: `${action} completed successfully`,
      affected: result.modifiedCount || result.deletedCount || 0,
    });
  } catch (error) {
    console.error('Error performing bulk operation:', error);
    return NextResponse.json(
      { error: 'Failed to perform operation' },
      { status: 500 }
    );
  }
}
