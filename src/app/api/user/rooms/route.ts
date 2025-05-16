import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/app/lib/mongoose';
import Room from '@/app/models/Room';
import { getServerSession } from 'next-auth';

// GET /api/user/rooms - Get rooms created or participated by the user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    
    // Check authentication
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await dbConnect();
    
    // Get query type (created or participated)
    const url = new URL(req.url);
    const type = url.searchParams.get('type') || 'created';
    
    let query = {};
    
    if (type === 'created') {
      // Rooms created by the user
      query = { creator: session.user.id };
    } else if (type === 'participated') {
      // Rooms where the user is a participant but not the creator
      query = { 
        participants: session.user.id,
        creator: { $ne: session.user.id }
      };
    } else {
      return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }
    
    // Find rooms
    const rooms = await Room.find(query)
      .populate('creator', 'name email image')
      .sort({ startTime: -1 });
    
    return NextResponse.json(rooms);
  } catch (error) {
    console.error('Error fetching user rooms:', error);
    return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 });
  }
} 