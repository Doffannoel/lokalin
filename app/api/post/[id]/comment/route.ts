import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Comment from "@/models/Comment";
import { getUserFromToken } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { text } = await req.json();
  if (!text) return NextResponse.json({ message: "Komentar tidak boleh kosong" }, { status: 400 });

  const comment = await Comment.create({
    postId: params.id,
    userId: user._id,
    text,
  });

  return NextResponse.json({ message: "Komentar ditambahkan", comment }, { status: 201 });
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const comments = await Comment.find({ postId: params.id }).populate("userId", "username image");
  return NextResponse.json({ comments });
}
