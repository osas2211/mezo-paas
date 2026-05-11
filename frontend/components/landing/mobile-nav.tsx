"use client";

import { useState, useEffect } from "react";
import { X, Menu } from "lucide-react";
import { links } from "./nav-links";
import Link from "next/link";

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <div className="md:hidden">
      {/* Hamburger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative z-50 p-2 text-zinc-400 transition-colors hover:text-white"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Slide-in panel */}
      <div
        className={`fixed top-0 right-0 z-40 h-full w-[280px] bg-zinc-950 border-l border-zinc-800 transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full pt-20 px-6 pb-8">
          {/* Nav links */}
          <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="px-4 py-3 text-base text-zinc-400 rounded-lg transition-colors duration-200 hover:text-white hover:bg-white/5"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Divider */}
          <div className="my-6 h-px bg-zinc-800" />

          {/* CTA buttons */}
          <div className="flex flex-col gap-3">
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center px-5 py-3 text-sm font-medium text-white rounded-full border border-zinc-700 transition-all duration-200 hover:border-zinc-500 hover:bg-white/5"
            >
              Console
            </Link>
            <Link
              href="/signup"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center px-5 py-3 text-sm font-medium text-black bg-primary rounded-full transition-all duration-200 hover:brightness-110"
            >
              Get Started
            </Link>
          </div>

          {/* Bottom decoration */}
          <div className="mt-auto pt-6 border-t border-zinc-800">
            <p className="text-xs text-zinc-600">
              © 2026 Mezo. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
