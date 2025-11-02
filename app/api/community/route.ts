// app/api/community/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Community from "@/models/Community";
import Post from "@/models/Post";
import { getUserFromRequest } from "@/lib/auth";
import mongoose from "mongoose";

// ✅ CREATE COMMUNITY
export async function POST(req: NextRequest) {
  await dbConnect();

  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { title, desc, image } = await req.json();
  if (!title || !desc) {
    return NextResponse.json({ message: "Title dan deskripsi wajib diisi" }, { status: 400 });
  }

  const community = await Community.create({
    title,
    desc,
    image: image || "",
    createdBy: user._id,
    members: [user._id],
    totalUsers: 1,
  });

  return NextResponse.json(
    { message: "Komunitas berhasil dibuat", community },
    { status: 201 }
  );
}

// ✅ GET ALL COMMUNITY (FILTERABLE) + isMember + postsCount
export async function GET(req: NextRequest) {
  await dbConnect();

  const user = await getUserFromRequest(req).catch(() => null); // boleh null
  const userId = user?._id ? new mongoose.Types.ObjectId(user._id) : null;

  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("filter"); // "all" | "joined" | "unjoined"

  let query: any = {};
  if (userId && filter === "joined") {
    query = { $or: [{ createdBy: userId }, { members: userId }] };
  } else if (userId && filter === "unjoined") {
    query = { members: { $ne: userId } };
  }
  // else: "all" atau belum login -> {}

  // Ambil komunitas dasar
  const communities = await Community.find(query)
    .select("_id title desc image members createdBy totalUsers slug") // slug opsional
    .populate("members", "username image") // opsional: untuk preview avatar/nama
    .lean();

  if (communities.length === 0) {
    return NextResponse.json({ communities: [] });
  }

  // Hitung posts per komunitas (ANTI N+1)
  const ids = communities.map((c: any) => c._id);
  const counts = await Post.aggregate([
    { $match: { community_id: { $in: ids } } },
    { $group: { _id: "$community_id", count: { $sum: 1 } } },
  ]);

  const countMap = new Map<string, number>();
  counts.forEach((row: any) => countMap.set(String(row._id), row.count));

  // Enrich: isMember, postsCount, totalUsers (fallback)
  const enriched = communities.map((c: any) => {
    const totalUsers =
      typeof c.totalUsers === "number"
        ? c.totalUsers
        : Array.isArray(c.members)
        ? c.members.length
        : 0;

    const isMember =
      !!userId &&
      (String(c.createdBy) === String(userId) ||
        (Array.isArray(c.members) &&
          c.members.some(
            (m: any) => String(m?._id ?? m) === String(userId)
          )));

    return {
      ...c,
      totalUsers,
      postsCount: countMap.get(String(c._id)) ?? 0,
      isMember,
    };
  });

  return NextResponse.json({ communities: enriched });
}
