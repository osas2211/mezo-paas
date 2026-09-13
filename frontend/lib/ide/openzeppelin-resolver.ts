/**
 * OpenZeppelin Import Resolver for Mezo IDE
 *
 * Resolves @openzeppelin imports by fetching source code from CDN.
 * Caches fetched contracts to avoid repeated network requests.
 */

// OpenZeppelin version to use (matching solidity 0.8.20+)
const OZ_VERSION = "5.0.2"

// CDN base URL for fetching OpenZeppelin contracts
const OZ_CDN_BASE = `https://cdn.jsdelivr.net/npm/@openzeppelin/contracts@${OZ_VERSION}`

// Import resolution cache (persists across compilations)
const importCache = new Map<string, string>()

// Track in-flight requests to avoid duplicate fetches
const pendingFetches = new Map<string, Promise<string>>()

/**
 * Parse import statements from Solidity source code
 * Returns an array of import paths (e.g., "@openzeppelin/contracts/token/ERC20/ERC20.sol")
 */
export function parseImports(source: string): string[] {
  const imports: string[] = []

  // Match various import syntaxes:
  // import "path";
  // import { A, B } from "path";
  // import * as X from "path";
  // import "path" as X;
  const importRegex = /import\s+(?:(?:\{[^}]*\}|[\w*]+(?:\s+as\s+\w+)?)\s+from\s+)?["']([^"']+)["']\s*;/g

  let match
  while ((match = importRegex.exec(source)) !== null) {
    imports.push(match[1])
  }

  return imports
}

/**
 * Check if an import path is an OpenZeppelin import
 */
export function isOpenZeppelinImport(importPath: string): boolean {
  return importPath.startsWith("@openzeppelin/")
}

/**
 * Convert OpenZeppelin import path to CDN URL
 * @example "@openzeppelin/contracts/token/ERC20/ERC20.sol" -> CDN URL
 */
function getOpenZeppelinCdnUrl(importPath: string): string {
  // Remove the @openzeppelin/contracts prefix and get the path
  const contractPath = importPath.replace("@openzeppelin/contracts/", "")
  return `${OZ_CDN_BASE}/${contractPath}`
}

/**
 * Fetch a single OpenZeppelin contract source from CDN
 */
