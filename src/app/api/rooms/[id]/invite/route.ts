import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';
import dbConnect from '@/app/lib/mongoose';
import Room from '@/app/models/Room';
import User from '@/app/models/User';
import Notification from '@/app/models/Notification';
import { sendEmail } from '@/app/lib/email';
import mongoose from 'mongoose';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const roomId = params.id;
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    await dbConnect();
    
    // Find the room
    const room = await Room.findById(roomId).populate('creator', 'name email');
    
    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }
    
    // Check if user is the creator of the room
    if (room.creator._id.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the room creator can send invites' },
        { status: 403 }
      );
    }
    
    // Find the user to invite
    const invitedUser = await User.findOne({ email });
    
    // Generate an invite token
    const inviteToken = generateInviteToken();
    
    // Get the base URL for links
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    if (invitedUser) {
      // User exists - check if already a participant
      if (room.participants.includes(invitedUser._id)) {
        return NextResponse.json(
          { error: 'User is already a participant' },
          { status: 400 }
        );
      }
      
      // Create a notification for the invited user
      const notification = new Notification({
        recipient: invitedUser._id,
        type: 'room_invite',
        content: `You've been invited to join "${room.title}"`,
        data: {
          roomId: room._id,
          roomTitle: room.title,
        },
        read: false,
      });
      
      await notification.save();
      
      // Send email to registered user
      const inviteLink = `${baseUrl}/rooms/${roomId}`;
      
      await sendEmail({
        to: email,
        subject: `You've been invited to join "${room.title}" on RoomLoop`,
        text: `${room.creator.name} has invited you to join a room titled "${room.title}" on RoomLoop. Click here to join: ${inviteLink}`,
        html: `
          <h2>You've been invited to a room on RoomLoop</h2>
          <p><strong>${room.creator.name}</strong> has invited you to join a room titled "<strong>${room.title}</strong>"</p>
          <p>This room is scheduled for: ${new Date(room.startTime).toLocaleString()} - ${new Date(room.endTime).toLocaleString()}</p>
          <p><a href="${inviteLink}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Join Room</a></p>
        `
      });
    } else {
      // User doesn't exist - send invite with signup link
      // Store the invite in a temporary collection or as a token
      const signupLink = `${baseUrl}/auth/signup?email=${encodeURIComponent(email)}&invite=${inviteToken}&roomId=${roomId}`;
      
      // Save the invite token to the database
      await saveInviteToken(inviteToken, {
        email,
        roomId: room._id,
        creatorId: session.user.id,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      });
      
      // Send email to new user
      await sendEmail({
        to: email,
        subject: `You've been invited to join "${room.title}" on RoomLoop`,
        text: `${room.creator.name} has invited you to join a room titled "${room.title}" on RoomLoop. Sign up to join: ${signupLink}`,
        html: `
          <h2>You've been invited to a room on RoomLoop</h2>
          <p><strong>${room.creator.name}</strong> has invited you to join a room titled "<strong>${room.title}</strong>"</p>
          <p>This room is scheduled for: ${new Date(room.startTime).toLocaleString()} - ${new Date(room.endTime).toLocaleString()}</p>
          <p>Create an account to join this room:</p>
          <p><a href="${signupLink}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Sign Up & Join Room</a></p>
        `
      });
    }
    
    return NextResponse.json(
      { success: true, message: 'Invitation sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending invite:', error);
    return NextResponse.json(
      { error: 'Failed to send invitation' },
      { status: 500 }
    );
  }
}

// Generate a random token for invites
function generateInviteToken() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Save invite token to database
async function saveInviteToken(token: string, data: any) {
  // Create a model for invite tokens if it doesn't exist
  const InviteTokenSchema = new mongoose.Schema({
    token: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    expires: { type: Date, required: true },
    used: { type: Boolean, default: false }
  });
  
  const InviteToken = mongoose.models.InviteToken || mongoose.model('InviteToken', InviteTokenSchema);
  
  // Save the token
  await InviteToken.create({
    token,
    email: data.email,
    roomId: data.roomId,
    creatorId: data.creatorId,
    expires: data.expires
  });
} 