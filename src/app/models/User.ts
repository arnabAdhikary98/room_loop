import mongoose from 'mongoose';
import { hash } from 'bcrypt';

export interface IUser {
  name: string;
  email: string;
  password: string;
  image?: string;
  createdRooms?: mongoose.Types.ObjectId[];
  participatedRooms?: mongoose.Types.ObjectId[];
}

const UserSchema = new mongoose.Schema<IUser>({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  createdRooms: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
  }],
  participatedRooms: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
  }],
}, {
  timestamps: true,
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  try {
    this.password = await hash(this.password, 10);
    next();
  } catch (error: any) {
    next(error);
  }
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema); 