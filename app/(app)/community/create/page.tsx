"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Cropper from "react-easy-crop";
import { useAuth } from "@/app/contexts/AuthContext";

/** Helper: crop image on a canvas and return Blob */
async function getCroppedBlob(
  imageSrc: string,
  cropPixels: { x: number; y: number; width: number; height: number },
  mime: string = "image/jpeg",
  quality: number = 0.92
): Promise<Blob> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.crossOrigin = "anonymous";
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = imageSrc;
  });

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(cropPixels.width);
  canvas.height = Math.round(cropPixels.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  ctx.drawImage(
    img,
    cropPixels.x,
    cropPixels.y,
    cropPixels.width,
    cropPixels.height,
    0,
    0,
    cropPixels.width,
    cropPixels.height
  );

  const blob: Blob = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b as Blob), mime, quality)
  );
  return blob;
}

/** Convert Blob → File (untuk FormData upload) */
function blobToFile(blob: Blob, filename: string): File {
  return new File([blob], filename, { type: blob.type, lastModified: Date.now() });
}

export default function CreateCommunityPage() {
  const [cover, setCover] = useState<File | null>(null); // hasil crop final
  const [preview, setPreview] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Cropping modal states
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [rawImageUrl, setRawImageUrl] = useState<string | null>(null); // sebelum crop
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const router = useRouter();
  const { user } = useAuth();

  // Update final preview
  useEffect(() => {
    if (!cover) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(cover);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [cover]);

  // Pilih file → buka cropper
  const handleSelectFile: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    const url = URL.createObjectURL(f);
    setRawImageUrl(url);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setCropModalOpen(true);
  };

  const onCropComplete = useCallback((_: any, croppedPixels: any) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const applyCrop = useCallback(async () => {
    try {
      if (!rawImageUrl || !croppedAreaPixels) return;
      const blob = await getCroppedBlob(rawImageUrl, croppedAreaPixels, "image/jpeg", 0.92);
      const file = blobToFile(blob, `community-banner-${Date.now()}.jpg`);
      setCover(file);
      setCropModalOpen(false);
    } catch (err: any) {
      setError(err?.message || "Failed to crop image");
    } finally {
      if (rawImageUrl) URL.revokeObjectURL(rawImageUrl);
      setRawImageUrl(null);
    }
  }, [rawImageUrl, croppedAreaPixels]);

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
        if (!uploadRes.ok || !uploadData?.success) {
          throw new Error(uploadData?.error || "Failed to upload image");
        }
        imageUrl = uploadData.imageUrl;
      }

      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title, desc, image: imageUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to create community");

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
          <h2 className="text-2xl font-semibold text-[#3434b8] mt-3">Create Community</h2>
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
              {/* Preview banner (5:1). TANPA h-56 agar rasio terjaga */}
              <div className="relative w-full bg-[#f3f4ff]" style={{ paddingTop: "20%" }}>
                {preview ? (
                  <img
                    src={preview}
                    alt="cover preview"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-[#3434b8]">
                    <div className="mb-2">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="#3434b8" className="mx-auto">
                        <path d="M12 5c-3.86 0-7 3.14-7 7 0 3 1.99 5.5 4.75 6.4-.02-.1-.04-.2-.04-.3 0-1.93 1.57-3.5 3.5-3.5s3.5 1.57 3.5 3.5c0 .1-.02.2-.04.3C17.01 17.5 19 15 19 12c0-3.86-3.14-7-7-7z" />
                      </svg>
                    </div>
                    <div className="text-sm">Add Cover Photo (5:1)</div>
                  </div>
                )}
              </div>

              <input
                type="file"
                accept="image/*"
                onChange={handleSelectFile}
                className="sr-only"
              />
            </label>

            {/* Form fields */}
            <div className="p-6 bg-white">
              <label className="block mb-3">
                <div className="text-[#3434b8] font-semibold mb-2">Add Community Name</div>
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
                <div className="text-[#3434b8] font-semibold mb-2">Add Community Description</div>
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

      {/* Crop Modal */}
      {cropModalOpen && rawImageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              setCropModalOpen(false);
              URL.revokeObjectURL(rawImageUrl);
              setRawImageUrl(null);
            }}
          />
          {/* Modal */}
          <div className="relative z-10 w-[90vw] max-w-[960px] bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b">
              <h3 className="text-lg font-semibold text-[#3434b8]">Crop Banner (5:1)</h3>
            </div>

            <div className="relative w-full h-[60vh] bg-gray-100">
              <Cropper
                image={rawImageUrl}
                crop={crop}
                zoom={zoom}
                aspect={5}            // ⬅️ 5:1 seperti Reddit banner
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                restrictPosition
                cropShape="rect"
                showGrid={false}
              />
            </div>

            <div className="px-5 py-4 flex items-center gap-4">
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCropModalOpen(false);
                    URL.revokeObjectURL(rawImageUrl);
                    setRawImageUrl(null);
                  }}
                  className="px-4 py-2 rounded-md border border-gray-300 text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={applyCrop}
                  className="px-4 py-2 rounded-md bg-gradient-to-br from-[#5B5BD8] to-[#7A65FF] text-white"
                >
                  Apply Crop
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
