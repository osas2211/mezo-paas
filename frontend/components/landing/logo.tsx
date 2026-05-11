"use client"

export default function Logo() {
  return (
    <a
      href="/"
      className="flex items-center gap-2 group"
      aria-label="CodeVault Home"
    >
      {/* 
        The reference image shows the logo as 'CodeVault' written in a pixel font, 
        without an explicit SVG icon. So we just render the text with a pixelated style.
      */}
      <span
        className="text-xl tracking-tighter text-white"
        style={{
          fontFamily: "'Courier New', Courier, monospace",
          fontWeight: 700,
          letterSpacing: "-0.05em",
        }}
      >
        Mezo<span className="text-gray-300">Deploy</span>
      </span>
    </a>
  )
}
