import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Community from "@/models/Community";
import { getUserFromToken } from "@/lib/auth";

// ✅ CREATE COMMUNITY
export async function POST(req: Request) {
  await dbConnect();
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { title, desc, image } = await req.json();
  if (!title || !desc)
    return NextResponse.json({ message: "Title dan deskripsi wajib diisi" }, { status: 400 });

  const community = await Community.create({
    title,
    desc,
    image: image || "",
    createdBy: user._id,
    members: [user._id],
  });

  return NextResponse.json({ message: "Komunitas berhasil dibuat", community }, { status: 201 });
}

// ✅ GET ALL COMMUNITY (FILTERABLE)
export async function GET(req: Request) {
  await dbConnect();
  const user = await getUserFromToken(req);
  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("filter"); // all | joined | unjoined

  let query = {};

  if (user && filter === "joined") {
    query = { members: user._id };
  } else if (user && filter === "unjoined") {
    query = { members: { $ne: user._id } };
  }

  const communities = await Community.find(query)
    .populate("createdBy", "username email")
    .populate("members", "username email");

  return NextResponse.json({ communities });
}
