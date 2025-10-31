import React from "react";
import Button from "@/components/ui/Button";

type Community = {
  name: string;
  members: string;
};

type Props = {
  communities: Community[];
  title?: string;
  showSeeMore?: boolean;
  onSeeMore?: () => void;
};

export default function MyCommunity({
  communities,
  title = "My Community",
  showSeeMore = true,
  onSeeMore,
}: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sticky top-20">
      <h3 className="font-semibold text-gray-900 mb-4">{title}</h3>
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
      {showSeeMore && (
        <Button className="w-full mt-4" variant="primary" onClick={onSeeMore}>
          See More
        </Button>
      )}
    </div>
  );
}
