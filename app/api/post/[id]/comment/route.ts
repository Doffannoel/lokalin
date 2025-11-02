import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Comment from "@/models/Comment";
import Post from "@/models/Post";
import { getUserFromToken } from "@/lib/auth";

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id: postId } = await context.params;
  await dbConnect();
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { text } = await req.json();
  if (!text) return NextResponse.json({ message: "Komentar tidak boleh kosong" }, { status: 400 });

  const comment = await Comment.create({
    postId: postId,
    userId: user._id,
    text,
  });

  // Add comment to post's comments array
  const post = await Post.findById(postId);
  if (post) {
    post.comments.push(comment._id);
    await post.save();
  }

  return NextResponse.json({ message: "Komentar ditambahkan", comment }, { status: 201 });
}

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  await dbConnect();
  const comments = await Comment.find({ postId: id }).populate("userId", "username image");
  return NextResponse.json({ comments });
}
