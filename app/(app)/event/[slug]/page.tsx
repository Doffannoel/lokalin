// Lokasi file: app/(app)/event/[slug]/page.tsx
import Link from 'next/link';
import { Users, Calendar, Clock, ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';

// 1. Impor data terpusat. Path-nya '../data' karena file ini ada di dalam [slug]
import { getEventBySlug, communities } from '../data';

// 2. Seluruh blok '// --- Simulasi Database Event ---' DIHAPUS
// const allEvents = [...] DIHAPUS
// const communities = [...] DIHAPUS
// async function getEventBySlug(slug: string) { ... } DIHAPUS
// ---------------------------------


export default async function EventDetailPage({ params }: { params: { slug: string } }) {
  
  // Fungsi getEventBySlug sekarang berasal dari file data.tsx
  const event = await getEventBySlug(params.slug);

  if (!event) {
    return (
      <div className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold text-red-600">Event tidak ditemukan</h1>
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
          <img 
            src={event.image} 
            alt={event.title}
            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
          />
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
              <span className="font-medium text-gray-800">{event.community}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar size={24} className="text-indigo-600" />
              <span className="font-medium text-gray-800">{event.date}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Clock size={24} className="text-indigo-600" />
              <span className="font-medium text-gray-800">{event.time}</span>
            </div>
          </div>

          <div className="text-gray-700 leading-relaxed mb-8 prose">
            <p>{event.description}</p>
          </div>

          <Button variant="primary" size="lg">
            Join
          </Button>
        </div>
      </div>

      {/* Sidebar Kanan (My Community) - 1 Kolom */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sticky top-20">
          <h3 className="font-semibold text-gray-900 mb-4">My Community</h3>
          <div className="space-y-3">
            {/* 3. 'communities' sekarang juga berasal dari file data.tsx */}
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

    </div> // Penutup untuk div grid utama
  );
}