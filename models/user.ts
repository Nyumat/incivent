import mongoose from "mongoose";

export interface InciventUser extends mongoose.Document {
  email: string;
  password: string;
  name: string;
  username: string;
}

const userSchema = new mongoose.Schema<InciventUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
});

export const User = mongoose.model<InciventUser>("User", userSchema);

export async function deleteAccount(userId: string) {
  const user = await User.findById(userId).exec();

  if (!user) {
    throw new Error("User not found");
  }

  await User.findByIdAndDelete(userId);
}
