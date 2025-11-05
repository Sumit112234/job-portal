import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { Company } from "@/models/Company";
import { Application } from "@/models/Application";
import { Job } from "@/models/Job";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'employer') {
      return NextResponse.json(
        { error: 'Unauthorized - Employers only' },
        { status: 401 }
      );
    }

    await connectDB();

    // Get employer's company
    const user = await User.findById(session.user.id);
    if (!user.company) {
      return NextResponse.json(
        { error: 'No company found for this user' },
        { status: 400 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const jobId = searchParams.get('jobId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build query
    let jobQuery = { company: user.company };
    if (jobId) {
      jobQuery._id = jobId;
    }

    // Get all jobs for this company
    const jobs = await Job.find(jobQuery);
    const jobIds = jobs.map(job => job._id);

    // Build application query
    let appQuery = { job: { $in: jobIds } };
    if (status) {
      appQuery.status = status;
    }

    // Fetch applications with pagination
    const applications = await Application.find(appQuery)
      .populate('applicant', 'name email phone location skills experience resume avatar')
      .populate({
        path: 'job',
        select: 'title location type salary',
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Application.countDocuments(appQuery);

    // Get stats by status
    const stats = {
      total: await Application.countDocuments({ job: { $in: jobIds } }),
      pending: await Application.countDocuments({ job: { $in: jobIds }, status: 'pending' }),
      reviewing: await Application.countDocuments({ job: { $in: jobIds }, status: 'reviewing' }),
      shortlisted: await Application.countDocuments({ job: { $in: jobIds }, status: 'shortlisted' }),
      accepted: await Application.countDocuments({ job: { $in: jobIds }, status: 'accepted' }),
      rejected: await Application.countDocuments({ job: { $in: jobIds }, status: 'rejected' }),
    };

    return NextResponse.json({
      applications,
      stats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching employer applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}