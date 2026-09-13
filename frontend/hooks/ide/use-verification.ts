"use client"

import { useState, useCallback, useRef } from "react"
import type { VerificationStatus, VerificationResult } from "@/types/ide"
import {
  submitVerification,
  checkVerificationStatus,
  isContractVerified,
  flattenSource,
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
}

export function useVerification(
  options: UseVerificationOptions = {}
): UseVerificationReturn {
  const {
    onSuccess,
    onError,
    pollInterval = 3000,
    maxPollAttempts = 20,
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
          setStatus("failed")
          setError("Verification timed out. Check explorer manually.")
          onError?.("Verification timed out")
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
      setStatus("flattening")

      try {
        // Check if already verified
        const alreadyVerified = await isContractVerified(
          params.chainId,
          params.contractAddress
        )

        if (alreadyVerified) {
          const network = params.chainId === 31611 ? "testnet" : "mainnet"
          const successResult: VerificationResult = {
            success: true,
            status: "verified",
            message: "Contract is already verified!",
            explorerUrl: `https://explorer${params.chainId === 31611 ? ".test" : ""}.mezo.org/address/${params.contractAddress}`,
          }
          setStatus("verified")
          setResult(successResult)
          onSuccess?.(successResult)
          return successResult
        }

        setStatus("submitting")

        // Get full compiler version
        const fullVersion = getFullSolcVersion(params.compilerVersion)

        // Encode constructor arguments if present
        let constructorArgsHex = ""
        if (params.constructorArgs && params.constructorArgs.length > 0) {
          constructorArgsHex = encodeConstructorArgsHex(params.abi, params.constructorArgs)
        }

        // Determine if we have multiple sources (OpenZeppelin imports)
        const hasMultipleSources = params.sources && Object.keys(params.sources).length > 1

        // Flatten source code for single-file contracts only
        const flattenedSource = hasMultipleSources
          ? params.sourceCode
          : flattenSource(params.sourceCode, `${params.contractName}.sol`)

        // Submit verification with all parameters
        const submitResult = await submitVerification({
          contractAddress: params.contractAddress,
          contractName: params.contractName,
          sourceCode: flattenedSource,
          compilerVersion: fullVersion,
          optimizationUsed: params.optimizationUsed,
          runs: params.runs,
          constructorArguments: constructorArgsHex,
          chainId: params.chainId,
          sources: params.sources,
          mainFileName: params.mainFileName,
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
    isVerifying: status === "flattening" || status === "submitting" || status === "pending",
    verify,
    checkStatus,
    reset,
  }
}
