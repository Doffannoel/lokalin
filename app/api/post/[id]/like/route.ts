import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Post from "@/models/Post";
import { getUserFromToken } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const post = await Post.findById(params.id);
  if (!post) return NextResponse.json({ message: "Post tidak ditemukan" }, { status: 404 });

  // Simulasikan toggle-like di array
  if (!post.likesBy) post.likesBy = [];
  const index = post.likesBy.indexOf(user._id);

  if (index === -1) {
    post.likesBy.push(user._id);
  } else {
    post.likesBy.splice(index, 1);
  }

  post.likes = post.likesBy.length;
  await post.save();

  return NextResponse.json({ message: "Berhasil mengubah status like", likes: post.likes });
}
