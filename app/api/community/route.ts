// app/api/community/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Community from "@/models/Community";
import { getUserFromRequest } from "@/lib/auth";

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

// ✅ GET ALL COMMUNITY (FILTERABLE)
export async function GET(req: NextRequest) {
  await dbConnect();

  const user = await getUserFromRequest(req); // boleh null jika belum login
  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("filter"); // "all" | "joined" | "unjoined"

  let query: any = {};

  if (user && filter === "joined") {
    query = { members: user._id };
  } else if (user && filter === "unjoined") {
    query = { members: { $ne: user._id } };
  }
  // else: "all" atau tidak login -> query {}

  const communities = await Community.find(query)
    .populate("createdBy", "username email")
    .populate("members", "username email");

  return NextResponse.json({ communities });
}
