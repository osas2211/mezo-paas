import { NextRequest, NextResponse } from "next/server"

/**
 * Contract verification proxy for the Mezo Blockscout explorers.
 *
 * The explorer UI (explorer[.test].mezo.org) and its API are on different
 * hosts — the API lives on api.explorer[.test].mezo.org. Verification is
 * asynchronous in Blockscout: a successful POST only means "verification
 * started"; the result is read back from GET /api/v2/smart-contracts/:address.
 */

interface ExplorerHosts {
  explorerUrl: string // human-facing links
  apiUrl: string // Blockscout REST API
}

const EXPLORERS: Record<number, ExplorerHosts> = {
  31611: {
    explorerUrl: "https://explorer.test.mezo.org",
    apiUrl: "https://api.explorer.test.mezo.org",
  },
  31612: {
    explorerUrl: "https://explorer.mezo.org",
    apiUrl: "https://api.explorer.mezo.org",
  },
}

function getExplorer(chainId: number): ExplorerHosts {
  const hosts = EXPLORERS[chainId]
  if (!hosts) throw new Error(`Unsupported chain ID: ${chainId}`)
  return hosts
}

type SubmitOutcome =
  | { kind: "started" }
  | { kind: "already-verified" }
  | { kind: "rejected"; message: string }
  | { kind: "unavailable"; message: string }

/** Normalise a Blockscout verification POST response */
async function readSubmitResponse(response: Response): Promise<SubmitOutcome> {
  const contentType = response.headers.get("content-type") || ""
  if (!contentType.includes("application/json")) {
    return { kind: "unavailable", message: `Explorer API returned HTTP ${response.status}` }
  }

  const data = await response.json().catch(() => ({}))
  const message: string = data?.message || data?.error || ""

  if (/already verified/i.test(message)) return { kind: "already-verified" }
  if (response.ok) return { kind: "started" }
  return { kind: "rejected", message: message || `Explorer API returned HTTP ${response.status}` }
}

/**
 * Standard JSON input verification — the IDE sends the exact sources and
 * compiler settings it compiled with, so the explorer can reproduce the
 * bytecode byte-for-byte (including the metadata hash).
 */
async function submitStandardInput(
  apiUrl: string,
  params: {
    contractAddress: string
    contractName: string
    compilerVersion: string
    input: object
    constructorArguments?: string
  }
): Promise<SubmitOutcome> {
  const formData = new FormData()
  formData.append("compiler_version", params.compilerVersion)
  formData.append("contract_name", params.contractName)
  formData.append("license_type", "none")
  formData.append("autodetect_constructor_args", params.constructorArguments ? "false" : "true")
  if (params.constructorArguments) {
    formData.append("constructor_args", params.constructorArguments)
  }
  formData.append(
    "files[0]",
    new Blob([JSON.stringify(params.input)], { type: "application/json" }),
    "input.json"
  )

  const response = await fetch(
    `${apiUrl}/api/v2/smart-contracts/${params.contractAddress}/verification/via/standard-input`,
    { method: "POST", body: formData }
  )
  return readSubmitResponse(response)
}

