// lib/auth.ts
import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/Users";

type JwtPayload = { id: string; iat: number; exp: number };

// Ambil dari env sekali agar tidak undefined di runtime
const { JWT_SECRET } = process.env;

/**
 * Ambil user dari cookie httpOnly "token" atau header Authorization: Bearer <token>.
 * Return: user doc (subset field) atau null jika tidak ada/invalid.
 */
export async function getUserFromRequest(req: NextRequest) {
  if (!JWT_SECRET) {
    // Hindari 500 yang bikin bingung kalau env belum diset
    console.error("[auth] JWT_SECRET is not set");
    return null;
  }

  // 1) Coba dari cookie httpOnly
  const cookieToken = req.cookies.get("token")?.value;

  // 2) Fallback dari Authorization: Bearer <token>
  const authHeader = req.headers.get("authorization");
  const headerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : undefined;

  const token = cookieToken || headerToken;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    await dbConnect();
    const user = await User.findById(decoded.id).select(
      "_id name email username image"
    );

    return user ?? null;
  } catch (err) {
    // token invalid/expired, atau error verifikasi
    return null;
  }
}

/** ✅ Alias untuk kompatibilitas kode lama yang masih import getUserFromToken */
export const getUserFromToken = getUserFromRequest;
