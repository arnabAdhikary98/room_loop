import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/app/lib/mongoose';
import Room from '@/app/models/Room';
import Message from '@/app/models/Message';
import { getServerSession } from 'next-auth';

// GET /api/rooms/[id]/messages - Get all messages for a room
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    // Verify room exists
    const room = await Room.findById(params.id);
    
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }
    
    // Get messages for room
    const messages = await Message.find({ room: params.id })
      .populate('sender', 'name email image')
      .sort({ timestamp: 1 });
    
    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

// POST /api/rooms/[id]/messages - Create a new message
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
    
    // Verify room exists
    const room = await Room.findById(params.id);
    
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }
    
    // Check if user is a participant
    if (!room.participants.includes(session.user.id)) {
      return NextResponse.json({ error: 'Not a participant in this room' }, { status: 403 });
    }
    
    // Check if room is live
    if (room.status !== 'live') {
      return NextResponse.json({ error: 'Room is not currently live' }, { status: 400 });
    }
    
    // Get request body
    const body = await req.json();
    
    // Create new message
    const newMessage = await Message.create({
      room: params.id,
      sender: session.user.id,
      content: body.content,
      type: body.type || 'text',
    });
    
    // Return message with sender info
    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'name email image');
    
    return NextResponse.json(populatedMessage, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 });
  }
} 