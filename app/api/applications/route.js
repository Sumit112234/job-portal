import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { Application } from '@/models/Application';
import { Job } from '@/models/Job';
import User from '@/models/User';
import { Company } from '@/models/Company';
import { sendApplicationConfirmation, sendNewApplicationAlert } from '@/lib/email';

// GET - Fetch user's applications (Job Seeker)
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get('status'); // Filter by status

    let query = { applicant: session.user.id };
    if (status) {
      query.status = status;
    }

    const applications = await Application.find(query)
      .populate({
        path: 'job',
        populate: { 
          path: 'company', 
          select: 'name logo location' 
        },
      })
      .sort({ createdAt: -1 });

    return NextResponse.json({ 
      applications,
      total: applications.length 
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}

// POST - Submit new application
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'seeker') {
      return NextResponse.json(
        { error: 'Unauthorized - Job seekers only' },
        { status: 401 }
      );
    }

    await connectDB();

    const { jobId, resume, coverLetter } = await req.json();

    // Validate input
    if (!jobId || !resume) {
      return NextResponse.json(
        { error: 'Job ID and resume are required' },
        { status: 400 }
      );
    }

    // Check if job exists and is active
    const job = await Job.findById(jobId).populate('company');
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    if (job.status !== 'active') {
      return NextResponse.json(
        { error: 'This job is no longer accepting applications' },
        { status: 400 }
      );
    }
    

    // Check if already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: session.user.id,
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already applied to this job' },
        { status: 400 }
      );
    }

    // Create application
    const application = await Application.create({
      job: jobId,
      applicant: session.user.id,
      resume,
      coverLetter: coverLetter || '',
      status: 'pending',
    });

    // Update job application count
    await Job.findByIdAndUpdate(jobId, {
      $inc: { applicationCount: 1 },
    });

    // Get user details for email
    const user = await User.findById(session.user.id);

    // Send confirmation email to applicant
    await sendApplicationConfirmation(
      user.email,
      job.title,
      job.company.name
    );

    // Send notification email to employer
    const companyOwner = await User.findById(job.company.owner);
    if (companyOwner) {
      await sendNewApplicationAlert(
        companyOwner.email,
        job.title,
        user.name
      );
    }

    // Populate and return created application
    const populatedApplication = await Application.findById(application._id)
      .populate({
        path: 'job',
        populate: { path: 'company', select: 'name logo' },
      })
      .populate('applicant', 'name email');

    return NextResponse.json({
      message: 'Application submitted successfully',
      application: populatedApplication,
    }, { status: 201 });
  } catch (error) {
    console.error('Error submitting application:', error);
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    );
  }
}

// DELETE - Withdraw application
export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'seeker') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const applicationId = searchParams.get('id');

    if (!applicationId) {
      return NextResponse.json(
        { error: 'Application ID is required' },
        { status: 400 }
      );
    }

    // Find application and verify ownership
    const application = await Application.findOne({
      _id: applicationId,
      applicant: session.user.id,
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Only allow withdrawal if status is 'pending' or 'reviewing'
    if (!['pending', 'reviewing'].includes(application.status)) {
      return NextResponse.json(
        { error: 'Cannot withdraw application in current status' },
        { status: 400 }
      );
    }

    // Delete application
    await Application.findByIdAndDelete(applicationId);

    // Decrease job application count
    await Job.findByIdAndUpdate(application.job, {
      $inc: { applicationCount: -1 },
    });

    return NextResponse.json({
      message: 'Application withdrawn successfully',
    });
  } catch (error) {
    console.error('Error withdrawing application:', error);
    return NextResponse.json(
      { error: 'Failed to withdraw application' },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const data = await req.json();
    
    // Remove sensitive fields
    delete data.password;
    delete data.email;
    delete data.role;

    const user = await User.findByIdAndUpdate(
      session.user.id,
      data,
      { new: true }
    ).select('-password');

    return NextResponse.json({
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}