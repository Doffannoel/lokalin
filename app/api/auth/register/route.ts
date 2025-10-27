import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/Users";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { username, email, password, confirmPassword, profile, bio } = await req.json();

    if (!username || !email || !password || !confirmPassword) {
      return NextResponse.json({ message: "Semua field wajib diisi" }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ message: "Password dan konfirmasi tidak cocok" }, { status: 400 });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json({ message: "Email sudah terdaftar" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      profile: profile || "",
      bio: bio || "",
      joinDate: new Date(),
    });

    return NextResponse.json(
      { message: "Registrasi berhasil", user: { id: newUser._id, username, email } },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Terjadi kesalahan server" }, { status: 500 });
  }
}
