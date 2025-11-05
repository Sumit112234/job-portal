import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import { Company } from '@/models/Company';

// PUT /api/users/company - Associate user with existing verified company
export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'employer') {
      return NextResponse.json({ 
        error: 'Only employers can be associated with companies' 
      }, { status: 403 });
    }

    await connectDB();

    const { companyId } = await req.json();

    if (!companyId) {
      return NextResponse.json({ 
        error: 'Company ID is required' 
      }, { status: 400 });
    }

    // Check if company exists and is verified
    const company = await Company.findById(companyId);
    
    if (!company) {
      return NextResponse.json({ 
        error: 'Company not found' 
      }, { status: 404 });
    }

    if (!company.isVerified) {
      return NextResponse.json({ 
        error: 'Company is not verified. Please select a verified company.' 
      }, { status: 400 });
    }

    // Get current user to check if they have an existing company
    const currentUser = await User.findById(session.user.id);
    
    // If user already has a company, remove them from old company's owner array
    if (currentUser.company && currentUser.company.toString() !== companyId) {
      await Company.findByIdAndUpdate(
        currentUser.company,
        { $pull: { owner: session.user.id } }
      );
    }

    // Update user with company association
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { 
        company: companyId,
        isCompanyVerified: true // Since we're associating with a verified company
      },
      { new: true }
    )
      .populate('company')
      .select('-password');

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Add user to company's owner array if not already present
    await Company.findByIdAndUpdate(
      companyId,
      { $addToSet: { owner: session.user.id } }, // $addToSet prevents duplicates
      { new: true }
    );

    return NextResponse.json({ 
      message: 'Company associated successfully',
      user: updatedUser 
    }, { status: 200 });

  } catch (error) {
    console.error('Company association error:', error);
    return NextResponse.json({ 
      error: 'Failed to associate company' 
    }, { status: 500 });
  }
}

// DELETE /api/users/company - Remove company association
export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'employer') {
      return NextResponse.json({ 
        error: 'Only employers have company associations' 
      }, { status: 403 });
    }

    await connectDB();

    // Get current user to find their company
    const currentUser = await User.findById(session.user.id);
    
    if (currentUser.company) {
      // Remove user from company's owner array
      await Company.findByIdAndUpdate(
        currentUser.company,
        { $pull: { owner: session.user.id } }
      );
    }

    // Update user - remove company association
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { 
        company: null,
        isCompanyVerified: false
      },
      { new: true }
    )
      .select('-password');

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Company association removed',
      user: updatedUser 
    }, { status: 200 });

  } catch (error) {
    console.error('Company removal error:', error);
    return NextResponse.json({ 
      error: 'Failed to remove company association' 
    }, { status: 500 });
  }
}