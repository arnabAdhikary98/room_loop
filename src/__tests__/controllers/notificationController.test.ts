import { NextResponse } from 'next/server';
import { notificationController } from '@/app/controllers/notificationController';
import { dbService } from '@/app/services/db';

// Mock the dbService
jest.mock('@/app/services/db', () => ({
  dbService: {
    notifications: {
      getUserNotifications: jest.fn(),
      getUnreadCount: jest.fn(),
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
    },
  },
}));

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({
      data,
      status: init?.status || 200,
    })),
  },
}));

describe('Notification Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserNotifications', () => {
    const mockSession = {
      user: { id: 'user1', name: 'Test User' },
    };
    
    const mockNotifications = [
      { 
        _id: 'notif1',
        recipient: 'user1',
        type: 'new_message',
        content: 'You have a new message',
        read: false,
      }
    ];
    
    it('should return notifications when authenticated', async () => {
      // Setup mock
      (dbService.notifications.getUserNotifications as jest.Mock).mockResolvedValue(mockNotifications);
      
      // Execute
      const response = await notificationController.getUserNotifications(mockSession as any, {});
      
      // Verify
      expect(dbService.notifications.getUserNotifications).toHaveBeenCalledWith(
        'user1',
        { limit: 20, offset: 0, unreadOnly: false }
      );
      expect(NextResponse.json).toHaveBeenCalledWith(mockNotifications);
      expect(response).toEqual({ data: mockNotifications, status: 200 });
    });
    
    it('should return 401 when not authenticated', async () => {
      // Execute
      const response = await notificationController.getUserNotifications(null, {});
      
      // Verify
      expect(dbService.notifications.getUserNotifications).not.toHaveBeenCalled();
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    });
    
    it('should handle query parameters correctly', async () => {
      // Setup mock
      (dbService.notifications.getUserNotifications as jest.Mock).mockResolvedValue(mockNotifications);
      
      // Execute
      const response = await notificationController.getUserNotifications(
        mockSession as any,
        { limit: '10', offset: '20', unreadOnly: 'true' }
      );
      
      // Verify
      expect(dbService.notifications.getUserNotifications).toHaveBeenCalledWith(
        'user1',
        { limit: 10, offset: 20, unreadOnly: true }
      );
    });
    
    it('should handle errors', async () => {
      // Setup mock
      (dbService.notifications.getUserNotifications as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      // Execute
      const response = await notificationController.getUserNotifications(mockSession as any, {});
      
      // Verify
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Failed to fetch notifications' },
        { status: 500 }
      );
    });
  });

  describe('getUnreadCount', () => {
    const mockSession = {
      user: { id: 'user1', name: 'Test User' },
    };
    
    it('should return unread count when authenticated', async () => {
      // Setup mock
      (dbService.notifications.getUnreadCount as jest.Mock).mockResolvedValue(5);
      
      // Execute
      const response = await notificationController.getUnreadCount(mockSession as any);
      
      // Verify
      expect(dbService.notifications.getUnreadCount).toHaveBeenCalledWith('user1');
      expect(NextResponse.json).toHaveBeenCalledWith({ count: 5 });
      expect(response).toEqual({ data: { count: 5 }, status: 200 });
    });
    
    it('should return 401 when not authenticated', async () => {
      // Execute
      const response = await notificationController.getUnreadCount(null);
      
      // Verify
      expect(dbService.notifications.getUnreadCount).not.toHaveBeenCalled();
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    });
    
    it('should handle errors', async () => {
      // Setup mock
      (dbService.notifications.getUnreadCount as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      // Execute
      const response = await notificationController.getUnreadCount(mockSession as any);
      
      // Verify
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Failed to fetch unread notification count' },
        { status: 500 }
      );
    });
  });

  describe('markAsRead', () => {
    const mockSession = {
      user: { id: 'user1', name: 'Test User' },
    };
    
    const mockNotification = { 
      _id: 'notif1',
      recipient: 'user1',
      type: 'new_message',
      content: 'You have a new message',
      read: true,
    };
    
    it('should mark notification as read when authenticated', async () => {
      // Setup mock
      (dbService.notifications.markAsRead as jest.Mock).mockResolvedValue(mockNotification);
      
      // Execute
      const response = await notificationController.markAsRead('notif1', mockSession as any);
      
      // Verify
      expect(dbService.notifications.markAsRead).toHaveBeenCalledWith('notif1', 'user1');
      expect(NextResponse.json).toHaveBeenCalledWith(mockNotification);
      expect(response).toEqual({ data: mockNotification, status: 200 });
    });
    
    it('should return 401 when not authenticated', async () => {
      // Execute
      const response = await notificationController.markAsRead('notif1', null);
      
      // Verify
      expect(dbService.notifications.markAsRead).not.toHaveBeenCalled();
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    });
    
    it('should handle notification not found error', async () => {
      // Setup mock
      (dbService.notifications.markAsRead as jest.Mock).mockRejectedValue(new Error('Notification not found'));
      
      // Execute
      const response = await notificationController.markAsRead('notif1', mockSession as any);
      
      // Verify
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Notification not found' },
        { status: 404 }
      );
    });
    
    it('should handle other errors', async () => {
      // Setup mock
      (dbService.notifications.markAsRead as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      // Execute
      const response = await notificationController.markAsRead('notif1', mockSession as any);
      
      // Verify
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Failed to mark notification as read' },
        { status: 500 }
      );
    });
  });

  describe('markAllAsRead', () => {
    const mockSession = {
      user: { id: 'user1', name: 'Test User' },
    };
    
    it('should mark all notifications as read when authenticated', async () => {
      // Setup mock
      (dbService.notifications.markAllAsRead as jest.Mock).mockResolvedValue({ success: true });
      
      // Execute
      const response = await notificationController.markAllAsRead(mockSession as any);
      
      // Verify
      expect(dbService.notifications.markAllAsRead).toHaveBeenCalledWith('user1');
      expect(NextResponse.json).toHaveBeenCalledWith({ success: true });
      expect(response).toEqual({ data: { success: true }, status: 200 });
    });
    
    it('should return 401 when not authenticated', async () => {
      // Execute
      const response = await notificationController.markAllAsRead(null);
      
      // Verify
      expect(dbService.notifications.markAllAsRead).not.toHaveBeenCalled();
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    });
    
    it('should handle errors', async () => {
      // Setup mock
      (dbService.notifications.markAllAsRead as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      // Execute
      const response = await notificationController.markAllAsRead(mockSession as any);
      
      // Verify
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Failed to mark all notifications as read' },
        { status: 500 }
      );
    });
  });
}); 