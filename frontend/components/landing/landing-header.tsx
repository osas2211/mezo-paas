"use client";

import { useEffect, useState } from "react";
import Logo from "./logo";
import NavLinks from "./nav-links";
import HeaderActions from "./header-actions";
import MobileNav from "./mobile-nav";

export default function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/50"
          : "bg-transparent"
      }`}
    >
      <div className="w-full px-5 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between h-16">
          {/* Left group: Logo + Nav */}
          <div className="flex items-center gap-8">
            <Logo />
            <NavLinks />
          </div>
          {/* Right group: CTA buttons */}
          <div className="flex items-center">
            <HeaderActions />
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  );
}
