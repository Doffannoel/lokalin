// app/api/event/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import Event from "@/models/Event";
import Community from "@/models/Community";
import { getUserFromToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/event/:id
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  await dbConnect();

  const { id } = await context.params; // ⬅️ penting: await
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ message: "ID event tidak valid" }, { status: 400 });
  }

  try {
    const event = await Event.findById(id)
      .populate("communityId", "title")
      .populate("createdBy", "username email");

    if (!event) {
      return NextResponse.json({ message: "Event tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ event });
  } catch (error) {
    console.error("[EVENT_GET_ERROR]", error);
    return NextResponse.json({ message: "Gagal mengambil event" }, { status: 500 });
  }
}

// PATCH /api/event/:id
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  await dbConnect();

  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await context.params; // ⬅️ penting: await
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ message: "ID event tidak valid" }, { status: 400 });
  }

  try {
    const event = await Event.findById(id);
    if (!event) return NextResponse.json({ message: "Event tidak ditemukan" }, { status: 404 });

    const community = await Community.findById(event.communityId);
    if (!community || String(community.createdBy) !== String(user._id)) {
      return NextResponse.json({ message: "Tidak memiliki izin update event" }, { status: 403 });
    }

    const body = await req.json();
    const updated = await Event.findByIdAndUpdate(id, body, { new: true });

    return NextResponse.json({ message: "Event berhasil diperbarui", event: updated });
  } catch (error) {
    console.error("[EVENT_PATCH_ERROR]", error);
    return NextResponse.json({ message: "Gagal memperbarui event" }, { status: 500 });
  }
}

// DELETE /api/event/:id
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  await dbConnect();

  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await context.params; // ⬅️ penting: await
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ message: "ID event tidak valid" }, { status: 400 });
  }

  try {
    const event = await Event.findById(id);
    if (!event) return NextResponse.json({ message: "Event tidak ditemukan" }, { status: 404 });

    const community = await Community.findById(event.communityId);
    if (!community || String(community.createdBy) !== String(user._id)) {
      return NextResponse.json({ message: "Tidak memiliki izin menghapus event" }, { status: 403 });
    }

    await Event.findByIdAndDelete(id);
    return NextResponse.json({ message: "Event berhasil dihapus" });
  } catch (error) {
    console.error("[EVENT_DELETE_ERROR]", error);
    return NextResponse.json({ message: "Gagal menghapus event" }, { status: 500 });
  }
}
