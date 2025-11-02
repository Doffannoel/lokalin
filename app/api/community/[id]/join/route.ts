// app/api/community/[id]/join/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Community from "@/models/Community";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  await dbConnect();

  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const community = await Community.findById(id);
  if (!community) return NextResponse.json({ message: "Komunitas tidak ditemukan" }, { status: 404 });

  const already = community.members.some((m: any) => m.toString() === user._id.toString());
  if (already) return NextResponse.json({ message: "Sudah bergabung" }, { status: 400 });

  community.members.push(user._id);
  community.totalUsers = community.members.length;
  await community.save();

  return NextResponse.json({ message: "Berhasil bergabung dengan komunitas" });
}
