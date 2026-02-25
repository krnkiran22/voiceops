import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  telegramUserId?: string;
  telegramUsername?: string;
  role: 'operator' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  name:             { type: String, required: true },
  email:            { type: String, required: true, unique: true },
  phone:            { type: String, required: true },
  passwordHash:     { type: String, required: true },
  telegramUserId:   { type: String, default: null, index: { sparse: true } },
  telegramUsername: { type: String, default: null },
  role:             { type: String, enum: ['operator', 'admin'], default: 'operator' },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
