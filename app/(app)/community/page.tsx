// app/community/page.tsx (untuk case sidebar fixed)
import React from "react";
import CommunityList from "@/components/community/CommunityList";

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* beri offset kiri sesuai lebar sidebar (mis. 260px) hanya di screen lg ke atas */}
      <div className="max-w-full mx-auto">
        <main className="lg:pl-[130px] py-6">
          <div className="max-w-[900px]">
            <CommunityList />
          </div>
        </main>
      </div>
    </div>
  );
}
