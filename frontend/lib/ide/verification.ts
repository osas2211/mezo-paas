/**
 * Contract Verification Service for Mezo Explorer
 * Handles source code verification after deployment
 * Supports both Standard JSON and flattened source verification
 */

import { MEZO_NETWORKS } from "@/types/ide"
import type { VerificationRequest, VerificationResult } from "@/types/ide"
import { encodeConstructorArgs } from "./abi-utils"

// Solc version mapping (browser solc version to full version string)
const SOLC_VERSION_MAP: Record<string, string> = {
  "0.8.28": "v0.8.28+commit.7893614a",
  "0.8.27": "v0.8.27+commit.40a35a09",
  "0.8.26": "v0.8.26+commit.8a97fa7a",
  "0.8.25": "v0.8.25+commit.b61c2a91",
  "0.8.24": "v0.8.24+commit.e11b9ed9",
  "0.8.23": "v0.8.23+commit.f704f362",
  "0.8.22": "v0.8.22+commit.4fc1097e",
  "0.8.21": "v0.8.21+commit.d9974bed",
  "0.8.20": "v0.8.20+commit.a1b79de6",
  "0.8.19": "v0.8.19+commit.7dd6d404",
  "0.8.18": "v0.8.18+commit.87f61d96",
  "0.8.17": "v0.8.17+commit.8df45f5f",
}

/**
 * Get the full solc version string for explorer verification
 */
export function getFullSolcVersion(shortVersion: string): string {
  return SOLC_VERSION_MAP[shortVersion] || `v${shortVersion}`
}

/**
 * Flatten Solidity source code by resolving local imports
 * Note: This is a simplified flattener for single-file or local imports only.
 * External imports (OpenZeppelin, etc.) should use Standard JSON verification.
 */
export function flattenSource(
  mainSource: string,
  fileName: string,
  allSources?: Record<string, string>
): string {
  // Track already included files to avoid duplicates
  const included = new Set<string>()
  const licenseRegex = /\/\/\s*SPDX-License-Identifier:\s*(.+)/
  const pragmaRegex = /pragma\s+solidity\s+[^;]+;/

  let license = ""
  let pragma = ""
  let flattenedBody = ""

  // Extract license and pragma from main file
  const licenseMatch = mainSource.match(licenseRegex)
  if (licenseMatch) {
    license = licenseMatch[0]
  }

  const pragmaMatch = mainSource.match(pragmaRegex)
  if (pragmaMatch) {
    pragma = pragmaMatch[0]
  }

  // Process the main source
  const processSource = (source: string, file: string): string => {
    if (included.has(file)) return ""
    included.add(file)

    let processed = source

    // Remove license identifier (will add once at top)
    processed = processed.replace(licenseRegex, "")

    // Remove pragma (will add once at top)
    processed = processed.replace(pragmaRegex, "")

    // Handle local imports if we have all sources
    if (allSources) {
      const importRegex = /import\s+["']([^"']+)["'];/g
      let match
      while ((match = importRegex.exec(source)) !== null) {
        const importPath = match[1]
        // Only process local imports (not @openzeppelin, etc.)
        if (!importPath.startsWith("@") && !importPath.startsWith("http")) {
          const importedSource = allSources[importPath]
          if (importedSource) {
            const importedContent = processSource(importedSource, importPath)
            processed = processed.replace(match[0], importedContent)
          }
        }
      }
    }

    // Remove remaining import statements (external deps)
    processed = processed.replace(/import\s+.*?;/g, "")

    return processed.trim()
  }

  flattenedBody = processSource(mainSource, fileName)

  // Combine with single license and pragma at top
  const parts = []
  if (license) parts.push(license)
  if (pragma) parts.push(pragma)
  parts.push("")
  parts.push(flattenedBody)

  return parts.join("\n")
}

/**
 * Encode constructor arguments to ABI hex string (without 0x prefix)
 */
export function encodeConstructorArgsHex(abi: any[], args: any[]): string {
  if (!args || args.length === 0) return ""

  try {
    const encoded = encodeConstructorArgs(abi, args)
    if (encoded) {
      // Remove 0x prefix for Blockscout API
      return encoded.startsWith("0x") ? encoded.slice(2) : encoded
    }
  } catch (error) {
    console.error("Failed to encode constructor args:", error)
  }
  return ""
}

/**
 * Build Standard JSON input for verification
 * This format includes all sources with their imports resolved
 */
