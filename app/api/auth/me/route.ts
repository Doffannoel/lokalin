import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/Users";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET(req: Request) {
  await dbConnect();

  try {
    const token = req.headers.get("cookie")?.split("token=")[1];
    if (!token) {
      return NextResponse.json({ message: "Tidak ada token" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return NextResponse.json({ message: "User tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ message: "Token tidak valid" }, { status: 401 });
  }
}
