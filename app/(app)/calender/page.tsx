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

type SavedEvent = {
  _id: string;
  eventId: {
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
  };
};

type Event = {
  id: string;
  day: number;
  time: string;
  title: string;
  community: string;
  color: "purple" | "orange" | "pink";
  description: string;
  fullStartDate: Date;
};

interface MiniCalendarProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  eventDays: number[];
}

interface EventCardProps {
  event: Event;
  isExpanded: boolean;
  onToggle: () => void;
}

const MiniCalendar = ({
  selectedDate,
  onDateChange,
  currentMonth,
  onMonthChange,
  eventDays,
}: MiniCalendarProps) => {
  const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"];

  const getDaysInMonth = (year: number, month: number): number => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number): number => {
    return new Date(year, month, 1).getDay();
  };

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const blanks: null[] = Array(firstDay).fill(null);
  const days: number[] = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const allDays: (number | null)[] = [...blanks, ...days];

  const handlePrevMonth = () => {
    onMonthChange(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    onMonthChange(new Date(year, month + 1, 1));
  };

  const handleDateClick = (day: number | null) => {
    if (!day) return;
    onDateChange(new Date(year, month, day));
  };

  const isSelected = (day: number | null): boolean => {
    return (
      !!day &&
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === month &&
      selectedDate.getFullYear() === year
    );
  };

  const hasEvent = (day: number | null): boolean => {
    return !!day && eventDays.includes(day);
  };

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
            onClick={handlePrevMonth}
            className="text-gray-500 hover:text-gray-800"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={handleNextMonth}
            className="text-gray-500 hover:text-gray-800"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {daysOfWeek.map((day: string, index: number) => (
          <div
            key={`${day}-${index}`}
            className="text-xs font-medium text-gray-500 mb-2"
          >
            {day}
          </div>
        ))}

        {allDays.map((day: number | null, index: number) => (
          <button
            key={index}
            onClick={() => handleDateClick(day)}
            className={`
              w-8 h-8 flex items-center justify-center rounded-full text-sm relative
              ${day ? "hover:bg-blue-100" : "cursor-default"}
              ${isSelected(day) ? "bg-[#5858FA] text-white" : "text-gray-700"}
            `}
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
  const colorClasses = {
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

  const colors = colorClasses[event.color] || colorClasses.purple;

  const timeParts = event.time.split(" ");
  const time = timeParts[0] || "";
  const period = timeParts[1] || "";

  return (
    <div
      className={`rounded-xl border ${colors.border} ${
        isExpanded ? "shadow-md" : "shadow-sm"
      }`}
    >
      <div
        className={`p-4 flex items-center justify-between cursor-pointer ${colors.bg}`}
        onClick={onToggle}
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="flex-shrink-0 text-left w-24">
            <span className="text-sm font-semibold text-gray-700 block">
              {time}
            </span>
            <span className="text-xs text-gray-500 block">{period}</span>
          </div>

          <div className="flex-1 min-w-0">
            <span className={`font-semibold ${colors.text} truncate`}>
              {event.title}
            </span>
            <span className="text-sm text-gray-500 hidden md:inline truncate">
              {" "}
              - {event.community}
            </span>
          </div>
        </div>
        <button className="text-gray-500 hover:text-gray-800 ml-4">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {isExpanded && (
        <div className="p-4 bg-white rounded-b-xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">{event.description}</p>
            </div>
            <button className="text-gray-400 hover:text-gray-700">
              <MoreVertical size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [savedEvents, setSavedEvents] = useState<SavedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchSavedEvents();
    }
  }, [user]);

  const fetchSavedEvents = async () => {
    try {
      const res = await fetch("/api/calender", {
        credentials: "include",
      });
      const data = await res.json();
      if (data.events) {
        setSavedEvents(data.events);
      }
    } catch (error) {
      console.error("Error fetching saved events:", error);
    } finally {
      setLoading(false);
    }
  };

  const getColorForIndex = (index: number): "purple" | "orange" | "pink" => {
    const colors: ("purple" | "orange" | "pink")[] = [
      "purple",
      "orange",
      "pink",
    ];
    return colors[index % colors.length];
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

    return `${startTime}-${endTime} WIB`;
  };

  const events: Event[] = savedEvents.map((saved, index) => {
    const startDate = new Date(saved.eventId.startDate);
    return {
      id: saved._id,
      day: startDate.getDate(),
      time: formatTime(saved.eventId.startDate, saved.eventId.endDate),
      title: saved.eventId.title,
      community: saved.eventId.communityId.title,
      color: getColorForIndex(index),
      description: saved.eventId.desc,
      fullStartDate: startDate,
    };
  });

  const groupEventsByDay = () => {
    const grouped: { [key: string]: Event[] } = {};

    events.forEach((event) => {
      const dateKey = event.fullStartDate.toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });

    return Object.entries(grouped)
      .map(([dateKey, events]) => ({
        date: new Date(dateKey),
        events: events.sort(
          (a, b) => a.fullStartDate.getTime() - b.fullStartDate.getTime()
        ),
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  const dayGroups = groupEventsByDay();

  const eventDays = events.map((event) => event.day);

  const handleExpandToggle = (id: string) => {
    setExpandedEventId((prevId) => (prevId === id ? null : id));
  };

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 md:p-8">
      <div className="lg:col-span-2">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Calendar</h1>

        {dayGroups.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-gray-500">
            No saved events. Save events from the Event page to see them here!
          </div>
        ) : (
          <div className="space-y-6">
            {dayGroups.map((group) => {
              const dateStr = group.date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                weekday: "short",
              });

              return (
                <div key={group.date.toISOString()}>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-3xl font-bold text-gray-800 w-10">
                      {group.date.getDate()}
                    </span>
                    <span className="font-semibold text-gray-500 uppercase">
                      {dateStr}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {group.events.map((event) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        isExpanded={expandedEventId === event.id}
                        onToggle={() => handleExpandToggle(event.id)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

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
