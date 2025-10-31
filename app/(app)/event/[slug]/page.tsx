"use client";

import React, { useEffect, useState } from "react";
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

export default function EventDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = React.use(params);
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
  }, [slug]);

  const fetchEvent = async () => {
    try {
      const res = await fetch(`/api/event/${slug}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.event) {
        setEvent(data.event);
      }
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
      const res = await fetch("/api/event/saved", {
        credentials: "include",
      });
      const data = await res.json();
      if (data.saved) {
        const isSaved = data.saved.some(
          (item: any) => item.eventId._id === slug
        );
        setSaved(isSaved);
      }
    } catch (error) {
      console.error("Error checking saved status:", error);
    }
  };

  const handleSaveEvent = async () => {
    if (!user) {
      alert("Please login first");
      return;
    }

    setSavingEvent(true);
    try {
      const res = await fetch(`/api/event/${slug}/save`, {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        setSaved(!saved);
        alert(data.message);
      } else {
        alert(data.message || "Failed to save event");
      }
    } catch (error) {
      console.error("Error saving event:", error);
      alert("An error occurred");
    } finally {
      setSavingEvent(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const startTime = start.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const endTime = end.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return `${startTime} - ${endTime} WIB`;
  };

  if (loading) {
    return (
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="text-center text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold text-red-600">
          Event tidak ditemukan
        </h1>
        <Link href="/event" className="text-indigo-600 hover:underline">
          Kembali ke daftar event
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-4 md:p-8">
      {/* Konten Utama (Detail Event) - 3 Kolom */}
      <div className="lg:col-span-3">
        {/* Event Detail Header Image */}
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
            className="absolute top-6 left-6 p-3 bg-white/30 hover:bg-white/50 rounded-lg backdrop-blur-sm transition-colors cursor-pointer z-50 shadow-lg"
          >
            <ArrowLeft size={24} className="text-white" />
          </Link>
        </div>

        {/* Event Detail Content */}
        <div className="p-8 max-w-4xl">
          <h1 className="text-3xl font-bold mb-6 text-indigo-900">
            {event.title}
          </h1>

          <div className="flex flex-wrap gap-6 mb-8">
            <div className="flex items-center space-x-3">
              <Users size={24} className="text-indigo-600" />
              <span className="font-medium text-gray-800">
                {event.communityId.title}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar size={24} className="text-indigo-600" />
              <span className="font-medium text-gray-800">
                {formatDate(event.startDate)}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <Clock size={24} className="text-indigo-600" />
              <span className="font-medium text-gray-800">
                {formatTime(event.startDate, event.endDate)}
              </span>
            </div>
          </div>

          <div className="text-gray-700 leading-relaxed mb-8 prose">
            <p>{event.desc}</p>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={handleSaveEvent}
              disabled={savingEvent}
              variant={saved ? "secondary" : "primary"}
              size="lg"
            >
              {savingEvent ? "..." : saved ? "Saved" : "Save Event"}
            </Button>
          </div>
        </div>
      </div>

      {/* Sidebar Kanan (My Community) - 1 Kolom */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sticky top-20">
          <h3 className="font-semibold text-gray-900 mb-4">My Community</h3>
          <div className="space-y-3">
            {communities.slice(0, 4).map((community) => (
              <div
                key={community._id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-orange-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 truncate">
                    {community.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {community.totalUsers} Members
                  </p>
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