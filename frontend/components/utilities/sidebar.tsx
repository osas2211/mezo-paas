"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  BookOpen,
  CreditCard,
  FolderKanban,
  Globe,
  LayoutDashboard,
  Plug,
  Rocket,
  Settings,
} from "lucide-react"

type navItem = {
  group: string
  items: {
    label: string
    href: string
    icon: React.ReactNode
  }[]
}

const navItems: navItem[] = [
  {
    group: "Main",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: <LayoutDashboard size={20} className="text-white/60" />,
      },
    ],
  },
  {
    group: "Infrastructure",
    items: [
      {
        label: "projects",
        href: "/projects",
        icon: <FolderKanban size={20} className="text-white/60" />,
      },
      {
        label: "deployments",
        href: "/deployments",
        icon: <Rocket size={20} className="text-white/60" />,
      },
      {
        label: "domains",
        href: "/domains",
        icon: <Globe size={20} className="text-white/60" />,
      },
    ],
  },
  {
    group: "Integrations",
    items: [
      {
        label: "Integrations",
        href: "/integrations",
        icon: <Plug size={20} className="text-white/60" />,
      },
    ],
  },

  {
    group: "Account",
    items: [
      {
        label: "Billing",
        href: "/billing",
        icon: <CreditCard size={20} className="text-white/60" />,
      },

      {
        label: "Settings",
        href: "/settings",
        icon: <Settings size={20} className="text-white/60" />,
      },
    ],
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const isAuthPage = pathname === "/login" || pathname === "/register"

  if (isAuthPage) {
    return null
  }

  return (
    <nav className="">
      <ul className="flex flex-col gap-8">
        {navItems.map((navItem) => (
          <li key={navItem.group}>
            <h2 className="text-xs mb-2 text-white/70 uppercase">
              {navItem.group}
            </h2>
            <ul className="space-y-1">
              {navItem.items.map((item, index) => {
                const isActive = pathname === item.href
                return (
                  <li key={index}>
                    <Link
                      href={item.href}
                      className={`capitalize flex items-center gap-3 px-3 py-2 text-sm transition-colors text-white ${isActive ? "bg-violet-50/5 *:text-primary! text-primary!" : ""}`}
                    >
                      {item.icon} {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </li>
        ))}
      </ul>

      <div className="fixed bottom-0 left-0 w-[290px] h-[50px] border-t border-white/15 px-4 md:px-10 py-2">
        <div className="flex flex-col gap-2 h-full justify-center text-sm text-white">
          <Link
            href={""}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <BookOpen size={20} className="text-white/60" />
            <span>Docs</span>
          </Link>
        </div>
      </div>
    </nav>
  )
}
