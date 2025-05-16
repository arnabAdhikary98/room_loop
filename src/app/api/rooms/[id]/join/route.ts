import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/app/lib/mongoose';
import Room from '@/app/models/Room';
import User from '@/app/models/User';
import { getServerSession } from 'next-auth';

// POST /api/rooms/[id]/join - Join a room
export async function POST(
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
    
    // Check if room is already closed
    if (room.status === 'closed') {
      return NextResponse.json({ error: 'Room is already closed' }, { status: 400 });
    }
    
    // Check if user is already a participant
    if (room.participants.includes(session.user.id)) {
      return NextResponse.json({ error: 'Already a participant' }, { status: 400 });
    }
    
    // Add user to participants
    room.participants.push(session.user.id);
    await room.save();
    
    // Add room to user's participated rooms
    await User.findByIdAndUpdate(
      session.user.id,
      { $addToSet: { participatedRooms: params.id } }
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to join room' }, { status: 500 });
  }
} 