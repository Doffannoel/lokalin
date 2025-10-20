// components/community/CommunityList.tsx
"use client";
import React, { useState } from "react";
import CreateCommunityButton from "./CreateCommunityButton";
import CommunityCard from "./CommunityCard";

type Community = {
  id: string;
  slug: string;
  title: string;
  image: string;
  membersPreview: string[];
  extraMembers: number;
  freq: string;
  description: string;
  mine?: boolean;
};

const DATA: Community[] = [
  {
    id: "1",
    slug: "pecinta-php",
    title: "Pecinta PHP",
    image: "/images/community-1.jpg",
    membersPreview: [
      "/images/avatars/avatar-1.png",
      "/images/avatars/avatar-2.png",
      "/images/avatars/avatar-3.png",
    ],
    extraMembers: 66,
    freq: "10+ posts a day",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
  },
  {
    id: "2",
    slug: "cat-lover",
    title: "Cat Lover",
    image: "/images/community-2.png",
    membersPreview: [
      "/images/avatars/avatar-1.png",
      "/images/avatars/avatar-2.png",
      "/images/avatars/avatar-3.png",
    ],
    extraMembers: 66,
    freq: "10+ posts a day",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
  },
  {
    id: "3",
    slug: "anak-it-hebat",
    title: "ANAK IT HEbat",
    image: "/images/community-3.jpg",
    membersPreview: [
      "/images/avatars/avatar-1.png",
      "/images/avatars/avatar-2.png",
      "/images/avatars/avatar-3.png",
    ],
    extraMembers: 66,
    freq: "10+ posts a day",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
    mine: true, // ✅ Komunitas milik user
  },
];

export default function CommunityList() {
  const [tab, setTab] = useState<"all" | "mine">("all");

  // filter data
  const all = DATA;
  const mine = DATA.filter((d) => d.mine);
  const list = tab === "all" ? all : mine;

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
              You&apos;re Community
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
        {list.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            You don&apos;t have any communities yet.
          </div>
        ) : (
          list.map((c) => (
            <CommunityCard
              key={c.id}
              slug={c.slug}
              title={c.title}
              image={c.image}
              membersPreview={c.membersPreview}
              extraMembers={c.extraMembers}
              freq={c.freq}
              description={c.description}
              // 🧠 jika di tab you're community, button diubah jadi View
              mine={tab === "mine"}
            />
          ))
        )}
      </div>
    </div>
  );
}
