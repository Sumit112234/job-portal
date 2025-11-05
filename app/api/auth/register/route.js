import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(req) {
  try {
    const { name, email, password, role, location, phone,companyId } = await req.json();
    console.log('Registration data received:', { name, email, role, location, phone, companyId });

    await connectDB();

    // throw new Error('Test error');

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'seeker',
      location,
      phone,
      company : companyId || null,
    });

    await sendWelcomeEmail(email, name);

    return NextResponse.json({
      message: 'User created successfully',
      userId: user._id,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}