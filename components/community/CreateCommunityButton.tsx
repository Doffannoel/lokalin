// components/community/CreateCommunityButton.tsx
"use client";
import Link from "next/link";
import React from "react";

export default function CreateCommunityButton() {
  return (
    <Link href="/community/create" className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-br from-[#3f37ff] to-[#6b5bff] text-white font-medium shadow hover:scale-[1.01] transition-transform">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
        <path d="M3 11h8V3h2v8h8v2h-8v8h-2v-8H3z" />
      </svg>
      Create Community
    </Link>
  );
}
