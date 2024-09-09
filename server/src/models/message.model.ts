import { Schema, model } from 'mongoose';

// Define the Message interface
export interface IMessage {
  from: string;
  to: string;
  message: string;
  timestamp: Date;
}

// Define the Message schema
const messageSchema = new Schema<IMessage>({
  from: { type: String, required: true },
  to: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

// Create the Message model from the schema
export const Message = model<IMessage>('Message', messageSchema);
