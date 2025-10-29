import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Community from "@/models/Community";
import { getUserFromToken } from "@/lib/auth";

// ✅ DETAIL KOMUNITAS
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  await dbConnect();

  const community = await Community.findById(id)
    .populate("createdBy", "username email")
    .populate("members", "username email");

  if (!community)
    return NextResponse.json({ message: "Komunitas tidak ditemukan" }, { status: 404 });

  return NextResponse.json({ community });
}

// ✅ UPDATE KOMUNITAS (hanya admin)
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  await dbConnect();
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const community = await Community.findById(id);
  if (!community)
    return NextResponse.json({ message: "Komunitas tidak ditemukan" }, { status: 404 });

  if (community.createdBy.toString() !== user._id.toString())
    return NextResponse.json({ message: "Bukan admin komunitas ini" }, { status: 403 });

  const body = await req.json();
  const updated = await Community.findByIdAndUpdate(id, body, { new: true });
  return NextResponse.json({ message: "Berhasil diperbarui", updated });
}

// ✅ DELETE KOMUNITAS (hanya admin)
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  await dbConnect();
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const community = await Community.findById(id);
  if (!community)
    return NextResponse.json({ message: "Komunitas tidak ditemukan" }, { status: 404 });

  if (community.createdBy.toString() !== user._id.toString())
    return NextResponse.json({ message: "Tidak memiliki izin menghapus" }, { status: 403 });

  await Community.findByIdAndDelete(id);
  return NextResponse.json({ message: "Komunitas berhasil dihapus" });
}
