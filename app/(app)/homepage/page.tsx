"use client";

import Image from "next/image";
import { Heart, MoreHorizontal, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import PostModal from "@/components/homepage/PostModal";
import { useAuth } from "@/app/contexts/AuthContext";

type Post = {
  _id: string;
  desc: string;
  image?: string;
  user_id: {
    _id: string;
    username: string;
    image?: string;
  };
  community_id: {
    _id: string;
    title: string;
  };
  likes: number;
  likesBy: string[];
  comments: any[];
  createdAt: string;
};

type Community = {
  _id: string;
  title: string;
  totalUsers: number;
};

export default function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const { user } = useAuth();

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchPosts = async (communityIds: string[]) => {
    if (communityIds.length === 0) {
      setPosts([]);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/post?community_ids=${communityIds.join(',')}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setPosts(data);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCommunities = async () => {
    try {
      const res = await fetch("/api/community?filter=joined", {
        credentials: "include",
      });
      const data = await res.json();
      const communityIds = (data.communities || []).filter(Boolean).map((c: any) => c._id);
      setCommunities((data.communities || []).filter(Boolean));
      fetchPosts(communityIds);
    } catch (error) {
      console.error("Error fetching communities:", error);
    }
  };

  const handleLike = async (postId: string) => {
    const originalPosts = [...posts];
    const updatedPosts = posts.map(p => {
      if (p._id === postId) {
        const isLiked = p.likesBy?.includes(user!.id);
        return {
          ...p,
          likes: isLiked ? p.likes - 1 : p.likes + 1,
          likesBy: isLiked ? p.likesBy.filter(id => id !== user!.id) : [...(p.likesBy || []), user!.id]
        };
      }
      return p;
    });

    setPosts(updatedPosts);

    try {
      const res = await fetch(`/api/post/${postId}/like`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        // Revert on error
        setPosts(originalPosts);
      }
    } catch (error) {
      console.error("Error liking post:", error);
      // Revert on error
      setPosts(originalPosts);
    }
  };

  const handleComment = async (postId: string) => {
    if (!comment.trim()) return;

    try {
      const res = await fetch(`/api/post/${postId}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ text: comment }),
      });

      if (res.ok) {
        setComment("");
        fetchCommunities(); // Refetch posts to show the new comment
      }
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  const toggleComments = (postId: string) => {
    setShowComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const isLiked = (post: Post) => {
    return user && post.likesBy?.includes(user.id);
  };

  return (
    <>
      <PostModal
        isOpen={isModalOpen}
        onClose={(postCreated) => {
          setIsModalOpen(false);
          if (postCreated) {
            fetchCommunities();
          }
        }}
      />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Write Something Box */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white font-semibold text-sm">
                {user?.username?.charAt(0).toUpperCase() || "U"}
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex-1 bg-gray-50 rounded-full px-4 py-2.5 text-left text-sm text-gray-400 hover:bg-gray-100 transition-all focus:outline-none focus:ring-2 focus:ring-[#5858FA]/20"
              >
                Write Something
              </button>
            </div>
          </div>

          {/* Posts */}
          {loading ? (
            <div className="bg-white rounded-xl p-8 text-center text-gray-500">
              Loading posts...
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center text-gray-500">
              No posts yet. Be the first to post!
            </div>
          ) : (
            posts.map((post) => (
              <motion.div
                key={post._id}
                className="bg-white rounded-xl shadow-sm border border-gray-100"
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  ease: "easeOut",
                  type: "spring",
                  stiffness: 100,
                  damping: 15,
                }}
              >
                {/* Post Header */}
                <div className="p-4 flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold text-sm">
                      {post.user_id.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-gray-900">
                          @{post.user_id.username}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {post.community_id?.title}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                    <button className="text-gray-400 hover:text-gray-600 transition-colors">
                      <MoreHorizontal size={20} />
                    </button>
                  </div>
                </div>

                {/* Post Content */}
                <div className="px-4 pb-4">
                  <p className="text-sm text-gray-700 leading-relaxed mb-4">
                    {post.desc}
                  </p>

                  {post.image && (
                    <div className="relative w-full h-[300px] rounded-lg overflow-hidden">
                      <Image
                        src={post.image}
                        alt="post image"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Post Footer */}
                <div className="px-4 pb-4 space-y-3">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleLike(post._id)}
                      className={`flex items-center gap-1.5 transition-colors ${
                        isLiked(post)
                          ? "text-red-500"
                          : "text-gray-500 hover:text-red-500"
                      }`}
                    >
                      <Heart
                        size={18}
                        fill={isLiked(post) ? "currentColor" : "none"}
                      />
                      <span className="text-sm font-medium">
                        {post.likes.toLocaleString()} Likes
                      </span>
                    </button>
                    <button
                      onClick={() => toggleComments(post._id)}
                      className="flex items-center gap-1.5 text-gray-500 hover:text-blue-500 transition-colors"
                    >
                      <MessageCircle size={18} />
                      <span className="text-sm font-medium">
                        {post.comments.length} Comments
                      </span>
                    </button>
                  </div>

                  {/* Comment Section */}
                  {showComments[post._id] && (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white font-semibold text-xs">
                          {user?.username?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <input
                          type="text"
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Write a comment..."
                          className="flex-1 bg-gray-50 rounded-full px-4 py-2 text-sm text-gray-600 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5858FA]/20 transition-all"
                          onKeyPress={(e) =>
                            e.key === "Enter" && handleComment(post._id)
                          }
                        />
                        <button
                          onClick={() => handleComment(post._id)}
                          className="bg-[#5858FA] text-white px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 transition"
                        >
                          Post
                        </button>
                      </div>

                      {/* Comments List */}
                      {post.comments && post.comments.length > 0 && (
                        <div className="space-y-2">
                          {post.comments.map((cmt: any, index) => (
                            <div key={index} className="flex gap-2">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white font-semibold text-xs">
                                {cmt.user_id?.username?.charAt(0).toUpperCase() || "U"}
                              </div>
                              <div className="bg-gray-50 rounded-lg px-3 py-2 flex-1">
                                <p className="text-sm text-gray-700">{cmt.text}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Right Sidebar - My Community */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sticky top-20">
            <h3 className="font-semibold text-gray-900 mb-4">My Community</h3>
            <div className="space-y-3">
              {communities.slice(0, 4).map((community) => (
                <div
                  key={community._id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-orange-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">
                      {community.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {community.totalUsers} Members
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Button href="/community" className="w-full mt-4" variant="primary">
              See More
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
