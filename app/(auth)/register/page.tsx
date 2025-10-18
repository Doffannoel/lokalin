"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <motion.div
      className="min-h-screen flex bg-white"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.5 }}
    >
      {/* Kiri: Logo + gradient (sama seperti login) */}
      <div
        className="relative hidden md:flex items-center justify-center overflow-hidden w-1/2"
        style={{
          background:
            "radial-gradient(circle at center, #00D1FF 0%, #5858FA 100%)",
        }}
      >
        <div className="z-10 text-white text-center">
          <Image
            src="/assets/logo_lokalin.png"
            alt="Lokalin"
            width={260}
            height={260}
            unoptimized
            priority
            className="mx-auto mb-4"
          />
        </div>
      </div>

      {/* Kanan: Form Register */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 px-6">
        <div className="w-full max-w-sm space-y-6">
          <h2 className="text-3xl font-bold text-[#150AA1] text-left">
            Sign Up
          </h2>

          <motion.form
            className="space-y-4"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.2,
                },
              },
            }}
          >
            {/* Username */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20, scale: 0.9 },
                visible: { opacity: 1, y: 0, scale: 1 },
              }}
              transition={{ duration: 0.5 }}
            >
              <label
                htmlFor="username"
                className="block text-sm font-medium text-[#7B7B7B] mb-1"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                placeholder="yourname"
                className="w-full rounded border border-gray-300 bg-gray-200 px-4 py-2 text-sm focus:outline-none focus:border-[#5858FA]"
                style={{ borderRadius: "4px" }}
              />
            </motion.div>

            {/* Email */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20, scale: 0.9 },
                visible: { opacity: 1, y: 0, scale: 1 },
              }}
              transition={{ duration: 0.5 }}
            >
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#7B7B7B] mb-1"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="w-full rounded border border-gray-300 bg-gray-200 px-4 py-2 text-sm focus:outline-none focus:border-[#5858FA]"
                style={{ borderRadius: "4px" }}
              />
            </motion.div>

            {/* Password */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20, scale: 0.9 },
                visible: { opacity: 1, y: 0, scale: 1 },
              }}
              transition={{ duration: 0.5 }}
            >
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[#7B7B7B] mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full rounded border border-gray-300 bg-gray-200 px-4 py-2 pr-10 text-sm focus:outline-none focus:border-[#5858FA]"
                  style={{ borderRadius: "4px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </motion.div>

            {/* Confirm Password */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20, scale: 0.9 },
                visible: { opacity: 1, y: 0, scale: 1 },
              }}
              transition={{ duration: 0.5 }}
            >
              <label
                htmlFor="confirm"
                className="block text-sm font-medium text-[#7B7B7B] mb-1"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirm"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full rounded border border-gray-300 bg-gray-200 px-4 py-2 pr-10 text-sm focus:outline-none focus:border-[#5858FA]"
                  style={{ borderRadius: "4px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>
            </motion.div>

            {/* Tombol */}
            <div className="flex justify-left">
              <button
                type="submit"
                className="bg-[#5858FA] text-white font-medium text-sm hover:opacity-90 transition"
                style={{ width: "89px", height: "48px", borderRadius: "18px" }}
              >
                Sign Up
              </button>
            </div>

            {/* Link ke Login */}
            <p className="text-left text-sm text-black mt-4">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-bold text-[#150AA1] hover:underline"
              >
                Log In
              </Link>
            </p>
          </motion.form>
        </div>
      </div>
    </motion.div>
  );
}
