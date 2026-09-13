"use client"

import { useRef } from "react"
import Link from "next/link"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ArrowRight } from "lucide-react"

gsap.registerPlugin(useGSAP, ScrollTrigger)

const features = [
  {
    title: "Instant Compilation",
    description:
      "Solidity 0.8.28 with full OpenZeppelin support. Compile in your browser.",
  },
  {
    title: "One-Click Deploy",
    description:
      "Deploy to Mezo Mainnet or Testnet. Constructor arguments handled automatically.",
  },
  {
    title: "Auto-Verification",
    description:
      "Contracts verified on Mezo Explorer immediately after deployment.",
  },
  {
    title: "Transaction Simulator",
    description:
      "Preview outcomes before spending gas. See state changes and events.",
  },
  {
    title: "Smart Templates",
    description: "Start from ERC-20, NFTs, Staking, DEX, Governance templates.",
  },
  {
    title: "Shareable Links",
    description:
      "Share contracts via URL. Perfect for collaboration and code reviews.",
  },
  {
    title: "Protocol Registry",
    description:
      "Explore Mezo protocols with ABIs. Generate interfaces instantly.",
  },
  {
    title: "dApp Generator",
    description:
      "Export Next.js + wagmi starter projects from deployed contracts.",
  },
]

export default function GsapIDEFeatures() {
  const container = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const cards = container.current?.querySelectorAll(".feature-card")
      if (cards) {
        gsap.set(cards, { opacity: 1, y: 0 }) // Ensure visible by default
        gsap.from(cards, {
          scrollTrigger: {
            trigger: container.current,
            start: "top 80%",
          },
          y: 30,
          opacity: 0,
          duration: 0.6,
          stagger: 0.05,
          ease: "power2.out",
        })
      }
    },
    { scope: container },
  )

  return (
    <section
      ref={container}
      id="features"
      className="relative bg-black py-32 px-6"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="mb-20">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
            Everything you need
          </h2>
          <p className="text-lg text-white/40 max-w-lg">
            A complete development environment for Mezo. Write, compile, deploy,
            and verify — all in your browser.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.06] rounded-2xl overflow-hidden border border-white/[0.06]">
          {features.map((feature, i) => (
            <div
              key={i}
              className="feature-card bg-[#0a0a0a] p-8 hover:bg-white/[0.03] transition-colors"
            >
              <div className="text-white/20 text-sm font-mono mb-6">
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-sm text-white/40 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 flex justify-center">
          <Link
            href="/ide"
            className="group inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            Try the IDE
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </section>
  )
}
