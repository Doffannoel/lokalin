import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import dbConnect from "@/lib/dbConnect";
import SavedEvent from "@/models/SavedEvent";
import { getUserFromToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const user = await getUserFromToken(token);
    if (!user)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    // Ambil semua event yang user simpan
    const savedEvents = await SavedEvent.find({ userId: user._id })
      .populate({
        path: "eventId",
        select: "title desc startDate endDate image communityId createdBy",
      })
      .lean();

    // Format untuk UI kalender
    const events = savedEvents.map((item) => ({
      id: item.eventId._id,
      title: item.eventId.title,
      description: item.eventId.desc,
      start: item.eventId.startDate,
      end: item.eventId.endDate,
      image: item.eventId.image,
      communityId: item.eventId.communityId,
      createdBy: item.eventId.createdBy,
    }));

    return NextResponse.json({ events });
  } catch (err) {
    console.error("Calendar fetch error:", err);
    return NextResponse.json(
      { message: "Failed to load calendar" },
      { status: 500 }
    );
  }
}
