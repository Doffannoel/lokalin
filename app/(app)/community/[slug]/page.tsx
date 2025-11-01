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

  useEffect(() => {
    if (!slug) return;
    fetchCommunity();
    fetchPosts();
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

  // ✅ gunakan community_id (slug bisa id/slug, API-mu sudah handle)
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

    setPosts((prev) =>
      prev.map((p) =>
        p._id === postId ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) } : p
      )
    );
    setLiking((s) => ({ ...s, [postId]: true }));

    try {
      const res = await fetch(`/api/post/${postId}/like`, { method: "POST", credentials: "include" });
      const data = await res.json();

      if (!res.ok) {
        setPosts((prev) =>
          prev.map((p) =>
            p._id === postId ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) } : p
          )
        );
      } else {
        setPosts((prev) =>
          prev.map((p) =>
            p._id === postId
              ? {
                  ...p,
                  liked: typeof data?.liked === "boolean" ? data.liked : p.liked,
                  likes: typeof data?.likeCount === "number" ? data.likeCount : p.likes,
                }
              : p
          )
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLiking((s) => ({ ...s, [postId]: false }));
    }
  }

  if (loading) return <div className="min-h-screen flex justify-center items-center text-gray-500">Loading...</div>;
  if (!community) return <div className="min-h-screen flex justify-center items-center">Community not found</div>;

  const createdById = (community.createdBy && community.createdBy._id) || community.createdBy;
  const isAdmin = user && createdById?.toString() === user.id?.toString();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full mx-auto grid grid-cols-1 lg:grid-cols-12">
        <div className="hidden lg:block lg:col-span-1" />

        <main className="lg:col-span-8 px-4 lg:px-8">
          {/* Cover */}
          <div className="relative rounded-b-lg overflow-hidden shadow-sm">
            <div className="relative w-full bg-gray-200" style={{ paddingTop: "20%" }}>
              <Image
                src={community.image || "/images/community-placeholder.jpg"}
                alt={community.title}
                fill
                className="object-cover"
                sizes="100vw"
              />
              <div className="absolute inset-0 flex items-start justify-between p-4">
                <Link href="/community" className="text-white bg-white/10 px-3 py-1 rounded-full hover:bg-white/20">
                  Back
                </Link>
                {isAdmin && <button className="bg-white px-3 py-2 rounded-full">Edit Group</button>}
              </div>
            </div>
          </div>

          {/* Title & stats */}
          <div className="mt-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#1e1e9b]">{community.title}</h1>
              <div className="mt-2 text-sm text-gray-500 flex gap-6">
                <span>{posts.length} Posts</span>
                <span>{community.totalUsers} Members</span>
              </div>
            </div>

            {isAdmin && (
              <div className="flex items-center gap-3">
                <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#1e1e9b" aria-hidden>
                    <path d="M12 5v14M5 12h14" stroke="#1e1e9b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Add Event
                </button>
              </div>
            )}
          </div>

          {/* Posts */}
          <div className="mt-6 space-y-6">
            {posts.length === 0 ? (
              <div className="bg-white border rounded-xl p-8 text-center text-gray-500">No posts yet</div>
            ) : (
              posts.map((post) => (
                <article key={post._id} className="bg-white border rounded-xl shadow-sm p-6">
                  <header className="flex justify-between">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white font-semibold">
                        {post.user_id.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">@{post.user_id.username}</div>
                        <div className="text-xs text-gray-500">{community.title}</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleDateString()}</div>
                  </header>

                  <div className="mt-4 text-gray-700 leading-relaxed">{post.desc}</div>

                  {post.image && (
                    <div className="mt-4 overflow-hidden rounded-lg">
                      <Image src={post.image} width={1000} height={400} alt="post" className="object-cover w-full h-48" />
                    </div>
                  )}

                  <footer className="mt-4 flex items-center gap-2 text-gray-600">
                    <button
                      onClick={() => toggleLike(post._id)}
                      className={post.liked ? "text-rose-600" : "text-gray-600"}
                      aria-pressed={!!post.liked}
                      disabled={!!liking[post._id]}
                      title={post.liked ? "Unlike" : "Like"}
                    >
                      ❤️ {post.likes} Likes
                    </button>
                  </footer>
                </article>
              ))
            )}
          </div>
        </main>

        {/* ✅ Members sidebar (balik lagi) */}
        <aside className="hidden lg:block lg:col-span-3 border-l border-gray-100">
          <div className="sticky top-20 p-6">
            <h3 className="text-sm font-semibold text-[#1e1e9b] mb-4">Members</h3>
            <div className="space-y-4">
              {community.members.slice(0, 5).map((member: any, index: number) => (
                <div key={member._id || index} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white font-semibold">
                    {member.username?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div>
                    <div className="text-sm font-medium">@{member.username}</div>
                    <div className="text-xs text-gray-400">
                      {member._id?.toString() === createdById?.toString() ? "Admin" : "Member"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <div className="hidden lg:block lg:col-span-0" />
      </div>
    </div>
  );
}
