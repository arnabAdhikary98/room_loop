import { NextResponse } from 'next/server';
import { dbService } from '@/app/services/db';
import { Session } from 'next-auth';

/**
 * Notification controller for handling notification-related operations
 */
export const notificationController = {
  /**
   * Get user notifications
   */
  getUserNotifications: async (session: Session | null, query: any = {}) => {
    try {
      // Check authentication
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      // Parse query parameters
      const limit = query.limit ? parseInt(query.limit, 10) : 20;
      const offset = query.offset ? parseInt(query.offset, 10) : 0;
      const unreadOnly = query.unreadOnly === 'true';
      
      // Get notifications
      const notifications = await dbService.notifications.getUserNotifications(
        session.user.id,
        { limit, offset, unreadOnly }
      );
      
      return NextResponse.json(notifications);
    } catch (error: any) {
      console.error('Failed to fetch notifications:', error);
      return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }
  },

  /**
   * Get unread notification count
   */
  getUnreadCount: async (session: Session | null) => {
    try {
      // Check authentication
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      // Get unread count
      const count = await dbService.notifications.getUnreadCount(session.user.id);
      
      return NextResponse.json({ count });
    } catch (error: any) {
      console.error('Failed to fetch unread notification count:', error);
      return NextResponse.json({ error: 'Failed to fetch unread notification count' }, { status: 500 });
    }
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (id: string, session: Session | null) => {
    try {
      // Check authentication
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      // Mark notification as read
      const notification = await dbService.notifications.markAsRead(id, session.user.id);
      
      return NextResponse.json(notification);
    } catch (error: any) {
      console.error(`Failed to mark notification ${id} as read:`, error);
      
      // Handle specific errors
      if (error.message === 'Notification not found') {
        return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
      }
      
      return NextResponse.json({ error: 'Failed to mark notification as read' }, { status: 500 });
    }
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (session: Session | null) => {
    try {
      // Check authentication
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      // Mark all notifications as read
      await dbService.notifications.markAllAsRead(session.user.id);
      
      return NextResponse.json({ success: true });
    } catch (error: any) {
      console.error('Failed to mark all notifications as read:', error);
      return NextResponse.json({ error: 'Failed to mark all notifications as read' }, { status: 500 });
    }
  },
}; 