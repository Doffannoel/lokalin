import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import SavedEvent from "@/models/SavedEvent";
import { getUserFromToken } from "@/lib/auth";

export async function GET(req: Request) {
  await dbConnect();
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const saved = await SavedEvent.find({ userId: user._id }).populate("eventId");
  return NextResponse.json({ saved });
}
