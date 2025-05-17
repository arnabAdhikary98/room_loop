import mongoose from 'mongoose';

export interface INotification {
  recipient: mongoose.Types.ObjectId;
  type: 'room_invite' | 'room_update' | 'new_message' | 'system';
  content: string;
  data?: {
    roomId?: mongoose.Types.ObjectId;
    roomTitle?: string;
    messageId?: mongoose.Types.ObjectId;
    senderId?: mongoose.Types.ObjectId;
  };
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new mongoose.Schema<INotification>({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['room_invite', 'room_update', 'new_message', 'system'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  data: {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
    },
    roomTitle: String,
    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  read: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Index for faster queries
NotificationSchema.index({ recipient: 1, read: 1 });
NotificationSchema.index({ recipient: 1, createdAt: -1 });

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema); 