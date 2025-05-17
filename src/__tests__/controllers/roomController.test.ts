import { NextResponse } from 'next/server';
import { roomController } from '@/app/controllers/roomController';
import { dbService } from '@/app/services/db';

// Mock the dbService
jest.mock('@/app/services/db', () => ({
  dbService: {
    rooms: {
      getAll: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
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

describe('Room Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllRooms', () => {
    it('should return rooms when successful', async () => {
      // Mock data
      const mockRooms = [{ _id: 'room1', title: 'Test Room' }];
      const mockQuery = { status: 'active' };
      
      // Setup mock
      (dbService.rooms.getAll as jest.Mock).mockResolvedValue(mockRooms);
      
      // Execute
      const response = await roomController.getAllRooms(mockQuery);
      
      // Verify
      expect(dbService.rooms.getAll).toHaveBeenCalledWith(mockQuery);
      expect(NextResponse.json).toHaveBeenCalledWith(mockRooms);
      expect(response).toEqual({ data: mockRooms, status: 200 });
    });
    
    it('should handle errors', async () => {
      // Setup mock
      (dbService.rooms.getAll as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      // Execute
      const response = await roomController.getAllRooms({});
      
      // Verify
      expect(dbService.rooms.getAll).toHaveBeenCalledWith({});
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Failed to fetch rooms' },
        { status: 500 }
      );
    });
  });

  describe('getRoomById', () => {
    it('should return a room when found', async () => {
      // Mock data
      const mockRoom = { _id: 'room1', title: 'Test Room' };
      const roomId = 'room1';
      
      // Setup mock
      (dbService.rooms.getById as jest.Mock).mockResolvedValue(mockRoom);
      
      // Execute
      const response = await roomController.getRoomById(roomId);
      
      // Verify
      expect(dbService.rooms.getById).toHaveBeenCalledWith(roomId);
      expect(NextResponse.json).toHaveBeenCalledWith(mockRoom);
    });
    
    it('should return 404 when room not found', async () => {
      // Setup mock
      (dbService.rooms.getById as jest.Mock).mockResolvedValue(null);
      
      // Execute
      const response = await roomController.getRoomById('nonexistent');
      
      // Verify
      expect(dbService.rooms.getById).toHaveBeenCalledWith('nonexistent');
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Room not found' },
        { status: 404 }
      );
    });
    
    it('should handle errors', async () => {
      // Setup mock
      (dbService.rooms.getById as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      // Execute
      const response = await roomController.getRoomById('room1');
      
      // Verify
      expect(dbService.rooms.getById).toHaveBeenCalledWith('room1');
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Failed to fetch room' },
        { status: 500 }
      );
    });
  });

  describe('createRoom', () => {
    const mockSession = {
      user: { id: 'user1', name: 'Test User' },
    };
    
    const mockRoomData = {
      title: 'New Room',
      description: 'Test Description',
      startTime: '2023-05-20T10:00:00.000Z',
      endTime: '2023-05-20T11:00:00.000Z',
    };
    
    const mockCreatedRoom = {
      _id: 'room1',
      ...mockRoomData,
      creator: 'user1',
    };
    
    it('should create a room when all data is valid', async () => {
      // Setup mock
      (dbService.rooms.create as jest.Mock).mockResolvedValue(mockCreatedRoom);
      
      // Execute
      const response = await roomController.createRoom(mockRoomData, mockSession as any);
      
      // Verify
      expect(dbService.rooms.create).toHaveBeenCalledWith(mockRoomData, 'user1');
      expect(NextResponse.json).toHaveBeenCalledWith(mockCreatedRoom, { status: 201 });
    });
    
    it('should return 401 when not authenticated', async () => {
      // Execute
      const response = await roomController.createRoom(mockRoomData, null);
      
      // Verify
      expect(dbService.rooms.create).not.toHaveBeenCalled();
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    });
    
    it('should return 400 when required fields are missing', async () => {
      // Execute
      const response = await roomController.createRoom({ title: 'Only Title' }, mockSession as any);
      
      // Verify
      expect(dbService.rooms.create).not.toHaveBeenCalled();
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    });
    
    it('should handle user not found error', async () => {
      // Setup mock
      (dbService.rooms.create as jest.Mock).mockRejectedValue(new Error('User not found'));
      
      // Execute
      const response = await roomController.createRoom(mockRoomData, mockSession as any);
      
      // Verify
      expect(dbService.rooms.create).toHaveBeenCalledWith(mockRoomData, 'user1');
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'User not found' },
        { status: 404 }
      );
    });
    
    it('should handle other errors', async () => {
      // Setup mock
      (dbService.rooms.create as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      // Execute
      const response = await roomController.createRoom(mockRoomData, mockSession as any);
      
      // Verify
      expect(dbService.rooms.create).toHaveBeenCalledWith(mockRoomData, 'user1');
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Failed to create room' },
        { status: 500 }
      );
    });
  });

  describe('updateRoom', () => {
    const mockSession = {
      user: { id: 'user1', name: 'Test User' },
    };
    
    const mockRoomData = {
      title: 'Updated Room',
    };
    
    const mockUpdatedRoom = {
      _id: 'room1',
      title: 'Updated Room',
      creator: 'user1',
    };
    
    it('should update a room when all data is valid', async () => {
      // Setup mock
      (dbService.rooms.update as jest.Mock).mockResolvedValue(mockUpdatedRoom);
      
      // Execute
      const response = await roomController.updateRoom('room1', mockRoomData, mockSession as any);
      
      // Verify
      expect(dbService.rooms.update).toHaveBeenCalledWith('room1', mockRoomData, 'user1');
      expect(NextResponse.json).toHaveBeenCalledWith(mockUpdatedRoom);
    });
    
    it('should return 401 when not authenticated', async () => {
      // Execute
      const response = await roomController.updateRoom('room1', mockRoomData, null);
      
      // Verify
      expect(dbService.rooms.update).not.toHaveBeenCalled();
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    });
    
    it('should handle room not found error', async () => {
      // Setup mock
      (dbService.rooms.update as jest.Mock).mockRejectedValue(new Error('Room not found'));
      
      // Execute
      const response = await roomController.updateRoom('room1', mockRoomData, mockSession as any);
      
      // Verify
      expect(dbService.rooms.update).toHaveBeenCalledWith('room1', mockRoomData, 'user1');
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Room not found' },
        { status: 404 }
      );
    });
    
    it('should handle not authorized error', async () => {
      // Setup mock
      (dbService.rooms.update as jest.Mock).mockRejectedValue(
        new Error('Not authorized to update this room')
      );
      
      // Execute
      const response = await roomController.updateRoom('room1', mockRoomData, mockSession as any);
      
      // Verify
      expect(dbService.rooms.update).toHaveBeenCalledWith('room1', mockRoomData, 'user1');
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Not authorized to update this room' },
        { status: 403 }
      );
    });
    
    it('should handle other errors', async () => {
      // Setup mock
      (dbService.rooms.update as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      // Execute
      const response = await roomController.updateRoom('room1', mockRoomData, mockSession as any);
      
      // Verify
      expect(dbService.rooms.update).toHaveBeenCalledWith('room1', mockRoomData, 'user1');
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Failed to update room' },
        { status: 500 }
      );
    });
  });

  describe('deleteRoom', () => {
    const mockSession = {
      user: { id: 'user1', name: 'Test User' },
    };
    
    it('should delete a room when authenticated and authorized', async () => {
      // Setup mock
      (dbService.rooms.delete as jest.Mock).mockResolvedValue({ success: true });
      
      // Execute
      const response = await roomController.deleteRoom('room1', mockSession as any);
      
      // Verify
      expect(dbService.rooms.delete).toHaveBeenCalledWith('room1', 'user1');
      expect(NextResponse.json).toHaveBeenCalledWith({ success: true });
    });
    
    it('should return 401 when not authenticated', async () => {
      // Execute
      const response = await roomController.deleteRoom('room1', null);
      
      // Verify
      expect(dbService.rooms.delete).not.toHaveBeenCalled();
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    });
    
    it('should handle room not found error', async () => {
      // Setup mock
      (dbService.rooms.delete as jest.Mock).mockRejectedValue(new Error('Room not found'));
      
      // Execute
      const response = await roomController.deleteRoom('room1', mockSession as any);
      
      // Verify
      expect(dbService.rooms.delete).toHaveBeenCalledWith('room1', 'user1');
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Room not found' },
        { status: 404 }
      );
    });
    
    it('should handle not authorized error', async () => {
      // Setup mock
      (dbService.rooms.delete as jest.Mock).mockRejectedValue(
        new Error('Not authorized to delete this room')
      );
      
      // Execute
      const response = await roomController.deleteRoom('room1', mockSession as any);
      
      // Verify
      expect(dbService.rooms.delete).toHaveBeenCalledWith('room1', 'user1');
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Not authorized to delete this room' },
        { status: 403 }
      );
    });
    
    it('should handle other errors', async () => {
      // Setup mock
      (dbService.rooms.delete as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      // Execute
      const response = await roomController.deleteRoom('room1', mockSession as any);
      
      // Verify
      expect(dbService.rooms.delete).toHaveBeenCalledWith('room1', 'user1');
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Failed to delete room' },
        { status: 500 }
      );
    });
  });
}); 