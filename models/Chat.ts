import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface IChat extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  id: { type: String, required: true },
  content: { type: String, required: true },
  role: { type: String, enum: ['user', 'assistant'], required: true },
  timestamp: { type: Date, default: Date.now }
});

const ChatSchema = new Schema<IChat>({
  name: { type: String, required: true, default: 'New Chat' },
  messages: [MessageSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
ChatSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const Chat = mongoose.models.Chat || mongoose.model<IChat>('Chat', ChatSchema);
