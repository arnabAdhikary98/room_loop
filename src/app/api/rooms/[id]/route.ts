import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { roomController } from '@/app/controllers/roomController';

// GET /api/rooms/[id] - Get a room by ID
export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const id = context.params.id;
    
    // Use controller to get room
    return roomController.getRoomById(id);
  } catch (error: any) {
    console.error(`Error in GET /api/rooms/${context.params.id}:`, error);
    return Response.json({ error: error.message || 'Internal server error' }, { status: error.status || 500 });
  }
}

// PUT /api/rooms/[id] - Update a room
export async function PUT(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const id = context.params.id;
    const session = await getServerSession(authOptions);
    const body = await req.json();
    
    // Use controller to update room
    return roomController.updateRoom(id, body, session);
  } catch (error: any) {
    console.error(`Error in PUT /api/rooms/${context.params.id}:`, error);
    return Response.json({ error: error.message || 'Internal server error' }, { status: error.status || 500 });
  }
}

// DELETE /api/rooms/[id] - Delete a room
export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const id = context.params.id;
    const session = await getServerSession(authOptions);
    
    // Use controller to delete room
    return roomController.deleteRoom(id, session);
  } catch (error: any) {
    console.error(`Error in DELETE /api/rooms/${context.params.id}:`, error);
    return Response.json({ error: error.message || 'Internal server error' }, { status: error.status || 500 });
  }
} 