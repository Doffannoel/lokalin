"use client";
import React, { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/app/contexts/AuthContext";

type Props = {
  params: Promise<{ slug: string }>;
};

type Community = {
  _id: string;
  title: string;
  desc: string;
  image: string;
  members: any[];
  createdBy: any;
  totalUsers: number;
};

type Post = {
  _id: string;
  desc: string;
  image?: string;
  user_id: { username: string; image?: string };
  likes: number;
  liked?: boolean;
  likesBy?: string[];
  createdAt: string;
};

export default function CommunityDetailPage({ params }: Props) {
  const { slug } = use(params);

  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [liking, setLiking] = useState<Record<string, boolean>>({});
  const { user } = useAuth();

  // state untuk edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editBannerFile, setEditBannerFile] = useState<File | null>(null);
  const [editBannerPreview, setEditBannerPreview] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string>("");

  useEffect(() => {
    if (!slug) return;
    fetchCommunity();
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const fetchCommunity = async () => {
    try {
      const res = await fetch(`/api/community/${slug}`, { credentials: "include" });
      const data = await res.json();
      if (res.ok) setCommunity(data.community);
    } catch (error) {
      console.error("Error fetching community:", error);
    } finally {
      setLoading(false);
    }
  };

  // gunakan community_id (slug boleh id/slug; API post-mu sudah handle)
  const fetchPosts = async () => {
    try {
      const res = await fetch(`/api/post?community_id=${slug}`, {
        credentials: "include",
      });
      const data = await res.json();

      const raw: any[] = Array.isArray(data?.posts)
        ? data.posts
        : Array.isArray(data)
        ? data
        : [];

      const withLiked: Post[] = raw.map((p: any) => {
        const liked =
          typeof p.liked === "boolean"
            ? p.liked
            : Array.isArray(p.likesBy) && user?.id
            ? p.likesBy.some((u: any) => u?.toString?.() === user.id)
            : false;
        return { ...p, liked };
      });

      setPosts(withLiked);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  async function toggleLike(postId: string) {
    if (!user) return alert("Please login first");
    if (liking[postId]) return;

    // optimistic
    setPosts((prev) =>
      prev.map((p) =>
        p._id === postId ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) } : p
      )
    );
    setLiking((s) => ({ ...s, [postId]: true }));

    try {
      const res = await fetch(`/api/post/${postId}/like`, { method: "POST", credentials: "include" });
      const _data = await res.json();
      if (!res.ok) {
        // rollback
        setPosts((prev) =>
          prev.map((p) =>
            p._id === postId ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) } : p
          )
        );
      }
    } catch (e) {
      // rollback
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) } : p
        )
      );
    } finally {
      setLiking((s) => ({ ...s, [postId]: false }));
    }
  }

  // ====== EDIT MODAL HANDLERS ======
  function openEdit() {
    if (!community) return;
    setEditTitle(community.title);
    setEditDesc(community.desc);
    setEditBannerFile(null);
    setEditBannerPreview(community.image || null);
    setEditError("");
    setEditOpen(true);
  }

  function onPickBanner(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setEditBannerFile(f);
    if (f) {
      const url = URL.createObjectURL(f);
      setEditBannerPreview(url);
    } else {
      setEditBannerPreview(community?.image || null);
    }
  }

  async function saveEdit() {
    if (!community) return;
    setSavingEdit(true);
    setEditError("");

    try {
      let imageUrl = community.image || "";

      // kalau admin pilih banner baru, upload dulu
      if (editBannerFile) {
        const form = new FormData();
        form.append("file", editBannerFile);
        const up = await fetch("/api/upload", { method: "POST", body: form });
        const upData = await up.json();
        if (!up.ok || !upData?.success) {
          throw new Error(upData?.error || "Failed to upload banner");
        }
        imageUrl = upData.imageUrl;
      }

      // PATCH pakai _id (aman walau halaman diakses via slug)
      const res = await fetch(`/api/community/${community._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: editTitle.trim(),
          desc: editDesc.trim(),
          image: imageUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to update community");

      // sync state UI
      setCommunity((prev) =>
        prev
          ? { ...prev, title: editTitle.trim(), desc: editDesc.trim(), image: imageUrl }
          : prev
      );
      setEditOpen(false);
    } catch (e: any) {
      setEditError(e?.message || "Update failed");
    } finally {
      setSavingEdit(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-gray-500">
        Loading...
      </div>
    );
  }
  if (!community) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        Community not found
      </div>
    );
  }

  const createdById =
    (community.createdBy && community.createdBy._id) || community.createdBy;
  const isAdmin = user && createdById?.toString() === user.id?.toString();
  const isMember =
    !!user &&
    Array.isArray(community.members) &&
    community.members.some(
      (m: any) => (m?._id ?? m)?.toString?.() === user.id?.toString?.()
    );

  // keluar komunitas
  async function handleLeave() {
    if (!community || !user) return;
    if (!confirm("Are you sure you want to leave this community?")) return;

    try {
      const res = await fetch(`/api/community/${community._id}/leave`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to leave community");

      setCommunity((prev) =>
        prev
          ? {
              ...prev,
              members: prev.members.filter(
                (m: any) => (m?._id ?? m).toString() !== user.id.toString()
              ),
              totalUsers: Math.max(
                0,
                (prev.totalUsers || prev.members.length) - 1
              ),
            }
          : prev
      );
    } catch (e: any) {
      alert(e?.message || "Something went wrong");
    }
  }

  // join komunitas
  async function handleJoin() {
    if (!community || !user) return;
    try {
      const res = await fetch(`/api/community/${community._id}/join`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to join community");

      // tambah user ke members + update total
      setCommunity((prev) =>
        prev
          ? {
              ...prev,
              members: [
                ...prev.members,
                { _id: user.id, username: user.username },
              ],
              totalUsers: (prev.totalUsers || prev.members.length) + 1,
            }
          : prev
      );
    } catch (e: any) {
      alert(e?.message || "Something went wrong");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full mx-auto grid grid-cols-1 lg:grid-cols-12">
        <div className="hidden lg:block lg:col-span-1" />

        <main className="lg:col-span-8 px-4 lg:px-8">
          {/* Cover */}
          <div className="relative rounded-b-lg overflow-hidden shadow-sm">
            <div
              className="relative w-full bg-gray-200"
              style={{ paddingTop: "20%" }}
            >
              <Image
                src={community.image || "/images/community-placeholder.jpg"}
                alt={community.title}
                fill
                className="object-cover"
                sizes="100vw"
              />
              {/* ✅ Bagian overlay di-cover (UI sama, peletakan rapi) */}
              <div className="absolute inset-0 flex items-start justify-between p-4">
                <Link
                  href="/community"
                  className="text-white bg-white/10 px-3 py-1 rounded-full hover:bg-white/20"
                >
                  Back
                </Link>

                <div className="flex items-center gap-3">
                  {isAdmin ? (
                    <button
                      onClick={openEdit}
                      className="inline-flex items-center gap-2 bg-white/90 text-[#1e1e9b] px-3 py-2 rounded-full shadow"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="#1e1e9b"
                        aria-hidden
                      >
                        <path d="M3 11h8V3h2v8h8v2h-8v8h-2v-8H3z" />
                      </svg>
                      Edit Group
                    </button>
                  ) : isMember ? (
                    <button
                      onClick={handleLeave}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-full shadow bg-red-500 text-white hover:bg-red-600"
                      title="Leave this community"
                    >
                      Leave Community
                    </button>
                  ) : (
                    <button
                      onClick={handleJoin}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-full shadow bg-white/90 text-[#1e1e9b] hover:bg-white"
                      title="Join this community"
                    >
                      Join Community
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Title & stats */}
          <div className="mt-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#1e1e9b]">
                {community.title}
              </h1>
              <div className="mt-2 text-sm text-gray-500 flex gap-6">
                <span>{posts.length} Posts</span>
                <span>{community.totalUsers} Members</span>
              </div>
            </div>

            {isAdmin && (
              <div className="flex items-center gap-3">
                <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="#1e1e9b"
                    aria-hidden
                  >
                    <path
                      d="M12 5v14M5 12h14"
                      stroke="#1e1e9b"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Add Event
                </button>
              </div>
            )}
          </div>

          {/* Posts */}
          <div className="mt-6 space-y-6">
            {posts.length === 0 ? (
              <div className="bg-white border rounded-xl p-8 text-center text-gray-500">
                No posts yet
              </div>
            ) : (
              posts.map((post) => (
                <article
                  key={post._id}
                  className="bg-white border rounded-xl shadow-sm p-6"
                >
                  <header className="flex justify-between">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white font-semibold">
                        {post.user_id.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          @{post.user_id.username}
                        </div>
                        <div className="text-xs text-gray-500">
                          {community.title}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </div>
                  </header>

                  <div className="mt-4 text-gray-700 leading-relaxed">
                    {post.desc}
                  </div>

                  {post.image && (
                    <div className="mt-4 overflow-hidden rounded-lg">
                      <Image
                        src={post.image}
                        width={1000}
                        height={400}
                        alt="post image"
                        className="object-cover w-full h-48"
                      />
                    </div>
                  )}

<footer className="mt-4 flex items-center gap-4 text-gray-600">
  <button
    type="button"
    onClick={() => toggleLike(post._id)}
    disabled={!!liking[post._id]}
    aria-pressed={!!post.liked}
    title={post.liked ? "Unlike" : "Like"}
    className={`inline-flex items-center gap-2 text-sm transition-colors ${
      post.liked ? "text-rose-600" : "text-gray-600"
    } ${liking[post._id] ? "opacity-60 cursor-not-allowed" : "hover:opacity-90"}`}
  >
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 10-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"
        fill={post.liked ? "currentColor" : "none"}     // 🔴 merah saat liked, transparan saat tidak
        stroke="currentColor"                           // outline ikut warna teks (abu/merah)
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
    <span>{post.likes} Likes</span>
  </button>
</footer>

                </article>
              ))
            )}
          </div>
        </main>

        {/* Members sidebar */}
        <aside className="hidden lg:block lg:col-span-3 border-l border-gray-100">
          <div className="sticky top-20 p-6">
            <h3 className="text-sm font-semibold text-[#1e1e9b] mb-4">
              Members
            </h3>
            <div className="space-y-4">
              {community.members.slice(0, 5).map((member: any, index: number) => (
                <div key={member._id || index} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white font-semibold">
                    {member.username?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div>
                    <div className="text-sm font-medium">@{member.username}</div>
                    <div className="text-xs text-gray-400">
                      {member._id?.toString() ===
                      ((community.createdBy as any)?._id ?? community.createdBy)?.toString()
                        ? "Admin"
                        : "Member"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <div className="hidden lg:block lg:col-span-0" />
      </div>

      {/* ===== Edit Modal (hanya admin) ===== */}
      {editOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setEditOpen(false)}
        >
          <div
            className="w-full max-w-2xl bg-white rounded-xl shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">Edit Community</h2>
            </div>

            <div className="p-6 space-y-4">
              {/* Banner preview + picker */}
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Banner</div>
                <div
                  className="relative w-full bg-gray-100 rounded-lg overflow-hidden"
                  style={{ paddingTop: "20%" }}
                >
                  {editBannerPreview ? (
                    // pakai img biasa agar preview blob URL aman
                    <img
                      src={editBannerPreview}
                      alt="banner preview"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                      No banner
                    </div>
                  )}
                </div>
                <div className="mt-3">
                  <label className="inline-flex items-center gap-2 px-3 py-2 rounded-md border bg-white hover:bg-gray-50 cursor-pointer">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 5v14M5 12h14"
                        stroke="#111827"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="text-sm">Change Banner</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={onPickBanner}
                    />
                  </label>
                </div>
              </div>

              {/* Title */}
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Name</div>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="Community name"
                />
              </div>

              {/* Description */}
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Description</div>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 h-28 resize-none"
                  placeholder="Community description"
                />
              </div>

              {editError && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                  {editError}
                </div>
              )}
            </div>

            <div className="p-6 border-t flex items-center justify-end gap-3">
              <button
                onClick={() => setEditOpen(false)}
                className="px-4 py-2 rounded-md border bg-white hover:bg-gray-50"
                disabled={savingEdit}
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="px-4 py-2 rounded-md text-white bg-[#5B5BD8] hover:opacity-90 disabled:opacity-50"
                disabled={savingEdit}
              >
                {savingEdit ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
