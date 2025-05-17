import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { messageController } from '@/app/controllers/messageController';

// Helper: Unified error handler
const handleError = (method: string, id: string, error: any) => {
  console.error(`Error in ${method} /api/rooms/${id}/messages:`, error);
  return Response.json(
    { error: error?.message || 'Internal server error' },
    { status: error?.status || 500 }
  );
};

// GET /api/rooms/[id]/messages - Get messages for a room
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    const session = await getServerSession(authOptions);
    return await messageController.getRoomMessages(id, session);
  } catch (error) {
    return handleError('GET', id, error);
  }
}

// POST /api/rooms/[id]/messages - Create a new message
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    return await messageController.createMessage(id, body, session);
  } catch (error) {
    return handleError('POST', id, error);
  }
}
