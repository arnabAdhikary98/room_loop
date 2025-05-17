import mongoose from 'mongoose';

export interface IRoom {
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  creator: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[];
  tags: string[];
  status: 'scheduled' | 'live' | 'closed';
  isOpen: boolean; // Whether anyone can join or only invitees
}

const RoomSchema = new mongoose.Schema<IRoom>({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  tags: [{
    type: String,
    trim: true,
  }],
  status: {
    type: String,
    enum: ['scheduled', 'live', 'closed'],
    default: 'scheduled',
  },
  isOpen: {
    type: Boolean,
    default: true, // Default to open rooms that anyone can join
  }
}, {
  timestamps: true,
});

// Automatically update status based on current time and start/end times
RoomSchema.pre('find', async function (next) {
  try {
    const Room = mongoose.model('Room');
    
    // Update scheduled rooms to live
    await Room.updateMany(
      {
        status: 'scheduled',
        startTime: { $lte: new Date() },
      },
      {
        status: 'live',
      }
    ).clone(); // Use clone() to avoid "Query was already executed" errors

    // Update live rooms to closed
    await Room.updateMany(
      {
        status: 'live',
        endTime: { $lte: new Date() },
      },
      {
        status: 'closed',
      }
    ).clone(); // Use clone() to avoid "Query was already executed" errors

    next();
  } catch (error) {
    console.error('Error in Room pre-find hook:', error);
    next();
  }
});

export default mongoose.models.Room || mongoose.model<IRoom>('Room', RoomSchema); 