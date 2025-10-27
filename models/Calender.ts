import mongoose, { Schema, Document } from "mongoose";

export interface ICalendar extends Document {
  event_id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
  status: boolean;
}

const calendarSchema = new Schema<ICalendar>({
  event_id: { type: Schema.Types.ObjectId, ref: "Event", required: true },
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: Boolean, default: false },
});

export default mongoose.models.Calendar ||
  mongoose.model<ICalendar>("Calendar", calendarSchema);
