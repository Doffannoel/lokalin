// app/api/event/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Event from "@/models/Event";
import Community from "@/models/Community";
import { getUserFromRequest } from "@/lib/auth";

// GET /api/event — list semua event (buat halaman /event)
export async function GET(req: NextRequest) {
  await dbConnect();

  // (opsional) filter by community ?communityId=... 
  const { searchParams } = new URL(req.url);
  const communityId = searchParams.get("communityId") || undefined;

  const query: any = {};
  if (communityId) query.communityId = communityId;

  const events = await Event.find(query)
    .sort({ startDate: 1 })
    .populate("communityId", "title")
    .populate("createdBy", "username email")
    .lean();

  return NextResponse.json({ events });
}

// POST /api/event — create event (hanya admin komunitas)
export async function POST(req: NextRequest) {
  await dbConnect();

  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body)
    return NextResponse.json({ message: "Bad JSON payload" }, { status: 400 });

  const { title, desc, startDate, endDate, communityId, image } = body;

  if (!title || !desc || !startDate || !endDate || !communityId) {
    return NextResponse.json(
      { message: "Title, desc, startDate, endDate, communityId wajib diisi" },
      { status: 400 }
    );
  }

  // pastikan pembuat adalah admin komunitas
  const community = await Community.findById(communityId).select("createdBy");
  if (!community)
    return NextResponse.json({ message: "Komunitas tidak ditemukan" }, { status: 404 });

  if (String(community.createdBy) !== String(user._id)) {
    return NextResponse.json(
      { message: "Hanya admin komunitas yang bisa membuat event" },
      { status: 403 }
    );
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return NextResponse.json({ message: "Format tanggal invalid" }, { status: 400 });
  }
  if (end <= start) {
    return NextResponse.json(
      { message: "End date/time harus lebih besar dari start date/time" },
      { status: 400 }
    );
  }

  const created = await Event.create({
    title: String(title).trim(),
    desc: String(desc).trim(),
    startDate: start,
    endDate: end,
    image: image || "",
    communityId,
    createdBy: user._id,
  });

  return NextResponse.json(
    { message: "Event berhasil dibuat", event: created },
    { status: 201 }
  );
}
