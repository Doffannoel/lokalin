"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";

export default function CreateCommunityPage() {
  const [cover, setCover] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!cover) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(cover);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [cover]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!user) {
      alert("Please login first");
      return;
    }

    if (!title.trim() || !desc.trim()) {
      setError("Title and description are required");
      return;
    }

    setLoading(true);

    try {
      let imageUrl = "";
      if (cover) {
        const formData = new FormData();
        formData.append("file", cover);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadRes.json();

        if (!uploadData.success) {
          throw new Error(uploadData.error || "Failed to upload image");
        }

        imageUrl = uploadData.imageUrl;
      }

      const res = await fetch("/api/community", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title,
          desc,
          image: imageUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create community");
      }

      router.push("/community");
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[900px]">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="mb-4">
          <Link href="/community" className="text-gray-500 hover:underline">
            ← Back
          </Link>
          <h2 className="text-2xl font-semibold text-[#3434b8] mt-3">
            Create Community
          </h2>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Cover upload */}
          <div className="border border-gray-100 rounded-md overflow-hidden">
            <label className="block">
              <div className="flex items-center justify-center h-44 bg-[#f3f4ff] cursor-pointer">
                {preview ? (
                  <img
                    src={preview}
                    alt="cover preview"
                    className="object-cover w-full h-44"
                  />
                ) : (
                  <div className="text-center text-[#3434b8]">
                    <div className="mb-2">
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="#3434b8"
                        className="mx-auto"
                      >
                        <path d="M12 5c-3.86 0-7 3.14-7 7 0 3 1.99 5.5 4.75 6.4-.02-.1-.04-.2-.04-.3 0-1.93 1.57-3.5 3.5-3.5s3.5 1.57 3.5 3.5c0 .1-.02.2-.04.3C17.01 17.5 19 15 19 12c0-3.86-3.14-7-7-7z" />
                      </svg>
                    </div>
                    <div className="text-sm">Add Cover Photo</div>
                  </div>
                )}
              </div>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  setCover(f);
                }}
                className="sr-only"
              />
            </label>

            {/* Form fields */}
            <div className="p-6 bg-white">
              <label className="block mb-3">
                <div className="text-[#3434b8] font-semibold mb-2">
                  Add Community Name
                </div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Write here.."
                  className="w-full border border-gray-200 rounded-md px-4 py-3"
                  required
                />
              </label>

              <label className="block mb-3">
                <div className="text-[#3434b8] font-semibold mb-2">
                  Add Community Description
                </div>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Write here.."
                  className="w-full border border-gray-200 rounded-md px-4 py-3 h-32"
                  required
                />
              </label>

              <button
                type="submit"
                disabled={loading}
                className="mt-4 px-6 py-3 rounded-md bg-gradient-to-br from-[#5B5BD8] to-[#7A65FF] text-white font-medium disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Community"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
