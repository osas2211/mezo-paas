"use client"

import { useRef } from "react"
import Link from "next/link"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ArrowRight, Code2, Rocket, Shield, Zap } from "lucide-react"

gsap.registerPlugin(useGSAP, ScrollTrigger)

export default function GsapFeatures() {
  const container = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const cards = container.current?.querySelectorAll(".pricing-card")
    if (cards) {
      gsap.set(cards, { opacity: 1, y: 0 })
      gsap.from(cards, {
        scrollTrigger: {
          trigger: container.current,
          start: "top 75%",
        },
        y: 50,
        opacity: 0,
        duration: 0.7,
        stagger: 0.12,
        ease: "power3.out",
      })
    }

    gsap.from(".flow-item", {
      scrollTrigger: {
        trigger: ".flow-container",
        start: "top 85%",
      },
      scale: 0.95,
      opacity: 0,
      duration: 0.5,
      stagger: 0.08,
      ease: "power2.out",
    })

    gsap.from(".env-card", {
      scrollTrigger: {
        trigger: ".env-section",
        start: "top 80%",
      },
      y: 30,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: "power2.out",
    })
  }, { scope: container })

  return (
    <section ref={container} id="pricing" className="relative bg-black py-32 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Developer Environment Section */}
        <div className="env-section mb-32">
          <div className="mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
              Built for Mezo builders
            </h2>
            <p className="text-lg text-white/40 max-w-2xl">
              A complete development environment purpose-built for the Mezo ecosystem.
              Write Solidity, deploy to Mezo, and interact with Bitcoin DeFi protocols — all from your browser.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Code2,
                title: "Browser-Native IDE",
                desc: "Full Solidity editor with syntax highlighting, auto-completion, and real-time error detection. No extensions needed.",
              },
              {
                icon: Rocket,
                title: "Instant Deployment",
                desc: "One-click deploy to Mezo Testnet or Mainnet. Automatic constructor argument handling and gas estimation.",
              },
              {
                icon: Shield,
                title: "Auto-Verification",
                desc: "Contracts are automatically verified on Mezo Explorer after deployment. Source code publicly readable.",
              },
              {
                icon: Zap,
                title: "Protocol Integration",
                desc: "Browse deployed Mezo protocols, import ABIs, and generate TypeScript interfaces for your dApps.",
              },
            ].map((item, i) => (
              <div key={i} className="env-card p-6 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                <item.icon size={20} className="text-white/40 mb-4" />
                <h3 className="text-white font-medium mb-2">{item.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Yield for Compute Section */}
        <div className="mb-20">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
            Yield for compute
          </h2>
          <p className="text-lg text-white/40 max-w-2xl">
            A novel payment model for decentralized infrastructure. Lock BTC or stablecoins in a smart vault —
            the yield generated pays for your compute costs. Your principal remains intact and withdrawable anytime.
          </p>
        </div>

        {/* How It Works */}
        <div className="mb-16 p-8 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
          <div className="text-xs text-white/30 uppercase tracking-wider mb-8">How it works</div>
          <div className="flow-container grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                label: "Lock Assets",
                desc: "Deposit BTC, stBTC, or stablecoins into the Mezo yield vault smart contract."
              },
              {
                step: "02",
                label: "Generate Yield",
                desc: "Your locked assets earn yield through Mezo's DeFi integrations automatically."
              },
              {
                step: "03",
                label: "Pay for Compute",
                desc: "Yield is directed to pay for container hosting, storage, and bandwidth."
              },
              {
                step: "04",
                label: "Withdraw Anytime",
                desc: "Your full principal is always available. No lock-ups, no penalties."
              },
            ].map((item, i) => (
              <div key={i} className="flow-item">
                <div className="text-2xl font-bold text-white/10 mb-3">{item.step}</div>
                <div className="text-white font-medium mb-2">{item.label}</div>
                <div className="text-sm text-white/40 leading-relaxed">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Yield Vault */}
          <div className="pricing-card relative">
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent rounded-2xl" />
            <div className="relative border border-white/[0.08] rounded-2xl p-10">
              <div className="flex items-center justify-between mb-8">
                <div className="text-sm text-white/30 uppercase tracking-wider">Recommended</div>
                <div className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full">Zero Cost</div>
              </div>

              <h3 className="text-2xl font-bold text-white mb-3">
                Yield Vault
              </h3>
              <p className="text-white/40 mb-8 leading-relaxed">
                Lock any amount of BTC or stablecoins. The yield generated pays for your compute costs.
                Zero out-of-pocket expenses — your deposit works for you.
              </p>

              <div className="space-y-3 mb-10">
                {[
                  "No minimum deposit required",
                  "Yield auto-directed to compute",
                  "Full principal withdrawable anytime",
                  "Supports BTC, stBTC, USDC",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <div className="w-1 h-1 bg-primary rounded-full" />
                    <span className="text-white/60">{item}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/ide"
                className="block w-full py-4 bg-white text-black font-medium rounded-full hover:bg-white/90 transition-colors text-center"
              >
                Start Building
              </Link>
            </div>
          </div>

          {/* Prepaid Credits */}
          <div className="pricing-card relative">
            <div className="relative border border-white/[0.06] rounded-2xl p-10">
              <div className="mb-8">
                <div className="text-sm text-white/30 uppercase tracking-wider">Alternative</div>
              </div>

              <h3 className="text-2xl font-bold text-white mb-3">
                Prepaid Credits
              </h3>
              <p className="text-white/40 mb-8 leading-relaxed">
                Prefer not to lock capital? Purchase compute credits directly.
                Credits are consumed as you use resources — per-second billing with no waste.
              </p>

              <div className="space-y-3 mb-10">
                {[
                  "Pay only for what you use",
                  "No capital lockup required",
                  "Per-second granular billing",
                  "Top up anytime",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <div className="w-1 h-1 bg-white/30 rounded-full" />
                    <span className="text-white/60">{item}</span>
                  </div>
                ))}
              </div>

              <button className="w-full py-4 bg-white/5 border border-white/10 text-white font-medium rounded-full hover:bg-white/10 transition-colors">
                Buy Credits
              </button>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-white/30 text-sm">
            Questions about yield vaults or compute pricing?{" "}
            <a href="https://mezo.org" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white transition-colors">
              Read the docs <ArrowRight size={12} className="inline" />
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
