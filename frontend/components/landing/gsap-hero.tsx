"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"

gsap.registerPlugin(useGSAP)

export default function GsapHero() {
  const container = useRef<HTMLDivElement>(null)
  
  useGSAP(() => {
    const tl = gsap.timeline()
    
    // Animate the main headline words
    tl.from(".hero-word", {
      y: 100,
      opacity: 0,
      rotateZ: 5,
      duration: 1,
      stagger: 0.1,
      ease: "power4.out",
      delay: 0.2
    })
    
    // Fade in the subtitle
    tl.from(".hero-subtitle", {
      y: 20,
      opacity: 0,
      duration: 0.8,
      ease: "power2.out"
    }, "-=0.6")
    
    // Brutalist reveal for buttons
    tl.from(".hero-btn", {
      scale: 0.9,
      opacity: 0,
      duration: 0.5,
      stagger: 0.1,
      ease: "back.out(1.7)"
    }, "-=0.4")
    
  }, { scope: container })

  return (
    <section ref={container} className="relative min-h-[90vh] flex flex-col items-center justify-center bg-[#0a0a0a] pt-20 overflow-hidden px-6">
      
      {/* Background brutalist accents */}
      <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-white/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[30vw] h-[30vw] bg-primary/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3 pointer-events-none" />
      
      <div className="max-w-6xl w-full flex flex-col items-center text-center z-10">
        
        {/* Monospace pre-header */}
        <div className="hero-subtitle overflow-hidden mb-6">
          <p className="font-mono text-xs md:text-sm text-primary tracking-widest uppercase border border-primary/30 bg-primary/5 px-4 py-1.5 rounded-full">
            Mezo Decentralized PaaS
          </p>
        </div>

        {/* Main Headline */}
        <h1 className=" text-5xl md:text-8xl lg:text-9xl font-semibold tracking-tighter text-white leading-[0.9] flex flex-wrap justify-center gap-x-4 gap-y-2 mb-8">
          <span className="hero-word font-sans!">DEPLOY.</span>
          <span className="hero-word font-sans!">EARN.</span>
          <span className="hero-word font-sans! text-white/50">SCALE.</span>
        </h1>

        {/* Subtitle */}
        <p className="hero-subtitle text-lg md:text-2xl text-white/60 max-w-2xl mb-12 font-light">
          Run your services without giving up your BTC. The first "Yield for Compute" platform built natively on the Mezo Chain.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Link 
            href="/sign-up"
            className="hero-btn group relative inline-flex items-center justify-center px-8 py-4 bg-white text-black font-semibold uppercase tracking-wider text-sm transition-transform hover:scale-105 active:scale-95"
            style={{ clipPath: "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)" }}
          >
            Start Deploying Free
          </Link>
          
          <Link 
            href="/login"
            className="hero-btn relative inline-flex items-center justify-center px-8 py-4 bg-transparent text-white font-semibold uppercase tracking-wider text-sm border border-white/20 transition-colors hover:bg-white/10"
            style={{ clipPath: "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)" }}
          >
            Access Dashboard
          </Link>
        </div>
        
      </div>
      
      {/* Brutalist scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50 hero-subtitle">
        <span className="font-mono text-[10px] uppercase tracking-widest text-white/50">Scroll</span>
        <div className="w-px h-12 bg-gradient-to-b from-white/50 to-transparent" />
      </div>
      
    </section>
  )
}
