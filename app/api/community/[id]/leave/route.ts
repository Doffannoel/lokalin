// app/api/community/[id]/leave/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Community from "@/models/Community";
import { getUserFromRequest } from "@/lib/auth";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  await dbConnect();

  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ message: "Invalid community id" }, { status: 400 });
  }

  const community = await Community.findById(id);
  if (!community) {
    return NextResponse.json({ message: "Komunitas tidak ditemukan" }, { status: 404 });
  }

  // Cegah owner keluar (biar gak yatim piatu)
  const ownerId = (community.createdBy as any)?._id ?? community.createdBy;
  if (String(ownerId) === String(user._id)) {
    return NextResponse.json(
      { message: "Admin tidak bisa keluar. Transfer admin atau hapus komunitas." },
      { status: 403 }
    );
  }

  // Kalau user bukan member, tidak perlu apa-apa (idempotent)
  const isMember = Array.isArray(community.members)
    ? community.members.some((m: any) => String(m?._id ?? m) === String(user._id))
    : false;

  if (!isMember) {
    return NextResponse.json({ message: "Anda bukan member komunitas ini" }, { status: 400 });
  }

  // Pull user dari members
  community.members = (community.members as any[]).filter(
    (m: any) => String(m?._id ?? m) !== String(user._id)
  );

  // Update totalUsers jika kamu simpan
  // (fallback ke length untuk konsistensi)
  community.totalUsers = typeof community.totalUsers === "number"
    ? Math.max(0, (community.totalUsers || 0) - 1)
    : community.members.length;

  const updated = await community.save();

  // (opsional) populate ringan
  await updated.populate("members", "username image");
  await updated.populate("createdBy", "username image");

  return NextResponse.json({
    message: "Berhasil keluar dari komunitas",
    community: {
      _id: updated._id,
      title: updated.title,
      desc: updated.desc,
      image: updated.image,
      totalUsers: updated.totalUsers ?? updated.members.length,
      members: updated.members,
      createdBy: updated.createdBy,
    },
  });
}
