// Lokasi file: app/(app)/event/data.ts

// --- Tipe Data (Opsional tapi bagus untuk TypeScript) ---
interface Community {
  name: string;
  members: string;
}

interface Event {
  id: number;
  slug: string;
  image: string;
  title: string;
  community: string;
  date: string;
  time: string;
  description: string;
}

// --- Data Komunitas ---
export const communities: Community[] = [
  { name: 'IT & Support Community', members: '1k Members' },
  { name: 'UI/UX Designers', members: '800 Members' },
  { name: 'Valorant Players', members: '2.5k Members' },
  { name: 'Next.js Developers', members: '1.2k Members' }
];

// --- Data Event ---
export const allEvents: Event[] = [
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
    image: 'https://images.unsplash.com/photo-1611095790732-5d6c8b2b2b1l?w=800&h=400&fit=crop',
    title: 'Giveaway 2',
    community: 'IT Support',
    date: '22 Apr 2025',
    time: '10.00 - 11.00 WIB',
    description: 'Quisque nunc sem, efficitur ac ante et, tristique faucibus orci. Class aptent taciti...'
  },
  {
    id: 3,
    slug: 'webinar-nextjs-15',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop',
    title: 'Webinar Next.js 15',
    community: 'Next.js Developers',
    date: '25 Apr 2025',
    time: '19.00 - 21.00 WIB',
    description: 'Membahas fitur-fitur terbaru di Next.js 15 dan Vercel.'
  },
  {
    id: 4,
    slug: 'ui-ux-design-talk',
    image: 'https://images.unsplash.com/photo-1581291518857-4e2751072d80?w=800&h=400&fit=crop',
    title: 'Design Talk: UI/UX',
    community: 'UI/UX Designers',
    date: '28 Apr 2025',
    time: '15.00 - 16.30 WIB',
    description: 'Sesi berbagi mengenai tren desain UI/UX di tahun 2025.'
  },
  {
    id: 5,
    slug: 'valorant-tournament',
    image: 'https://images.unsplash.com/photo-1600096193540-6b616a76e7b2?w=800&h=400&fit=crop',
    title: 'Turnamen Valorant',
    community: 'Valorant Players',
    date: '30 Apr 2025',
    time: '13.00 - Selesai',
    description: 'Turnamen komunitas bulanan. Pendaftaran dibuka!'
  },
  {
    id: 6,
    slug: 'php-community-gathering',
    image: 'https://images.unsplash.com/photo-1544256718-3b62ff049216?w=800&h=400&fit=crop',
    title: 'Kumpul Komunitas PHP',
    community: 'PHP Lovers',
    date: '02 May 2025',
    time: '16.00 - 18.00 WIB',
    description: 'Kopi darat dan diskusi santai seputar PHP dan Laravel.'
  }
];

// --- Fungsi Helper ---
// Kita pindahkan juga fungsi ini ke sini
export async function getEventBySlug(slug: string): Promise<Event | null> {
  return allEvents.find((event) => event.slug === slug) || null;
}

