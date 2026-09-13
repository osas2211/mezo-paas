"use client"

import { useRef } from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(useGSAP, ScrollTrigger)

const logos = [
  { name: "Thesis", text: "THESIS" },
  { name: "tBTC", text: "tBTC" },
  { name: "Acre", text: "ACRE" },
  { name: "Keep", text: "KEEP" },
  { name: "NuCypher", text: "NUCYPHER" },
  { name: "Mezo", text: "MEZO" },
  { name: "Fold", text: "FOLD" },
  { name: "Bitcoin", text: "BITCOIN" },
]

export default function GsapLogos() {
  const container = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    gsap.from(".logo-item", {
      scrollTrigger: {
        trigger: container.current,
        start: "top 85%",
      },
      y: 20,
      opacity: 0,
      duration: 0.5,
      stagger: 0.05,
      ease: "power2.out",
    })
  }, { scope: container })

  return (
    <section ref={container} className="relative py-16 px-6 bg-gradient-to-b from-[#071209] to-[#0a1a0f] border-y border-white/5">
      <div className="max-w-7xl mx-auto">
        {/* Headline */}
        <div className="text-center mb-12">
          <p className="text-sm text-white/30 uppercase tracking-[0.2em]">
            HELPING BITCOIN DEVELOPERS DEPLOY <span className="text-primary">10K+</span> CONTRACTS
          </p>
        </div>

        {/* Logo grid */}
        <div className="grid grid-cols-4 md:grid-cols-8 gap-8 items-center justify-items-center">
          {logos.map((logo, i) => (
            <div
              key={i}
              className="logo-item text-white/20 hover:text-white/40 transition-colors cursor-default"
            >
              <span className="text-lg font-semibold tracking-wider">{logo.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
