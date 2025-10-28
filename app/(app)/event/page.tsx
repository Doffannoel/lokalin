// Lokasi file: app/(app)/event/page.tsx

// 1. "use client"; DIHAPUS
// 2. Impor 'Link' untuk navigasi Next.js
import Link from 'next/link'; 
import { Users, Calendar } from 'lucide-react';
import Button from '@/components/ui/Button'; 
// 3. Impor data terpusat dari file data.tsx (atau .ts)
import { allEvents, communities } from './data';

// 4. const communities = [...] DIHAPUS
// 5. const events = [...] DIHAPUS

export default function EventPage() {
  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 md:p-8">
      
      {/* KONTEN UTAMA (2 KOLOM) */}
      <div className="lg:col-span-2 space-y-4">
        
        <h1 className="text-2xl font-bold text-gray-900">Event</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 6. Menggunakan 'allEvents' yang diimpor */}
          {allEvents.map((event) => (
            
            // 7. Menggunakan komponen <Link> dari Next.js, bukan <a>
            <Link 
              key={event.id} 
              href={`/event/${event.slug}`}
              className="block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-1"
            >
              <img 
                src={event.image} 
                alt={event.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-5 flex flex-col h-full">
                <h3 className="font-bold text-lg mb-3 text-gray-900">{event.title}</h3>
                
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
                
                <div className="mt-auto"></div> 
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* SIDEBAR KANAN (1 KOLOM) */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sticky top-20">
          <h3 className="font-semibold text-gray-900 mb-4">My Community</h3>
          <div className="space-y-3">
            {/* 8. Menggunakan 'communities' yang diimpor */}
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