import { NextResponse } from 'next/server';
import { dbService } from '@/app/services/db';
import { Session } from 'next-auth';

/**
 * User controller for handling user-related operations
 */
export const userController = {
  /**
   * Get user profile
   */
  getUserProfile: async (session: Session | null) => {
    try {
      // Check authentication
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      // Get user
      const user = await dbService.users.getById(session.user.id);
      
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      
      // Remove sensitive information
      const { password, ...userWithoutPassword } = user.toObject();
      
      return NextResponse.json(userWithoutPassword);
    } catch (error: any) {
      console.error('Failed to fetch user profile:', error);
      return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 });
    }
  },

  /**
   * Update user profile
   */
  updateUserProfile: async (body: any, session: Session | null) => {
    try {
      // Check authentication
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      // Don't allow password update through this endpoint
      if (body.password) {
        delete body.password;
      }
      
      // Update user
      const updatedUser = await dbService.users.updateProfile(session.user.id, body);
      
      if (!updatedUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      
      // Remove sensitive information
      const { password, ...userWithoutPassword } = updatedUser.toObject();
      
      return NextResponse.json(userWithoutPassword);
    } catch (error: any) {
      console.error('Failed to update user profile:', error);
      return NextResponse.json({ error: 'Failed to update user profile' }, { status: 500 });
    }
  },

  /**
   * Get user's rooms
   */
  getUserRooms: async (session: Session | null) => {
    try {
      // Check authentication
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      // Get user's rooms
      const rooms = await dbService.users.getUserRooms(session.user.id);
      
      return NextResponse.json(rooms);
    } catch (error: any) {
      console.error('Failed to fetch user rooms:', error);
      return NextResponse.json({ error: 'Failed to fetch user rooms' }, { status: 500 });
    }
  },
}; 