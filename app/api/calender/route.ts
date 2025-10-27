import dbConnect from "@/lib/dbConnect";
import Calendar from "@/models/Calender";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await dbConnect();
  const token = (await cookies()).get("token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
  const { event_id, status } = await req.json();

  const calendar = await Calendar.create({
    event_id,
    user_id: decoded.id,
    status,
  });

  return NextResponse.json(calendar, { status: 201 });
}

export async function GET() {
  await dbConnect();
  const data = await Calendar.find()
    .populate("event_id", "title start_date")
    .populate("user_id", "username email");
  return NextResponse.json(data);
}
