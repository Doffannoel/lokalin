import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Community from "@/models/Community";
import { getUserFromRequest } from "@/lib/auth";
import mongoose from "mongoose";

// (opsional) pastikan diroute ini selalu dynamic
export const dynamic = "force-dynamic";

// helpers (DITAMBAHKAN)
const isObjectId = (s: string) => /^[0-9a-fA-F]{24}$/.test(s);
const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const slugify = (input: string) =>
  input
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

// ✅ DETAIL — dukung param :id berupa ObjectId ATAU slug
export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
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

// ✅ UPDATE — hanya admin (createdBy) yang boleh
export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params; // di FE kamu pakai _id → cocok
  await dbConnect();

  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const community = await Community.findById(id);
  if (!community) return NextResponse.json({ message: "Komunitas tidak ditemukan" }, { status: 404 });

  const ownerId = (community.createdBy as any)?._id ?? community.createdBy;
  if (String(ownerId) !== String(user._id)) {
    return NextResponse.json({ message: "Bukan admin komunitas ini" }, { status: 403 });
  }

  let payload: Partial<{ title: string; desc: string; image: string }> = {};
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ message: "Bad JSON payload" }, { status: 400 });
  }

  const toUpdate: any = {};
  if (typeof payload.title === "string") toUpdate.title = payload.title.trim();
  if (typeof payload.desc === "string") toUpdate.desc = payload.desc.trim();
  if (typeof payload.image === "string") toUpdate.image = payload.image;

  // ⬇️ DITAMBAHKAN: Cek duplikat nama & perbarui slug bila title berubah
  if (typeof toUpdate.title === "string" && toUpdate.title.length > 0) {
    // duplikat nama (case-insensitive) kecuali dirinya sendiri
    const dup = await Community.findOne({
      _id: { $ne: community._id },
      title: { $regex: `^${escapeRegex(toUpdate.title)}$`, $options: "i" },
    }).select("_id");

    if (dup) {
      return NextResponse.json(
        { message: "Nama komunitas sudah digunakan. Gunakan nama lain." },
        { status: 409 }
      );
    }

    // kalau title berbeda → regen slug unik
    if (toUpdate.title.toLowerCase() !== String(community.title).toLowerCase()) {
      const base = slugify(toUpdate.title) || "community";
      let newSlug = base;
      let i = 1;
      // pastikan unik selain dirinya
      // @ts-ignore
      while (await Community.exists({ slug: newSlug, _id: { $ne: community._id } })) {
        newSlug = `${base}-${i++}`;
      }
      toUpdate.slug = newSlug;
    }
  }

  const updated = await Community.findByIdAndUpdate(community._id, toUpdate, { new: true })
    .populate("createdBy", "username email")
    .populate("members", "username email");

  return NextResponse.json({ message: "Berhasil diperbarui", community: updated });
}

// ✅ DELETE — opsional, seperti punyamu sebelumnya
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  await dbConnect();

  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const community = await Community.findById(id);
  if (!community) return NextResponse.json({ message: "Komunitas tidak ditemukan" }, { status: 404 });

  const ownerId = (community.createdBy as any)?._id ?? community.createdBy;
  if (String(ownerId) !== String(user._id)) {
    return NextResponse.json({ message: "Tidak memiliki izin menghapus" }, { status: 403 });
  }

  await Community.findByIdAndDelete(id);
  return NextResponse.json({ message: "Komunitas berhasil dihapus" });
}
