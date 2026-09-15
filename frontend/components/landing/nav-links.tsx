"use client";

import Link from "next/link";

const links = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Infrastructure", href: "#resources" },
  { label: "Docs", href: "/docs" },
];

export default function NavLinks() {
  return (
    <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
      {links.map((link) => (
        link.href.startsWith("#") ? (
          <a
            key={link.label}
            href={link.href}
            className="px-4 py-2 text-sm text-zinc-400 rounded-lg transition-colors duration-200 hover:text-white hover:bg-white/5"
          >
            {link.label}
          </a>
        ) : (
          <Link
            key={link.label}
            href={link.href}
            className="px-4 py-2 text-sm text-zinc-400 rounded-lg transition-colors duration-200 hover:text-white hover:bg-white/5"
          >
            {link.label}
          </Link>
        )
      ))}
    </nav>
  );
}

export { links };
