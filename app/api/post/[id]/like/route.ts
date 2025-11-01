import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Post from "@/models/Post";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  await dbConnect();

  const { id } = await context.params; // Next 15: params wajib di-await
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const post = await Post.findById(id);
  if (!post) return NextResponse.json({ message: "Post tidak ditemukan" }, { status: 404 });

  if (!Array.isArray(post.likesBy)) post.likesBy = [];

  const me = user._id.toString();
  const idx = post.likesBy.findIndex((u: any) => u?.toString() === me);

  const liked = idx === -1;
  if (liked) post.likesBy.push(user._id);
  else post.likesBy.splice(idx, 1);

  (post as any).likes = post.likesBy.length;
  await post.save();

  return NextResponse.json({
    message: liked ? "Liked" : "Unliked",
    liked,
    likes: post.likesBy.length,
  });
}
