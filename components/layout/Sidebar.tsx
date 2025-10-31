"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, Calendar, Flag } from "lucide-react";

import { useAuth } from "@/app/contexts/AuthContext";

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const menuItems = [
    { icon: Home, label: "Home", href: "/homepage" },
    { icon: Users, label: "Community", href: "/community" },
    { icon: Flag, label: "Event", href: "/event" },
    { icon: Calendar, label: "Calender", href: "/calender" },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-[280px] bg-white flex flex-col border-r border-gray-200">
      {/* Logo */}
      <div className="pl-[30px] border-b border-gray-200">
        <div className="flex items-center gap-1 p-4">
          <Image
            src="/assets/LokalinIcon.png"
            alt="Lokalin"
            width={32}
            height={32}
            className="w-27 h-8 rounded-lg"
          />
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white font-semibold">
            {user?.username?.charAt(0).toUpperCase() || "U"}
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-900">
              @{user?.username || "User"}
            </p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-gray-100 text-[#5858FA]"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium text-sm">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
