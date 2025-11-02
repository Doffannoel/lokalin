import mongoose, { Schema, Document } from "mongoose";

export interface IPost extends Document {
  desc: string;
  image?: string;
  video?: string;
  user_id: mongoose.Types.ObjectId;
  community_id: mongoose.Types.ObjectId;
  likes: number;
  createdAt: Date;
  likesBy: mongoose.Types.ObjectId[];
  comments: mongoose.Types.ObjectId[];
}

const postSchema = new Schema<IPost>({
  desc: { type: String, required: true },
  image: { type: String },
  video: { type: String },
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  community_id: { type: Schema.Types.ObjectId, ref: "Community", required: true },
  likes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  likesBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
});

export default mongoose.models.Post || mongoose.model<IPost>("Post", postSchema);
