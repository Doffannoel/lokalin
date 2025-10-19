"use client";

import Image from "next/image";
import { Heart, MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";

export default function HomePage() {
  const communities = [
    { name: "IT & Support Community", members: "1k Members" },
    { name: "IT & Support Community", members: "1k Members" },
    { name: "IT & Support Community", members: "1k Members" },
    { name: "IT & Support Community", members: "1k Members" },
  ];

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-4">
        {/* Write Something Box */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white font-semibold text-sm">
              C
            </div>
            <input
              type="text"
              placeholder="Write Something"
              className="flex-1 bg-gray-50 rounded-full px-4 py-2.5 text-sm text-gray-600 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5858FA]/20 transition-all"
            />
          </div>
        </div>

        {/* Post Card */}
        <motion.div
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
                J
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-gray-900">
                    @Jacob
                  </span>
                </div>
                <p className="text-xs text-gray-500">IT & Support Community</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">1 day ago</span>
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <MoreHorizontal size={20} />
              </button>
            </div>
          </div>

          {/* Post Content */}
          <div className="px-4 pb-4">
            <p className="text-sm text-gray-700 leading-relaxed mb-4">
              Prepare to be dazzled by our latest collection! From trendy
              fashion to must-have gadgets, we've got something for everyone.
            </p>

            {/* Post Image - Laptop dengan gradient background */}
            <div className="relative w-full h-[300px] rounded-lg overflow-hidden bg-black">
              {/* Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-purple-500 to-blue-500 opacity-80" />

              {/* Laptop Mockup */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-[70%] max-w-[500px]">
                  {/* Laptop Screen */}
                  <div
                    className="relative bg-gray-900 rounded-lg shadow-2xl"
                    style={{ aspectRatio: "16/10" }}
                  >
                    {/* Screen border/bezel */}
                    <div className="absolute inset-0 border-8 border-gray-800 rounded-lg">
                      {/* Screen content - gradient */}
                      <div className="w-full h-full bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-sm" />
                    </div>
                    {/* Camera notch */}
                    <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gray-700 rounded-full" />
                    {/* Apple logo hint */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <svg
                        width="40"
                        height="40"
                        viewBox="0 0 24 24"
                        fill="white"
                        opacity="0.3"
                      >
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                      </svg>
                    </div>
                  </div>
                  {/* Laptop base */}
                  <div
                    className="relative h-2 bg-gray-800 rounded-b-lg"
                    style={{ marginTop: "-1px" }}
                  />
                  <div
                    className="relative h-1 bg-gray-700"
                    style={{
                      width: "110%",
                      marginLeft: "-5%",
                      marginTop: "-1px",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Post Footer */}
          <div className="px-4 pb-4 flex items-center gap-2">
            <button className="flex items-center gap-1.5 text-gray-500 hover:text-red-500 transition-colors">
              <Heart size={18} />
              <span className="text-sm font-medium">100k Likes</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Right Sidebar - My Community */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sticky top-20">
          <h3 className="font-semibold text-gray-900 mb-4">My Community</h3>
          <div className="space-y-3">
            {communities.map((community, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-orange-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 truncate">
                    {community.name}
                  </p>
                  <p className="text-xs text-gray-500">{community.members}</p>
                </div>
              </div>
            ))}
          </div>
          <Button className="w-full mt-4" variant="primary">
            See More
          </Button>
        </div>
      </div>
    </div>
  );
}
