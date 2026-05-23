"use client"

import { useRef } from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Database, Server, GitBranch, Cpu } from "lucide-react"

gsap.registerPlugin(useGSAP, ScrollTrigger)

const archSteps = [
  {
    id: "01",
    title: "Immutable Storage",
    desc: "Connect your GitHub. We clone your code securely and push it to an immutable AWS S3 staging bucket. Git credentials never touch the deployment worker.",
    icon: <GitBranch size={40} className="text-white/80" />
  },
  {
    id: "02",
    title: "Redis Queue",
    desc: "A stateless event payload hits our hyper-fast Redis queue. The NestJS backend orchestrates the deployment lifecycle instantly.",
    icon: <Database size={40} className="text-white/80" />
  },
  {
    id: "03",
    title: "Isolated Build Engine",
    desc: "Our Node.js worker pulls your code, auto-detects frameworks, and injects dynamic Dockerfiles. Everything builds in complete isolation.",
    icon: <Cpu size={40} className="text-white/80" />
  },
  {
    id: "04",
    title: "Dynamic Routing",
    desc: "Containers spin up on ephemeral ports. Our custom proxy reads Redis memory state and pipes wildcard HTTP traffic with zero Nginx reloads.",
    icon: <Server size={40} className="text-white/80" />
  }
]

export default function GsapArchitecture() {
  const container = useRef<HTMLDivElement>(null)
  
  useGSAP(() => {
    // Pinning the left side text while right side scrolls
    const mm = gsap.matchMedia()

    mm.add("(min-width: 1024px)", () => {
      ScrollTrigger.create({
        trigger: ".arch-container",
        start: "top top",
        end: "bottom bottom",
        pin: ".arch-left",
        anticipatePin: 1
      })

      // Fade in steps as they scroll into view
      const steps = gsap.utils.toArray<HTMLElement>(".arch-step")
      steps.forEach((step) => {
        gsap.from(step, {
          scrollTrigger: {
            trigger: step,
            start: "top 70%",
            end: "top 30%",
            scrub: true
          },
          opacity: 0.2,
          scale: 0.95,
          x: 50
        })
      })
    })
    
    // For mobile, just fade them in
    mm.add("(max-width: 1023px)", () => {
      const steps = gsap.utils.toArray<HTMLElement>(".arch-step")
      steps.forEach((step) => {
        gsap.from(step, {
          scrollTrigger: {
            trigger: step,
            start: "top 80%",
            toggleActions: "play none none reverse"
          },
          opacity: 0,
          y: 30,
          duration: 0.8
        })
      })
    })
  }, { scope: container })

  return (
    <section ref={container} className="relative bg-[#0a0a0c] text-white py-24 md:py-0">
      <div className="arch-container max-w-7xl mx-auto px-6 flex flex-col lg:flex-row min-h-screen">
        
        {/* Left Side: Pinned Context */}
        <div className="arch-left lg:w-1/2 flex flex-col justify-center lg:h-screen mb-16 lg:mb-0 pr-0 lg:pr-16">
          <div className="font-mono text-sm text-white/40 mb-4 tracking-widest uppercase">
            Platform Architecture
          </div>
          <h2 className="text-4xl md:text-6xl font-semibold tracking-tighter mb-6 leading-tight">
            Built for <br/> <span className="text-white/50">Maximum Autonomy.</span>
          </h2>
          <p className="text-lg text-white/60 font-light max-w-md">
            Mezo PaaS separates the orchestration layer from the execution layer. Stateless, immutable, and brutally fast.
          </p>
        </div>

        {/* Right Side: Scrolling Steps */}
        <div className="arch-right lg:w-1/2 lg:py-32 flex flex-col gap-24">
          {archSteps.map((step) => (
            <div key={step.id} className="arch-step flex flex-col gap-6">
              <div className="w-20 h-20 bg-white/5 border border-white/10 flex items-center justify-center relative"
                style={{ clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)" }}>
                {/* Accent corner */}
                <div className="absolute top-0 left-0 w-3 h-3 bg-white/20" />
                {step.icon}
              </div>
              <div>
                <div className="font-mono text-xs text-white/40 mb-2">STEP {step.id}</div>
                <h3 className="text-2xl font-semibold mb-3">{step.title}</h3>
                <p className="text-white/60 leading-relaxed font-light">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
