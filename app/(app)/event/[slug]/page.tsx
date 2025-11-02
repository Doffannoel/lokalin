"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { Users, Calendar, Clock, ArrowLeft } from "lucide-react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/app/contexts/AuthContext";
import Cropper from "react-easy-crop";

/* ===================== Types ===================== */
type Event = {
  _id: string;
  title: string;
  desc: string;
  startDate: string;
  endDate: string;
  image?: string;
  communityId: {
    _id: string;
    title: string;
  };
  createdBy: {
    _id: string;
    username: string;
  };
};

type Community = {
  _id: string;
  title: string;
  totalUsers: number;
};

/* ===================== Helpers ===================== */
// crop image on a canvas and return Blob
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

function blobToFile(blob: Blob, filename: string): File {
  return new File([blob], filename, { type: blob.type, lastModified: Date.now() });
}

/* ===================== Page ===================== */
export default function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params); // Next 15 unwrap
  const { user } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [savingEvent, setSavingEvent] = useState(false);

  // ===== Image crop states (NEW) =====
  const [cropOpen, setCropOpen] = useState(false);
  const [rawUrl, setRawUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{
    x: number; y: number; width: number; height: number;
  } | null>(null);
  const [changingCover, setChangingCover] = useState(false);
  const [coverError, setCoverError] = useState<string>("");

  useEffect(() => {
    if (!slug) return;
    fetchEvent();
    fetchCommunities();
    checkIfSaved();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const fetchEvent = async () => {
    try {
      const res = await fetch(`/api/event/${slug}`, { credentials: "include" });
      const data = await res.json();
      if (res.ok && data.event) setEvent(data.event);
    } catch (error) {
      console.error("Error fetching event:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCommunities = async () => {
    try {
      const res = await fetch("/api/community?filter=joined", { credentials: "include" });
      const data = await res.json();
      setCommunities(data.communities || []);
    } catch (error) {
      console.error("Error fetching communities:", error);
    }
  };

  const checkIfSaved = async () => {
    try {
      const res = await fetch("/api/calender", { credentials: "include" });
      const data = await res.json();
      if (data.events) {
        const isSaved = data.events.some(
          (item: any) => (item.eventId?._id ?? item.eventId)?.toString() === slug.toString()
        );
        setSaved(isSaved);
      }
    } catch (error) {
      console.error("Error checking saved:", error);
    }
  };

  const handleSaveEvent = async () => {
    if (!user) return alert("Please login first");
    setSavingEvent(true);
    try {
      const res = await fetch(`/api/event/${slug}/save`, { method: "POST", credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed");
      setSaved((prev) => !prev);
    } catch (error: any) {
      alert(error?.message || "Failed to save");
    } finally {
      setSavingEvent(false);
    }
  };

  // ===== Change Cover (NEW) =====
  const isAdmin =
    !!user &&
    !!event &&
    (event.createdBy?._id?.toString?.() ?? "") === (user.id?.toString?.() ?? "");

  function pickCover(e: React.ChangeEvent<HTMLInputElement>) {
    setCoverError("");
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setRawUrl(url);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setCropOpen(true);
  }

  const onCropComplete = (_: any, cropped: any) => setCroppedAreaPixels(cropped);

  async function applyCover() {
    if (!event || !rawUrl || !croppedAreaPixels) return;
    setChangingCover(true);
    setCoverError("");
    try {
      // crop -> file
      const blob = await getCroppedBlob(rawUrl, croppedAreaPixels, "image/jpeg", 0.92);
      const file = blobToFile(blob, `event-cover-${Date.now()}.jpg`);

      // upload
      const form = new FormData();
      form.append("file", file);
      const up = await fetch("/api/upload", { method: "POST", body: form });
      const upData = await up.json();
      if (!up.ok || !upData?.success) {
        throw new Error(upData?.error || "Failed to upload image");
      }
      const imageUrl = upData.imageUrl as string;

      // patch event
      const res = await fetch(`/api/event/${event._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ image: imageUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to update event");

      // update UI
      setEvent((prev) => (prev ? { ...prev, image: imageUrl } : prev));
      setCropOpen(false);
    } catch (err: any) {
      setCoverError(err?.message || "Failed to change cover");
    } finally {
      if (rawUrl) URL.revokeObjectURL(rawUrl);
      setRawUrl(null);
      setChangingCover(false);
    }
  }

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const formatTime = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return `${start.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} - ${end.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB`;
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (!event) return <div className="p-8">Event tidak ditemukan</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-4 md:p-8">
      {/* Main Content */}
      <div className="lg:col-span-3">
        <div className="relative h-80 bg-gradient-to-br from-green-400 to-green-600 rounded-xl overflow-hidden">
          {event.image ? (
            <img
              src={event.image}
              alt={event.title}
              className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white text-6xl font-bold">
              {event.title.charAt(0)}
            </div>
          )}

          <Link
            href="/event"
            className="absolute top-6 left-6 bg-white/40 hover:bg-white/60 p-3 rounded-lg backdrop-blur-sm"
          >
            <ArrowLeft size={24} className="text-white" />
          </Link>

          {/* NEW: admin-only change cover button (tidak mengganggu UI existing) */}
          {isAdmin && (
            <label className="absolute top-6 right-6">
              <span className="inline-flex items-center gap-2 bg-white/70 hover:bg-white text-indigo-700 text-sm px-3 py-2 rounded-md shadow cursor-pointer">
                Change Cover
                <input type="file" accept="image/*" className="hidden" onChange={pickCover} />
              </span>
            </label>
          )}
        </div>

        <div className="p-8">
          <h1 className="text-3xl font-bold mb-6 text-indigo-900">{event.title}</h1>

          <div className="flex flex-wrap gap-6 mb-8">
            <div className="flex items-center gap-3">
              <Users size={24} className="text-indigo-600" /> {event.communityId.title}
            </div>
            <div className="flex items-center gap-3">
              <Calendar size={24} className="text-indigo-600" /> {formatDate(event.startDate)}
            </div>
            <div className="flex items-center gap-3">
              <Clock size={24} className="text-indigo-600" /> {formatTime(event.startDate, event.endDate)}
            </div>
          </div>

          <p className="text-gray-700 leading-relaxed mb-8">{event.desc}</p>

          <Button
            onClick={handleSaveEvent}
            disabled={savingEvent}
            variant={saved ? "secondary" : "primary"}
            size="lg"
          >
            {savingEvent ? "..." : saved ? "Saved ✓" : "Save Event"}
          </Button>
        </div>
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl shadow-sm border p-4 sticky top-20">
          <h3 className="font-semibold text-gray-900 mb-4">My Community</h3>

          <div className="space-y-3">
            {communities.slice(0, 4).map((c) => (
              <div key={c._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-orange-400" />
                <div>
                  <p className="text-sm font-medium">{c.title}</p>
                  <p className="text-xs text-gray-500">{c.totalUsers} Members</p>
                </div>
              </div>
            ))}
          </div>

          <Button href="/community" className="w-full mt-4" variant="primary">
            See More
          </Button>
        </div>
      </div>

      {/* ===== NEW: Crop Modal (admin only) ===== */}
      {cropOpen && rawUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => {
              setCropOpen(false);
              URL.revokeObjectURL(rawUrl);
              setRawUrl(null);
            }}
          />
          {/* modal */}
          <div className="relative z-10 w-[92vw] max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-5 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#3434b8]">Crop Cover (16:9)</h3>
              <button
                onClick={() => {
                  setCropOpen(false);
                  URL.revokeObjectURL(rawUrl);
                  setRawUrl(null);
                }}
                className="p-2 rounded-md hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <div className="relative w-full h-[60vh] bg-gray-100">
              <Cropper
                image={rawUrl}
                crop={crop}
                zoom={zoom}
                aspect={16 / 9}         // cocok untuk hero 16:9
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                restrictPosition
                cropShape="rect"
                showGrid={false}
              />
            </div>

            {coverError && (
              <div className="px-6 pt-3 text-sm text-red-600">{coverError}</div>
            )}

            <div className="px-6 py-4 border-t flex items-center justify-end gap-3">
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="mr-auto w-48"
              />
              <button
                onClick={() => {
                  setCropOpen(false);
                  if (rawUrl) URL.revokeObjectURL(rawUrl);
                  setRawUrl(null);
                }}
                className="px-4 py-2 rounded-md border bg-white hover:bg-gray-50"
                disabled={changingCover}
              >
                Cancel
              </button>
              <button
                onClick={applyCover}
                className="px-4 py-2 rounded-md text-white bg-[#5B5BD8] hover:opacity-90 disabled:opacity-50"
                disabled={changingCover}
              >
                {changingCover ? "Saving..." : "Apply Cover"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
