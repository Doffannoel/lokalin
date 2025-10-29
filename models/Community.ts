import mongoose, { Schema, Document } from "mongoose";

export interface ICommunity extends Document {
  title: string;
  desc: string;
  image?: string;
  totalUsers: number;
  createdBy: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const communitySchema = new Schema<ICommunity>({
  title: { type: String, required: true },
  desc: { type: String, required: true },
  image: { type: String },
  totalUsers: { type: Number, default: 1 },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  members: [{ type: Schema.Types.ObjectId, ref: "User" }], 
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Community ||
  mongoose.model<ICommunity>("Community", communitySchema);
