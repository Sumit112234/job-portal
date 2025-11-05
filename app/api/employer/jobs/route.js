import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import { Job } from "@/models/Job";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { Company } from "@/models/Company";
import { getServerSession } from "next-auth";

export async function GET(req) {
  // try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'employer') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findById(session.user.id);
    if (!user.company) {
      return NextResponse.json(
        { error: 'No company found' },
        { status: 400 }
      );
    }

    const jobs = await Job.find({ company: user.company })
      .populate('company')
      .sort({ createdAt: -1 });

    return NextResponse.json({ jobs });
  // } catch (error) {
  //   return NextResponse.json(
  //     { error: 'Failed to fetch jobs' },
  //     { status: 500 }
  //   );
  // }
}