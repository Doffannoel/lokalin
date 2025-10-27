import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password?: string;
  image?: string;
  bio?: string;
  joinedAt: Date;
  googleId?: string;
  online?: boolean;
}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  image: { type: String, default: "" },
  bio: { type: String, default: "" },
  joinedAt: { type: Date, default: Date.now },
  googleId: { type: String },
  online: { type: Boolean, default: false },
});

export default mongoose.models.User || mongoose.model<IUser>("User", userSchema);
