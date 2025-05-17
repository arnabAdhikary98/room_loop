import axios from 'axios';

// Mock axios
jest.mock('axios', () => {
  const mockAxiosInstance = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  };
  
  return {
    create: jest.fn(() => mockAxiosInstance)
  };
});

// Import after mocking
import { roomService, userService, messageService, notificationService } from '@/app/services/api';

describe('API Service', () => {
  let mockAxios: any;
  
  beforeEach(() => {
    // Get the mocked axios instance
    mockAxios = (axios.create as jest.Mock)();
    jest.clearAllMocks();
  });
  
  describe('Room Service', () => {
    const mockRoom = {
      _id: 'room123',
      title: 'Test Room',
      description: 'Test Description',
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      creator: {
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
      },
      participants: [{
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
      }],
    };
    
    describe('getAllRooms', () => {
      it('should fetch all rooms with no filters', async () => {
        // Setup
        mockAxios.get.mockResolvedValue({ data: [mockRoom] });
        
        // Execute
        const result = await roomService.getAllRooms();
        
        // Verify
        expect(mockAxios.get).toHaveBeenCalledWith('/rooms?');
        expect(result).toEqual([mockRoom]);
      });
      
      it('should fetch rooms with filters', async () => {
        // Setup
        mockAxios.get.mockResolvedValue({ data: [mockRoom] });
        
        // Execute
        const result = await roomService.getAllRooms({ status: 'active', tag: 'test' });
        
        // Verify
        expect(mockAxios.get).toHaveBeenCalledWith('/rooms?status=active&tag=test');
        expect(result).toEqual([mockRoom]);
      });
    });
    
    describe('getRoomById', () => {
      it('should fetch a room by ID', async () => {
        // Setup
        mockAxios.get.mockResolvedValue({ data: mockRoom });
        
        // Execute
        const result = await roomService.getRoomById('room123');
        
        // Verify
        expect(mockAxios.get).toHaveBeenCalledWith('/rooms/room123');
        expect(result).toEqual(mockRoom);
      });
    });
    
    describe('createRoom', () => {
      it('should create a new room', async () => {
        // Setup
        const roomData = {
          title: 'New Room',
          description: 'New Description',
          startTime: new Date(),
          endTime: new Date(),
          tags: ['test'],
        };
        
        mockAxios.post.mockResolvedValue({ data: mockRoom });
        
        // Execute
        const result = await roomService.createRoom(roomData);
        
        // Verify
        expect(mockAxios.post).toHaveBeenCalledWith('/rooms', roomData);
        expect(result).toEqual(mockRoom);
      });
    });
    
    describe('updateRoom', () => {
      it('should update a room', async () => {
        // Setup
        const roomData = {
          title: 'Updated Room',
        };
        
        mockAxios.put.mockResolvedValue({ data: { ...mockRoom, title: 'Updated Room' } });
        
        // Execute
        const result = await roomService.updateRoom('room123', roomData);
        
        // Verify
        expect(mockAxios.put).toHaveBeenCalledWith('/rooms/room123', roomData);
        expect(result).toEqual({ ...mockRoom, title: 'Updated Room' });
      });
    });
    
    describe('deleteRoom', () => {
      it('should delete a room', async () => {
        // Setup
        mockAxios.delete.mockResolvedValue({ data: { success: true } });
        
        // Execute
        const result = await roomService.deleteRoom('room123');
        
        // Verify
        expect(mockAxios.delete).toHaveBeenCalledWith('/rooms/room123');
        expect(result).toEqual({ success: true });
      });
    });
  });
  
  describe('User Service', () => {
    const mockUser = {
      _id: 'user123',
      name: 'Test User',
      email: 'test@example.com',
    };
    
    const mockRooms = {
      created: [{ _id: 'room1', title: 'Created Room' }],
      participating: [{ _id: 'room2', title: 'Participating Room' }],
    };
    
    describe('getUserProfile', () => {
      it('should fetch the user profile', async () => {
        // Setup
        mockAxios.get.mockResolvedValue({ data: mockUser });
        
        // Execute
        const result = await userService.getUserProfile();
        
        // Verify
        expect(mockAxios.get).toHaveBeenCalledWith('/user/profile');
        expect(result).toEqual(mockUser);
      });
    });
    
    describe('getUserRooms', () => {
      it('should fetch user rooms', async () => {
        // Setup
        mockAxios.get.mockResolvedValue({ data: mockRooms });
        
        // Execute
        const result = await userService.getUserRooms();
        
        // Verify
        expect(mockAxios.get).toHaveBeenCalledWith('/user/rooms');
        expect(result).toEqual(mockRooms);
      });
    });
    
    describe('updateUserProfile', () => {
      it('should update the user profile', async () => {
        // Setup
        const userData = {
          name: 'Updated Name',
        };
        
        mockAxios.put.mockResolvedValue({ data: { ...mockUser, name: 'Updated Name' } });
        
        // Execute
        const result = await userService.updateUserProfile(userData);
        
        // Verify
        expect(mockAxios.put).toHaveBeenCalledWith('/user/profile', userData);
        expect(result).toEqual({ ...mockUser, name: 'Updated Name' });
      });
    });
  });
  
  describe('Message Service', () => {
    const mockMessage = {
      _id: 'msg123',
      content: 'Test message',
      type: 'text',
      sender: {
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
      },
      room: 'room123',
      timestamp: new Date().toISOString(),
    };
    
    describe('getRoomMessages', () => {
      it('should fetch messages for a room', async () => {
        // Setup
        mockAxios.get.mockResolvedValue({ data: [mockMessage] });
        
        // Execute
        const result = await messageService.getRoomMessages('room123');
        
        // Verify
        expect(mockAxios.get).toHaveBeenCalledWith('/rooms/room123/messages');
        expect(result).toEqual([mockMessage]);
      });
    });
    
    describe('sendMessage', () => {
      it('should send a text message to a room', async () => {
        // Setup
        mockAxios.post.mockResolvedValue({ data: mockMessage });
        
        // Execute
        const result = await messageService.sendMessage('room123', 'Test message');
        
        // Verify
        expect(mockAxios.post).toHaveBeenCalledWith('/rooms/room123/messages', { 
          content: 'Test message', 
          type: 'text' 
        });
        expect(result).toEqual(mockMessage);
      });
      
      it('should send an emoji message to a room', async () => {
        // Setup
        const emojiMessage = { ...mockMessage, type: 'emoji', content: '😊' };
        mockAxios.post.mockResolvedValue({ data: emojiMessage });
        
        // Execute
        const result = await messageService.sendMessage('room123', '😊', 'emoji');
        
        // Verify
        expect(mockAxios.post).toHaveBeenCalledWith('/rooms/room123/messages', { 
          content: '😊', 
          type: 'emoji' 
        });
        expect(result).toEqual(emojiMessage);
      });
    });
    
    describe('deleteMessage', () => {
      it('should delete a message', async () => {
        // Setup
        mockAxios.delete.mockResolvedValue({ data: { success: true } });
        
        // Execute
        const result = await messageService.deleteMessage('msg123');
        
        // Verify
        expect(mockAxios.delete).toHaveBeenCalledWith('/messages/msg123');
        expect(result).toEqual({ success: true });
      });
    });
  });
  
  describe('Notification Service', () => {
    const mockNotification = {
      _id: 'notif123',
      recipient: 'user123',
      sender: {
        _id: 'user456',
        name: 'Another User',
      },
      type: 'new_message',
      content: 'You have a new message',
      relatedRoom: 'room123',
      read: false,
      createdAt: new Date().toISOString(),
    };
    
    describe('getNotifications', () => {
      it('should fetch notifications with no options', async () => {
        // Setup
        mockAxios.get.mockResolvedValue({ data: [mockNotification] });
        
        // Execute
        const result = await notificationService.getNotifications();
        
        // Verify
        expect(mockAxios.get).toHaveBeenCalledWith('/user/notifications?');
        expect(result).toEqual([mockNotification]);
      });
      
      it('should fetch notifications with options', async () => {
        // Setup
        mockAxios.get.mockResolvedValue({ data: [mockNotification] });
        
        // Execute
        const result = await notificationService.getNotifications({ 
          limit: 10, 
          offset: 20, 
          unreadOnly: true 
        });
        
        // Verify
        expect(mockAxios.get).toHaveBeenCalledWith('/user/notifications?limit=10&offset=20&unreadOnly=true');
        expect(result).toEqual([mockNotification]);
      });
    });
    
    describe('getUnreadCount', () => {
      it('should fetch unread notification count', async () => {
        // Setup
        mockAxios.get.mockResolvedValue({ data: { count: 5 } });
        
        // Execute
        const result = await notificationService.getUnreadCount();
        
        // Verify
        expect(mockAxios.get).toHaveBeenCalledWith('/user/notifications/count');
        expect(result).toEqual(5);
      });
    });
    
    describe('markAsRead', () => {
      it('should mark a notification as read', async () => {
        // Setup
        const readNotification = { ...mockNotification, read: true };
        mockAxios.put.mockResolvedValue({ data: readNotification });
        
        // Execute
        const result = await notificationService.markAsRead('notif123');
        
        // Verify
        expect(mockAxios.put).toHaveBeenCalledWith('/user/notifications/notif123');
        expect(result).toEqual(readNotification);
      });
    });
    
    describe('markAllAsRead', () => {
      it('should mark all notifications as read', async () => {
        // Setup
        mockAxios.put.mockResolvedValue({ data: { success: true } });
        
        // Execute
        const result = await notificationService.markAllAsRead();
        
        // Verify
        expect(mockAxios.put).toHaveBeenCalledWith('/user/notifications');
        expect(result).toEqual({ success: true });
      });
    });
  });
}); 