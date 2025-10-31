"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/app/contexts/AuthContext";

type Props = {
  params: { slug: string };
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
  user_id: {
    username: string;
    image?: string;
  };
  likes: number;
  createdAt: string;
};

export default function CommunityDetailPage({ params }: Props) {
  const { slug } = React.use(params);
  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchCommunity();
    fetchPosts();
  }, [slug]);

  const fetchCommunity = async () => {
    try {
      const res = await fetch(`/api/community/${slug}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setCommunity(data.community);
      }
    } catch (error) {
      console.error("Error fetching community:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await fetch(`/api/post?community_id=${slug}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setPosts(data);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Community not found
          </h1>
          <Link href="/community" className="text-[#5858FA] hover:underline">
            Back to communities
          </Link>
        </div>
      </div>
    );
  }

  const isAdmin = user && community.createdBy._id === user.id;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full mx-auto grid grid-cols-1 lg:grid-cols-12">
        {/* Left placeholder */}
        <div className="hidden lg:block lg:col-span-1" />

        {/* Main content */}
        <main className="lg:col-span-8 px-4 lg:px-8">
          {/* Cover */}
          <div className="relative rounded-b-lg overflow-hidden shadow-sm">
            <div className="relative h-56 md:h-64 w-full bg-gray-200">
              <Image
                src={community.image || "/images/community-placeholder.jpg"}
                alt={community.title}
                fill
                sizes="(min-width: 1024px) 100vw"
                style={{ objectFit: "cover" }}
                className="object-cover"
              />

              {/* Header overlay */}
              <div className="absolute inset-0 flex items-start justify-between p-4">
                <div className="text-white">
                  <Link
                    href="/community"
                    className="inline-flex items-center gap-2 text-sm bg-white/10 px-3 py-1 rounded-full hover:bg-white/20"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="stroke-current"
                    >
                      <path
                        d="M15 18l-6-6 6-6"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Back
                  </Link>
                </div>

                {isAdmin && (
                  <div className="flex items-center gap-3">
                    <button className="inline-flex items-center gap-2 bg-white/90 text-[#1e1e9b] px-3 py-2 rounded-full shadow">
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
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Title & actions */}
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
              <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-8 text-center text-gray-500">
                No posts yet
              </div>
            ) : (
              posts.map((post) => (
                <article
                  key={post._id}
                  className="bg-white border border-gray-100 rounded-xl shadow-sm p-6"
                >
                  <header className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white font-semibold">
                        {post.user_id.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
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
                    <p>{post.desc}</p>
                  </div>

                  {post.image && (
                    <div className="mt-4 rounded overflow-hidden">
                      <Image
                        src={post.image}
                        alt="post image"
                        width={1000}
                        height={400}
                        className="object-cover w-full h-48 rounded-lg"
                      />
                    </div>
                  )}

                  <footer className="mt-4 flex items-center gap-4 text-gray-600">
                    <div className="flex items-center gap-2">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        aria-hidden
                      >
                        <path
                          d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 10-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className="text-sm">{post.likes} Likes</span>
                    </div>
                  </footer>
                </article>
              ))
            )}
          </div>
        </main>

        {/* Right sidebar: members */}
        <aside className="hidden lg:block lg:col-span-3 border-l border-gray-100">
          <div className="sticky top-20 p-6">
            <h3 className="text-sm font-semibold text-[#1e1e9b] mb-4">
              Members
            </h3>
            <div className="space-y-4">
              {community.members
                .slice(0, 5)
                .map((member: any, index: number) => (
                  <div
                    key={member._id || index}
                    className="flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white font-semibold">
                      {member.username?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div>
                      <div className="text-sm font-medium">
                        @{member.username}
                      </div>
                      <div className="text-xs text-gray-400">
                        {member._id === community.createdBy._id
                          ? "Admin"
                          : "Member"}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </aside>

        {/* rightmost gap */}
        <div className="hidden lg:block lg:col-span-0" />
      </div>
    </div>
  );
}
