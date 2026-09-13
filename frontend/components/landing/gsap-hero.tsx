"use client"

import { useRef } from "react"
import Link from "next/link"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ArrowRight } from "lucide-react"

gsap.registerPlugin(useGSAP)

export default function GsapHero() {
  const container = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } })

      tl.from(".hero-line", {
        y: 120,
        opacity: 0,
        duration: 1.2,
        stagger: 0.15,
      })
        .from(
          ".hero-sub",
          {
            y: 30,
            opacity: 0,
            duration: 0.8,
          },
          "-=0.5",
        )
        .from(
          ".hero-cta",
          {
            y: 20,
            opacity: 0,
            duration: 0.6,
          },
          "-=0.4",
        )
        .from(
          ".hero-ide",
          {
            y: 80,
            opacity: 0,
            duration: 1.2,
            ease: "power2.out",
          },
          "-=0.4",
        )

      gsap.to(".cursor", {
        opacity: 0,
        duration: 0.53,
        repeat: -1,
        yoyo: true,
        ease: "steps(1)",
      })
    },
    { scope: container },
  )

  return (
    <section
      ref={container}
      className="relative min-h-screen bg-black pt-32 pb-24 px-6 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Typography Hero */}
        <div className="text-center mb-20">
          <div className="overflow-hidden">
            <h1 className="hero-line text-[clamp(3rem,10vw,8rem)] font-bold tracking-[-0.04em] text-white leading-[0.95]">
              Write. Deploy.
            </h1>
          </div>
          <div className="overflow-hidden">
            <h1 className="hero-line text-[clamp(3rem,10vw,8rem)] font-bold tracking-[-0.04em] leading-[0.95]">
              <span className="text-white/15">Ship on </span>
              <span className="text-primary">Bitcoin.</span>
            </h1>
          </div>

          <p className="hero-sub text-xl text-white/40 max-w-md mx-auto mt-10 font-light">
            The complete Developer environment for Mezo. Browser-native. Zero
            setup.
          </p>

          <div className="hero-cta flex gap-4 justify-center items-center mt-12">
            <Link
              href="/ide"
              className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-medium rounded-full transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Open IDE
              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
            <Link
              href="#features"
              className="px-8 py-4 text-white/40 font-medium transition-colors hover:text-white"
            >
              Learn more
            </Link>
          </div>
        </div>

        {/* Minimal IDE Preview */}
        <div className="hero-ide max-w-4xl mx-auto">
          <div className="relative">
            <div className="absolute -inset-px bg-gradient-to-b from-white/[0.08] to-transparent rounded-2xl" />

            <div className="relative bg-black border border-white/[0.08] rounded-2xl overflow-hidden">
              {/* Tab Bar */}
              <div className="flex items-center px-4 h-10 border-b border-white/[0.06]">
                <div className="flex items-center gap-2 px-3 py-1 -mb-px border-b border-white/20">
                  <span className="text-[13px] text-white/70">Token.sol</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 -mb-px">
                  <span className="text-[13px] text-white/30">Staking.sol</span>
                </div>
              </div>

              {/* Editor */}
              <div className="flex">
                {/* Line Numbers */}
                <div className="py-5 pl-5 pr-4 text-right select-none border-r border-white/[0.04]">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((n) => (
                    <div
                      key={n}
                      className="text-[13px] leading-6 text-white/20 font-mono"
                    >
                      {n}
                    </div>
                  ))}
                </div>

                {/* Code */}
                <div className="flex-1 py-5 pl-5 pr-8 font-mono text-[13px] leading-6 overflow-x-auto">
                  <div className="text-white/25">
                    // SPDX-License-Identifier: MIT
                  </div>
                  <div>
                    <span className="text-white/50">pragma solidity</span>{" "}
                    <span className="text-white/30">^0.8.28;</span>
                  </div>
                  <div className="h-6" />
                  <div>
                    <span className="text-white/50">import</span>{" "}
                    <span className="text-white/70">
                      "@openzeppelin/contracts/token/ERC20/ERC20.sol"
                    </span>
                    <span className="text-white/30">;</span>
                  </div>
                  <div className="h-6" />
                  <div>
                    <span className="text-white/50">contract</span>{" "}
                    <span className="text-white">MezoToken</span>{" "}
                    <span className="text-white/50">is</span>{" "}
                    <span className="text-white/70">ERC20</span>{" "}
                    <span className="text-white/30">{"{"}</span>
                  </div>
                  <div className="pl-6">
                    <span className="text-white/50">constructor</span>
                    <span className="text-white/30">()</span>{" "}
                    <span className="text-white/70">ERC20</span>
                    <span className="text-white/30">(</span>
                    <span className="text-primary/70">"Mezo"</span>
                    <span className="text-white/30">,</span>{" "}
                    <span className="text-primary/70">"MZO"</span>
                    <span className="text-white/30">) {"{"}</span>
                  </div>
                  <div className="pl-12">
                    <span className="text-white/70">_mint</span>
                    <span className="text-white/30">(msg.sender,</span>{" "}
                    <span className="text-white/50">1_000_000e18</span>
                    <span className="text-white/30">);</span>
                  </div>
                  <div className="pl-6">
                    <span className="text-white/30">{"}"}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-white/30">{"}"}</span>
                    <span className="cursor w-[2px] h-5 bg-primary ml-1" />
                  </div>
                  <div className="h-6" />
                </div>
              </div>

              {/* Status Bar */}
              <div className="flex items-center justify-between px-5 h-8 border-t border-white/[0.06] text-[11px]">
                <div className="flex items-center gap-6">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span className="text-white/40">Compiled</span>
                  </span>
                  <span className="text-white/25">Solidity 0.8.28</span>
                </div>
                <span className="text-white/25">UTF-8</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
