"use client";

import React, { useEffect, useState } from "react";
import { use } from "react";
import Link from "next/link";
import { Users, Calendar, Clock, ArrowLeft } from "lucide-react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/app/contexts/AuthContext";

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

export default function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params); // ✅ Fix next.js param unwrap

  const [event, setEvent] = useState<Event | null>(null);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [savingEvent, setSavingEvent] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
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
      const res = await fetch("/api/community?filter=joined", {
        credentials: "include",
      });
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
          (item: any) =>
            (item.eventId?._id ?? item.eventId)?.toString() === slug.toString()
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
      const res = await fetch(`/api/event/${slug}/save`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data?.message || "Failed");
      setSaved((prev) => !prev);
    } catch (error: any) {
      alert(error?.message || "Failed to save");
    } finally {
      setSavingEvent(false);
    }
  };

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
            <img src={event.image} alt={event.title} className="absolute inset-0 w-full h-full object-cover mix-blend-overlay" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white text-6xl font-bold">
              {event.title.charAt(0)}
            </div>
          )}
          <Link href="/event" className="absolute top-6 left-6 bg-white/40 hover:bg-white/60 p-3 rounded-lg backdrop-blur-sm">
            <ArrowLeft size={24} className="text-white" />
          </Link>
        </div>

        <div className="p-8">
          <h1 className="text-3xl font-bold mb-6 text-indigo-900">{event.title}</h1>

          <div className="flex flex-wrap gap-6 mb-8">
            <div className="flex items-center gap-3"><Users size={24} className="text-indigo-600" /> {event.communityId.title}</div>
            <div className="flex items-center gap-3"><Calendar size={24} className="text-indigo-600" /> {formatDate(event.startDate)}</div>
            <div className="flex items-center gap-3"><Clock size={24} className="text-indigo-600" /> {formatTime(event.startDate, event.endDate)}</div>
          </div>

          <p className="text-gray-700 leading-relaxed mb-8">{event.desc}</p>

          <Button onClick={handleSaveEvent} disabled={savingEvent} variant={saved ? "secondary" : "primary"} size="lg">
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
    </div>
  );
}
