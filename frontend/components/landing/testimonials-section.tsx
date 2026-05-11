"use client"

import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function TestimonialsSection() {
  return (
    <section className="relative w-full py-24 sm:py-32 bg-black text-white border-t border-zinc-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center">
        {/* Left Side */}
        <div className="flex flex-col gap-6 max-w-md relative">
          {/* Subtle dotted background grid pattern could go here */}
          
          <span className="inline-flex items-center px-3 py-1 rounded bg-primary/20 text-primary text-xs font-semibold tracking-wider uppercase w-fit">
            Testimonials
          </span>
          <h2 className="text-4xl sm:text-5xl font-medium tracking-tight leading-tight">
            Loved by developers worldwide
          </h2>
          <p className="text-lg text-zinc-400 leading-relaxed">
            Join thousands of teams who trust MezoDeploy for their deployment needs.
          </p>
        </div>

        {/* Right Side: Testimonial Card */}
        <div className="relative w-full flex lg:justify-end">
          <div className="flex flex-col gap-6 max-w-lg w-full">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-xl overflow-hidden relative border border-zinc-800 bg-zinc-900">
              <Image 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop" 
                alt="Marcus Rodriguez"
                fill
                className="object-cover grayscale hover:grayscale-0 transition-all duration-300"
              />
            </div>

            {/* Quote */}
            <blockquote className="text-xl sm:text-2xl font-light leading-snug tracking-tight text-zinc-100">
              "The best deployment platform we've used. Fast, reliable, and the developer experience is outstanding. Our team productivity increased by 40%."
            </blockquote>

            {/* Author */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-white">Marcus Rodriguez</span>
              <span className="text-zinc-500">—</span>
              <span className="text-zinc-400">Lead Developer at DataCore</span>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
              {/* Dots */}
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <div className="w-2 h-2 rounded-full bg-zinc-700" />
                <div className="w-2 h-2 rounded-full bg-zinc-700" />
              </div>

              {/* Arrows */}
              <div className="flex items-center gap-2">
                <button aria-label="Previous testimonial" className="flex items-center justify-center w-10 h-10 rounded border border-zinc-800 hover:bg-zinc-900 transition-colors">
                  <ChevronLeft size={18} className="text-zinc-400" />
                </button>
                <button aria-label="Next testimonial" className="flex items-center justify-center w-10 h-10 rounded border border-zinc-800 hover:bg-zinc-900 transition-colors">
                  <ChevronRight size={18} className="text-zinc-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
