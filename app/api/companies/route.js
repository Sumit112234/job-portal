import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { Company } from '@/models/Company';
import { Job } from '@/models/Job';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';


export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role === 'seeker') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Check if user already has a company
    // const existingCompany = await Company.findOne({ owner: session.user.id });
    // if (existingCompany) {
    //   return NextResponse.json(
    //     { error: 'Company already exists' },
    //     { status: 400 }
    //   );
    // }

    const data = await req.json();
    const company = await Company.create({
      ...data,
      owner: [session.user.id],
      isVerified: false,
    });

    // company.owner.push(session.user.id);
    // await company.save();

    // Update user with company reference
    await User.findByIdAndUpdate(session.user.id, {
      company: company._id,
    });

    return NextResponse.json({
      message: 'Company created successfully',
      company,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create company' },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    const companies = await Company.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Company.countDocuments();

    // Get job count for each company
    const companiesWithJobs = await Promise.all(
      companies.map(async (company) => {
        const jobCount = await Job.countDocuments({
          company: company._id,
          status: 'active',
        });
        return {
          ...company.toObject(),
          jobCount,
        };
      })
    );

    return NextResponse.json({
      companies: companiesWithJobs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch companies' },
      { status: 500 }
    );
  }
}