import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import { Company } from "@/models/Company";
import { Job } from "@/models/Job";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await connectDB();

    // console.log(req.params, params)
    let para = await params

    const company = await Company.findById(para.id);
  

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    const jobs = await Job.find({ 
      company: company._id, 
      status: 'active' 
    });

    return NextResponse.json({ 
      company: company.toObject(),
      jobs 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch company' },
      { status: 500 }
    );
  }
}

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'employer') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const data = await req.json();
    const company = await Company.findOneAndUpdate(
      { _id: params.id, owner: session.user.id },
      data,
      { new: true }
    );

    return NextResponse.json({
      message: 'Company updated successfully',
      company,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update company' },
      { status: 500 }
    );
  }
}
