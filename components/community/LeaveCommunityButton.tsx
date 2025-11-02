// components/community/LeaveCommunityButton.tsx
"use client";
import { useState } from "react";

type Props = {
  communityId: string;
  onSuccess?: (payload?: any) => void;
};

export default function LeaveCommunityButton({ communityId, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleLeave() {
    if (!communityId) return;
    setLoading(true);
    setErr(null);

    try {
      const res = await fetch(`/api/community/${communityId}/leave`, {
        method: "POST",
        credentials: "include",
      });

      const ct = res.headers.get("content-type") || "";
      const data = ct.includes("application/json") ? await res.json() : null;

      if (!res.ok) {
        throw new Error(data?.message || `HTTP ${res.status}`);
      }

      onSuccess?.(data);
    } catch (e: any) {
      setErr(e?.message || "Failed to leave community");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={handleLeave}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50"
        title="Leave this community"
      >
        {loading ? "Leaving..." : "Leave Community"}
      </button>
      {err && <span className="text-sm text-red-600">{err}</span>}
    </div>
  );
}
