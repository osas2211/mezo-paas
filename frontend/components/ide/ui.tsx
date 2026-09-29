"use client"

/**
 * Shared IDE primitives. They mirror the design language of the rest of the
 * app (dashboard, projects, settings, billing): pure black surfaces, white/10
 * hairlines, square containers, the double-frame card, uppercase micro-labels
 * and the lime `primary` accent. Every IDE component should build on these
 * instead of hand-rolling colours.
 */

import React from "react"
import { Modal } from "antd"
import { Loader2 } from "lucide-react"

/* ------------------------------------------------------------------ */
/* Class tokens                                                        */
/* ------------------------------------------------------------------ */

export const ide = {
  /** Uppercase micro-label used above sections and fields (sidebar group style) */
  label: "text-[10px] uppercase tracking-wider text-white/40",
  /** Standard text input / textarea / select (matches the projects search field) */
  input:
    "w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary/40 focus:bg-white/[0.07] transition-all disabled:opacity-50 disabled:cursor-not-allowed",
  /** Monospace variant for addresses, hex, ABI JSON */
  inputMono:
    "w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-mono text-white placeholder:text-white/30 focus:outline-none focus:border-primary/40 focus:bg-white/[0.07] transition-all disabled:opacity-50 disabled:cursor-not-allowed",
  /** Inset read-only block (code output, bytecode, results) */
  codeBlock:
    "bg-white/5 border border-white/10 p-3 text-xs font-mono text-white/80 overflow-auto",
  /** Single-frame card for dense panels */
  card: "border border-white/10 bg-white/5",
  /** Hover row / list item */
  row: "border border-white/10 bg-white/5 hover:bg-white/[0.07] hover:border-primary/30 transition-colors",
  /** Hairline divider */
  divider: "border-white/10",
}

/* ------------------------------------------------------------------ */
/* Frame: the app's signature double-border card                       */
/* ------------------------------------------------------------------ */

export function Frame({
  children,
  className = "",
  innerClassName = "",
}: {
  children: React.ReactNode
  className?: string
  innerClassName?: string
}) {
  return (
    <div className={`border border-white/10 bg-white/5 p-1 ${className}`}>
      <div className={`border border-white/20 bg-dark ${innerClassName}`}>{children}</div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Buttons                                                             */
/* ------------------------------------------------------------------ */

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline"
type ButtonSize = "xs" | "sm" | "md"

const buttonVariants: Record<ButtonVariant, string> = {
  primary: "bg-primary text-black hover:bg-primary/90",
  secondary: "bg-white/5 text-white/80 border border-white/10 hover:bg-white/10 hover:text-white",
  outline: "border border-primary/40 text-primary hover:bg-primary/10",
  ghost: "text-white/60 hover:text-white hover:bg-white/5",
  danger: "bg-red-600 text-white hover:bg-red-700",
}

const buttonSizes: Record<ButtonSize, string> = {
  xs: "h-7 px-2.5 text-xs gap-1.5",
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
}

export interface IdeButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: React.ReactNode
  loading?: boolean
  block?: boolean
}

export function IdeButton({
  variant = "secondary",
  size = "sm",
  icon,
  loading,
  block,
  className = "",
  children,
  disabled,
  ...rest
}: IdeButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${buttonVariants[variant]} ${buttonSizes[size]} ${block ? "w-full" : ""} ${className}`}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : icon}
      {children}
    </button>
  )
}

/** Square icon-only button used in toolbars and panel headers */
export function IconButton({
  active,
  className = "",
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center h-7 w-7 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
        active ? "bg-primary/10 text-primary" : "text-white/50 hover:text-white hover:bg-white/5"
      } ${className}`}
    >
      {children}
    </button>
  )
}

/* ------------------------------------------------------------------ */
/* Status                                                              */
/* ------------------------------------------------------------------ */

export type Tone = "success" | "error" | "warning" | "neutral" | "primary"

/** Text colour per tone (for icons / inline status text) */
export const toneText: Record<Tone, string> = {
  success: "text-green-500",
  error: "text-red-500",
  warning: "text-amber-500",
  neutral: "text-white/60",
  primary: "text-primary",
}

