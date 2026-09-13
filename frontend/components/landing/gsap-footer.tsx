"use client"

import { useRef } from "react"
import Link from "next/link"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ArrowRight } from "lucide-react"
import { FaTwitter, FaGithub } from "react-icons/fa"

gsap.registerPlugin(useGSAP, ScrollTrigger)

const footerLinks = {
  product: [
    { label: "IDE", href: "/ide" },
    { label: "Dashboard", href: "/login" },
    { label: "Pricing", href: "#pricing" },
  ],
  resources: [
    { label: "Documentation", href: "#" },
    { label: "Templates", href: "/ide" },
    { label: "Protocol Registry", href: "/ide" },
  ],
  company: [
    { label: "About", href: "https://mezo.org", external: true },
    { label: "Twitter", href: "https://twitter.com/meaboratory", external: true },
    { label: "GitHub", href: "https://github.com", external: true },
  ],
}

export default function GsapFooter() {
  const container = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    gsap.from(".footer-content", {
      scrollTrigger: {
        trigger: container.current,
        start: "top 85%",
      },
      y: 40,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out"
    })
  }, { scope: container })

  return (
    <footer ref={container} className="relative bg-black pt-32 pb-8 px-6 border-t border-white/[0.06]">
      <div className="footer-content max-w-6xl mx-auto">
        {/* CTA Section */}
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
            Ready to build?
          </h2>
          <p className="text-lg text-white/40 max-w-md mx-auto mb-10">
            Deploy your first contract in minutes. No credit card required.
          </p>
          <Link
            href="/ide"
            className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-medium rounded-full transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Open IDE
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-20">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="text-white font-semibold mb-4">Mezo</div>
            <p className="text-sm text-white/30 leading-relaxed max-w-[200px]">
              The decentralized PaaS for Bitcoin DeFi.
            </p>
          </div>

          {/* Product */}
          <div>
            <div className="text-xs text-white/20 uppercase tracking-wider mb-4">Product</div>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-white/40 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <div className="text-xs text-white/20 uppercase tracking-wider mb-4">Resources</div>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-white/40 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <div className="text-xs text-white/20 uppercase tracking-wider mb-4">Company</div>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                    className="text-sm text-white/40 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-white/[0.06]">
          <div className="text-xs text-white/20">
            &copy; {new Date().getFullYear()} Mezo
          </div>
          <div className="flex gap-4">
            <a href="https://twitter.com/meaboratory" target="_blank" rel="noopener noreferrer" className="text-white/20 hover:text-white transition-colors">
              <FaTwitter size={16} />
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-white/20 hover:text-white transition-colors">
              <FaGithub size={16} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
