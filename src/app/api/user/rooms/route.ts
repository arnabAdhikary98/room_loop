import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { userController } from '@/app/controllers/userController';

// GET /api/user/rooms - Get user's rooms
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Use controller to get user rooms
    return userController.getUserRooms(session);
  } catch (error: any) {
    console.error('Error in GET /api/user/rooms:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
} 