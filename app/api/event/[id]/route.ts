import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Event from "@/models/Event";
import Community from "@/models/Community";
import { getUserFromToken } from "@/lib/auth";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  try {
    const event = await Event.findById(params.id)
      .populate("communityId", "title")
      .populate("createdBy", "username email");
    if (!event) return NextResponse.json({ message: "Event tidak ditemukan" }, { status: 404 });
    return NextResponse.json({ event });
  } catch (error) {
    return NextResponse.json({ message: "Gagal mengambil event" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const event = await Event.findById(params.id);
    if (!event) return NextResponse.json({ message: "Event tidak ditemukan" }, { status: 404 });

    const community = await Community.findById(event.communityId);
    if (community.createdBy.toString() !== user._id.toString()) {
      return NextResponse.json({ message: "Tidak memiliki izin update event" }, { status: 403 });
    }

    const body = await req.json();
    const updated = await Event.findByIdAndUpdate(params.id, body, { new: true });
    return NextResponse.json({ message: "Event berhasil diperbarui", updated });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal memperbarui event" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const event = await Event.findById(params.id);
    if (!event) return NextResponse.json({ message: "Event tidak ditemukan" }, { status: 404 });

    const community = await Community.findById(event.communityId);
    if (community.createdBy.toString() !== user._id.toString()) {
      return NextResponse.json({ message: "Tidak memiliki izin menghapus event" }, { status: 403 });
    }

    await Event.findByIdAndDelete(params.id);
    return NextResponse.json({ message: "Event berhasil dihapus" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal menghapus event" }, { status: 500 });
  }
}
