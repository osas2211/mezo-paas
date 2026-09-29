"use client"

import { useState, useEffect } from "react"
import { Link, Copy, Check, AlertCircle, ExternalLink } from "lucide-react"
import {
  generateShareUrl,
  copyToClipboard,
  isContentTooLarge,
  estimateUrlLength,
} from "@/lib/ide/share"
import { ide, IdeButton, Notice, Section, IdeModal } from "./ui"

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

  const estimatedLength = estimateUrlLength(content, fileName)
  const isTooLarge = isContentTooLarge(content, fileName)

  return (
    <IdeModal open={open} onClose={onClose} title="Share Contract" icon={<Link />} width={520}>
      <div className="space-y-4">
        {/* File Info */}
        <div className={`${ide.card} p-3`}>
          <p className="text-white text-sm font-medium">{fileName}</p>
          <p className="text-white/60 text-xs mt-1">
            {content.length.toLocaleString()} characters
            {content.length > 2000 && " (will be compressed)"}
          </p>
        </div>

        {/* Error State */}
        {error && (
          <Notice tone="error" icon={<AlertCircle size={14} />}>
            {error}
          </Notice>
        )}

        {/* Too Large Warning */}
        {isTooLarge && !error && (
          <Notice tone="warning" icon={<AlertCircle size={14} />} title="Contract too large">
            This contract exceeds the URL limit. Consider using GitHub Gist for large files.
          </Notice>
        )}

        {/* URL Display */}
        {!isTooLarge && !error && (
          <>
            <Section title="Share Link">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={isGenerating ? "Generating..." : shareUrl}
                  readOnly
                  className={`${ide.inputMono} flex-1 min-w-0`}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <IdeButton
                  variant="primary"
                  size="md"
                  onClick={handleCopy}
                  disabled={isGenerating || !shareUrl}
                  icon={copied ? <Check size={14} /> : <Copy size={14} />}
                  className="shrink-0"
                >
                  <span>{copied ? "Copied" : "Copy"}</span>
                </IdeButton>
              </div>
            </Section>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <IdeButton
                variant="ghost"
                size="xs"
                onClick={handleOpenInNewTab}
                disabled={isGenerating || !shareUrl}
                icon={<ExternalLink size={12} />}
                className="-ml-2.5"
              >
                Open in new tab
              </IdeButton>

              <span className="text-white/40 text-xs">
                ~{estimatedLength.toLocaleString()} chars
              </span>
            </div>
          </>
        )}

        {/* Tips */}
        <div className="pt-4 border-t border-white/10">
          <p className="text-white/40 text-xs leading-relaxed">
            Share this link with anyone to let them view and edit this contract in Mezo IDE.
            The contract code is embedded in the URL.
          </p>
        </div>
      </div>
    </IdeModal>
  )
}
