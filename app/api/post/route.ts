import dbConnect from "@/lib/dbConnect";
import Post from "@/models/Post";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await dbConnect();
  const token = (await cookies()).get("token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
  const { desc, image, video, community_id } = await req.json();

  const post = await Post.create({
    desc,
    image,
    video,
    community_id,
    user_id: decoded.id,
  });

  return NextResponse.json(post, { status: 201 });
}

export async function GET() {
  await dbConnect();
  const posts = await Post.find()
    .sort({ createdAt: -1 })
    .populate("user_id", "username image")
    .populate("community_id", "title");
  return NextResponse.json(posts);
}
