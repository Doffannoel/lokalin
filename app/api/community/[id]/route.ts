// app/api/community/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Community from "@/models/Community";
import mongoose from "mongoose";

// ✅ DETAIL — dukung ObjectId ATAU slug pada param :id
export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params; // Next 15: params adalah Promise
  await dbConnect();

  const query = mongoose.isValidObjectId(id) ? { _id: id } : { slug: id };

  const community = await Community.findOne(query)
    .populate("createdBy", "username email")
    .populate("members", "username email");

  if (!community) {
    return NextResponse.json({ message: "Komunitas tidak ditemukan" }, { status: 404 });
  }
  return NextResponse.json({ community });
}
