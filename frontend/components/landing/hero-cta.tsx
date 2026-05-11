"use client";

import { CheckCircle } from "lucide-react";

export default function HeroCTA() {
  return (
    <div className="flex flex-col gap-3">
      {/* Buttons */}
      <div className="flex items-center gap-3 flex-wrap">
        <a
          href="/signup"
          className="px-6 py-2.5 text-[13px] font-medium text-black bg-white rounded-full transition-all duration-200 hover:bg-zinc-200"
        >
          Try for free
        </a>
        <a
          href="#contact"
          className="px-6 py-2.5 text-[13px] font-medium text-white rounded-full border border-zinc-600 transition-all duration-200 hover:border-zinc-400 hover:bg-white/5"
        >
          Talk to an engineer
        </a>
      </div>

      {/* Trust badge */}
      <div className="flex items-center gap-1.5 text-xs text-zinc-500 mt-2">
        <CheckCircle size={13} className="text-zinc-500" />
        <span>No credit card required.</span>
      </div>
    </div>
  );
}
