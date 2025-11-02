"use client";

import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  MoreVertical,
} from "lucide-react";
import { useAuth } from "@/app/contexts/AuthContext";

/* ================== Types ================== */
type PopulatedCommunity =
  | string
  | {
      _id: string;
      title?: string;
    };

type PopulatedEventObj = {
  _id: string;
  title?: string;
  desc?: string;
  startDate?: string; // ISO string
  endDate?: string; // ISO string
  image?: string;
  communityId?: PopulatedCommunity;
};

type SavedEvent =
  | {
      _id: string;
      eventId?: string | PopulatedEventObj;
    }
  | any; // fallback for unknown shapes coming from API

type UiEvent = {
  id: string;
  day: number;
  time: string;
  title: string;
  community: string;
  description: string;
  color: "purple" | "orange" | "pink";
  fullStartDate: Date;
};

type MiniCalendarProps = {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  eventDays: number[];
};

type EventCardProps = {
  event: UiEvent;
  isExpanded: boolean;
  onToggle: () => void;
};

/* ================== Helpers ================== */
function getCommunityTitle(c: PopulatedCommunity | undefined): string {
  if (!c) return "Community";
  if (typeof c === "string") return "Community";
  return c.title || "Community";
}

function formatTimeRange(startISO?: string, endISO?: string): string {
  if (!startISO || !endISO) return "";
  const start = new Date(startISO);
  const end = new Date(endISO);
  const startTime = start.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const endTime = end.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${startTime}-${endTime} WIB`;
}

function colorForIndex(i: number): UiEvent["color"] {
  const arr: UiEvent["color"][] = ["purple", "orange", "pink"];
  return arr[i % arr.length];
}

/* ================== UI Bits ================== */
const MiniCalendar = ({
  selectedDate,
  onDateChange,
  currentMonth,
  onMonthChange,
  eventDays,
}: MiniCalendarProps) => {
  const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"];

  const getDaysInMonth = (y: number, m: number) =>
    new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) =>
    new Date(y, m, 1).getDay();

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const blanks: null[] = Array(firstDay).fill(null);
  const days: number[] = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const allDays: (number | null)[] = [...blanks, ...days];

  const isSelected = (day: number | null): boolean =>
    !!day &&
    selectedDate.getDate() === day &&
    selectedDate.getMonth() === month &&
    selectedDate.getFullYear() === year;

  const hasEvent = (day: number | null): boolean =>
    !!day && eventDays.includes(day);

  return (
    <div className="bg-blue-50/50 rounded-xl p-4 sticky top-24 border border-blue-100">
      <div className="flex items-center justify-between mb-4">
        <span className="font-semibold text-gray-800">
          {currentMonth.toLocaleString("id-ID", {
            month: "long",
            year: "numeric",
          })}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onMonthChange(new Date(year, month - 1, 1))}
            className="text-gray-500 hover:text-gray-800"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => onMonthChange(new Date(year, month + 1, 1))}
            className="text-gray-500 hover:text-gray-800"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {daysOfWeek.map((d, i) => (
          <div key={`${d}-${i}`} className="text-xs font-medium text-gray-500 mb-2">
            {d}
          </div>
        ))}

        {allDays.map((day, i) => (
          <button
            key={i}
            onClick={() => day && onDateChange(new Date(year, month, day))}
            className={`w-8 h-8 flex items-center justify-center rounded-full text-sm relative ${
              day ? "hover:bg-blue-100" : "cursor-default"
            } ${isSelected(day) ? "bg-[#5858FA] text-white" : "text-gray-700"}`}
            disabled={!day}
          >
            {day}
            {hasEvent(day) && !isSelected(day) && (
              <span className="absolute bottom-0.5 w-1 h-1 bg-[#5858FA] rounded-full"></span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

const EventCard = ({ event, isExpanded, onToggle }: EventCardProps) => {
  const colorClasses: Record<
    UiEvent["color"],
    { bg: string; text: string; border: string }
  > = {
    purple: {
      bg: "bg-purple-100/60",
      text: "text-purple-700",
      border: "border-purple-200",
    },
    orange: {
      bg: "bg-orange-100/60",
      text: "text-orange-700",
      border: "border-orange-200",
    },
    pink: {
      bg: "bg-pink-100/60",
      text: "text-pink-700",
      border: "border-pink-200",
    },
  };
  const colors = colorClasses[event.color];

  return (
    <div className={`rounded-xl border ${colors.border} ${isExpanded ? "shadow-md" : "shadow-sm"}`}>
      <div
        className={`p-4 flex items-center justify-between cursor-pointer ${colors.bg}`}
        onClick={onToggle}
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="flex-shrink-0 text-left w-24">
            <span className="text-sm font-semibold text-gray-700 block">
              {event.time.split(" ")[0] || ""}
            </span>
            <span className="text-xs text-gray-500 block">
              {event.time.split(" ")[1] || ""}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <span className={`font-semibold ${colors.text} truncate`}>{event.title}</span>
            <span className="text-sm text-gray-500 hidden md:inline truncate"> — {event.community}</span>
          </div>
        </div>
        <button className="text-gray-500 hover:text-gray-800 ml-4">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {isExpanded && (
        <div className="p-4 bg-white rounded-b-xl">
          <div className="flex justify-between items-start">
            <p className="text-sm text-gray-500">{event.description}</p>
            <button className="text-gray-400 hover:text-gray-700">
              <MoreVertical size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ================== Page ================== */
export default function CalendarPage() {
  const { user } = useAuth();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [savedEvents, setSavedEvents] = useState<SavedEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (user) fetchSavedEvents();
  }, [user]);

  async function fetchSavedEvents() {
    try {
      const res = await fetch("/api/calender", { credentials: "include" });
      const data = await res.json();
      // dukung { events: [...] } ATAU { saved: [...] }
      const arr: SavedEvent[] = Array.isArray(data?.events)
        ? data.events
        : Array.isArray(data?.saved)
        ? data.saved
        : [];
      setSavedEvents(arr);
    } catch (e) {
      console.error("Error fetching saved events:", e);
    } finally {
      setLoading(false);
    }
  }

  // Normalisasi savedEvents -> UiEvent[]
  const uiEvents: UiEvent[] = savedEvents.flatMap((saved, index) => {
    const evRaw = (saved as any)?.eventId as undefined | string | PopulatedEventObj;
    // kalau belum populate / masih string → skip (tidak bisa render tanggal)
    if (!evRaw || typeof evRaw === "string") return [];

    const { startDate, endDate, title, desc, communityId } = evRaw;
    if (!startDate) return [];

    const start = new Date(startDate);
    return [
      {
        id: (saved as any)._id ?? `${index}`,
        day: start.getDate(),
        time: formatTimeRange(startDate, endDate),
        title: title || "Untitled",
        community: getCommunityTitle(communityId),
        description: desc || "",
        color: colorForIndex(index),
        fullStartDate: start,
      },
    ];
  });

  // Hari yang punya event (untuk dot di mini calendar)
  const eventDays: number[] = uiEvents.map((e) => e.day);

  // Grouping by day (KETIK DENGAN JELAS → hilangin 'unknown'!)
  const grouped: Record<string, UiEvent[]> = uiEvents.reduce(
    (acc: Record<string, UiEvent[]>, ev) => {
      const key = ev.fullStartDate.toDateString();
      if (!acc[key]) acc[key] = [];
      acc[key].push(ev);
      return acc;
    },
    {} as Record<string, UiEvent[]>
  );

  // Toggle expand (kalau nanti mau dipakai)
  const handleExpandToggle = (id: string) =>
    setExpandedEventId((prev) => (prev === id ? null : id));

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 md:p-8">
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Calendar</h1>
          <div className="text-center text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  const groupedEntries = Object.entries(grouped) as [string, UiEvent[]][];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 md:p-8">
      {/* Left / Main */}
      <div className="lg:col-span-2">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Calendar</h1>

        {groupedEntries.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-gray-500">
            No saved events. Save events from the Event page to see them here!
          </div>
        ) : (
          <div className="space-y-6">
            {groupedEntries
              .map(([dateKey, list]) => ({
                date: new Date(dateKey),
                events: [...list].sort(
                  (a, b) => a.fullStartDate.getTime() - b.fullStartDate.getTime()
                ),
              }))
              .sort((a, b) => a.date.getTime() - b.date.getTime())
              .map(({ date, events }) => {
                const header = date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  weekday: "short",
                });

                return (
                  <div key={date.toISOString()}>
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-3xl font-bold text-gray-800 w-10">
                        {date.getDate()}
                      </span>
                      <span className="font-semibold text-gray-500 uppercase">
                        {header}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {events.map((ev) => (
                        <EventCard
                          key={ev.id}
                          event={ev}
                          isExpanded={expandedEventId === ev.id}
                          onToggle={() => handleExpandToggle(ev.id)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Right / Mini Calendar */}
      <div className="lg:col-span-1">
        <MiniCalendar
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          currentMonth={currentMonth}
          onMonthChange={setCurrentMonth}
          eventDays={eventDays}
        />
      </div>
    </div>
  );
}
