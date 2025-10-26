// Lokasi file: components/ui/Button.tsx
// (Salin dan timpa seluruh file Anda dengan kode ini)

import { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link"; // <-- 1. PASTIKAN Link di-impor

// 2. PASTIKAN 'href' ADA DI DALAM SINI
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  href?: string; // <-- INI YANG PALING PENTING
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  href, // <-- 3. PASTIKAN 'href' DIAMBIL DARI PROPS
  ...props
}: ButtonProps) {
  
  // Definisikan semua kelas style
  const baseStyles = "rounded-lg font-medium transition-all inline-block text-center";

  const variants = {
    primary: "bg-[#5858FA] text-white hover:bg-[#4747E8]",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const combinedClassName = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  // 4. PASTIKAN LOGIKA INI ADA
  // Jika ada 'href', render sebagai <Link>
  if (href) {
    return (
      <Link href={href} className={combinedClassName}>
        {children}
      </Link>
    );
  }

  // Jika tidak, render sebagai <button> biasa
  return (
    <button
      className={combinedClassName}
      {...props}
    >
      {children}
    </button>
  );
}