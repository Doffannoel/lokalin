"use client";
import React from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

type CommunityItem = {
  id?: string;    // mapped _id
  _id?: string;   // kalau ada yang masih kirim _id
  slug?: string;  // kalau pakai slug
  name: string;
  members: string;
};

type Props = {
  communities: CommunityItem[];
  title?: string;
  showSeeMore?: boolean;
  onSeeMore?: () => void;
};

function keyOf(c: CommunityItem) {
  return c.slug ?? c.id ?? c._id;
}

export default function MyCommunity({
  communities,
  title = "My Community",
  showSeeMore = true,
  onSeeMore,
}: Props) {
  const router = useRouter();

  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sticky top-20"
      style={{ position: "sticky", zIndex: 2, pointerEvents: "auto" }}
      data-testid="my-community"
    >
      <h3 className="font-semibold text-gray-900 mb-4">{title}</h3>

      <div className="space-y-3">
        {communities.map((c, i) => {
          const key = keyOf(c);
          const href = key ? `/community/${key}` : "/community";
          const disabled = !key;

          return (
            <div
              key={(c.id as string) ?? (c._id as string) ?? `mc-${i}`}
              className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                disabled ? "opacity-60 cursor-not-allowed" : "hover:bg-gray-50 cursor-pointer"
              }`}
              role="button"
              tabIndex={disabled ? -1 : 0}
              onClick={
                disabled
                  ? undefined
                  : () => {
                      // log untuk memastikan href benar
                      console.log("[MyCommunity] navigate to:", href, c);
                      router.push(href);
                    }
              }
              onKeyDown={
                disabled
                  ? undefined
                  : (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        router.push(href);
                      }
                    }
              }
              aria-label={disabled ? undefined : `Open ${c.name}`}
              data-href={href}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-orange-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-900 truncate">{c.name}</p>
                <p className="text-xs text-gray-500">{c.members}</p>
              </div>
            </div>
          );
        })}
      </div>

      {showSeeMore && (
        <Button className="w-full mt-4" variant="primary" onClick={onSeeMore}>
          See More
        </Button>
      )}
    </div>
  );
}
