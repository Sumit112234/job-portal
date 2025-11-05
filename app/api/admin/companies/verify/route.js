import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import { Company } from "@/models/Company";
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

    const { companyId, action } = await req.json();

    if (action === 'verify') {
      await Company.findByIdAndUpdate(companyId, { isVerified: true });
    } else if (action === 'reject') {
      await Company.findByIdAndUpdate(companyId, { isVerified: false });
    }

    return NextResponse.json({
      message: `Company ${action === 'verify' ? 'verified' : 'rejected'} successfully`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update company' },
      { status: 500 }
    );
  }
}