
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import { Job } from "@/models/Job";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

// DELETE - Delete a job
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

    const user = await User.findById(session.user.id);
    if (!user.company) {
      return NextResponse.json(
        { error: 'No company found' },
        { status: 400 }
      );
    }

    const { id } = await params;

    // Find the job and verify it belongs to the employer's company
    const job = await Job.findById(id);
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    if (job.company.toString() !== user.company.toString()) {
      return NextResponse.json(
        { error: 'Not authorized to delete this job' },
        { status: 403 }
      );
    }

    await Job.findByIdAndDelete(id);

    return NextResponse.json({ 
      message: 'Job deleted successfully',
      success: true 
    });
  } catch (error) {
    console.error('Delete job error:', error);
    return NextResponse.json(
      { error: 'Failed to delete job' },
      { status: 500 }
    );
  }
}

// PUT - Update a job
export async function PUT(req, { params }) {
  try {
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

    const { id } = await params;
    const body = await req.json();

    // Find the job and verify it belongs to the employer's company
    const job = await Job.findById(id);
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    if (job.company.toString() !== user.company.toString()) {
      return NextResponse.json(
        { error: 'Not authorized to update this job' },
        { status: 403 }
      );
    }

    // Update fields
    const updateFields = {
      title: body.title,
      description: body.description,
      location: body.location,
      type: body.type,
      status: body.status,
      requirements: body.requirements,
      responsibilities: body.responsibilities,
      benefits: body.benefits,
      salaryMin: body.salaryMin,
      salaryMax: body.salaryMax,
      salaryCurrency: body.salaryCurrency,
      experienceLevel: body.experienceLevel,
      category: body.category,
      skills: body.skills,
    };

    // Remove undefined fields
    Object.keys(updateFields).forEach(key => 
      updateFields[key] === undefined && delete updateFields[key]
    );

    updateFields.benefits = updateFields.benefits.join(',')
    updateFields.requirements = updateFields.requirements.join(',')
  

    console.log('Updating job with ID:', id, 'with data:', updateFields);

    const updatedJob = await Job.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).populate('company');

    return NextResponse.json({ 
      message: 'Job updated successfully',
      job: updatedJob,
      success: true 
    });
  } catch (error) {
    console.error('Update job error:', error);
    return NextResponse.json(
      { error: 'Failed to update job' },
      { status: 500 }
    );
  }
}

// GET - Get single job details
export async function GET(req, { params }) {
  try {
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

    const { id } = await params;
    console.log('Fetching job with ID:', id);

    const job = await Job.findById(id).populate('company');
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    if (job.company._id.toString() !== user.company.toString()) {
      return NextResponse.json(
        { error: 'Not authorized to view this job' },
        { status: 403 }
      );
    }

    return NextResponse.json({ job });
  } catch (error) {
    console.error('Get job error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job' },
      { status: 500 }
    );
  }
}