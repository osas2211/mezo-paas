"use client"

import { useState, useEffect } from "react"
import { X, FileCode, Coins, CreditCard, Wrench, Image, TrendingUp, Vote } from "lucide-react"
import { TEMPLATES, type ContractTemplate } from "@/lib/ide/templates"

interface TemplateSelectorProps {
  open: boolean
  onClose: () => void
  onSelect: (template: ContractTemplate) => void
}

export default function TemplateSelector({
  open,
  onClose,
  onSelect,
}: TemplateSelectorProps) {
  const [activeCategory, setActiveCategory] = useState("example")

  const categories = [
    { key: "example", label: "Examples", icon: <FileCode size={14} /> },
    { key: "token", label: "Tokens", icon: <Coins size={14} /> },
    { key: "defi", label: "DeFi", icon: <TrendingUp size={14} /> },
    { key: "nft", label: "NFTs", icon: <Image size={14} /> },
    { key: "governance", label: "Governance", icon: <Vote size={14} /> },
    { key: "billing", label: "Billing", icon: <CreditCard size={14} /> },
    { key: "utility", label: "Utilities", icon: <Wrench size={14} /> },
  ]

  const handleSelect = (template: ContractTemplate) => {
    onSelect(template)
    onClose()
  }

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (open) {
      document.addEventListener("keydown", handleEscape)
      return () => document.removeEventListener("keydown", handleEscape)
    }
  }, [open, onClose])

  if (!open) return null

  const filteredTemplates = TEMPLATES.filter((t) => t.category === activeCategory)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 bg-[#0a0a0a] border border-white/10 rounded-lg shadow-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="text-white text-base font-medium">Create from Template</h2>
          <button
            onClick={onClose}
            className="p-1 text-white/40 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-1 px-5 py-3 border-b border-white/10 overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category.key}
              onClick={() => setActiveCategory(category.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                activeCategory === category.key
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              {category.icon}
              <span>{category.label}</span>
            </button>
          ))}
        </div>

        {/* Template List */}
        <div className="flex-1 overflow-y-auto p-5">
          {filteredTemplates.length > 0 ? (
            <div className="grid gap-3">
              {filteredTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleSelect(template)}
                  className="w-full p-4 text-left bg-[#111] hover:bg-[#161616] border border-white/10 hover:border-primary/40 rounded-lg transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-white font-medium group-hover:text-primary transition-colors">
                        {template.name}
                      </h3>
                      <p className="text-white/50 text-sm mt-1">
                        {template.description}
                      </p>
                    </div>
                    <FileCode
                      size={18}
                      className="text-white/20 group-hover:text-primary/50 transition-colors mt-0.5"
                    />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <p className="text-white/40 text-sm">No templates in this category yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
