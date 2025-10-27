import jwt from "jsonwebtoken";
import User from "@/models/Users";
import dbConnect from "@/lib/dbConnect";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function getUserFromToken(req: Request) {
  await dbConnect();
  const cookieHeader = req.headers.get("cookie");
  const token = cookieHeader?.split("token=")[1];

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = await User.findById(decoded.id).select("-password");
    return user;
  } catch (error) {
    return null;
  }
}
