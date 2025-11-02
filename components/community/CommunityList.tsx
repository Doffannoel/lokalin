"use client";
import React, { useState, useEffect } from "react";
import CreateCommunityButton from "./CreateCommunityButton";
import CommunityCard from "./CommunityCard";

type Community = {
  _id: string;
  title: string;
  desc: string;
  image: string;
  members: Array<{ _id: string; username?: string; image?: string }> | any[];
  createdBy: any;
  totalUsers: number;
  postsCount?: number;   // <-- baru
  isMember?: boolean;    // <-- baru
  slug?: string;         // kalau kamu punya slug
};

export default function CommunityList() {
  const [tab, setTab] = useState<"all" | "mine">("all");
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommunities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const fetchCommunities = async () => {
    setLoading(true);
    try {
      const filter = tab === "mine" ? "joined" : "all";
      const res = await fetch(`/api/community?filter=${filter}`, {
        credentials: "include",
      });
      const data = await res.json();
      setCommunities(Array.isArray(data?.communities) ? data.communities : []);
    } catch (error) {
      console.error("Error fetching communities:", error);
      setCommunities([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      {/* Header: tabs + create button */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => setTab("all")}
              className={`text-lg font-semibold ${tab === "all" ? "text-[#3434b8]" : "text-gray-400"}`}
            >
              Community
            </button>
            <button
              onClick={() => setTab("mine")}
              className={`text-lg font-semibold ${tab === "mine" ? "text-[#3434b8]" : "text-gray-400"}`}
            >
              Your Communities
            </button>
          </div>
          <div className="mt-2">
            <div className="flex gap-6">
              <div className={tab === "all" ? "h-1 w-28 bg-[#3434b8] rounded" : "h-1 w-28 bg-transparent"} />
              <div className={tab === "mine" ? "h-1 w-28 bg-[#3434b8] rounded" : "h-1 w-28 bg-transparent"} />
            </div>
          </div>
        </div>

        <CreateCommunityButton />
      </div>

      {/* List */}
      <div className="mt-6 space-y-4">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : communities.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {tab === "mine" ? "You don't have any communities yet." : "No communities found."}
          </div>
        ) : (
          communities.map((c) => {
            // ambil preview avatar 3 pertama (kalau ada)
            const memberAvatars =
              Array.isArray(c.members)
                ? (c.members as any[])
                    .slice(0, 3)
                    .map((m) => m?.image || "/images/avatars/avatar-1.png")
                : ["/images/avatars/avatar-1.png", "/images/avatars/avatar-2.png", "/images/avatars/avatar-3.png"];

            return (
              <CommunityCard
                key={c._id}
                id={c._id}
                slug={c.slug || c._id} // tetap kompat
                title={c.title}
                image={c.image || "/images/community-placeholder.jpg"}
                membersPreview={memberAvatars}
                extraMembers={c.totalUsers ?? (Array.isArray(c.members) ? c.members.length : 0)}
                // tampilkan jumlah post aktual
                freq={`${c.postsCount ?? 0} posts`}
                description={c.desc}
                // kalau tab = mine pasti true, kalau tab = all tampilkan status join dari API
                mine={tab === "mine" ? true : !!c.isMember}
                onUpdate={fetchCommunities}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
