"use client";

export default function HeroCodeBlock() {
  return (
    <div className="flex flex-col gap-4">
      {/* Description */}
      <p className="text-[13px] sm:text-[14px] leading-relaxed text-zinc-400">
        A dead simple, drop-in replacement that costs
        <br className="hidden sm:block" />
        {" "}60% less than traditional cloud providers
      </p>

      {/* Code diff */}
      <div className="font-mono text-[13px] rounded-xl bg-transparent px-0 py-2 overflow-hidden">
        <div className="flex items-center gap-2">
          <span className="text-zinc-500 select-none">—</span>
          <span className="text-zinc-400">Provider:</span>
          <span className="bg-red-500/20 text-red-400 px-1 py-0.5 rounded line-through decoration-red-400/60">
            aws-standard
          </span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-zinc-400 select-none">+</span>
          <span className="text-zinc-400">Provider:</span>
          <span className="bg-primary/20 text-primary px-1 py-0.5 rounded font-medium">
            codevault-optimized
          </span>
        </div>
      </div>
    </div>
  );
}
