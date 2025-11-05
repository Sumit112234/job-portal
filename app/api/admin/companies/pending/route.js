import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import { Company } from "@/models/Company";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import User from "@/models/User";

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

    const pendingCompanies = await Company.find({ isVerified: false })
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json({ companies: pendingCompanies });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch pending companies' },
      { status: 500 }
    );
  }
}
