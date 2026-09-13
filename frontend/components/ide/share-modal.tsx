"use client"

import { useState, useEffect } from "react"
import { Link, Copy, Check, AlertCircle, ExternalLink, X } from "lucide-react"
import {
  generateShareUrl,
  copyToClipboard,
  isContentTooLarge,
  estimateUrlLength,
} from "@/lib/ide/share"

interface ShareModalProps {
  open: boolean
  onClose: () => void
  fileName: string
  content: string
}

export default function ShareModal({
  open,
  onClose,
  fileName,
  content,
}: ShareModalProps) {
  const [shareUrl, setShareUrl] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Generate URL when modal opens
  useEffect(() => {
    if (open && content) {
      generateUrl()
    }
  }, [open, content, fileName])

  // Reset copied state after 2 seconds
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [copied])

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

  const generateUrl = async () => {
    setIsGenerating(true)
    setError(null)

    if (isContentTooLarge(content, fileName)) {
      setError("Contract is too large to share via URL. Consider using GitHub Gist instead.")
      setIsGenerating(false)
      return
    }

    try {
      const url = await generateShareUrl({
        name: fileName,
        content,
      })
      setShareUrl(url)
    } catch (err: any) {
      setError(err.message || "Failed to generate share URL")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = async () => {
    const success = await copyToClipboard(shareUrl)
    setCopied(success)
  }

  const handleOpenInNewTab = () => {
    window.open(shareUrl, "_blank")
  }

  if (!open) return null

  const estimatedLength = estimateUrlLength(content, fileName)
  const isTooLarge = isContentTooLarge(content, fileName)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-[#0a0a0a] border border-white/10 rounded-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Link size={18} className="text-primary" />
            <h2 className="text-white text-base font-medium">Share Contract</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-white/40 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* File Info */}
          <div className="mb-4 p-3 bg-[#111] rounded-lg border border-white/10">
            <p className="text-white text-sm font-medium">{fileName}</p>
            <p className="text-white/50 text-xs mt-1">
              {content.length.toLocaleString()} characters
              {content.length > 2000 && " (will be compressed)"}
            </p>
          </div>

          {/* Error State */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Too Large Warning */}
          {isTooLarge && !error && (
            <div className="mb-4 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-yellow-400 text-sm font-medium">Contract too large</p>
                  <p className="text-yellow-400/70 text-xs mt-1">
                    This contract exceeds the URL limit. Consider using GitHub Gist for large files.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* URL Display */}
          {!isTooLarge && !error && (
            <>
              <div className="mb-4">
                <label className="text-white/60 text-xs mb-2 block">Share Link</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={isGenerating ? "Generating..." : shareUrl}
                    readOnly
                    className="flex-1 bg-[#111] border border-white/10 rounded-lg px-3 py-2.5 text-white/80 text-sm font-mono focus:outline-none focus:border-primary/50"
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                  <button
                    onClick={handleCopy}
                    disabled={isGenerating || !shareUrl}
                    className="px-4 py-2.5 bg-primary text-dark font-medium text-sm rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
                  >
                    {copied ? (
                      <>
                        <Check size={14} />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <button
                  onClick={handleOpenInNewTab}
                  disabled={isGenerating || !shareUrl}
                  className="flex items-center gap-1.5 text-white/50 text-xs hover:text-primary disabled:opacity-50 transition-colors"
                >
                  <ExternalLink size={12} />
                  Open in new tab
                </button>

                <span className="text-white/30 text-xs">
                  ~{estimatedLength.toLocaleString()} chars
                </span>
              </div>
            </>
          )}

          {/* Tips */}
          <div className="mt-5 pt-4 border-t border-white/10">
            <p className="text-white/40 text-xs leading-relaxed">
              Share this link with anyone to let them view and edit this contract in Mezo IDE.
              The contract code is embedded in the URL.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
