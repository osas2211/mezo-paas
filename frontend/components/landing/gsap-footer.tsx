"use client"

import { useRef } from "react"
import Link from "next/link"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ArrowRight } from "lucide-react"

gsap.registerPlugin(useGSAP, ScrollTrigger)

export default function GsapFooter() {
  const container = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    gsap.from(".footer-content", {
      scrollTrigger: {
        trigger: container.current,
        start: "top 75%",
      },
      y: 100,
      opacity: 0,
      duration: 1.2,
      ease: "power3.out"
    })
    
    gsap.to(".marquee-text", {
      xPercent: -50,
      ease: "none",
      duration: 20,
      repeat: -1,
    })
  }, { scope: container })

  return (
    <footer ref={container} className="relative bg-[#050505] pt-32 overflow-hidden border-t border-white/10">
      
      <div className="footer-content max-w-6xl mx-auto px-6 mb-24 text-center z-10 relative">
        <h2 className="text-5xl md:text-8xl font-semibold tracking-tighter text-white mb-8">
          Ready to <span className="text-white/40">Deploy?</span>
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-12">
          <Link 
            href="/sign-up"
            className="group relative inline-flex items-center justify-center gap-2 px-10 py-5 bg-primary text-black font-semibold uppercase tracking-wider text-sm transition-transform hover:scale-105"
            style={{ clipPath: "polygon(16px 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%, 0 16px)" }}
          >
            Start For Free
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
          <Link 
            href="/login"
            className="text-white/60 hover:text-white uppercase tracking-widest text-sm font-mono transition-colors underline underline-offset-4"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>

      {/* Infinite Marquee */}
      <div className="relative w-full border-t border-b border-white/10 bg-white/[0.02] py-4 overflow-hidden mt-16 flex items-center">
        <div className="marquee-text whitespace-nowrap flex gap-8 items-center text-white/20 font-mono text-sm uppercase tracking-widest">
          {Array.from({ length: 15 }).map((_, i) => (
            <span key={i} className="flex items-center gap-8">
              <span>Mezo PaaS</span>
              <span className="w-2 h-2 bg-white/20 rounded-full" />
              <span>Yield For Compute</span>
              <span className="w-2 h-2 bg-white/20 rounded-full" />
              <span>Bitcoin DeFi</span>
              <span className="w-2 h-2 bg-white/20 rounded-full" />
            </span>
          ))}
        </div>
      </div>

      {/* Actual Footer Bottom */}
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center text-xs text-white/40 font-mono uppercase tracking-widest">
        <div>&copy; {new Date().getFullYear()} Mezo PaaS. All rights reserved.</div>
        <div className="flex gap-6 mt-4 md:mt-0">
          <Link href="https://mezo.org" target="_blank" className="hover:text-white transition-colors">Mezo.org</Link>
          {/* <Link href="https://github.com/osas2211/mezo-paas" target="_blank" className="hover:text-white transition-colors">GitHub</Link> */}
        </div>
      </div>
      
    </footer>
  )
}
