import mongoose, { Schema, Document } from "mongoose";

export interface IComment extends Document {
  postId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  text: string;
  createdAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Comment || mongoose.model<IComment>("Comment", commentSchema);
