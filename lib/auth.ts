import jwt from "jsonwebtoken";
import User from "@/models/Users";
import dbConnect from "@/lib/dbConnect";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function getUserFromToken(token: string | undefined) {
  if (!token) return null;

  await dbConnect();

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = await User.findById(decoded.id).select("-password");
    return user;
  } catch (error) {
    return null;
  }
}