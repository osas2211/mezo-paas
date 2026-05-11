"use client";

const links = [
  { label: "Pricing", href: "#pricing" },
  { label: "Customers", href: "#customers" },
  { label: "Resources", href: "#resources" },
  { label: "Support", href: "#support" },
];

export default function NavLinks() {
  return (
    <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          className="px-4 py-2 text-sm text-zinc-400 rounded-lg transition-colors duration-200 hover:text-white hover:bg-white/5"
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
}

export { links };