/** Flattened single-file verification (fallback) */
async function submitFlattened(
  apiUrl: string,
  params: {
    contractAddress: string
    contractName: string
    compilerVersion: string
    sourceCode: string
    optimizationUsed: boolean
    runs: number
    evmVersion?: string
    constructorArguments?: string
  }
): Promise<SubmitOutcome> {
  const response = await fetch(
    `${apiUrl}/api/v2/smart-contracts/${params.contractAddress}/verification/via/flattened-code`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        compiler_version: params.compilerVersion,
        source_code: params.sourceCode,
        is_optimization_enabled: params.optimizationUsed,
        optimization_runs: params.runs,
        contract_name: params.contractName,
        evm_version: params.evmVersion || "default",
        license_type: "none",
        autodetect_constructor_args: !params.constructorArguments,
        constructor_args: params.constructorArguments || undefined,
      }),
    }
  )
  return readSubmitResponse(response)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      contractAddress,
      contractName,
      sources,
      compilerSettings,
      sourceCode,
      compilerVersion,
      optimizationUsed,
      runs,
      constructorArguments,
      chainId,
    } = body

    if (!contractAddress || !contractName || !chainId || !compilerVersion) {
      return NextResponse.json(
        { success: false, status: "failed", message: "Missing required fields" },
        { status: 400 }
      )
    }

    if (!sources && !sourceCode) {
      return NextResponse.json(
        { success: false, status: "failed", message: "Missing source code or sources" },
        { status: 400 }
      )
    }

    const { explorerUrl, apiUrl } = getExplorer(chainId)
    const addressUrl = `${explorerUrl}/address/${contractAddress}`
    const verifyPageUrl = `${addressUrl}/contract-verification`

    let outcome: SubmitOutcome = { kind: "unavailable", message: "No verification method attempted" }

    // 1. Standard JSON input with the exact compiler input (preferred)
    if (sources && Object.keys(sources).length > 0) {
      const settings = compilerSettings || {
        optimizer: { enabled: !!optimizationUsed, runs: runs ?? 200 },
      }
      outcome = await submitStandardInput(apiUrl, {
        contractAddress,
        contractName,
        compilerVersion,
        input: { language: "Solidity", sources, settings },
        constructorArguments,
      })
    }

    // 2. Flattened fallback, only when standard input could not be used at all
    if (outcome.kind === "unavailable" && sourceCode) {
      outcome = await submitFlattened(apiUrl, {
        contractAddress,
        contractName,
        compilerVersion,
        sourceCode,
        optimizationUsed: !!optimizationUsed,
        runs: runs ?? 200,
        evmVersion: compilerSettings?.evmVersion,
        constructorArguments,
      })
    }

    switch (outcome.kind) {
      case "already-verified":
        return NextResponse.json({
          success: true,
          status: "verified",
          message: "Contract is already verified.",
          explorerUrl: addressUrl,
        })
      case "started":
        return NextResponse.json({
          success: true,
          status: "pending",
          message: "Verification submitted — waiting for the explorer to confirm...",
          guid: contractAddress,
        })
      case "rejected":
        return NextResponse.json({
          success: false,
          status: "failed",
          message: outcome.message,
          verifyUrl: verifyPageUrl,
        })
      default:
        return NextResponse.json({
          success: false,
          status: "manual",
          message: `Automatic verification is unavailable (${outcome.message}). Please verify manually on the explorer.`,
          verifyUrl: verifyPageUrl,
        })
    }
  } catch (error: any) {
    console.error("Verification API error:", error)
    return NextResponse.json(
      { success: false, status: "failed", message: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * Verification / indexing status.
 * - exists: the explorer has indexed the address as a smart contract
 * - isVerified: source is verified on the explorer
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const chainId = parseInt(searchParams.get("chainId") || "0")
  const address = searchParams.get("address")

  if (!chainId || !address) {
    return NextResponse.json(
      { success: false, message: "Missing chainId or address" },
      { status: 400 }
    )
  }

  try {
    const { apiUrl, explorerUrl } = getExplorer(chainId)
    const response = await fetch(`${apiUrl}/api/v2/smart-contracts/${address}`, {
      cache: "no-store",
    })

    if (!response.ok) {
      return NextResponse.json({ success: true, exists: false, isVerified: false })
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      exists: true,
      isVerified: data.is_verified === true,
      isPartiallyVerified: data.is_partially_verified === true,
      name: data.name,
      compilerVersion: data.compiler_version,
      explorerUrl: `${explorerUrl}/address/${address}`,
    })
  } catch (error: any) {
    console.error("Check verification error:", error)
    return NextResponse.json({
      success: false,
      exists: false,
      isVerified: false,
      message: error.message,
    })
  }
}
