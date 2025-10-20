// app/community/[slug]/page.tsx
import React from "react";
import Image from "next/image";
import Link from "next/link";

type Props = {
  params: { slug: string };
};

export default function CommunityDetailPage({ params }: Props) {
  const { slug } = params;

  // Dummy data — ganti dengan fetch dari API bila perlu
  const community = {
    slug,
    title: "ANAK IT HEbat",
    cover: "/images/community-3.jpg",
    postsCount: 33,
    membersCount: 4556,
  };

  const members = [
    { id: 1, name: "@BambangTampan", role: "Admin", avatar: "/images/avatars/avatar-1.png" },
    { id: 2, name: "@AyamMelahirkan", role: "Member", avatar: "/images/avatars/avatar-2.png" },
    { id: 3, name: "@AyamMelahirkan2", role: "Member", avatar: "/images/avatars/avatar-3.png" },
    { id: 4, name: "@AyamMelahirkan3", role: "Member", avatar: "/images/avatars/avatar-2.png" },
    { id: 5, name: "@AyamMelahirkan4", role: "Member", avatar: "/images/avatars/avatar-3.png" },
  ];

  const posts = [
    {
      id: "p1",
      author: { name: "@Jacob", avatar: "/images/avatars/avatar-1.png" },
      community: community.title,
      time: "1 day ago",
      text: "Prepare to be dazzled by our latest collection! From trendy fashion to must-have gadgets, we've got something for everyone.",
      image: "/images/post-laptop.jpg",
      likes: "100k Likes",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full mx-auto grid grid-cols-1 lg:grid-cols-12">
        {/* Left placeholder (global sidebar occupies actual left) */}
        <div className="hidden lg:block lg:col-span-1" />

        {/* Main content */}
        <main className="lg:col-span-8 px-4 lg:px-8">
          {/* Cover */}
          <div className="relative rounded-b-lg overflow-hidden shadow-sm">
            <div className="relative h-56 md:h-64 w-full bg-gray-200">
              <Image
                src={community.cover}
                alt={community.title}
                fill
                sizes="(min-width: 1024px) 100vw"
                style={{ objectFit: "cover" }}
                className="object-cover"
              />

              {/* Header overlay */}
              <div className="absolute inset-0 flex items-start justify-between p-4">
                <div className="text-white">
                  <Link
                    href="/community"
                    className="inline-flex items-center gap-2 text-sm bg-white/10 px-3 py-1 rounded-full hover:bg-white/20"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="stroke-current">
                      <path d="M15 18l-6-6 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Back
                  </Link>
                </div>

                <div className="flex items-center gap-3">
                  <button className="inline-flex items-center gap-2 bg-white/90 text-[#1e1e9b] px-3 py-2 rounded-full shadow">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#1e1e9b" aria-hidden>
                      <path d="M3 11h8V3h2v8h8v2h-8v8h-2v-8H3z" />
                    </svg>
                    Edit Group
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Title & actions */}
          <div className="mt-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#1e1e9b]">{community.title}</h1>
              <div className="mt-2 text-sm text-gray-500 flex gap-6">
                <span>{community.postsCount} Posts</span>
                <span>{community.membersCount} Members</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#1e1e9b" aria-hidden>
                  <path d="M12 5v14M5 12h14" stroke="#1e1e9b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Add Event
              </button>
            </div>
          </div>

          {/* Posts */}
          <div className="mt-6 space-y-6">
            {posts.map((p) => (
              <article key={p.id} className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
                <header className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                      <Image src={p.author.avatar} alt={p.author.name} width={48} height={48} className="object-cover" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{p.author.name}</div>
                      <div className="text-xs text-gray-500">{p.community}</div>
                    </div>
                  </div>

                  <div className="text-xs text-gray-400">{p.time}</div>
                </header>

                <div className="mt-4 text-gray-700 leading-relaxed">
                  <p>{p.text}</p>
                </div>

                {p.image && (
                  <div className="mt-4 rounded overflow-hidden">
                    <Image src={p.image} alt="post image" width={1000} height={400} className="object-cover w-full h-48 rounded-lg" />
                  </div>
                )}

                <footer className="mt-4 flex items-center gap-4 text-gray-600">
                  <div className="flex items-center gap-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
                      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 10-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-sm">{p.likes}</span>
                  </div>
                </footer>
              </article>
            ))}
          </div>
        </main>

        {/* Right sidebar: members */}
        <aside className="hidden lg:block lg:col-span-3 border-l border-gray-100">
          <div className="sticky top-20 p-6">
            <h3 className="text-sm font-semibold text-[#1e1e9b] mb-4">Member</h3>
            <div className="space-y-4">
              {members.map((m) => (
                <div key={m.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    <Image src={m.avatar} alt={m.name} width={40} height={40} className="object-cover" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{m.name}</div>
                    <div className="text-xs text-gray-400">{m.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* rightmost gap for symmetry */}
        <div className="hidden lg:block lg:col-span-0" />
      </div>
    </div>
  );
}
