import { NextResponse } from 'next/server';
import { dbService } from '@/app/services/db';
import { Session } from 'next-auth';

/**
 * Message controller for handling message-related operations
 */
export const messageController = {
  /**
   * Get messages for a room
   */
  getRoomMessages: async (roomId: string, session: Session | null) => {
    try {
      // Check authentication
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      // Check if room exists and user has access
      const room = await dbService.rooms.getById(roomId);
      
      if (!room) {
        return NextResponse.json({ error: 'Room not found' }, { status: 404 });
      }
      
      // Check if user is a participant
      const isParticipant = room.participants?.some(
        (participant: any) => participant._id.toString() === session.user?.id
      );
      
      const isCreator = room.creator?._id.toString() === session.user?.id;
      
      if (!isParticipant && !isCreator) {
        return NextResponse.json({ error: 'Not authorized to access this room' }, { status: 403 });
      }
      
      // Get messages
      const messages = await dbService.messages.getRoomMessages(roomId);
      
      return NextResponse.json(messages);
    } catch (error: any) {
      console.error(`Failed to fetch messages for room ${roomId}:`, error);
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }
  },

  /**
   * Create a new message
   */
  createMessage: async (roomId: string, body: any, session: Session | null) => {
    try {
      // Check authentication
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      // Validate required fields
      if (!body.content) {
        return NextResponse.json(
          { error: 'Message content is required' },
          { status: 400 }
        );
      }
      
      // Check if room exists and user has access
      const room = await dbService.rooms.getById(roomId);
      
      if (!room) {
        return NextResponse.json({ error: 'Room not found' }, { status: 404 });
      }
      
      // Check if room is live
      if (room.status !== 'live') {
        return NextResponse.json(
          { error: 'Cannot send messages to a room that is not live' },
          { status: 400 }
        );
      }
      
      // Check if user is a participant
      const isParticipant = room.participants?.some(
        (participant: any) => participant._id.toString() === session.user?.id
      );
      
      const isCreator = room.creator?._id.toString() === session.user?.id;
      
      if (!isParticipant && !isCreator) {
        return NextResponse.json({ error: 'Not authorized to send messages to this room' }, { status: 403 });
      }
      
      // Create message
      const newMessage = await dbService.messages.create({
        room: roomId,
        sender: session.user.id,
        content: body.content,
        type: body.type || 'text',
      });
      
      return NextResponse.json(newMessage, { status: 201 });
    } catch (error: any) {
      console.error(`Failed to create message in room ${roomId}:`, error);
      return NextResponse.json({ error: 'Failed to create message' }, { status: 500 });
    }
  },

  /**
   * Delete a message
   */
  deleteMessage: async (messageId: string, session: Session | null) => {
    try {
      // Check authentication
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      // Delete message
      const result = await dbService.messages.delete(messageId, session.user.id);
      
      return NextResponse.json({ success: true });
    } catch (error: any) {
      console.error(`Failed to delete message ${messageId}:`, error);
      
      // Handle specific errors
      if (error.message === 'Message not found') {
        return NextResponse.json({ error: 'Message not found' }, { status: 404 });
      }
      
      if (error.message === 'Not authorized to delete this message') {
        return NextResponse.json({ error: 'Not authorized to delete this message' }, { status: 403 });
      }
      
      return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 });
    }
  },
}; 