"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "./contexts/AuthContext";
import Image from "next/image";

export default function RootPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Jika sudah login, redirect ke homepage
        router.push("/homepage");
      } else {
        // Jika belum login, redirect ke login
        router.push("/login");
      }
    }
  }, [user, loading, router]);

  // Show loading state dengan branding Lokalin
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#5858FA] to-[#00D1FF]">
      <div className="text-center">
        <div className="mb-8">
          <Image
            src="/assets/logo_lokalin.png"
            alt="Lokalin"
            width={200}
            height={200}
            className="mx-auto animate-pulse"
            priority
            unoptimized
          />
        </div>
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-white"></div>
        <p className="mt-4 text-white font-medium">Loading Lokalin...</p>
      </div>
    </div>
  );
}
