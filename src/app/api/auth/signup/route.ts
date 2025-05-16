import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/app/lib/mongoose';
import User from '@/app/models/User';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    // Get request body
    const { name, email, password } = await req.json();
    
    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email is already registered' },
        { status: 409 }
      );
    }
    
    // Create new user
    const newUser = await User.create({
      name,
      email,
      password, // Password will be hashed by the User model pre-save hook
    });
    
    // Remove password from response
    const user = {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
    };
    
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
} 