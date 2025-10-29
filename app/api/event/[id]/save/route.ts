import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import SavedEvent from "@/models/SavedEvent";
import { getUserFromToken } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const existing = await SavedEvent.findOne({ eventId: params.id, userId: user._id });
  if (existing) {
    await SavedEvent.deleteOne({ eventId: params.id, userId: user._id });
    return NextResponse.json({ message: "Event dihapus dari daftar" });
  }

  await SavedEvent.create({ userId: user._id, eventId: params.id });
  return NextResponse.json({ message: "Event berhasil disimpan" });
}
