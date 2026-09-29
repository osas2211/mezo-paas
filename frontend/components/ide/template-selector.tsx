"use client"

import { useState } from "react"
import { FileCode, Coins, CreditCard, Wrench, Image, TrendingUp, Vote } from "lucide-react"
import { TEMPLATES, type ContractTemplate } from "@/lib/ide/templates"
import { ide, ChipTabs, EmptyState, IdeModal } from "./ui"

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

  const filteredTemplates = TEMPLATES.filter((t) => t.category === activeCategory)

  return (
    <IdeModal
      open={open}
      onClose={onClose}
      title="Create from Template"
      icon={<FileCode />}
      width={720}
    >
      <div className="space-y-4">
        {/* Category Tabs */}
        <ChipTabs
          items={categories}
          active={activeCategory}
          onChange={setActiveCategory}
          className="pb-3 border-b border-white/10"
        />

        {/* Template List */}
        {filteredTemplates.length > 0 ? (
          <div className="grid gap-2">
            {filteredTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleSelect(template)}
                className={`${ide.row} w-full p-4 text-left cursor-pointer group`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-white font-medium group-hover:text-primary transition-colors">
                      {template.name}
                    </h3>
                    <p className="text-white/50 text-sm mt-1">
                      {template.description}
                    </p>
                  </div>
                  <FileCode
                    size={18}
                    className="shrink-0 text-white/30 group-hover:text-primary transition-colors mt-0.5"
                  />
                </div>
              </button>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<FileCode size={24} />}
            title="No templates in this category yet"
          />
        )}
      </div>
    </IdeModal>
  )
}
