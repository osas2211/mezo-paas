"use client";

import Link from "next/link";

export default function HeaderActions() {
  return (
    <div className="hidden md:flex items-center gap-3">
      <Link
        href="/login"
        className="px-5 py-2 text-sm font-medium text-white rounded-full border border-zinc-700 transition-all duration-200 hover:border-zinc-500 hover:bg-white/5"
      >
        Console
      </Link>
      <Link
        href="/signup"
        className="px-5 py-2 text-sm font-medium text-black bg-white rounded-full transition-all duration-200 hover:brightness-110"
      >
        Get Started
      </Link>
    </div>
  );
}
