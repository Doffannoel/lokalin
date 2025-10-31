"use client";
import React, { useState, useEffect } from "react";
import CreateCommunityButton from "./CreateCommunityButton";
import CommunityCard from "./CommunityCard";

type Community = {
  _id: string;
  title: string;
  desc: string;
  image: string;
  members: any[];
  createdBy: any;
  totalUsers: number;
};

export default function CommunityList() {
  const [tab, setTab] = useState<"all" | "mine">("all");
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommunities();
  }, [tab]);

  const fetchCommunities = async () => {
    setLoading(true);
    try {
      const filter = tab === "mine" ? "joined" : "all";
      const res = await fetch(`/api/community?filter=${filter}`, {
        credentials: "include",
      });
      const data = await res.json();
      setCommunities(data.communities || []);
    } catch (error) {
      console.error("Error fetching communities:", error);
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
              className={`text-lg font-semibold ${
                tab === "all" ? "text-[#3434b8]" : "text-gray-400"
              }`}
            >
              Community
            </button>

            <button
              onClick={() => setTab("mine")}
              className={`text-lg font-semibold ${
                tab === "mine" ? "text-[#3434b8]" : "text-gray-400"
              }`}
            >
              Your Communities
            </button>
          </div>

          {/* underline */}
          <div className="mt-2">
            <div className="flex gap-6">
              <div
                className={
                  tab === "all"
                    ? "h-1 w-28 bg-[#3434b8] rounded"
                    : "h-1 w-28 bg-transparent"
                }
              />
              <div
                className={
                  tab === "mine"
                    ? "h-1 w-28 bg-[#3434b8] rounded"
                    : "h-1 w-28 bg-transparent"
                }
              />
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
            {tab === "mine"
              ? "You don't have any communities yet."
              : "No communities found."}
          </div>
        ) : (
          communities.map((c) => (
            <CommunityCard
              key={c._id}
              id={c._id}
              slug={c._id}
              title={c.title}
              image={c.image || "/images/community-placeholder.jpg"}
              membersPreview={[
                "/images/avatars/avatar-1.png",
                "/images/avatars/avatar-2.png",
                "/images/avatars/avatar-3.png",
              ]}
              extraMembers={c.totalUsers || c.members.length}
              freq="10+ posts a day"
              description={c.desc}
              mine={tab === "mine"}
              onUpdate={fetchCommunities}
            />
          ))
        )}
      </div>
    </div>
  );
}
