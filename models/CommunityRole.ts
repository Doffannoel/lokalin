import mongoose, { Schema, Document } from "mongoose";

export interface ICommunityRole extends Document {
  user_id: mongoose.Types.ObjectId;
  community_id: mongoose.Types.ObjectId;
  role: string; // admin, member, moderator
}

const communityRoleSchema = new Schema<ICommunityRole>({
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  community_id: { type: Schema.Types.ObjectId, ref: "Community", required: true },
  role: { type: String, enum: ["admin", "member"], default: "member" },
});

export default mongoose.models.CommunityRole ||
  mongoose.model<ICommunityRole>("CommunityRole", communityRoleSchema);
