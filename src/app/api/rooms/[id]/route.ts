import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/app/lib/mongoose';
import Room from '@/app/models/Room';
import { getServerSession } from 'next-auth';

// GET /api/rooms/[id] - Get a specific room
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const room = await Room.findById(params.id)
      .populate('creator', 'name email image')
      .populate('participants', 'name email image');
    
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }
    
    return NextResponse.json(room);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch room' }, { status: 500 });
  }
}

// PUT /api/rooms/[id] - Update a room
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    
    // Check authentication
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await dbConnect();
    
    // Get room
    const room = await Room.findById(params.id);
    
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }
    
    // Check if user is the creator
    if (room.creator.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized to edit this room' }, { status: 403 });
    }
    
    // Get request body
    const body = await req.json();
    
    // Update room
    const updatedRoom = await Room.findByIdAndUpdate(
      params.id,
      { ...body },
      { new: true, runValidators: true }
    );
    
    return NextResponse.json(updatedRoom);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update room' }, { status: 500 });
  }
}

// DELETE /api/rooms/[id] - Delete a room
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    
    // Check authentication
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await dbConnect();
    
    // Get room
    const room = await Room.findById(params.id);
    
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }
    
    // Check if user is the creator
    if (room.creator.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized to delete this room' }, { status: 403 });
    }
    
    // Delete room
    await Room.findByIdAndDelete(params.id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete room' }, { status: 500 });
  }
} 