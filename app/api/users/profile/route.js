import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import { Company } from '@/models/Company';

// GET /api/users/profile - Get current user profile
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.user.id)
      .populate('company')
      .select('-password');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      profile: user 
    }, { status: 200 });

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch profile' 
    }, { status: 500 });
  }
}

// PUT /api/users/profile - Update current user profile
export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const data = await req.json();
    
    // Fields that can be updated
    const allowedFields = {
      name: data.name,
      phone: data.phone,
      location: data.location,
      bio: data.bio,
      skills: data.skills,
      experience: data.experience,
      education: data.education,
      avatar: data.avatar,
      resume: data.resume,
    };

    // Remove undefined fields
    Object.keys(allowedFields).forEach(key => {
      if (allowedFields[key] === undefined) {
        delete allowedFields[key];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { $set: allowedFields },
      { new: true, runValidators: true }
    )
      .populate('company')
      .select('-password');

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Profile updated successfully',
      profile: updatedUser 
    }, { status: 200 });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ 
      error: 'Failed to update profile' 
    }, { status: 500 });
  }
}

// import { NextResponse } from 'next/server';
// import bcrypt from 'bcryptjs';
// import { jwtVerify } from 'jose';
// import connectDB from '@/lib/mongodb';
// import User from '@/models/User';

// const JWT_SECRET = process.env.NEXTAUTH_SECRET;
// const encodedKey = new TextEncoder().encode(JWT_SECRET);

// // Helper function to verify JWT token
// async function verifyToken(request) {
//   try {
//     const token = request.cookies.get('token')?.value;
    
//     if (!token) {
//       return { error: 'Unauthorized - No token provided', status: 401 };
//     }

//     const { payload } = await jwtVerify(token, encodedKey);
//     return { userId: payload.userId, role: payload.role };
//   } catch (error) {
//     return { error: 'Unauthorized - Invalid token', status: 401 };
//   }
// }

// // GET - Fetch user profile
// export async function GET(req) {
//   try {
//     const auth = await verifyToken(req);
//     if (auth.error) {
//       return NextResponse.json({ error: auth.error }, { status: auth.status });
//     }

//     await connectDB();

//     // Get userId from query params or use authenticated user's ID
//     const { searchParams } = new URL(req.url);
//     const requestedUserId = searchParams.get('userId');
    
//     // Allow fetching own profile or if admin
//     const userId = requestedUserId && auth.role === 'admin' 
//       ? requestedUserId 
//       : auth.userId;

//     const user = await User.findById(userId)
//       .select('-password')
//       .populate('company', 'name logo');

//     if (!user) {
//       return NextResponse.json(
//         { error: 'User not found' },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json(
//       { 
//         message: 'User fetched successfully',
//         user 
//       },
//       { status: 200 }
//     );

//   } catch (error) {
//     console.error('Get user error:', error);
//     return NextResponse.json(
//       { error: 'Failed to fetch user' },
//       { status: 500 }
//     );
//   }
// }

// // PUT - Update user profile
// export async function PUT(req) {
//   try {
//     const auth = await verifyToken(req);
//     if (auth.error) {
//       return NextResponse.json({ error: auth.error }, { status: auth.status });
//     }

//     const updates = await req.json();
    
//     // Remove fields that shouldn't be updated directly
//     const {
//       password: newPassword,
//       email,
//       role,
//       isVerified,
//       emailVerified,
//       isCompanyVerified,
//       _id,
//       ...allowedUpdates
//     } = updates;

//     await connectDB();

//     const user = await User.findById(auth.userId);
    
//     if (!user) {
//       return NextResponse.json(
//         { error: 'User not found' },
//         { status: 404 }
//       );
//     }

//     // Handle password update separately
//     if (newPassword) {
//       if (newPassword.length < 6) {
//         return NextResponse.json(
//           { error: 'Password must be at least 6 characters' },
//           { status: 400 }
//         );
//       }
//       const hashedPassword = await bcrypt.hash(newPassword, 10);
//       user.password = hashedPassword;
//     }

//     // Update allowed fields
//     Object.keys(allowedUpdates).forEach(key => {
//       if (allowedUpdates[key] !== undefined) {
//         user[key] = allowedUpdates[key];
//       }
//     });

//     await user.save();

//     // Return updated user without password
//     const updatedUser = user.toObject();
//     delete updatedUser.password;

//     return NextResponse.json(
//       {
//         message: 'Profile updated successfully',
//         user: updatedUser
//       },
//       { status: 200 }
//     );

//   } catch (error) {
//     console.error('Update user error:', error);
//     return NextResponse.json(
//       { error: 'Failed to update profile' },
//       { status: 500 }
//     );
//   }
// }