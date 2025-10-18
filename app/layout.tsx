import type { Metadata } from "next";
import "./globals.css";
import { AnimatePresence } from "framer-motion";

export const metadata: Metadata = {
  title: { default: "Localin", template: "%s · Localin" },
  description: "Platform komunitas lokal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      {/* Pastikan putih, tidak pakai class 'dark' di <html> */}
      <body className="min-h-screen antialiased">
        <AnimatePresence mode="wait">
          {children}
        </AnimatePresence>
      </body>
    </html>
  );
}
