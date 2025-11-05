import { authOptions } from '@/lib/auth';
import { sendApplicationStatusUpdate } from '@/lib/email';
import connectDB from '@/lib/mongodb';
import { Application } from '@/models/Application';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { Job } from '@/models/Job';
import { Company } from '@/models/Company';
import User from '@/models/User';

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

    let para = await params

    const application = await Application.findById(para.id)
      .populate('applicant', 'name email phone location skills experience education resume avatar')
      .populate({
        path: 'job',
        populate: { path: 'company' },
      });

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Verify employer owns this job
    const user = await User.findById(session.user.id);
    if (application.job.company._id.toString() !== user.company.toString()) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({ application });
  } catch (error) {
    console.error('Error fetching application:', error);
    return NextResponse.json(
      { error: 'Failed to fetch application' },
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

    const { status, notes } = await req.json();

    // Validate status
    const validStatuses = ['pending', 'reviewing', 'shortlisted', 'rejected', 'accepted'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    let para = await params

    const application = await Application.findById(para.id)
      .populate('applicant', 'email name')
      .populate('job', 'title');

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Verify employer owns this job
    const job = await Job.findById(application.job._id).populate('company');
    const user = await User.findById(session.user.id);
    
    if (job.company._id.toString() !== user.company.toString()) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Update application
    if (status) application.status = status;
    if (notes !== undefined) application.notes = notes;
    
    await application.save();

    // Send email notification to applicant if status changed
    if (status && status !== application.status) {
      await sendApplicationStatusUpdate(
        application.applicant.email,
        application.job.title,
        status
      );
    }

    const updatedApplication = await Application.findById(para.id)
      .populate('applicant', 'name email phone location skills experience')
      .populate('job', 'title location type salary');

    return NextResponse.json({
      message: 'Application updated successfully',
      application: updatedApplication,
    });
  } catch (error) {
    console.error('Error updating application:', error);
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    );
  }
}
