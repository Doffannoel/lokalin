import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import SavedEvent from "@/models/SavedEvent";
import { getUserFromToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  await dbConnect();

  const user = await getUserFromToken(req);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const saved = await SavedEvent.find({ userId: user._id })
      .populate({
        path: "eventId",
        populate: [
          { path: "communityId", select: "title" },
          { path: "createdBy", select: "username email" }
        ],
      })
      .lean();

    // Filter event yang rusak / terhapus
    const events = (saved || []).filter((s: any) => s.eventId).sort(
      (a: any, b: any) =>
        new Date(a.eventId.startDate).getTime() -
        new Date(b.eventId.startDate).getTime()
    );

    return NextResponse.json({ events });
  } catch (error) {
    console.error("[CALENDAR_GET_ERROR]", error);
    return NextResponse.json(
      { message: "Gagal mengambil saved event" },
      { status: 500 }
    );
  }
}
