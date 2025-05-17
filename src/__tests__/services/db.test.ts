import { dbService } from '@/app/services/db';
import dbConnect from '@/app/lib/mongoose';
import Room from '@/app/models/Room';
import User from '@/app/models/User';

// Mock the database connection
jest.mock('@/app/lib/mongoose', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock the models
jest.mock('@/app/models/Room', () => {
  const mockRoom = {
    find: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  };
  
  // Add chainable methods for populate and sort
  mockRoom.find.mockReturnValue({
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  });
  
  mockRoom.findById.mockReturnValue({
    populate: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  });
  
  return {
    __esModule: true,
    default: mockRoom,
  };
});

jest.mock('@/app/models/User', () => {
  const mockUser = {
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  };
  
  return {
    __esModule: true,
    default: mockUser,
  };
});

describe('Database Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  describe('Room Operations', () => {
    const mockRoomData = {
      title: 'Test Room',
      description: 'Test Description',
      startTime: new Date(),
      endTime: new Date(),
      tags: ['test'],
    };
    
    const mockUserId = 'user123';
    
    const mockRoom = {
      _id: 'room123',
      ...mockRoomData,
      creator: mockUserId,
      participants: [mockUserId],
    };
    
    const mockUser = {
      _id: mockUserId,
      name: 'Test User',
      email: 'test@example.com',
      createdRooms: [],
      save: jest.fn(),
    };
    
    const mockPopulatedRoom = {
      ...mockRoom,
      creator: {
        _id: mockUserId,
        name: 'Test User',
        email: 'test@example.com',
      },
      participants: [{
        _id: mockUserId,
        name: 'Test User',
        email: 'test@example.com',
      }],
    };
    
    describe('getAll', () => {
      it('should connect to the database and return rooms', async () => {
        // Setup
        const mockRooms = [mockPopulatedRoom];
        const mockPopulate = jest.fn().mockReturnThis();
        const mockSort = jest.fn().mockResolvedValue(mockRooms);
        
        (Room.find as jest.Mock).mockReturnValue({
          populate: mockPopulate,
          sort: mockSort,
        });
        
        // Execute
        const result = await dbService.rooms.getAll({ status: 'active' });
        
        // Verify
        expect(dbConnect).toHaveBeenCalled();
        expect(Room.find).toHaveBeenCalledWith({ status: 'active' });
        expect(mockPopulate).toHaveBeenCalledWith('creator', 'name email image');
        expect(mockSort).toHaveBeenCalledWith({ startTime: 1 });
        expect(result).toEqual(mockRooms);
      });
    });
    
    describe('getById', () => {
      it('should connect to the database and return a room by ID', async () => {
        // Setup
        const mockPopulate1 = jest.fn().mockReturnThis();
        const mockPopulate2 = jest.fn().mockResolvedValue(mockPopulatedRoom);
        
        (Room.findById as jest.Mock).mockReturnValue({
          populate: mockPopulate1,
        });
        
        mockPopulate1.mockReturnValue({
          populate: mockPopulate2,
        });
        
        // Execute
        const result = await dbService.rooms.getById('room123');
        
        // Verify
        expect(dbConnect).toHaveBeenCalled();
        expect(Room.findById).toHaveBeenCalledWith('room123');
        expect(mockPopulate1).toHaveBeenCalledWith('creator', '_id name email image');
        expect(mockPopulate2).toHaveBeenCalledWith('participants', '_id name email image');
        expect(result).toEqual(mockPopulatedRoom);
      });
    });
    
    describe('create', () => {
      it('should create a room and update user', async () => {
        // Setup
        (User.findById as jest.Mock).mockResolvedValue(mockUser);
        (Room.create as jest.Mock).mockResolvedValue(mockRoom);
        
        const mockPopulate1 = jest.fn().mockReturnThis();
        const mockPopulate2 = jest.fn().mockResolvedValue(mockPopulatedRoom);
        
        (Room.findById as jest.Mock).mockReturnValue({
          populate: mockPopulate1,
        });
        
        mockPopulate1.mockReturnValue({
          populate: mockPopulate2,
        });
        
        // Execute
        const result = await dbService.rooms.create(mockRoomData, mockUserId);
        
        // Verify
        expect(dbConnect).toHaveBeenCalled();
        expect(User.findById).toHaveBeenCalledWith(mockUserId);
        expect(Room.create).toHaveBeenCalledWith({
          ...mockRoomData,
          creator: mockUser._id,
          participants: [mockUser._id],
        });
        expect(mockUser.createdRooms.push).toHaveBeenCalledWith(mockRoom._id);
        expect(mockUser.save).toHaveBeenCalled();
        expect(Room.findById).toHaveBeenCalledWith(mockRoom._id);
        expect(result).toEqual(mockPopulatedRoom);
      });
      
      it('should throw an error if user is not found', async () => {
        // Setup
        (User.findById as jest.Mock).mockResolvedValue(null);
        
        // Execute and verify
        await expect(dbService.rooms.create(mockRoomData, mockUserId))
          .rejects.toThrow('User not found');
        
        expect(dbConnect).toHaveBeenCalled();
        expect(User.findById).toHaveBeenCalledWith(mockUserId);
        expect(Room.create).not.toHaveBeenCalled();
      });
    });
    
    describe('update', () => {
      it('should update a room if user is the creator', async () => {
        // Setup
        (Room.findById as jest.Mock).mockResolvedValue({
          ...mockRoom,
          creator: {
            toString: () => mockUserId
          }
        });
        
        const mockPopulate1 = jest.fn().mockReturnThis();
        const mockPopulate2 = jest.fn().mockResolvedValue(mockPopulatedRoom);
        
        (Room.findByIdAndUpdate as jest.Mock).mockReturnValue({
          populate: mockPopulate1,
        });
        
        mockPopulate1.mockReturnValue({
          populate: mockPopulate2,
        });
        
        // Execute
        const result = await dbService.rooms.update('room123', { title: 'Updated Title' }, mockUserId);
        
        // Verify
        expect(dbConnect).toHaveBeenCalled();
        expect(Room.findById).toHaveBeenCalledWith('room123');
        expect(Room.findByIdAndUpdate).toHaveBeenCalledWith(
          'room123',
          { title: 'Updated Title' },
          { new: true }
        );
        expect(mockPopulate1).toHaveBeenCalledWith('creator', '_id name email image');
        expect(mockPopulate2).toHaveBeenCalledWith('participants', '_id name email image');
        expect(result).toEqual(mockPopulatedRoom);
      });
      
      it('should throw an error if room is not found', async () => {
        // Setup
        (Room.findById as jest.Mock).mockResolvedValue(null);
        
        // Execute and verify
        await expect(dbService.rooms.update('room123', { title: 'Updated Title' }, mockUserId))
          .rejects.toThrow('Room not found');
        
        expect(dbConnect).toHaveBeenCalled();
        expect(Room.findById).toHaveBeenCalledWith('room123');
        expect(Room.findByIdAndUpdate).not.toHaveBeenCalled();
      });
      
      it('should throw an error if user is not the creator', async () => {
        // Setup
        (Room.findById as jest.Mock).mockResolvedValue({
          ...mockRoom,
          creator: {
            toString: () => 'different-user'
          }
        });
        
        // Execute and verify
        await expect(dbService.rooms.update('room123', { title: 'Updated Title' }, mockUserId))
          .rejects.toThrow('Not authorized to update this room');
        
        expect(dbConnect).toHaveBeenCalled();
        expect(Room.findById).toHaveBeenCalledWith('room123');
        expect(Room.findByIdAndUpdate).not.toHaveBeenCalled();
      });
    });
    
    describe('delete', () => {
      it('should delete a room if user is the creator', async () => {
        // Setup
        (Room.findById as jest.Mock).mockResolvedValue({
          ...mockRoom,
          creator: {
            toString: () => mockUserId
          }
        });
        
        (Room.findByIdAndDelete as jest.Mock).mockResolvedValue({});
        (User.findByIdAndUpdate as jest.Mock).mockResolvedValue({});
        
        // Execute
        const result = await dbService.rooms.delete('room123', mockUserId);
        
        // Verify
        expect(dbConnect).toHaveBeenCalled();
        expect(Room.findById).toHaveBeenCalledWith('room123');
        expect(Room.findByIdAndDelete).toHaveBeenCalledWith('room123');
        expect(User.findByIdAndUpdate).toHaveBeenCalledWith(mockUserId, {
          $pull: { createdRooms: 'room123' }
        });
        expect(result).toEqual({ success: true });
      });
      
      it('should throw an error if room is not found', async () => {
        // Setup
        (Room.findById as jest.Mock).mockResolvedValue(null);
        
        // Execute and verify
        await expect(dbService.rooms.delete('room123', mockUserId))
          .rejects.toThrow('Room not found');
        
        expect(dbConnect).toHaveBeenCalled();
        expect(Room.findById).toHaveBeenCalledWith('room123');
        expect(Room.findByIdAndDelete).not.toHaveBeenCalled();
      });
      
      it('should throw an error if user is not the creator', async () => {
        // Setup
        (Room.findById as jest.Mock).mockResolvedValue({
          ...mockRoom,
          creator: {
            toString: () => 'different-user'
          }
        });
        
        // Execute and verify
        await expect(dbService.rooms.delete('room123', mockUserId))
          .rejects.toThrow('Not authorized to delete this room');
        
        expect(dbConnect).toHaveBeenCalled();
        expect(Room.findById).toHaveBeenCalledWith('room123');
        expect(Room.findByIdAndDelete).not.toHaveBeenCalled();
      });
    });
  });
  
  describe('User Operations', () => {
    const mockUserId = 'user123';
    
    const mockUser = {
      _id: mockUserId,
      name: 'Test User',
      email: 'test@example.com',
    };
    
    describe('getById', () => {
      it('should connect to the database and return a user by ID', async () => {
        // Setup
        (User.findById as jest.Mock).mockResolvedValue(mockUser);
        
        // Execute
        const result = await dbService.users.getById(mockUserId);
        
        // Verify
        expect(dbConnect).toHaveBeenCalled();
        expect(User.findById).toHaveBeenCalledWith(mockUserId);
        expect(result).toEqual(mockUser);
      });
    });
    
    describe('getUserRooms', () => {
      it('should return created and participating rooms', async () => {
        // Setup
        const mockCreatedRooms = [{ _id: 'room1', title: 'Created Room' }];
        const mockParticipatingRooms = [{ _id: 'room2', title: 'Participating Room' }];
        
        const mockPopulateCreated = jest.fn().mockReturnThis();
        const mockSortCreated = jest.fn().mockResolvedValue(mockCreatedRooms);
        
        const mockPopulateParticipating = jest.fn().mockReturnThis();
        const mockSortParticipating = jest.fn().mockResolvedValue(mockParticipatingRooms);
        
        (Room.find as jest.Mock).mockImplementation((query) => {
          if (query.creator === mockUserId) {
            return {
              populate: mockPopulateCreated,
              sort: mockSortCreated,
            };
          } else {
            return {
              populate: mockPopulateParticipating,
              sort: mockSortParticipating,
            };
          }
        });
        
        // Execute
        const result = await dbService.users.getUserRooms(mockUserId);
        
        // Verify
        expect(dbConnect).toHaveBeenCalled();
        expect(Room.find).toHaveBeenCalledWith({ creator: mockUserId });
        expect(Room.find).toHaveBeenCalledWith({ 
          participants: mockUserId,
          creator: { $ne: mockUserId }
        });
        expect(mockPopulateCreated).toHaveBeenCalledWith('creator', 'name email image');
        expect(mockPopulateParticipating).toHaveBeenCalledWith('creator', 'name email image');
        expect(mockSortCreated).toHaveBeenCalledWith({ startTime: 1 });
        expect(mockSortParticipating).toHaveBeenCalledWith({ startTime: 1 });
        expect(result).toEqual({
          created: mockCreatedRooms,
          participating: mockParticipatingRooms,
        });
      });
    });
    
    describe('updateProfile', () => {
      it('should update user profile', async () => {
        // Setup
        const updatedUser = { ...mockUser, name: 'Updated Name' };
        (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(updatedUser);
        
        // Execute
        const result = await dbService.users.updateProfile(mockUserId, { name: 'Updated Name' });
        
        // Verify
        expect(dbConnect).toHaveBeenCalled();
        expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
          mockUserId,
          { name: 'Updated Name' },
          { new: true }
        );
        expect(result).toEqual(updatedUser);
      });
    });
  });
}); 