import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import { Application } from "@/models/Application";
import { Company } from "@/models/Company";
import { Job } from "@/models/Job";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const [
      totalUsers,
      totalJobs,
      activeJobs,
      totalApplications,
      totalCompanies,
      pendingJobs,
      pendingCompanies,
    ] = await Promise.all([
      User.countDocuments(),
      Job.countDocuments(),
      Job.countDocuments({ status: 'active' }),
      Application.countDocuments(),
      Company.countDocuments(),
      Job.countDocuments({ status: 'pending' }),
      Company.countDocuments({ isVerified: false }),
    ]);

    return NextResponse.json({
      stats: {
        totalUsers,
        totalJobs,
        activeJobs,
        totalApplications,
        totalCompanies,
        pendingJobs,
        pendingCompanies,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
