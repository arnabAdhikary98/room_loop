import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/app/lib/mongoose';
import Room from '@/app/models/Room';
import { getServerSession } from 'next-auth';

// GET /api/rooms - Get all rooms
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    // Get query parameters
    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const tag = url.searchParams.get('tag');
    
    // Build query object
    const query: any = {};
    if (status) query.status = status;
    if (tag) query.tags = tag;
    
    // Find rooms with optional filters
    const rooms = await Room.find(query)
      .populate('creator', 'name email image')
      .sort({ startTime: 1 });
    
    return NextResponse.json(rooms);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 });
  }
}

// POST /api/rooms - Create a new room
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    
    // Check authentication
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await dbConnect();
    
    // Get request body
    const body = await req.json();
    
    // Create new room
    const newRoom = await Room.create({
      ...body,
      creator: session.user.id,
      participants: [session.user.id], // Creator is automatically a participant
    });
    
    return NextResponse.json(newRoom, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
  }
} 