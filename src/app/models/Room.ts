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
}, {
  timestamps: true,
});

// Automatically update status based on current time and start/end times
RoomSchema.pre('find', function (next) {
  this.updateMany(
    {
      status: 'scheduled',
      startTime: { $lte: new Date() },
    },
    {
      status: 'live',
    }
  ).exec();

  this.updateMany(
    {
      status: 'live',
      endTime: { $lte: new Date() },
    },
    {
      status: 'closed',
    }
  ).exec();

  next();
});

export default mongoose.models.Room || mongoose.model<IRoom>('Room', RoomSchema); 