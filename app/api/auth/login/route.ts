// app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/Users";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { email, password } = await req.json();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: "Email tidak ditemukan" }, { status: 404 });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ message: "Password salah" }, { status: 401 });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email }, // payload cukup id & email
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    const res = NextResponse.json({
      message: "Login berhasil",
      user: {
        id: user._id.toString(),
        username: user.username,     // ⬅️ penting untuk Sidebar
        email: user.email,
        image: user.image ?? null,   // opsional
      },
      token,
    });

    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 1 hari
      path: "/",
    });

    return res;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Terjadi kesalahan server" }, { status: 500 });
  }
}
