import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Community from "@/models/Community";
import { getUserFromRequest } from "@/lib/auth";
import mongoose from "mongoose";

// (opsional) pastikan diroute ini selalu dynamic
export const dynamic = "force-dynamic";

// ✅ DETAIL — dukung param :id berupa ObjectId ATAU slug
export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  await dbConnect();

  const query = mongoose.isValidObjectId(id) ? { _id: id } : { slug: id };

  const community = await Community.findOne(query)
    .populate("createdBy", "username email")
    .populate("members", "username email");

  if (!community) {
    return NextResponse.json({ message: "Komunitas tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ community });
}

// ✅ UPDATE — hanya admin (createdBy) yang boleh
export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params; // di FE kamu pakai _id → cocok
  await dbConnect();

  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const community = await Community.findById(id);
  if (!community) return NextResponse.json({ message: "Komunitas tidak ditemukan" }, { status: 404 });

  const ownerId = (community.createdBy as any)?._id ?? community.createdBy;
  if (String(ownerId) !== String(user._id)) {
    return NextResponse.json({ message: "Bukan admin komunitas ini" }, { status: 403 });
  }

  let payload: Partial<{ title: string; desc: string; image: string }> = {};
  try {
    payload = await req.json();
  } catch {
    // kalau tanpa body JSON, balas error rapi
    return NextResponse.json({ message: "Bad JSON payload" }, { status: 400 });
  }

  const toUpdate: any = {};
  if (typeof payload.title === "string") toUpdate.title = payload.title.trim();
  if (typeof payload.desc === "string") toUpdate.desc = payload.desc.trim();
  if (typeof payload.image === "string") toUpdate.image = payload.image;

  const updated = await Community.findByIdAndUpdate(id, toUpdate, { new: true })
    .populate("createdBy", "username email")
    .populate("members", "username email");

  return NextResponse.json({ message: "Berhasil diperbarui", community: updated });
}

// ✅ DELETE — opsional, seperti punyamu sebelumnya
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  await dbConnect();

  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const community = await Community.findById(id);
  if (!community) return NextResponse.json({ message: "Komunitas tidak ditemukan" }, { status: 404 });

  const ownerId = (community.createdBy as any)?._id ?? community.createdBy;
  if (String(ownerId) !== String(user._id)) {
    return NextResponse.json({ message: "Tidak memiliki izin menghapus" }, { status: 403 });
  }

  await Community.findByIdAndDelete(id);
  return NextResponse.json({ message: "Komunitas berhasil dihapus" });
}
