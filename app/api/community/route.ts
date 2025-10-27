import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Community from "@/models/Community";
import { getUserFromToken } from "@/lib/auth";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const user = await getUserFromToken(req);
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { title, desc, image } = await req.json();
    if (!title || !desc) {
      return NextResponse.json({ message: "Title dan deskripsi wajib diisi" }, { status: 400 });
    }

    const community = await Community.create({
      title,
      desc,
      image: image || "",
      date: new Date(),
      createdBy: user._id,
      members: [user._id],
    });

    return NextResponse.json({ message: "Komunitas berhasil dibuat", community }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal membuat komunitas" }, { status: 500 });
  }
}

export async function GET() {
  await dbConnect();

  try {
    const communities = await Community.find().populate("createdBy", "username email");
    return NextResponse.json({ communities });
  } catch (error) {
    return NextResponse.json({ message: "Gagal mengambil komunitas" }, { status: 500 });
  }
}
