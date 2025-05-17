import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { messageController } from '@/app/controllers/messageController';

// GET /api/rooms/[id]/messages - Get messages for a room
export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);
    
    // Use controller to get room messages
    return messageController.getRoomMessages(id, session);
  } catch (error: any) {
    console.error(`Error in GET /api/rooms/${context.params.id}/messages:`, error);
    return Response.json({ error: error.message || 'Internal server error' }, { status: error.status || 500 });
  }
}

// POST /api/rooms/[id]/messages - Create a new message
export async function POST(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const session = await getServerSession(authOptions);
    
    // Use controller to create message
    return messageController.createMessage(id, body, session);
  } catch (error: any) {
    console.error(`Error in POST /api/rooms/${context.params.id}/messages:`, error);
    return Response.json({ error: error.message || 'Internal server error' }, { status: error.status || 500 });
  }
} 