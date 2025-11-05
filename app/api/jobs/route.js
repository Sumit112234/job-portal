import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { Job } from '@/models/Job';
import { Company } from '@/models/Company';
import User from '@/models/User';

export async function GET(req) {
  try {
    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get('search');
    const location = searchParams.get('location');
    const type = searchParams.get('type');
    const experience = searchParams.get('experience');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    let query = { status: 'active' };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (type) {
      query.type = type;
    }

    if (experience) {
      query.experience = experience;
    }

    console.log('Job Query:', query);

    const jobs = await Job.find(query)
      .populate('company', 'name logo location')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Job.countDocuments(query);

    return NextResponse.json({
      jobs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'employer') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    console.log({session})

    const user = await User.findById({_id : session.user.id});

    if(!user.company){
      return NextResponse.json({
        error: 'Employer does not have an associated company',
      }, { status: 400 });
    }
      
    // throw new Error('Test error');

    const data = await req.json();
    console.log('Job Data:', data);
    const job = await Job.create({
      ...data,
      company: user.company,
      status: 'pending', // Admin approval required
    });

    return NextResponse.json({
      message: 'Job posted successfully',
      job,
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create job' },
      { status: 500 }
    );
  }
}