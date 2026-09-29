"use client"

import { useState, useCallback, useRef } from "react"
import type { CompilerSettings, VerificationStatus, VerificationResult } from "@/types/ide"
import { MEZO_NETWORKS } from "@/types/ide"
import {
  submitVerification,
  checkVerificationStatus,
  getContractStatus,
  getFullSolcVersion,
  encodeConstructorArgsHex,
} from "@/lib/ide/verification"

export interface UseVerificationOptions {
  onSuccess?: (result: VerificationResult) => void
  onError?: (error: string) => void
  pollInterval?: number
  maxPollAttempts?: number
}

export interface UseVerificationReturn {
  status: VerificationStatus
  result: VerificationResult | null
  error: string | null
  isVerifying: boolean
  verify: (params: VerifyParams) => Promise<VerificationResult>
  checkStatus: (chainId: number, guid: string) => Promise<VerificationResult>
  reset: () => void
}

export interface VerifyParams {
  contractAddress: string
  contractName: string
  sourceCode: string
  abi: any[]
  compilerVersion: string
  optimizationUsed: boolean
  runs: number
  constructorArgs?: any[]
  chainId: number
  sources?: Record<string, { content: string }> // Resolved sources for Standard JSON
  mainFileName?: string // Main file name for multi-file verification
  compilerSettings?: CompilerSettings // Exact settings used at compile time
}

