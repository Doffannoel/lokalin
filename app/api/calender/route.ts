import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import SavedEvent from "@/models/SavedEvent";
import { getUserFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // ✅ Populate FULL: eventId + communityId + createdBy
    const savedEvents = await SavedEvent.find({ userId: user._id })
      .populate({
        path: "eventId",
        populate: [
          { path: "communityId", select: "title totalUsers" },
          { path: "createdBy", select: "username" }
        ],
      })
      .sort({ savedAt: -1 })
      .lean();

    // ✅ Kembalikan dalam struktur yang CalendarPage kamu EXPECT
    return NextResponse.json({ events: savedEvents });

  } catch (err) {
    console.error("Calendar fetch error:", err);
    return NextResponse.json(
      { message: "Failed to load calendar" },
      { status: 500 }
    );
  }
}
