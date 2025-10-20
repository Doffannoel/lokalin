// components/community/CommunityCard.tsx
"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

type Props = {
  id?: string;
  slug?: string;
  title: string;
  image: string;
  membersPreview: string[];
  extraMembers: number;
  freq: string;
  description: string;
  mine?: boolean; // <-- new prop to decide button behavior
};

export default function CommunityCard({
  slug,
  title,
  image,
  membersPreview,
  extraMembers,
  freq,
  description,
  mine = false,
}: Props) {
  const [joined, setJoined] = useState(false);

  function handleJoin(e: React.MouseEvent) {
    e.preventDefault();
    setJoined((v) => !v);
    // TODO: panggil API join/leave di sini jika perlu
  }

  const cardLink = slug ? `/community/${slug}` : undefined;

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-start gap-4">
      {/* big circular image */}
      <div className="w-28 h-28 rounded-full overflow-hidden flex-shrink-0 border border-gray-200">
        <Image
          src={image}
          alt={title}
          width={112}
          height={112}
          className="object-cover w-full h-full"
        />
      </div>

      {/* content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {cardLink ? (
              <Link href={cardLink} className="text-sm font-semibold text-[#1e1e9b] hover:underline truncate">
                {title}
              </Link>
            ) : (
              <h3 className="text-sm font-semibold text-[#1e1e9b] truncate">{title}</h3>
            )}

            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center -space-x-2">
                {membersPreview?.map((m, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full overflow-hidden border-2 border-white bg-gray-100"
                    aria-hidden
                  >
                    <Image
                      src={m}
                      alt={`member-${i}`}
                      width={24}
                      height={24}
                      className="object-cover"
                    />
                  </div>
                ))}

                <div className="ml-2 text-xs text-gray-500 flex items-center gap-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#5B5BD8" aria-hidden>
                    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm8 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C21 14.17 16.33 13 14 13z" />
                  </svg>
                  <span className="text-xs text-gray-600">+{extraMembers}</span>
                </div>

                <div className="ml-4 text-xs text-gray-500">{freq}</div>
              </div>
            </div>
          </div>

          {/* Button: kalau mine -> View (link). kalau bukan -> Join toggle */}
          <div className="flex-shrink-0 mt-3 md:mt-0">
            {mine ? (
              // Owner's community -> show View link
              <Link
                href={cardLink ?? "#"}
                className="inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-br from-[#5B5BD8] to-[#7A65FF] text-white font-medium shadow focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#5B5BD8]/30"
                aria-label={`Open ${title}`}
              >
                View
              </Link>
            ) : (
              // Not owner -> show Join toggle
              <button
                onClick={handleJoin}
                type="button"
                className={`inline-flex items-center px-4 py-2 rounded-lg text-white font-medium shadow focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                  joined
                    ? "bg-gray-300 text-gray-700 hover:bg-gray-200"
                    : "bg-gradient-to-br from-[#5B5BD8] to-[#7A65FF] hover:brightness-95"
                }`}
                aria-pressed={joined}
              >
                {joined ? "Joined" : "Join"}
              </button>
            )}
          </div>
        </div>

        <p className="mt-3 text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
}
