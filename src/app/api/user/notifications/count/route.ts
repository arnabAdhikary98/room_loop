import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';
import Notification from '@/app/models/Notification';
import dbConnect from '@/app/lib/mongoose';

// Get count of unread notifications
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    await dbConnect();
    
    // Count unread notifications
    const count = await Notification.countDocuments({
      recipient: userId,
      read: false,
    });
    
    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error counting unread notifications:', error);
    return NextResponse.json(
      { error: 'Failed to count unread notifications' },
      { status: 500 }
    );
  }
} 