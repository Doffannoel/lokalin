import mongoose, { Schema, Document } from "mongoose";

export interface ISavedEvent extends Document {
  userId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  savedAt: Date;
}

const savedEventSchema = new Schema<ISavedEvent>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
  savedAt: { type: Date, default: Date.now },
});

export default mongoose.models.SavedEvent || mongoose.model<ISavedEvent>("SavedEvent", savedEventSchema);
