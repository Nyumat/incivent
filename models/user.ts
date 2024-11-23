import mongoose from "mongoose";

export interface InciventUser extends mongoose.Document {
  email: string;
  password: string;
}

const userSchema = new mongoose.Schema<InciventUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

export const User = mongoose.model<InciventUser>("User", userSchema);
