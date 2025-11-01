// app/api/auth/me/route.ts
export const runtime = "nodejs"; // ⬅️ WAJIB kalau pakai jsonwebtoken

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await dbConnect(); // ⬅️ Pastikan DB connect dulu

    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        image: user.image
      }
    });
  } catch (err) {
    console.error("GET /api/auth/me ERROR:", err);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
