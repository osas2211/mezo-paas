import { NextRequest, NextResponse } from "next/server"

// Explorer URLs
const getExplorerUrl = (chainId: number): string => {
  if (chainId === 31611) {
    return "https://explorer.test.mezo.org"
  }
  if (chainId === 31612) {
    return "https://explorer.mezo.org"
  }
  throw new Error(`Unsupported chain ID: ${chainId}`)
}

// Build Standard JSON input for Blockscout
function buildStandardJsonInput(
  sources: Record<string, { content: string }>,
  optimize: boolean,
  runs: number
): string {
  const input = {
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
  return JSON.stringify(input)
}

// Try Standard JSON verification (for multi-file contracts with imports)
async function tryStandardJsonVerification(
  explorerUrl: string,
  contractAddress: string,
  contractName: string,
  sources: Record<string, { content: string }>,
  mainFileName: string,
  compilerVersion: string,
  optimizationUsed: boolean,
  runs: number,
  constructorArguments?: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  const apiUrl = `${explorerUrl}/api/v2/smart-contracts/${contractAddress}/verification/via/standard-input`

  try {
    // Build the Standard JSON input
    const standardJsonInput = buildStandardJsonInput(sources, optimizationUsed, runs)

    // Create form data for multipart request (Blockscout prefers this for large payloads)
    const formData = new FormData()
    formData.append("compiler_version", compilerVersion)
    formData.append("contract_name", `${mainFileName}:${contractName}`)
    formData.append("license_type", "mit")
    formData.append("autodetect_constructor_args", constructorArguments ? "false" : "true")
    if (constructorArguments) {
      formData.append("constructor_args", constructorArguments)
    }
    // Append the JSON input as a file-like blob
    const jsonBlob = new Blob([standardJsonInput], { type: "application/json" })
    formData.append("files[0]", jsonBlob, "input.json")

    const response = await fetch(apiUrl, {
      method: "POST",
      body: formData,
    })

    const contentType = response.headers.get("content-type")
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json()
      if (response.ok || data.status === "1" || data.message === "OK" || data.is_verified) {
        return { success: true, data }
      }
      return { success: false, error: data.message || "Standard JSON verification failed" }
    }
    return { success: false, error: "Invalid response from verification API" }
  } catch (e: any) {
    console.log(`Standard JSON verification error:`, e.message)
    return { success: false, error: e.message }
  }
}

// Try flattened source verification (for single-file contracts)
async function tryFlattenedVerification(
  explorerUrl: string,
  contractAddress: string,
  contractName: string,
  sourceCode: string,
  compilerVersion: string,
  optimizationUsed: boolean,
  runs: number,
  constructorArguments?: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  const apiPaths = [
    `${explorerUrl}/api/v2/smart-contracts/${contractAddress}/verification/via/flattened-code`,
    `${explorerUrl}/api/v2/smart-contracts/${contractAddress}/verification/via/sourcify`,
  ]

  for (const apiUrl of apiPaths) {
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          compiler_version: compilerVersion,
          source_code: sourceCode,
          is_optimization_enabled: optimizationUsed,
          optimization_runs: runs,
          contract_name: contractName,
          license_type: "mit",
          autodetect_constructor_args: !constructorArguments,
          constructor_args: constructorArguments || undefined,
        }),
      })

      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json()
        if (response.ok || data.status === "1" || data.message === "OK" || data.is_verified) {
          return { success: true, data }
        }
      }
    } catch (e: any) {
      console.log(`API ${apiUrl} error:`, e.message)
    }
  }

  return { success: false, error: "All flattened verification methods failed" }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      contractAddress,
      contractName,
      sourceCode,
      sources, // For Standard JSON verification
      mainFileName,
      verificationMethod,
      compilerVersion,
      optimizationUsed,
      runs,
      constructorArguments,
      chainId,
    } = body

    if (!contractAddress || !contractName || !chainId) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      )
    }

    // Need either sourceCode or sources
    if (!sourceCode && !sources) {
      return NextResponse.json(
        { success: false, message: "Missing source code or sources" },
        { status: 400 }
      )
    }

    const explorerUrl = getExplorerUrl(chainId)
    const verifyPageUrl = `${explorerUrl}/address/${contractAddress}/contract-verification`

    let result: { success: boolean; data?: any; error?: string }

    // Try Standard JSON verification first if we have multi-file sources
    if (verificationMethod === "standard-json" && sources && Object.keys(sources).length > 0) {
      console.log(`Attempting Standard JSON verification for ${contractName}...`)
      result = await tryStandardJsonVerification(
        explorerUrl,
        contractAddress,
        contractName,
        sources,
        mainFileName || Object.keys(sources)[0],
        compilerVersion,
        optimizationUsed,
        runs,
        constructorArguments
      )

      if (result.success) {
        return NextResponse.json({
          success: true,
          status: "verified",
          message: "Contract verified successfully via Standard JSON!",
          data: result.data,
        })
      }

      console.log(`Standard JSON failed: ${result.error}, trying flattened...`)
    }

    // Fall back to flattened verification
    if (sourceCode) {
      console.log(`Attempting flattened verification for ${contractName}...`)
      result = await tryFlattenedVerification(
        explorerUrl,
        contractAddress,
        contractName,
        sourceCode,
        compilerVersion,
        optimizationUsed,
        runs,
        constructorArguments
      )

      if (result.success) {
        return NextResponse.json({
          success: true,
          status: "verified",
          message: "Contract verified successfully!",
          data: result.data,
        })
      }
    }

    // If all API verification fails, return manual verification instructions
    return NextResponse.json({
      success: false,
      status: "manual",
      message: "Automatic verification not available. Please verify manually on the explorer.",
      verifyUrl: verifyPageUrl,
      verificationData: {
        contractName,
        compilerVersion,
        optimizationUsed,
        runs,
      },
    })
  } catch (error: any) {
    console.error("Verification API error:", error)
    return NextResponse.json(
      {
        success: false,
        status: "failed",
        message: error.message || "Internal server error",
      },
      { status: 500 }
    )
  }
}

// Check verification status
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
    const explorerUrl = getExplorerUrl(chainId)

    // Check if contract is verified using Blockscout v2 API
    const response = await fetch(`${explorerUrl}/api/v2/smart-contracts/${address}`)

    if (!response.ok) {
      return NextResponse.json({
        success: true,
        isVerified: false,
      })
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      isVerified: data.is_verified === true,
      name: data.name,
      compilerVersion: data.compiler_version,
    })
  } catch (error: any) {
    console.error("Check verification error:", error)
    return NextResponse.json({
      success: false,
      isVerified: false,
      message: error.message,
    })
  }
}
