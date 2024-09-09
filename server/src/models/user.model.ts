import { Schema, model } from 'mongoose';

// Define the User interface
export interface IUser {
  username: string;
  online: boolean;
}

// Define the User schema
const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  online: { type: Boolean, default: false },
});

// Create the User model from the schema
export const User = model<IUser>('User', userSchema);
