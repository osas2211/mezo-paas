/**
 * Shareable Links for Mezo IDE
 *
 * Allows developers to share contracts via URL.
 * Uses base64 encoding with optional compression for larger contracts.
 */

// Compression threshold (bytes) - compress if source is larger
const COMPRESSION_THRESHOLD = 2000

/**
 * Compress a string using the browser's CompressionStream API
 */
async function compressString(str: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(str)

  // Check if CompressionStream is available
  if (typeof CompressionStream === 'undefined') {
    // Fallback: just use base64 without compression
    return btoa(unescape(encodeURIComponent(str)))
  }

  const stream = new CompressionStream('gzip')
  const writer = stream.writable.getWriter()
  writer.write(data)
  writer.close()

  const compressedData = await new Response(stream.readable).arrayBuffer()
  const compressedArray = new Uint8Array(compressedData)

  // Convert to base64
  let binary = ''
  for (let i = 0; i < compressedArray.length; i++) {
    binary += String.fromCharCode(compressedArray[i])
  }
  return btoa(binary)
}

/**
 * Decompress a base64 string that was compressed with gzip
 */
async function decompressString(base64: string): Promise<string> {
  // Check if DecompressionStream is available
  if (typeof DecompressionStream === 'undefined') {
    // Fallback: assume it's just base64 encoded
    return decodeURIComponent(escape(atob(base64)))
  }

  try {
    // Convert base64 to Uint8Array
    const binary = atob(base64)
    const compressedArray = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      compressedArray[i] = binary.charCodeAt(i)
    }

    const stream = new DecompressionStream('gzip')
    const writer = stream.writable.getWriter()
    writer.write(compressedArray)
    writer.close()

    const decompressedData = await new Response(stream.readable).arrayBuffer()
    const decoder = new TextDecoder()
    return decoder.decode(decompressedData)
  } catch {
    // If decompression fails, try plain base64
    return decodeURIComponent(escape(atob(base64)))
  }
}

/**
 * Simple base64 encode (for smaller content)
 */
function simpleEncode(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
}

/**
 * Simple base64 decode
 */
function simpleDecode(base64: string): string {
  return decodeURIComponent(escape(atob(base64)))
}

export interface ShareData {
  name: string
  content: string
  version?: string
}

export interface ShareOptions {
  compress?: boolean
}

/**
 * Generate a shareable URL for a contract
 */
export async function generateShareUrl(
  data: ShareData,
  options: ShareOptions = {}
): Promise<string> {
  const { name, content, version } = data
  const shouldCompress = options.compress ?? content.length > COMPRESSION_THRESHOLD

  // Create the payload
  const payload = JSON.stringify({
    n: name,
    c: content,
    v: version || '1',
  })

  // Encode (with optional compression)
  let encoded: string
  let isCompressed = false

  if (shouldCompress) {
    try {
      encoded = await compressString(payload)
      isCompressed = true
    } catch {
      // Fallback to simple encoding
      encoded = simpleEncode(payload)
    }
  } else {
    encoded = simpleEncode(payload)
  }

  // Build the URL using hash params (avoids server issues)
  const base = typeof window !== 'undefined'
    ? `${window.location.origin}/ide`
    : '/ide'

  // Use hash params for client-side only handling
  const params = new URLSearchParams()
  params.set('code', encoded)
  if (isCompressed) params.set('z', '1') // z = compressed flag

  return `${base}#share?${params.toString()}`
}

/**
 * Parse a share URL and extract the contract data
 */
export async function parseShareUrl(url: string): Promise<ShareData | null> {
  try {
    // Handle hash-based params (#share?code=...)
    const hashIndex = url.indexOf('#share?')
    if (hashIndex === -1) return null

    const paramString = url.substring(hashIndex + 7) // After '#share?'
    const params = new URLSearchParams(paramString)

    const encoded = params.get('code')
    if (!encoded) return null

    const isCompressed = params.get('z') === '1'

    // Decode
    let payload: string
    if (isCompressed) {
      payload = await decompressString(encoded)
    } else {
      payload = simpleDecode(encoded)
    }

    // Parse JSON
    const data = JSON.parse(payload)

    return {
      name: data.n || 'Shared.sol',
      content: data.c || '',
      version: data.v || '1',
    }
  } catch (error) {
    console.error('Failed to parse share URL:', error)
    return null
  }
}

/**
 * Parse share params from window.location (for initial load)
 */
export async function parseShareFromLocation(): Promise<ShareData | null> {
  if (typeof window === 'undefined') return null

  const hash = window.location.hash
  if (!hash.startsWith('#share?')) return null

  return parseShareUrl(window.location.href)
}

/**
 * Copy text to clipboard with fallback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }

    // Fallback for older browsers
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.left = '-9999px'
    document.body.appendChild(textarea)
    textarea.select()

    try {
      document.execCommand('copy')
      return true
    } finally {
      document.body.removeChild(textarea)
    }
  } catch {
    return false
  }
}

/**
 * Clear share params from URL without reloading
 */
export function clearShareFromUrl(): void {
  if (typeof window === 'undefined') return

  const url = new URL(window.location.href)
  if (url.hash.startsWith('#share?')) {
    window.history.replaceState(null, '', url.pathname)
  }
}

/**
 * Check if current URL has share params
 */
export function hasShareParams(): boolean {
  if (typeof window === 'undefined') return false
  return window.location.hash.startsWith('#share?')
}

/**
 * Get estimated URL length (for UI feedback)
 */
export function estimateUrlLength(content: string, name: string): number {
  // Rough estimate: base64 is ~1.37x original, plus URL overhead
  const payload = JSON.stringify({ n: name, c: content, v: '1' })
  const base64Length = Math.ceil(payload.length * 1.37)
  const urlOverhead = 50 // /ide#share?code=...
  return base64Length + urlOverhead
}

/**
 * Check if content is too large to share
 * Most browsers support URLs up to ~2000 chars easily, up to ~8000 with issues
 */
export function isContentTooLarge(content: string, name: string): boolean {
  // With compression, we can handle larger content
  // But let's set a reasonable limit of ~100KB uncompressed
  return content.length > 100000
}
