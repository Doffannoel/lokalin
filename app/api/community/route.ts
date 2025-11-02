// app/api/community/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Community from "@/models/Community";
import Post from "@/models/Post";
import { getUserFromRequest } from "@/lib/auth";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

// helpers
const slugify = (input: string) =>
  input
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

// ✅ CREATE COMMUNITY (cegah duplikat nama + buat slug)
export async function POST(req: NextRequest) {
  await dbConnect();

  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const titleRaw = (body?.title ?? "").toString();
  const descRaw = (body?.desc ?? "").toString();
  const image = (body?.image ?? "").toString();

  const title = titleRaw.trim();
  const desc = descRaw.trim();

  if (!title || !desc) {
    return NextResponse.json(
      { message: "Title dan deskripsi wajib diisi" },
      { status: 400 }
    );
  }

  // siapkan slug dasar dari title
  const baseSlug = slugify(title) || "community";

  try {
    // cek duplikat (case-insensitive) berdasarkan slug
    const existed = await Community.findOne({ slug: baseSlug })
      .collation({ locale: "en", strength: 2 })
      .select("_id");

    if (existed) {
      return NextResponse.json(
        { message: "Nama komunitas sudah digunakan. Gunakan nama lain." },
        { status: 409 }
      );
    }

    const community = await Community.create({
      title,
      slug: baseSlug,
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
  } catch (err: any) {
    // jaga-jaga kalau index unik di DB yang nembak duluan
    if (err?.code === 11000) {
      return NextResponse.json(
        { message: "Nama komunitas sudah digunakan. Gunakan nama lain." },
        { status: 409 }
      );
    }
    console.error("POST /community error:", err);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
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
    // yang dibuat oleh user ATAU diikuti user
    query = { $or: [{ createdBy: userId }, { members: userId }] };
  } else if (userId && filter === "unjoined") {
    // bukan pembuat dan bukan member
    query = { $and: [{ createdBy: { $ne: userId } }, { members: { $ne: userId } }] };
  }
  // else: "all" atau belum login -> {}

  // Ambil komunitas dasar
  const communities = await Community.find(query)
    .select("_id title desc image members createdBy totalUsers slug createdAt")
    .populate("members", "username image") // untuk preview kalau diperlukan
    .sort({ createdAt: -1 })
    .lean();

  if (communities.length === 0) {
    return NextResponse.json({ communities: [] });
  }

  // Hitung posts per komunitas (ANTI N+1)
  const ids = communities.map((c: any) => c._id as mongoose.Types.ObjectId);
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
          c.members.some((m: any) => String(m?._id ?? m) === String(userId))));

    return {
      ...c,
      totalUsers,
      postsCount: countMap.get(String(c._id)) ?? 0,
      isMember,
    };
  });

  return NextResponse.json({ communities: enriched });
}
