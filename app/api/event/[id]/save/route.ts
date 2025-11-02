import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import SavedEvent from "@/models/SavedEvent";
import Event from "@/models/Event";
import { getUserFromToken } from "@/lib/auth";
import mongoose from "mongoose";

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await dbConnect();

  const user = await getUserFromToken(req);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // ✅ Unwrap params
  const { id: eventId } = await context.params;

  if (!mongoose.isValidObjectId(eventId)) {
    return NextResponse.json({ message: "ID event tidak valid" }, { status: 400 });
  }

  const event = await Event.findById(eventId);
  if (!event) {
    return NextResponse.json({ message: "Event tidak ditemukan" }, { status: 404 });
  }

  // Toggle Save (jika sudah save → un-save)
  const existing = await SavedEvent.findOne({ userId: user._id, eventId });
  if (existing) {
    await SavedEvent.deleteOne({ _id: existing._id });
    return NextResponse.json({ message: "Event berhasil di-unsave" });
  }

  await SavedEvent.create({
    userId: user._id,
    eventId,
  });

  return NextResponse.json({ message: "Event berhasil disimpan" });
}
