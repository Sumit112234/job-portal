import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import { Job } from "@/models/Job";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { Company } from "@/models/Company";

export async function GET(req) {
  // try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const pendingJobs = await Job.find({ status: 'pending' })
      .populate('company')
      .sort({ createdAt: -1 });

    return NextResponse.json({ jobs: pendingJobs });
  // } catch (error) {
  //   return NextResponse.json(
  //     { error: 'Failed to fetch pending jobs' },
  //     { status: 500 }
  //   );
  // }
}