export function buildStandardJsonInput(
  sources: Record<string, { content: string }>,
  mainFileName: string,
  optimize: boolean,
  runs: number
): object {
  return {
    language: "Solidity",
    sources,
    settings: {
      optimizer: {
        enabled: optimize,
        runs,
      },
      outputSelection: {
        "*": {
          "*": ["abi", "evm.bytecode", "evm.deployedBytecode", "metadata"],
        },
      },
    },
  }
}

/**
 * Submit contract for verification to Mezo Explorer
 * Uses internal API route to avoid CORS issues
 * Supports both Standard JSON (for multi-file) and flattened (for single-file) verification
 */
export async function submitVerification(
  request: VerificationRequest
): Promise<VerificationResult> {
  try {
    // Determine verification method based on whether we have sources
    const hasMultipleSources = request.sources && Object.keys(request.sources).length > 1

    const requestBody: Record<string, any> = {
      contractAddress: request.contractAddress,
      contractName: request.contractName,
      compilerVersion: request.compilerVersion,
      optimizationUsed: request.optimizationUsed,
      runs: request.runs,
      constructorArguments: request.constructorArguments || "",
      chainId: request.chainId,
    }

    // Use Standard JSON for multi-file contracts (with OpenZeppelin imports)
    if (hasMultipleSources && request.sources) {
      requestBody.verificationMethod = "standard-json"
      requestBody.sources = request.sources
      requestBody.mainFileName = request.mainFileName || Object.keys(request.sources)[0]
    } else {
      // Use flattened source for single-file contracts
      requestBody.verificationMethod = "flattened"
      requestBody.sourceCode = request.sourceCode
    }

    const response = await fetch("/api/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    const data = await response.json()

    const network = request.chainId === 31611 ? "testnet" : "mainnet"

    if (data.success) {
      if (data.status === "verified") {
        return {
          success: true,
          status: "verified",
          message: data.message || "Contract verified successfully!",
          explorerUrl: `${MEZO_NETWORKS[network].explorerUrl}/address/${request.contractAddress}`,
        }
      }

      if (data.status === "pending") {
        return {
          success: true,
          status: "pending",
          message: data.message || "Verification submitted, pending confirmation...",
          guid: data.guid || request.contractAddress,
        }
      }
    }

    // Handle manual verification fallback
    if (data.status === "manual") {
      return {
        success: false,
        status: "failed",
        message: data.message || "Automatic verification not available.",
        explorerUrl: data.verifyUrl || `${MEZO_NETWORKS[network].explorerUrl}/address/${request.contractAddress}/contract-verification`,
      }
    }

    return {
      success: false,
      status: "failed",
      message: data.message || "Verification failed",
    }
  } catch (error: any) {
    console.error("Verification error:", error)
    return {
      success: false,
      status: "failed",
      message: error.message || "Failed to submit verification",
    }
  }
}

/**
 * Check verification status by GUID (for pending verifications)
 */
export async function checkVerificationStatus(
  chainId: number,
  guid: string
): Promise<VerificationResult> {
  // For now, just check if the contract is verified
  // The guid in our case is the contract address
  const verified = await isContractVerified(chainId, guid)

  if (verified) {
    const network = chainId === 31611 ? "testnet" : "mainnet"
    return {
      success: true,
      status: "verified",
      message: "Contract verified successfully!",
      explorerUrl: `${MEZO_NETWORKS[network].explorerUrl}/address/${guid}`,
    }
  }

  return {
    success: true,
    status: "pending",
    message: "Verification still pending...",
    guid,
  }
}

/**
 * Check if a contract is already verified
 * Uses internal API route to avoid CORS issues
 */
export async function isContractVerified(
  chainId: number,
  address: string
): Promise<boolean> {
  try {
    const response = await fetch(
      `/api/verify?chainId=${chainId}&address=${address}`
    )

    if (!response.ok) return false

    const data = await response.json()
    return data.isVerified === true
  } catch {
    return false
  }
}

/**
 * Get source code of a verified contract
 */
export async function getVerifiedSource(
  chainId: number,
  address: string
): Promise<{ name: string; source: string; abi: any[] } | null> {
  try {
    const response = await fetch(
      `/api/verify?chainId=${chainId}&address=${address}`
    )

    if (!response.ok) return null

    const data = await response.json()

    if (!data.isVerified) return null

    return {
      name: data.name || "Unknown",
      source: "", // Source not returned in simple check
      abi: [],
    }
  } catch {
    return null
  }
}
