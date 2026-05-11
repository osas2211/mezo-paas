"use client"

import Image from "next/image"
import { Globe } from "lucide-react"
import HeroTagline from "./hero-tagline"
import HeroCodeBlock from "./hero-code-block"
import HeroCTA from "./hero-cta"
import HeroPixelText from "./hero-pixel-text"

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col bg-black overflow-hidden pt-20">
      {/* ─── Top area: Pixel art headline ─── */}
      <div className="relative flex-1 flex flex-col items-center justify-center min-h-[40vh]">
        <HeroPixelText />
      </div>

      {/* ─── Bottom area: Three-column cards, edge-to-edge ─── */}
      <div className="relative w-full bg-black">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.1fr_1.2fr] gap-px sm:gap-1 bg-zinc-900/50">
          {/* Left card — tagline */}
          <div
            className="relative flex flex-col justify-between bg-[#0a0a0c] p-6 sm:p-10 min-h-[280px] md:min-h-[350px]"
            style={{
              clipPath:
                "polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 0 100%)",
            }}
          >
            <HeroTagline />
            <div className="mt-auto pt-8">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20">
                <Globe size={20} className="text-primary" />
              </div>
            </div>
          </div>

          {/* Center card — hero image */}
          <div
            className="relative flex items-end justify-center bg-[#0a0a0c] min-h-[280px] md:min-h-[350px]"
            style={{
              clipPath:
                "polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 0 100%)",
            }}
          >
            <Image
              src="/assets/landing/hero-image.png"
              alt="CodeVault visualization"
              width={400}
              height={400}
              className="relative w-auto h-[85%] max-h-[320px] object-contain object-bottom"
              priority
            />
          </div>

          {/* Right card — value prop + CTA */}
          <div
            className="relative flex flex-col justify-between bg-[#0a0a0c] p-6 sm:p-10 min-h-[280px] md:min-h-[350px]"
            style={{
              clipPath: "polygon(24px 0, 100% 0, 100% 100%, 0 100%, 0 24px)",
            }}
          >
            <HeroCodeBlock />
            <div className="mt-auto pt-8">
              <HeroCTA />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
