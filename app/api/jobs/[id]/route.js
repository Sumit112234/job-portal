import { Job } from "@/models/Job";
import { Company } from "@/models/Company";
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req, { params }) {
  try {

     const session = await getServerSession(authOptions);
    if (!session ) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    await connectDB();

    let para = await params

    // console.log({par});

    const job = await Job.findById(para.id)
      .populate('company', 'name description logo website location size industry');

      
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Increment view count
    job.views += 1;
    await job.save();

    return NextResponse.json({ job , userId : session.user.id});
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch job' },
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
    const job = await Job.findByIdAndUpdate(
      params.id,
      data,
      { new: true }
    );

    return NextResponse.json({
      message: 'Job updated successfully',
      job,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update job' },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'employer') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    await Job.findByIdAndUpdate(params.id, { status: 'closed' });

    return NextResponse.json({
      message: 'Job closed successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to close job' },
      { status: 500 }
    );
  }
}