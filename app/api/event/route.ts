import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Event from "@/models/Event";
import Community from "@/models/Community";
import { getUserFromToken } from "@/lib/auth";

export async function POST(req: Request) {
  await dbConnect();
  try {
    const user = await getUserFromToken(req);
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { title, desc, startDate, endDate, image, communityId } = await req.json();

    if (!title || !desc || !startDate || !endDate || !communityId) {
      return NextResponse.json({ message: "Field wajib diisi lengkap" }, { status: 400 });
    }

    const community = await Community.findById(communityId);
    if (!community) return NextResponse.json({ message: "Komunitas tidak ditemukan" }, { status: 404 });

    // hanya admin komunitas yang bisa buat event
    if (community.createdBy.toString() !== user._id.toString()) {
      return NextResponse.json({ message: "Hanya admin komunitas yang bisa membuat event" }, { status: 403 });
    }

    const event = await Event.create({
      title,
      desc,
      startDate,
      endDate,
      image: image || "",
      communityId,
      createdBy: user._id,
    });

    return NextResponse.json({ message: "Event berhasil dibuat", event }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal membuat event" }, { status: 500 });
  }
}

export async function GET() {
  await dbConnect();
  try {
    const events = await Event.find().populate("communityId", "title").populate("createdBy", "username");
    return NextResponse.json({ events });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal mengambil event" }, { status: 500 });
  }
}
