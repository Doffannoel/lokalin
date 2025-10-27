import mongoose, { Schema, Document } from "mongoose";

export interface IEvent extends Document {
  title: string;
  desc: string;
  startDate: Date;
  endDate: Date;
  image?: string;
  communityId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
}

const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true },
    desc: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    image: { type: String },
    communityId: { type: Schema.Types.ObjectId, ref: "Community", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Event || mongoose.model<IEvent>("Event", EventSchema);
