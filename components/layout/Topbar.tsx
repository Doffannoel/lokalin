"use client";

import { useAuth } from "@/app/contexts/AuthContext";

export default function Topbar() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="fixed top-0 right-0 left-[280px] h-16 bg-white border-b border-gray-200 z-10">
      <div className="h-full px-6 flex items-center justify-end">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </header>
  );
}
