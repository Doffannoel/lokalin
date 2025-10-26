// Lokasi file: app/(app)/event/[slug]/page.tsx
import Image from 'next/image';
import Link from 'next/link';
import { Users, Calendar, Clock, ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';

// --- Simulasi Database Event ---
const allEvents = [
  {
    id: 1,
    slug: 'giveaway-it-support',
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&h=400&fit=crop',
    title: 'Giveaway',
    community: 'IT Support',
    date: '21 Apr 2025',
    time: '09.00 - 10.00 WIB',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam maximus tincidunt velit. Quisque nunc sem, efficitur ac ante et, tristique faucibus orci. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himaeos. Nulla feugiat velit in dui convallis efficitur. Fusce rhoncus lacinia elit vitae volutpat. Aenean suscipit ligula at leo pharetra porta. Sed aliquam arcu ac ante tempus laoreet. Donec dapibus lectus in efficitur aliquam. Integer non turpis eros. Curabitur congue urna a nulla cursus, a accumsan arcu porttitor. Mauris bibendum felis elementum, mattis risus at, laoreet tellus. Cras a sagittis odio. Aliquam ac enim id nulla vestibulum iaculis.'
  },
  {
    id: 2,
    slug: 'giveaway-it-support-2',
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&h=400&fit=crop',
    title: 'Giveaway 2',
    community: 'IT Support',
    date: '22 Apr 2025',
    time: '10.00 - 11.00 WIB',
    description: 'Quisque nunc sem, efficitur ac ante et, tristique faucibus orci. Class aptent taciti sociosqu ad litora torquent per conubia nostra'
  },
  // ... event lainnya
];

// ▼▼▼ 1. TAMBAHKAN DATA COMMUNITIES DI SINI ▼▼▼
const communities = [
  { name: 'IT & Support Community', members: '1k Members' },
  { name: 'UI/UX Designers', members: '800 Members' },
  { name: 'Valorant Players', members: '2.5k Members' },
];

// Simulasi fungsi untuk mengambil satu event berdasarkan slug
async function getEventBySlug(slug: string) {
  return allEvents.find(event => event.slug === slug) || null;
}
// ---------------------------------


export default async function EventDetailPage({ params }: { params: { slug: string } }) {
  
  // Mengambil data event berdasarkan slug dari params
  const event = await getEventBySlug(params.slug);

  // Jika event tidak ditemukan
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

  // ▼▼▼ 2. GANTI SELURUH BLOK 'RETURN' DI BAWAH INI ▼▼▼
  // Jika event ditemukan, tampilkan detailnya
  return (
    // Gunakan Grid Layout sebagai pembungkus utama
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-4 md:p-8">

      {/* Konten Utama (Detail Event) - 3 Kolom */}
      <div className="lg:col-span-3">
        {/* Event Detail Header Image */}
        <div className="relative h-80 bg-gradient-to-br from-green-400 to-green-600 rounded-xl overflow-hidden">
          <Image 
            src={event.image} 
            alt={event.title}
            layout="fill"
            objectFit="cover"
            className="absolute inset-0 mix-blend-overlay"
            priority
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