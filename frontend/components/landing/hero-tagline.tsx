"use client";

import { Loader } from "lucide-react";

export default function HeroTagline() {
  return (
    <div className="flex flex-col items-start gap-5">
      {/* Icon */}
      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-800/40 border border-zinc-700/30">
        <Loader size={20} className="text-zinc-300" />
      </div>

      {/* Tagline text */}
      <h2 className="text-xl sm:text-2xl md:text-[28px] font-light leading-snug tracking-tight text-white">
        The fastest way to deploy
        <br />
        your applications.
      </h2>
    </div>
  );
}
