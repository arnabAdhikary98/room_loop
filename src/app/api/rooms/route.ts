import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { roomController } from '@/app/controllers/roomController';

// GET /api/rooms - Get all rooms
export async function GET(req: NextRequest) {
  // Get query parameters
  const url = new URL(req.url);
  const status = url.searchParams.get('status');
  const tag = url.searchParams.get('tag');
  
  // Build query object
  const query: any = {};
  if (status) query.status = status;
  if (tag) query.tags = tag;
  
  // Use controller to get rooms
  return roomController.getAllRooms(query);
}

// POST /api/rooms - Create a new room
export async function POST(req: NextRequest) {
  try {
    // Get session
    const session = await getServerSession(authOptions);
    
    // Get request body
    const body = await req.json();
    
    // Use controller to create room
    return roomController.createRoom(body, session);
  } catch (error: any) {
    console.error('Error in POST /api/rooms:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
} 