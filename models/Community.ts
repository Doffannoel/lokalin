// models/Community.ts
import mongoose, { Schema, Document, Types } from "mongoose";

export interface ICommunity extends Document {
  title: string;
  slug: string; // ← baru: kunci unik untuk cegah duplikat nama (case-insensitive)
  desc: string;
  image?: string;
  totalUsers: number;
  createdBy: Types.ObjectId;
  members: Types.ObjectId[];
  createdAt: Date;

  // helpers (opsional)
  addMember(userId: Types.ObjectId): void;
  removeMember(userId: Types.ObjectId): void;
}

// util sederhana untuk bikin slug
function slugify(input: string) {
  return input
    .toString()
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

const communitySchema = new Schema<ICommunity>(
  {
    title: { type: String, required: true, trim: true },
    // 🔒 unik + index → mencegah nama sama (case-insensitive via lowercase slug)
    slug: { type: String, required: true, unique: true, index: true },
    desc: { type: String, required: true, trim: true },
    image: { type: String, default: "" },
    totalUsers: { type: Number, default: 1, min: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    createdAt: { type: Date, default: Date.now },
  },
  {
    // kalau kamu pakai createdAt custom, keep it. (timestamps: true) tidak diaktifkan agar tidak bentrok.
    versionKey: false,
  }
);

/**
 * Pre-validate:
 * - set slug dari title bila kosong/berubah
 * - buang duplikat di members
 * - sinkronkan totalUsers dengan members
 */
communitySchema.pre("validate", function (next) {
  const doc = this as ICommunity;

  if (doc.isModified("title") || !doc.slug) {
    doc.slug = slugify(doc.title);
  }

  if (Array.isArray(doc.members) && doc.members.length > 0) {
    // unikkan anggota
    const uniq = Array.from(new Set(doc.members.map((m) => String(m)))).map(
      (s) => new mongoose.Types.ObjectId(s)
    );
    doc.members = uniq as any;
    doc.totalUsers = uniq.length;
  } else {
    doc.members = [];
    doc.totalUsers = 0;
  }

  next();
});

/**
 * Pre-save:
 * - pastikan createdBy ikut jadi anggota saat pembuatan jika belum
 */
communitySchema.pre("save", function (next) {
  const doc = this as ICommunity;

  if (doc.isNew && doc.createdBy) {
    const ownerId = String(doc.createdBy);
    const hasOwner = (doc.members || []).some((m) => String(m) === ownerId);
    if (!hasOwner) {
      doc.members = [...(doc.members || []), doc.createdBy] as any;
      doc.totalUsers = doc.members.length;
    }
  }

  next();
});

// Helpers untuk join/leave (opsional, dipanggil dari route join/leave)
communitySchema.methods.addMember = function (userId: Types.ObjectId) {
  const u = String(userId);
  const exists = (this.members || []).some((m: any) => String(m) === u);
  if (!exists) {
    this.members.push(userId);
    this.totalUsers = this.members.length;
  }
};

communitySchema.methods.removeMember = function (userId: Types.ObjectId) {
  const u = String(userId);
  this.members = (this.members || []).filter((m: any) => String(m) !== u) as any;
  this.totalUsers = this.members.length;
};

export default mongoose.models.Community ||
  mongoose.model<ICommunity>("Community", communitySchema);
