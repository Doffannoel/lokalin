import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Community from "@/models/Community";
import { getUserFromRequest } from "@/lib/auth";

// ✅ DETAIL
export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params; // ⬅️ penting: await
  await dbConnect();

  const community = await Community.findById(id)
    .populate("createdBy", "username email")
    .populate("members", "username email");

  if (!community) return NextResponse.json({ message: "Komunitas tidak ditemukan" }, { status: 404 });
  return NextResponse.json({ community });
}

// ✅ UPDATE
export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params; // ⬅️ await
  await dbConnect();

  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const community = await Community.findById(id);
  if (!community) return NextResponse.json({ message: "Komunitas tidak ditemukan" }, { status: 404 });

  const ownerId = (community.createdBy as any)?._id ?? community.createdBy;
  if (ownerId.toString() !== user._id.toString()) {
    return NextResponse.json({ message: "Bukan admin komunitas ini" }, { status: 403 });
  }

  const body = await req.json();
  const updated = await Community.findByIdAndUpdate(id, body, { new: true });
  return NextResponse.json({ message: "Berhasil diperbarui", updated });
}

// ✅ DELETE
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params; // ⬅️ await
  await dbConnect();

  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const community = await Community.findById(id);
  if (!community) return NextResponse.json({ message: "Komunitas tidak ditemukan" }, { status: 404 });

  const ownerId = (community.createdBy as any)?._id ?? community.createdBy;
  if (ownerId.toString() !== user._id.toString()) {
    return NextResponse.json({ message: "Tidak memiliki izin menghapus" }, { status: 403 });
  }

  await Community.findByIdAndDelete(id);
  return NextResponse.json({ message: "Komunitas berhasil dihapus" });
}
