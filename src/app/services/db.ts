import dbConnect from '@/app/lib/mongoose';
import Room from '@/app/models/Room';
import User from '@/app/models/User';
import Message from '@/app/models/Message';
import Notification from '@/app/models/Notification';

export const dbService = {
  // Room operations
  rooms: {
    // Get all rooms with optional filters
    getAll: async (filters: any = {}) => {
      await dbConnect();
      return Room.find(filters)
        .populate('creator', 'name email image')
        .sort({ startTime: 1 });
    },
    
    // Get a single room by ID
    getById: async (id: string) => {
      await dbConnect();
      return Room.findById(id)
        .populate('creator', '_id name email image')
        .populate('participants', '_id name email image');
    },
    
    // Create a new room
    create: async (roomData: any, userId: string) => {
      await dbConnect();
      
      // Get user
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      // Create room
      const newRoom = await Room.create({
        ...roomData,
        creator: user._id,
        participants: [user._id],
      });
      
      // Add room to user's createdRooms
      user.createdRooms = user.createdRooms || [];
      user.createdRooms.push(newRoom._id);
      await user.save();
      
      // Return populated room
      return Room.findById(newRoom._id)
        .populate('creator', '_id name email image')
        .populate('participants', '_id name email image');
    },
    
    // Update a room
    update: async (id: string, roomData: any, userId: string) => {
      await dbConnect();
      
      // Check if room exists and user is the creator
      const room = await Room.findById(id);
      if (!room) {
        throw new Error('Room not found');
      }
      
      if (room.creator.toString() !== userId) {
        throw new Error('Not authorized to update this room');
      }
      
      // Update room
      const updatedRoom = await Room.findByIdAndUpdate(
        id,
        { ...roomData },
        { new: true }
      )
        .populate('creator', '_id name email image')
        .populate('participants', '_id name email image');
        
      // Create notifications for participants
      if (room.participants && room.participants.length > 0) {
        const notifications = room.participants
          .filter((participant: any) => participant.toString() !== userId) // Don't notify the updater
          .map((participantId: any) => ({
            recipient: participantId,
            sender: userId,
            type: 'room_update',
            content: `The room "${room.title}" has been updated`,
            relatedRoom: room._id,
          }));
        
        if (notifications.length > 0) {
          await Notification.insertMany(notifications);
        }
      }
      
      return updatedRoom;
    },
    
    // Delete a room
    delete: async (id: string, userId: string) => {
      await dbConnect();
      
      // Check if room exists and user is the creator
      const room = await Room.findById(id);
      if (!room) {
        throw new Error('Room not found');
      }
      
      if (room.creator.toString() !== userId) {
        throw new Error('Not authorized to delete this room');
      }
      
      // Delete room
      await Room.findByIdAndDelete(id);
      
      // Remove room from user's createdRooms
      await User.findByIdAndUpdate(userId, {
        $pull: { createdRooms: id }
      });
      
      // Delete all messages in the room
      await Message.deleteMany({ room: id });
      
      // Delete all notifications related to this room
      await Notification.deleteMany({ relatedRoom: id });
      
      return { success: true };
    }
  },
  
  // User operations
  users: {
    // Get user by ID
    getById: async (id: string) => {
      await dbConnect();
      return User.findById(id);
    },
    
    // Get user's rooms
    getUserRooms: async (userId: string) => {
      await dbConnect();
      
      // Get rooms created by the user
      const createdRooms = await Room.find({ creator: userId })
        .populate('creator', 'name email image')
        .sort({ startTime: 1 });
      
      // Get rooms where user is a participant
      const participatingRooms = await Room.find({ 
        participants: userId,
        creator: { $ne: userId } // Exclude rooms created by the user
      })
        .populate('creator', 'name email image')
        .sort({ startTime: 1 });
      
      return {
        created: createdRooms,
        participating: participatingRooms
      };
    },
    
    // Update user profile
    updateProfile: async (id: string, userData: any) => {
      await dbConnect();
      return User.findByIdAndUpdate(id, userData, { new: true });
    }
  },
  
  // Message operations
  messages: {
    // Get messages for a room
    getRoomMessages: async (roomId: string) => {
      await dbConnect();
      return Message.find({ room: roomId })
        .populate('sender', '_id name email image')
        .sort({ createdAt: 1 });
    },
    
    // Create a new message
    create: async (messageData: any) => {
      await dbConnect();
      
      // Create message
      const newMessage = await Message.create(messageData);
      
      // Get room to notify participants
      const room = await Room.findById(messageData.room);
      if (room && room.participants) {
        // Create notifications for participants except the sender
        const notifications = room.participants
          .filter((participant: any) => participant.toString() !== messageData.sender) // Don't notify the sender
          .map((participantId: any) => ({
            recipient: participantId,
            sender: messageData.sender,
            type: 'new_message',
            content: `New message in "${room.title}"`,
            relatedRoom: room._id,
            relatedMessage: newMessage._id,
          }));
        
        if (notifications.length > 0) {
          await Notification.insertMany(notifications);
        }
      }
      
      // Return populated message
      return Message.findById(newMessage._id)
        .populate('sender', '_id name email image');
    },
    
    // Delete a message
    delete: async (id: string, userId: string) => {
      await dbConnect();
      
      // Check if message exists and user is the sender
      const message = await Message.findById(id);
      if (!message) {
        throw new Error('Message not found');
      }
      
      if (message.sender.toString() !== userId) {
        throw new Error('Not authorized to delete this message');
      }
      
      // Delete message
      await Message.findByIdAndDelete(id);
      
      // Delete any notifications related to this message
      await Notification.deleteMany({ relatedMessage: id });
      
      return { success: true };
    }
  },
  
  // Notification operations
  notifications: {
    // Get notifications for a user
    getUserNotifications: async (userId: string, { limit = 20, offset = 0, unreadOnly = false } = {}) => {
      await dbConnect();
      
      const query: any = { recipient: userId };
      if (unreadOnly) {
        query.read = false;
      }
      
      return Notification.find(query)
        .populate('sender', '_id name email image')
        .populate('relatedRoom', '_id title')
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit);
    },
    
    // Get unread notification count
    getUnreadCount: async (userId: string) => {
      await dbConnect();
      return Notification.countDocuments({ recipient: userId, read: false });
    },
    
    // Mark notification as read
    markAsRead: async (id: string, userId: string) => {
      await dbConnect();
      
      // Check if notification exists and belongs to the user
      const notification = await Notification.findOne({ _id: id, recipient: userId });
      if (!notification) {
        throw new Error('Notification not found');
      }
      
      // Mark as read
      notification.read = true;
      await notification.save();
      
      return notification;
    },
    
    // Mark all notifications as read
    markAllAsRead: async (userId: string) => {
      await dbConnect();
      await Notification.updateMany(
        { recipient: userId, read: false },
        { read: true }
      );
      
      return { success: true };
    }
  }
}; 