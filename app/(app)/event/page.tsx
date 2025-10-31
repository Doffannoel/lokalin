"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Calendar } from "lucide-react";
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
  createdBy: any;
};

type Community = {
  _id: string;
  title: string;
  totalUsers: number;
};

export default function EventPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchEvents();
    fetchCommunities();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/event", {
        credentials: "include",
      });
      const data = await res.json();
      if (data.events) {
        setEvents(data.events);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 md:p-8">
      {/* KONTEN UTAMA (2 KOLOM) */}
      <div className="lg:col-span-2 space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Event</h1>

        {loading ? (
          <div className="bg-white rounded-xl p-8 text-center text-gray-500">
            Loading events...
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-gray-500">
            No events available yet
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map((event) => (
              <Link
                key={event._id}
                href={`/event/${event._id}`}
                className="block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-1"
              >
                <div className="relative h-48 w-full bg-gradient-to-br from-green-400 to-green-600">
                  {event.image ? (
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold">
                      {event.title.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="p-5 flex flex-col h-full">
                  <h3 className="font-bold text-lg mb-3 text-gray-900 line-clamp-1">
                    {event.title}
                  </h3>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Users size={18} className="text-[#5858FA]" />
                      <span className="text-sm text-gray-700">
                        {event.communityId.title}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar size={18} className="text-[#5858FA]" />
                      <span className="text-sm text-gray-700">
                        {formatDate(event.startDate)}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {event.desc}
                  </p>

                  <div className="mt-auto"></div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* SIDEBAR KANAN (1 KOLOM) */}
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
          <Button href="/community" className="w-full mt-4" variant="primary">
            See More
          </Button>
        </div>
      </div>
    </div>
  );
}
