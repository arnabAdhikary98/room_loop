import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { userController } from '@/app/controllers/userController';

// GET /api/user/profile - Get user profile
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Use controller to get user profile
    return userController.getUserProfile(session);
  } catch (error: any) {
    console.error('Error in GET /api/user/profile:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/user/profile - Update user profile
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    
    // Use controller to update user profile
    return userController.updateUserProfile(body, session);
  } catch (error: any) {
    console.error('Error in PUT /api/user/profile:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
} 