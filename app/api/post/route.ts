import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import Post from "@/models/Post";
import Community from "@/models/Community";

const isObjectId = (s: string) => /^[0-9a-fA-F]{24}$/.test(s);

// === CREATE POST (tetap seperti punyamu) ===
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
    community_id, // biarkan apa adanya (kompat lama)
    user_id: decoded.id,
  });

  return NextResponse.json(post, { status: 201 });
}

// === LIST POSTS (kompat lama + bisa filter komunitas) ===
export async function GET(req: Request) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const qpCommunity = searchParams.get("community_id"); // bisa ObjectId ATAU slug (kompat)
  const slug = searchParams.get("slug");

  let filter: any = {};

  if (qpCommunity) {
    if (isObjectId(qpCommunity)) {
      filter = { community_id: new mongoose.Types.ObjectId(qpCommunity) };
    } else {
      // treat sebagai slug
      const comm = await Community.findOne({ slug: qpCommunity }).select("_id");
      if (!comm) return NextResponse.json([]); // tidak ada → kosong
      filter = { community_id: comm._id };
    }
  } else if (slug) {
    const comm = await Community.findOne({ slug }).select("_id");
    if (!comm) return NextResponse.json([]); // tidak ada → kosong
    filter = { community_id: comm._id };
  }
  // else: tanpa filter → semua post (home page)

  const posts = await Post.find(filter)
    .sort({ createdAt: -1 })
    .populate("user_id", "username image")
    .populate("community_id", "title");

  // PENTING: kembalikan ARRAY (kompat dengan kode lamamu)
  return NextResponse.json(posts);
}
