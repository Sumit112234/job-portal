import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import { Job } from "@/models/Job";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { jobId, action } = await req.json();

    if (action === 'approve') {
      await Job.findByIdAndUpdate(jobId, { status: 'active' });
    } else if (action === 'reject') {
      await Job.findByIdAndUpdate(jobId, { status: 'closed' });
    }

    return NextResponse.json({
      message: `Job ${action}d successfully`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update job' },
      { status: 500 }
    );
  }
}