async function fetchOpenZeppelinSource(importPath: string): Promise<string> {
  // Check cache first
  if (importCache.has(importPath)) {
    return importCache.get(importPath)!
  }

  // Check if we're already fetching this
  if (pendingFetches.has(importPath)) {
    return pendingFetches.get(importPath)!
  }

  const url = getOpenZeppelinCdnUrl(importPath)

  const fetchPromise = (async () => {
    try {
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Failed to fetch ${importPath}: ${response.status} ${response.statusText}`)
      }

      const source = await response.text()

      // Cache the result
      importCache.set(importPath, source)
      pendingFetches.delete(importPath)

      return source
    } catch (error) {
      pendingFetches.delete(importPath)
      throw error
    }
  })()

  pendingFetches.set(importPath, fetchPromise)
  return fetchPromise
}

/**
 * Resolve relative import path to absolute path
 * @example ("./IERC20.sol", "@openzeppelin/contracts/token/ERC20/ERC20.sol")
 *          -> "@openzeppelin/contracts/token/ERC20/IERC20.sol"
 */
function resolveRelativePath(importPath: string, fromPath: string): string {
  if (!importPath.startsWith("./") && !importPath.startsWith("../")) {
    // Absolute import, return as-is
    return importPath
  }

  // Get directory of the importing file
  const fromDir = fromPath.substring(0, fromPath.lastIndexOf("/"))

  // Split paths into parts
  const importParts = importPath.split("/")
  const fromParts = fromDir.split("/")

  // Process relative path
  for (const part of importParts) {
    if (part === ".") {
      // Current directory, skip
      continue
    } else if (part === "..") {
      // Parent directory, go up
      fromParts.pop()
    } else {
      // Normal path segment
      fromParts.push(part)
    }
  }

  return fromParts.join("/")
}

/**
 * Recursively resolve all imports for a source file
 * Returns a map of import paths to their source code
 */
export async function resolveAllImports(
  source: string,
  fileName: string = "main.sol",
  resolved: Map<string, string> = new Map(),
  visited: Set<string> = new Set()
): Promise<Map<string, string>> {
  // Avoid infinite loops
  if (visited.has(fileName)) {
    return resolved
  }
  visited.add(fileName)

  // Parse imports from this source
  const imports = parseImports(source)

  // Process each import
  for (const importPath of imports) {
    // Resolve relative paths
    const absolutePath = importPath.startsWith("./") || importPath.startsWith("../")
      ? resolveRelativePath(importPath, fileName)
      : importPath

    // Skip if already resolved
    if (resolved.has(absolutePath)) {
      continue
    }

    // Only handle OpenZeppelin imports
    if (!isOpenZeppelinImport(absolutePath)) {
      // For local imports, check if it's in our resolved map with a different name
      continue
    }

    try {
      // Fetch the source
      const importSource = await fetchOpenZeppelinSource(absolutePath)
      resolved.set(absolutePath, importSource)

      // Recursively resolve imports in the fetched source
      await resolveAllImports(importSource, absolutePath, resolved, visited)
    } catch (error) {
      console.error(`Failed to resolve import: ${absolutePath}`, error)
      throw new Error(`Failed to resolve import: ${absolutePath}. ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return resolved
}

/**
 * Main entry point: Resolve all imports and return sources map for solc
 * @param mainSource - The main contract source code
 * @param mainFileName - The name of the main file
 * @returns Object mapping file paths to source content for solc input
 */
export async function resolveImportsForCompilation(
  mainSource: string,
  mainFileName: string = "Contract.sol"
): Promise<Record<string, { content: string }>> {
  const sources: Record<string, { content: string }> = {
    [mainFileName]: { content: mainSource }
  }

  try {
    // Resolve all imports recursively
    const resolvedImports = await resolveAllImports(mainSource, mainFileName)

    // Add resolved imports to sources
    for (const [path, content] of resolvedImports) {
      sources[path] = { content }
    }
  } catch (error) {
    // Re-throw with more context
    throw error
  }

  return sources
}

/**
 * Check if source code has any OpenZeppelin imports
 */
export function hasOpenZeppelinImports(source: string): boolean {
  const imports = parseImports(source)
  return imports.some(isOpenZeppelinImport)
}

/**
 * Get a list of OpenZeppelin imports in the source
 */
export function getOpenZeppelinImports(source: string): string[] {
  return parseImports(source).filter(isOpenZeppelinImport)
}

/**
 * Clear the import cache (useful for testing or forcing refresh)
 */
export function clearImportCache(): void {
  importCache.clear()
  pendingFetches.clear()
}

/**
 * Pre-warm the cache with commonly used OpenZeppelin contracts
 * Call this on IDE initialization to speed up first compilations
 */
export async function preloadCommonContracts(): Promise<void> {
  const commonContracts = [
    "@openzeppelin/contracts/token/ERC20/ERC20.sol",
    "@openzeppelin/contracts/token/ERC20/IERC20.sol",
    "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol",
    "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol",
    "@openzeppelin/contracts/token/ERC721/ERC721.sol",
    "@openzeppelin/contracts/access/Ownable.sol",
    "@openzeppelin/contracts/utils/ReentrancyGuard.sol",
    "@openzeppelin/contracts/utils/Context.sol",
    "@openzeppelin/contracts/interfaces/draft-IERC6093.sol",
  ]

  // Fetch in parallel but don't block on failures
  await Promise.allSettled(
    commonContracts.map(contract => fetchOpenZeppelinSource(contract))
  )
}

/**
 * Get current cache size for debugging/stats
 */
export function getCacheStats(): { size: number; entries: string[] } {
  return {
    size: importCache.size,
    entries: Array.from(importCache.keys())
  }
}