const INDEX_POLL_INTERVAL = 3000
const INDEX_MAX_ATTEMPTS = 40 // ~2 minutes for the explorer to index a new contract

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export function useVerification(
  options: UseVerificationOptions = {}
): UseVerificationReturn {
  const {
    onSuccess,
    onError,
    pollInterval = 5000,
    maxPollAttempts = 36, // ~3 minutes for the verifier to finish
  } = options

  const [status, setStatus] = useState<VerificationStatus>("idle")
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pollCountRef = useRef(0)

  // Cleanup polling on unmount
  const clearPolling = useCallback(() => {
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current)
      pollTimeoutRef.current = null
    }
    pollCountRef.current = 0
  }, [])

  const reset = useCallback(() => {
    clearPolling()
    setStatus("idle")
    setResult(null)
    setError(null)
  }, [clearPolling])

  const checkStatus = useCallback(
    async (chainId: number, guid: string): Promise<VerificationResult> => {
      const checkResult = await checkVerificationStatus(chainId, guid)
      setResult(checkResult)

      if (checkResult.status === "verified") {
        setStatus("verified")
        onSuccess?.(checkResult)
      } else if (checkResult.status === "failed") {
        setStatus("failed")
        setError(checkResult.message || "Verification failed")
        onError?.(checkResult.message || "Verification failed")
      }

      return checkResult
    },
    [onSuccess, onError]
  )

  const pollVerificationStatus = useCallback(
    (chainId: number, guid: string) => {
      const poll = async () => {
        pollCountRef.current++

        if (pollCountRef.current > maxPollAttempts) {
          const network = chainId === 31611 ? "testnet" : "mainnet"
          const timeoutMessage =
            "The explorer didn't confirm verification in time. It may still complete — check the explorer, or retry."
          setStatus("failed")
          setResult({
            success: false,
            status: "failed",
            message: timeoutMessage,
            explorerUrl: `${MEZO_NETWORKS[network].explorerUrl}/address/${guid}`,
          })
          setError(timeoutMessage)
          onError?.(timeoutMessage)
          return
        }

        const checkResult = await checkVerificationStatus(chainId, guid)

        if (checkResult.status === "verified") {
          setStatus("verified")
          setResult(checkResult)
          onSuccess?.(checkResult)
          return
        }

        if (checkResult.status === "failed") {
          setStatus("failed")
          setResult(checkResult)
          setError(checkResult.message || "Verification failed")
          onError?.(checkResult.message || "Verification failed")
          return
        }

        // Still pending, continue polling
        pollTimeoutRef.current = setTimeout(poll, pollInterval)
      }

      pollTimeoutRef.current = setTimeout(poll, pollInterval)
    },
    [pollInterval, maxPollAttempts, onSuccess, onError]
  )

  const verify = useCallback(
    async (params: VerifyParams): Promise<VerificationResult> => {
      reset()
      setStatus("indexing")

      const network = params.chainId === 31611 ? "testnet" : "mainnet"
      const addressUrl = `${MEZO_NETWORKS[network].explorerUrl}/address/${params.contractAddress}`

      try {
        // Wait until the explorer has indexed the freshly deployed contract —
        // Blockscout rejects verification for addresses it doesn't know yet.
        let explorerStatus = await getContractStatus(params.chainId, params.contractAddress)
        for (let attempt = 1; !explorerStatus.exists && attempt < INDEX_MAX_ATTEMPTS; attempt++) {
          await sleep(INDEX_POLL_INTERVAL)
          explorerStatus = await getContractStatus(params.chainId, params.contractAddress)
        }

        if (explorerStatus.isVerified) {
          const successResult: VerificationResult = {
            success: true,
            status: "verified",
            message: "Contract is already verified!",
            explorerUrl: addressUrl,
          }
          setStatus("verified")
          setResult(successResult)
          onSuccess?.(successResult)
          return successResult
        }

        if (!explorerStatus.exists) {
          const message =
            "The explorer hasn't indexed this contract yet. Wait a minute and retry verification."
          const failedResult: VerificationResult = {
            success: false,
            status: "failed",
            message,
            explorerUrl: addressUrl,
          }
          setStatus("failed")
          setResult(failedResult)
          setError(message)
          onError?.(message)
          return failedResult
        }

        setStatus("submitting")

        // Full compiler version (the compile result already carries it)
        const fullVersion = params.compilerVersion.startsWith("v")
          ? params.compilerVersion
          : getFullSolcVersion(params.compilerVersion)

        // Encode constructor arguments if present (otherwise the explorer autodetects them)
        let constructorArgsHex = ""
        if (params.constructorArgs && params.constructorArgs.length > 0) {
          constructorArgsHex = encodeConstructorArgsHex(params.abi, params.constructorArgs)
        }

        // Flattened fallback uses the exact compiled source, unmodified
        const mainSource =
          (params.mainFileName && params.sources?.[params.mainFileName]?.content) ||
          params.sourceCode

        const submitResult = await submitVerification({
          contractAddress: params.contractAddress,
          contractName: params.contractName,
          sourceCode: mainSource,
          compilerVersion: fullVersion,
          optimizationUsed: params.compilerSettings?.optimizer.enabled ?? params.optimizationUsed,
          runs: params.compilerSettings?.optimizer.runs ?? params.runs,
          constructorArguments: constructorArgsHex,
          chainId: params.chainId,
          sources: params.sources ?? { [params.mainFileName || `${params.contractName}.sol`]: { content: params.sourceCode } },
          mainFileName: params.mainFileName,
          compilerSettings: params.compilerSettings,
        })

        setResult(submitResult)

        if (submitResult.status === "verified") {
          setStatus("verified")
          onSuccess?.(submitResult)
          return submitResult
        }

        if (submitResult.status === "pending" && submitResult.guid) {
          setStatus("pending")
          // Start polling for status
          pollVerificationStatus(params.chainId, submitResult.guid)
          return submitResult
        }

        if (submitResult.status === "failed") {
          setStatus("failed")
          setError(submitResult.message || "Verification failed")
          onError?.(submitResult.message || "Verification failed")
          return submitResult
        }

        return submitResult
      } catch (err: any) {
        const errorMessage = err.message || "Verification failed"
        setStatus("failed")
        setError(errorMessage)
        onError?.(errorMessage)

        return {
          success: false,
          status: "failed",
          message: errorMessage,
        }
      }
    },
    [reset, pollVerificationStatus, onSuccess, onError]
  )

  return {
    status,
    result,
    error,
    isVerifying: status === "indexing" || status === "submitting" || status === "pending",
    verify,
    checkStatus,
    reset,
  }
}
