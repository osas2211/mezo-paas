"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Code,
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
        icon: <LayoutDashboard size={20} />,
      },
    ],
  },
  {
    group: "Infrastructure",
    items: [
      {
        label: "Projects",
        href: "/projects",
        icon: <FolderKanban size={20} />,
      },
      {
        label: "Deployments",
        href: "/deployments",
        icon: <Rocket size={20} />,
      },
      {
        label: "Domains",
        href: "/domains",
        icon: <Globe size={20} />,
      },
    ],
  },
  {
    group: "Integrations",
    items: [
      {
        label: "Integrations",
        href: "/integrations",
        icon: <Plug size={20} />,
      },
    ],
  },
  {
    group: "Developer",
    items: [
      {
        label: "IDE",
        href: "/ide",
        icon: <Code size={20} />,
      },
    ],
  },
  {
    group: "Account",
    items: [
      {
        label: "Billing",
        href: "/billing",
        icon: <CreditCard size={20} />,
      },
      {
        label: "Settings",
        href: "/settings",
        icon: <Settings size={20} />,
      },
    ],
  },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const isAuthPage = pathname === "/login" || pathname === "/register"

  if (isAuthPage) {
    return null
  }

  return (
    <nav className="h-full flex flex-col">
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-6 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-dark hover:bg-white/5 transition-colors"
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronRight size={14} className="text-white/60" />
        ) : (
          <ChevronLeft size={14} className="text-white/60" />
        )}
      </button>

      <ul className="flex flex-col gap-6 flex-1">
        {navItems.map((navItem) => (
          <li key={navItem.group}>
            {!collapsed && (
              <h2 className="text-xs mb-2 text-white/40 uppercase tracking-wider">
                {navItem.group}
              </h2>
            )}
            <ul className="space-y-1">
              {navItem.items.map((item, index) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(item.href + "/")
                return (
                  <li key={index}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-white/60 hover:text-white hover:bg-white/5"
                      } ${collapsed ? "justify-center px-2" : ""}`}
                      title={collapsed ? item.label : undefined}
                    >
                      <span className={isActive ? "text-primary" : "text-white/60"}>
                        {item.icon}
                      </span>
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </li>
        ))}
      </ul>

      {/* Docs Link */}
      <div className={`border-t border-white/10 pt-4 mt-4 ${collapsed ? "px-1" : ""}`}>
        <Link
          href="https://docs.mezo.org"
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-3 px-3 py-2 text-sm text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/5 ${
            collapsed ? "justify-center px-2" : ""
          }`}
          title={collapsed ? "Documentation" : undefined}
        >
          <BookOpen size={20} />
          {!collapsed && <span>Docs</span>}
        </Link>
      </div>
    </nav>
  )
}
