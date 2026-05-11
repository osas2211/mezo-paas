"use client"

import { Layers, Shield, Infinity, RotateCcw, Lock, SlidersHorizontal } from "lucide-react"

export default function FeaturesSection() {
  const features = [
    {
      icon: Layers,
      title: "Deploy anything, anywhere",
      description: "Run full-stack apps, APIs, static sites, and microservices across 12 global regions.",
      active: true,
    },
    {
      icon: Shield,
      title: "Enterprise-grade security",
      description: "We provision fully isolated containers that are securely destroyed after each deployment.",
      active: false,
    },
    {
      icon: Infinity,
      title: "Unlimited scale",
      description: "We don't believe in artificial limits. Scale from zero to millions seamlessly.",
      active: false,
    },
    {
      icon: RotateCcw,
      title: "Instant rollbacks",
      description: "Revert to any previous deployment in seconds with zero downtime.",
      active: false,
    },
    {
      icon: Lock,
      title: "Built-in compliance",
      description: "SOC 2 Type II certified with automatic security updates and patches.",
      active: false,
    },
    {
      icon: SlidersHorizontal,
      title: "Advanced analytics",
      description: "View your deployment metrics over time to identify bottlenecks and opportunities.",
      active: false,
    },
  ]

  return (
    <section className="relative w-full py-24 sm:py-32 bg-black text-white border-t border-zinc-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8">
        
        {/* Left Side: Sticky Header Area */}
        <div className="relative">
          <div className="lg:sticky lg:top-32 flex flex-col gap-6 max-w-sm">
            <span className="inline-flex items-center px-3 py-1 rounded bg-primary/20 text-primary text-xs font-semibold tracking-wider uppercase w-fit">
              Features
            </span>
            <h2 className="text-4xl sm:text-5xl font-medium tracking-tight leading-tight">
              Deploy anything, anywhere
            </h2>
            <p className="text-lg text-zinc-400 leading-relaxed">
              Build and run any application, from APIs to microservices across regions with zero friction.
            </p>
          </div>
        </div>

        {/* Right Side: Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-zinc-900 rounded-xl overflow-hidden border border-zinc-900">
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <div 
                key={i} 
                className={`relative p-8 flex flex-col gap-4 bg-black transition-colors duration-300 ${feature.active ? 'border border-primary bg-zinc-900/40 shadow-inner' : 'hover:bg-[#0a0a0c]'}`}
                style={{
                  ...(feature.active && {
                    backgroundImage: 'radial-gradient(circle at center, rgba(179, 236, 17, 0.1) 1px, transparent 1px)',
                    backgroundSize: '16px 16px',
                  })
                }}
              >
                <div className="mb-2 text-zinc-300">
                  <Icon size={24} strokeWidth={1.5} className={feature.active ? "text-primary" : "text-zinc-400"} />
                </div>
                <h3 className="text-lg font-medium text-zinc-100">{feature.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
        
      </div>
    </section>
  )
}
