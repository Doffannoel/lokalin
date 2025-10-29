import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Community from "@/models/Community";
import { getUserFromToken } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const community = await Community.findById(params.id);
  if (!community) return NextResponse.json({ message: "Komunitas tidak ditemukan" }, { status: 404 });

  if (community.members.includes(user._id)) {
    return NextResponse.json({ message: "Sudah bergabung" }, { status: 400 });
  }

  community.members.push(user._id);
  community.totalUsers = community.members.length;
  await community.save();

  return NextResponse.json({ message: "Berhasil bergabung dengan komunitas" });
}
