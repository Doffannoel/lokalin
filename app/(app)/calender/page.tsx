"use client";

import { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp, 
  MoreVertical 
} from 'lucide-react';

// --- Definisi Tipe ---
// Tipe untuk data event
type Event = {
  id: number;
  day: number;
  time: string;
  title: string;
  community: string;
  color: 'purple' | 'orange' | 'pink';
  description: string;
};

// Tipe untuk props MiniCalendar
interface MiniCalendarProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
}

// Tipe untuk props EventCard
interface EventCardProps {
  event: Event;
  isExpanded: boolean;
  onToggle: () => void;
}

// --- Komponen Mini Kalender (Sidebar Kanan) ---
const MiniCalendar = ({ selectedDate, onDateChange, currentMonth, onMonthChange }: MiniCalendarProps) => {
  
  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const getDaysInMonth = (year: number, month: number): number => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number): number => {
    return new Date(year, month, 1).getDay(); // 0 = Sunday
  };

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const blanks: (null)[] = Array(firstDay).fill(null);
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
    return !!day &&
           selectedDate.getDate() === day &&
           selectedDate.getMonth() === month &&
           selectedDate.getFullYear() === year;
  };

  return (
    <div className="bg-blue-50/50 rounded-xl p-4 sticky top-24 border border-blue-100">
      {/* Header Navigasi Bulan */}
      <div className="flex items-center justify-between mb-4">
        <span className="font-semibold text-gray-800">
          {currentMonth.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}
        </span>
        <div className="flex items-center gap-2">
          <button onClick={handlePrevMonth} className="text-gray-500 hover:text-gray-800">
            <ChevronLeft size={20} />
          </button>
          <button onClick={handleNextMonth} className="text-gray-500 hover:text-gray-800">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      
      {/* Grid Hari */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {/* DIPERBAIKI: Menambahkan 'index' ke 'key' untuk menghindari duplikasi */}
        {daysOfWeek.map((day: string, index: number) => (
          <div key={`${day}-${index}`} className="text-xs font-medium text-gray-500 mb-2">{day}</div>
        ))}
        
        {allDays.map((day: number | null, index: number) => (
          <button
            key={index}
            onClick={() => handleDateClick(day)}
            className={`
              w-8 h-8 flex items-center justify-center rounded-full text-sm
              ${day ? 'hover:bg-blue-100' : 'cursor-default'}
              ${isSelected(day) ? 'bg-[#5858FA] text-white' : 'text-gray-700'}
            `}
            disabled={!day}
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  );
};


// --- Komponen Kartu Event ---
const EventCard = ({ event, isExpanded, onToggle }: EventCardProps) => {
  const colorClasses = {
    purple: {
      bg: 'bg-purple-100/60',
      text: 'text-purple-700',
      border: 'border-purple-200'
    },
    orange: {
      bg: 'bg-orange-100/60',
      text: 'text-orange-700',
      border: 'border-orange-200'
    },
    pink: {
      bg: 'bg-pink-100/60',
      text: 'text-pink-700',
      border: 'border-pink-200'
    },
  };

  const colors = colorClasses[event.color] || colorClasses.purple;

  // Memisahkan waktu (cth: "09.30-10.30" dan "WIB")
  const timeParts = event.time.split(' ');
  const time = timeParts[0] || '';
  const period = timeParts[1] || '';

  // Pengecualian untuk event 'Community Gathering' yang diperluas
  // Di desain, event ini tidak menampilkan waktu di header saat diperluas
  const showTimeInHeader = !(isExpanded && event.id === 2901);

  return (
    <div className={`rounded-xl border ${colors.border} ${isExpanded ? 'shadow-md' : 'shadow-sm'}`}>
      {/* Bagian Header Kartu (Bisa diklik) */}
      <div 
        className={`p-4 flex items-center justify-between cursor-pointer ${colors.bg}`}
        onClick={onToggle}
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          
          {/* DIPERBAIKI: Styling Waktu ditumpuk agar sesuai desain */}
          {showTimeInHeader && (
            <div className="flex-shrink-0 text-left w-24">
              <span className="text-sm font-semibold text-gray-700 block">
                {time}
              </span>
              <span className="text-xs text-gray-500 block">
                {period}
              </span>
            </div>
          )}

          {/* DIPERBAIKI: Styling Judul & Komunitas */}
          <div className="flex-1 min-w-0">
            <span className={`font-semibold ${colors.text} truncate`}>{event.title}</span>
            {/* Tampilkan komunitas jika tidak di header 'Community Gathering' */}
            {event.id !== 2901 && (
              <span className="text-sm text-gray-500 hidden md:inline truncate"> - {event.community}</span>
            )}
          </div>
        </div>
        <button className="text-gray-500 hover:text-gray-800 ml-4">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {/* Bagian Detail (Bisa expand) */}
      {isExpanded && (
        <div className="p-4 bg-white rounded-b-xl">
          <div className="flex justify-between items-start">
            <div>
              {/* Tampilkan komunitas di sini untuk 'Community Gathering' */}
              {event.id === 2901 && (
                <p className="font-medium text-gray-700 mb-2">{event.community}</p>
              )}
              <p className="text-sm text-gray-500">
                {event.description}
              </p>
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


// --- Komponen Utama Halaman Kalender ---
export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(new Date(2024, 3, 19));
  const [currentMonth, setCurrentMonth] = useState(new Date(2024, 3, 1));
  const [expandedEventId, setExpandedEventId] = useState<number | null>(2901);

  // Data event dummy (diberi tipe Event[])
  const events: Event[] = [
    { 
      id: 2101, 
      day: 21, 
      time: '09.30-10.30 WIB', 
      title: 'Giveaway', 
      community: 'IT Support',
      color: 'purple',
      description: 'Deskripsi lengkap untuk Giveaway IT Support.'
    },
    { 
      id: 2601, 
      day: 26, 
      time: '12.00-13.00 WIB', 
      title: 'KAI BORTHDAY TOMORROW', 
      community: 'EXO-L',
      color: 'orange',
      description: 'Deskripsi lengkap untuk Ulang Tahun KAI.'
    },
    { 
      id: 2602, 
      day: 26, 
      time: '20.00-22.00 WIB', 
      title: 'Seminar Memandikan Kucing', 
      community: 'Cat Lovers',
      color: 'pink',
      description: 'Deskripsi lengkap Seminar Memandikan Kucing.'
    },
    { 
      id: 2901, 
      day: 29, 
      time: '10.00-15.00 WIB', 
      title: 'Community Gathering - PHP Lovers', 
      community: '(Community Name)',
      color: 'orange',
      description: '10.00-15.00 WIB, Monday, April 29' 
    },
  ];

  // Data dummy untuk grup hari (diberi tipe)
  const dayGroups: { day: number; dateStr: string }[] = [
    { day: 19, dateStr: 'APR, FRI' },
    { day: 21, dateStr: 'APR, SUN' },
    { day: 26, dateStr: 'APR, FRI' },
    { day: 29, dateStr: 'APR, MON' },
    { day: 30, dateStr: 'APR, TUE' },
  ];

  const handleExpandToggle = (id: number) => {
    setExpandedEventId(prevId => (prevId === id ? null : id));
  };

  return (
    // Layout utama (2 kolom: Konten & Mini Kalender)
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 md:p-8">

      {/* Kolom Konten Utama (Daftar Event) */}
      <div className="lg:col-span-2">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Calender</h1>

        <div className="space-y-6">
          {dayGroups.map(group => {
            // Filter event yang sesuai untuk hari ini
            const eventsForDay = events.filter(e => e.day === group.day);
            
            return (
              <div key={group.day}>
                {/* Header Hari */}
                <div className={`flex items-center gap-4 mb-4 ${eventsForDay.length === 0 ? 'pb-4 border-b border-gray-200' : ''}`}>
                  <span className="text-3xl font-bold text-gray-800 w-10">{group.day}</span>
                  <span className="font-semibold text-gray-500">{group.dateStr}</span>
                </div>

                {/* Daftar Kartu Event untuk hari ini */}
                <div className="space-y-3">
                  {eventsForDay.map(event => (
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
      </div>

      {/* Kolom Sidebar Kanan (Mini Kalender) */}
      <div className="lg:col-span-1">
        <MiniCalendar 
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          currentMonth={currentMonth}
          onMonthChange={setCurrentMonth}
        />
      </div>

    </div>
  );
}

