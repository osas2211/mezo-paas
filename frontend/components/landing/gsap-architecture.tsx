"use client"

import { useRef } from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(useGSAP, ScrollTrigger)

const steps = [
  {
    id: "01",
    title: "Connect & Push",
    desc: "Link your GitHub. Code is securely stored in immutable S3 buckets.",
  },
  {
    id: "02",
    title: "Queue & Build",
    desc: "Jobs hit our Redis queue. Auto-detect frameworks, inject Dockerfiles.",
  },
  {
    id: "03",
    title: "Deploy & Route",
    desc: "Containers on ephemeral ports. Custom proxy with zero-downtime reloads.",
  },
  {
    id: "04",
    title: "Scale & Secure",
    desc: "Auto-scaling on traffic. SSL auto-provisioned. Production-ready.",
  },
]

export default function GsapArchitecture() {
  const container = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    gsap.from(".arch-step", {
      scrollTrigger: {
        trigger: container.current,
        start: "top 70%",
      },
      y: 40,
      opacity: 0,
      duration: 0.7,
      stagger: 0.12,
      ease: "power3.out",
    })

    gsap.from(".arch-line", {
      scrollTrigger: {
        trigger: container.current,
        start: "top 70%",
        end: "bottom 70%",
        scrub: 1,
      },
      scaleY: 0,
      transformOrigin: "top center",
    })
  }, { scope: container })

  return (
    <section ref={container} id="resources" className="relative bg-black py-32 px-6 border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="mb-20">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
            Built for scale
          </h2>
          <p className="text-lg text-white/40 max-w-lg">
            Stateless. Immutable. Brutally fast.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Vertical Line */}
          <div className="hidden md:block absolute left-[60px] top-8 bottom-8 w-px">
            <div className="arch-line h-full bg-gradient-to-b from-white/10 via-white/5 to-transparent" />
          </div>

          <div className="space-y-0">
            {steps.map((step, i) => (
              <div key={step.id} className="arch-step relative flex gap-8 md:gap-12 py-8">
                {/* Number */}
                <div className="relative z-10 flex-shrink-0 w-[120px] hidden md:block">
                  <span className="text-6xl font-bold text-white/[0.04]">{step.id}</span>
                </div>

                {/* Content */}
                <div className="flex-1 max-w-lg">
                  <span className="text-xs text-white/20 font-mono md:hidden mb-2 block">{step.id}</span>
                  <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-white/40 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="mt-20 pt-12 border-t border-white/[0.06]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Sub-second deploys" },
              { label: "Global CDN" },
              { label: "Auto SSL" },
              { label: "Managed storage" },
            ].map((item, i) => (
              <div key={i} className="text-sm text-white/30">
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
