import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { roomController } from '@/app/controllers/roomController';

// Helper: handle errors uniformly
const handleError = (method: string, id: string, error: any) => {
  console.error(`Error in ${method} /api/rooms/${id}:`, error);
  return Response.json(
    { error: error?.message || 'Internal server error' },
    { status: error?.status || 500 }
  );
};

// GET /api/rooms/[id] - Get a room by ID
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    return await roomController.getRoomById(id);
  } catch (error) {
    return handleError('GET', id, error);
  }
}

// PUT /api/rooms/[id] - Update a room
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    return await roomController.updateRoom(id, body, session);
  } catch (error) {
    return handleError('PUT', id, error);
  }
}

// DELETE /api/rooms/[id] - Delete a room
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    const session = await getServerSession(authOptions);
    return await roomController.deleteRoom(id, session);
  } catch (error) {
    return handleError('DELETE', id, error);
  }
}
