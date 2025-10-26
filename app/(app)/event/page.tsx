"use client"; // Diperlukan untuk framer-motion jika Anda ingin menambahkannya

import Link from 'next/link'; // Diperlukan oleh komponen Button
import { Users, Calendar } from 'lucide-react';
// Path diubah menjadi huruf kecil 'button.tsx'
import Button from '@/components/ui/Button'; 
// import { motion } from "framer-motion"; // Aktifkan jika ingin animasi

// --- Data ---
const communities = [
  { name: "IT & Support Community", members: "1k Members" },
  { name: "UI/UX Designers", members: "800 Members" },
  { name: "Valorant Players", members: "2.5k Members" },
  { name: "Next.js Developers", members: "1.2k Members" }
];

const events = [
  {
    id: 1,
    slug: 'giveaway-it-support',
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&h=400&fit=crop',
    title: 'Giveaway',
    community: 'IT Support',
    date: '21 Apr 2025',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam maximus tincidunt velit...'
  },
  {
    id: 2,
    slug: 'giveaway-it-support-2',
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&h=400&fit=crop',
    title: 'Giveaway 2',
    community: 'IT Support',
    date: '22 Apr 2025',
    description: 'Quisque nunc sem, efficitur ac ante et, tristique faucibus orci. Class aptent taciti...'
  },
  // ... tambahkan 4 event lagi jika Anda mau
];
// ---------------------------------

export default function EventPage() {
  return (
    // 1. Menggunakan LAYOUT UTAMA DARI HOMEPAGE
    // (Padding ditambahkan agar tidak terlalu menempel)
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 md:p-8">
      
      {/* 2. KONTEN UTAMA (2 KOLOM) */}
      <div className="lg:col-span-2 space-y-4">
        
        {/* Judul Halaman */}
        <h1 className="text-3xl font-bold text-gray-900">Event</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((event) => (
            // Anda bisa membungkus ini dengan <motion.div> seperti di HomePage jika mau
            <div 
              key={event.id} 
              // 3. Menggunakan STYLE KARTU DARI HOMEPAGE
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              {/* Komponen <Image> diganti dengan <img> standar */}
              <img 
                src={event.image} 
                alt={event.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-5 flex flex-col h-full">
                <h3 className="font-bold text-lg mb-3 text-gray-900">{event.title}</h3>
                
                {/* Info (Komunitas & Tanggal) dibuat berdampingan */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Users size={18} className="text-[#5858FA]" />
                    <span className="text-sm text-gray-700">{event.community}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar size={18} className="text-[#5858FA]" />
                    <span className="text-sm text-gray-700">{event.date}</span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {event.description}
                </p>
                
                <Button 
                  href={`/event/${event.slug}`}
                  variant="primary"
                  className="w-full mt-auto" // mt-auto agar tombol di bawah
                >
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. SIDEBAR KANAN (1 KOLOM) - Persis seperti HOMEPAGE */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sticky top-20">
          <h3 className="font-semibold text-gray-900 mb-4">My Community</h3>
          <div className="space-y-3">
            {communities.map((community, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-orange-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 truncate">
                    {community.name}
                  </p>
                  <p className="text-xs text-gray-500">{community.members}</p>
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

