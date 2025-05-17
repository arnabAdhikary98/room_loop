import { NextResponse } from 'next/server';
import { dbService } from '@/app/services/db';
import { Session } from 'next-auth';

/**
 * Room controller for handling room-related operations
 */
export const roomController = {
  /**
   * Get all rooms with optional filters
   */
  getAllRooms: async (query: any) => {
    try {
      const rooms = await dbService.rooms.getAll(query);
      return NextResponse.json(rooms);
    } catch (error: any) {
      console.error('Failed to fetch rooms:', error);
      return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 });
    }
  },

  /**
   * Get a room by ID
   */
  getRoomById: async (id: string) => {
    try {
      const room = await dbService.rooms.getById(id);
      
      if (!room) {
        return NextResponse.json({ error: 'Room not found' }, { status: 404 });
      }
      
      return NextResponse.json(room);
    } catch (error: any) {
      console.error(`Failed to fetch room ${id}:`, error);
      return NextResponse.json({ error: 'Failed to fetch room' }, { status: 500 });
    }
  },

  /**
   * Create a new room
   */
  createRoom: async (body: any, session: Session | null) => {
    try {
      // Check authentication
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      // Validate required fields
      if (!body.title || !body.description || !body.startTime || !body.endTime) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }
      
      // Create room
      const newRoom = await dbService.rooms.create(body, session.user.id);
      return NextResponse.json(newRoom, { status: 201 });
    } catch (error: any) {
      console.error('Failed to create room:', error);
      
      // Handle specific errors
      if (error.message === 'User not found') {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      
      return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
    }
  },

  /**
   * Update a room
   */
  updateRoom: async (id: string, body: any, session: Session | null) => {
    try {
      // Check authentication
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      // Update room
      const updatedRoom = await dbService.rooms.update(id, body, session.user.id);
      return NextResponse.json(updatedRoom);
    } catch (error: any) {
      console.error(`Failed to update room ${id}:`, error);
      
      // Handle specific errors
      if (error.message === 'Room not found') {
        return NextResponse.json({ error: 'Room not found' }, { status: 404 });
      }
      
      if (error.message === 'Not authorized to update this room') {
        return NextResponse.json({ error: 'Not authorized to update this room' }, { status: 403 });
      }
      
      return NextResponse.json({ error: 'Failed to update room' }, { status: 500 });
    }
  },

  /**
   * Delete a room
   */
  deleteRoom: async (id: string, session: Session | null) => {
    try {
      // Check authentication
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      // Delete room
      await dbService.rooms.delete(id, session.user.id);
      return NextResponse.json({ success: true });
    } catch (error: any) {
      console.error(`Failed to delete room ${id}:`, error);
      
      // Handle specific errors
      if (error.message === 'Room not found') {
        return NextResponse.json({ error: 'Room not found' }, { status: 404 });
      }
      
      if (error.message === 'Not authorized to delete this room') {
        return NextResponse.json({ error: 'Not authorized to delete this room' }, { status: 403 });
      }
      
      return NextResponse.json({ error: 'Failed to delete room' }, { status: 500 });
    }
  },
}; 