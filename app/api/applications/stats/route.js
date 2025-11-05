export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'seeker') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const applications = await Application.find({ applicant: session.user.id });

    const stats = {
      total: applications.length,
      pending: applications.filter(a => a.status === 'pending').length,
      reviewing: applications.filter(a => a.status === 'reviewing').length,
      shortlisted: applications.filter(a => a.status === 'shortlisted').length,
      accepted: applications.filter(a => a.status === 'accepted').length,
      rejected: applications.filter(a => a.status === 'rejected').length,
    };

    // Calculate response rate
    const responded = stats.shortlisted + stats.accepted + stats.rejected;
    stats.responseRate = stats.total > 0 
      ? Math.round((responded / stats.total) * 100) 
      : 0;

    // Get recent applications (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentApplications = applications.filter(
      app => new Date(app.createdAt) >= sevenDaysAgo
    );
    stats.recentApplications = recentApplications.length;

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error fetching application stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}