/** Pill style — identical to the InfoCard status badge */
export function StatusPill({
  tone = "neutral",
  children,
  className = "",
}: {
  tone?: Tone
  children: React.ReactNode
  className?: string
}) {
  const styles: Record<Tone, string> = {
    success: "text-green-500 bg-green-200/10",
    error: "text-red-500 bg-red-200/10",
    warning: "text-amber-500 bg-amber-200/10",
    neutral: "text-white/60 bg-white/10",
    primary: "text-primary bg-primary/10",
  }
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-sm ${styles[tone]} ${className}`}
    >
      {children}
    </span>
  )
}

/** Callout box for hints, warnings and errors */
export function Notice({
  tone = "neutral",
  icon,
  title,
  children,
  className = "",
}: {
  tone?: Tone
  icon?: React.ReactNode
  title?: React.ReactNode
  children?: React.ReactNode
  className?: string
}) {
  const styles: Record<Tone, string> = {
    success: "bg-green-500/10 border-green-500/20 text-green-500",
    error: "bg-red-500/10 border-red-500/20 text-red-500",
    warning: "bg-amber-500/10 border-amber-500/20 text-amber-500",
    neutral: "bg-white/5 border-white/10 text-white/60",
    primary: "bg-primary/10 border-primary/20 text-primary",
  }
  return (
    <div className={`border p-3 text-xs leading-relaxed flex gap-2.5 ${styles[tone]} ${className}`}>
      {icon && <span className="shrink-0 mt-0.5">{icon}</span>}
      <div className="min-w-0 flex-1 space-y-1">
        {title && <p className="font-medium">{title}</p>}
        {children && <div className={title ? "opacity-80" : ""}>{children}</div>}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Layout pieces                                                       */
/* ------------------------------------------------------------------ */

/** Labelled section inside a side panel */
export function Section({
  title,
  action,
  children,
  className = "",
}: {
  title?: React.ReactNode
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={`space-y-2 ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-2">
          {title && <h4 className={ide.label}>{title}</h4>}
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

/** Form field: micro-label + control + optional hint */
export function Field({
  label,
  hint,
  children,
}: {
  label: React.ReactNode
  hint?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <label className="block space-y-1.5">
      <span className={`${ide.label} flex items-center gap-1.5`}>{label}</span>
      {children}
      {hint && <span className="block text-[11px] text-white/40">{hint}</span>}
    </label>
  )
}

/** Header strip for a panel (explorer, console, side panel) */
export function PanelHeader({
  icon,
  title,
  meta,
  actions,
  className = "",
}: {
  icon?: React.ReactNode
  title: React.ReactNode
  meta?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`flex items-center justify-between gap-2 h-9 px-3 border-b border-white/10 shrink-0 ${className}`}
    >
      <div className="flex items-center gap-2 min-w-0">
        {icon && <span className="text-white/40 shrink-0">{icon}</span>}
        <span className={`${ide.label} text-white/60 truncate`}>{title}</span>
        {meta}
      </div>
      {actions && <div className="flex items-center gap-0.5 shrink-0">{actions}</div>}
    </div>
  )
}

/** Underline tabs — same pattern as the project details page */
export function UnderlineTabs<K extends string>({
  items,
  active,
  onChange,
  fill,
  className = "",
}: {
  items: { key: K; label: React.ReactNode; icon?: React.ReactNode }[]
  active: K
  onChange: (key: K) => void
  fill?: boolean
  className?: string
}) {
  return (
    <div className={`flex border-b border-white/10 overflow-x-auto shrink-0 ${fill ? "" : "gap-5 px-4"} ${className}`}>
      {items.map((item) => {
        const isActive = item.key === active
        return (
          <button
            key={item.key}
            onClick={() => onChange(item.key)}
            className={`relative flex items-center justify-center gap-1.5 h-9 text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              fill ? "flex-1" : ""
            } ${isActive ? "text-primary" : "text-white/60 hover:text-white"}`}
          >
            {item.icon}
            {item.label}
            {isActive && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />}
          </button>
        )
      })}
    </div>
  )
}

/** Pill-style filter chips (template categories, etc.) */
export function ChipTabs<K extends string>({
  items,
  active,
  onChange,
  className = "",
}: {
  items: { key: K; label: React.ReactNode; icon?: React.ReactNode }[]
  active: K
  onChange: (key: K) => void
  className?: string
}) {
  return (
    <div className={`flex gap-1 overflow-x-auto ${className}`}>
      {items.map((item) => {
        const isActive = item.key === active
        return (
          <button
            key={item.key}
            onClick={() => onChange(item.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              isActive ? "bg-primary/10 text-primary" : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        )
      })}
    </div>
  )
}

/** Centered empty state for panels */
export function EmptyState({
  icon,
  title,
  caption,
  action,
  className = "",
}: {
  icon?: React.ReactNode
  title: React.ReactNode
  caption?: React.ReactNode
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center gap-1.5 px-4 py-10 ${className}`}>
      {icon && <div className="text-white/30 pb-3">{icon}</div>}
      <p className="text-sm text-white font-medium">{title}</p>
      {caption && <p className="text-xs text-white/50 max-w-60">{caption}</p>}
      {action && <div className="pt-3">{action}</div>}
    </div>
  )
}

export function Spinner({ size = 16, className = "" }: { size?: number; className?: string }) {
  return <Loader2 size={size} className={`animate-spin text-primary ${className}`} />
}

/* ------------------------------------------------------------------ */
/* Modal: same look as the app's other modals (e.g. Lock Collateral)   */
/* ------------------------------------------------------------------ */

export function IdeModal({
  open,
  onClose,
  title,
  icon,
  width = 560,
  children,
  footer,
  bodyClassName = "",
}: {
  open: boolean
  onClose: () => void
  title: React.ReactNode
  icon?: React.ReactNode
  width?: number
  children: React.ReactNode
  footer?: React.ReactNode
  bodyClassName?: string
}) {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={footer ?? null}
      centered
      width={width}
      destroyOnHidden
      title={
        <span className="text-white text-lg font-medium flex items-center gap-2">
          {icon && <span className="text-primary [&>svg]:h-5 [&>svg]:w-5">{icon}</span>}
          <span>{title}</span>
        </span>
      }
      styles={{
        mask: { backdropFilter: "blur(6px)" },
        body: { maxHeight: "72vh", overflowY: "auto" },
      }}
    >
      <div className={`pt-2 ${bodyClassName}`}>{children}</div>
    </Modal>
  )
}
