"use client"

import { useState, useCallback } from "react"
import type { CompilationResult, CompilerStatus } from "@/types/ide"
import {
  resolveImportsForCompilation,
  hasOpenZeppelinImports,
  preloadCommonContracts,
} from "@/lib/ide/openzeppelin-resolver"

// Solc version to use
const SOLC_VERSION = "v0.8.28+commit.7893614a"
const SOLC_CDN_URL = `https://binaries.soliditylang.org/bin/soljson-${SOLC_VERSION}.js`

interface SolcInput {
  language: "Solidity"
  sources: {
    [fileName: string]: {
      content: string
    }
  }
  settings: {
    optimizer: {
      enabled: boolean
      runs: number
    }
    outputSelection: {
      [fileName: string]: {
        [contractName: string]: string[]
      }
    }
  }
}

// Pre-load common contracts on module load (client-side only)
if (typeof window !== "undefined") {
  preloadCommonContracts().catch(console.error)
}

// We'll load solc dynamically from CDN using a web worker
let solcWorker: Worker | null = null
let solcLoadPromise: Promise<Worker> | null = null

async function loadSolcWorker(): Promise<Worker> {
  if (solcWorker) return solcWorker
  if (solcLoadPromise) return solcLoadPromise

  solcLoadPromise = new Promise((resolve, reject) => {
    // Create an inline worker that loads solc
    const workerCode = `
      let solc = null;
      let isReady = false;

      function initCompiler() {
        if (isReady) return;
        try {
          if (typeof Module !== 'undefined' && Module.cwrap) {
            solc = {
              compile: Module.cwrap('solidity_compile', 'string', ['string', 'number', 'number'])
            };
            isReady = true;
            postMessage({ type: 'ready' });
          }
        } catch (e) {
          // Module not ready yet
        }
      }

      // Load solc from CDN
      try {
        importScripts('${SOLC_CDN_URL}');
      } catch (e) {
        postMessage({ type: 'error', error: 'Failed to load Solidity compiler from CDN' });
      }

      // Try to init immediately (Module might be sync)
      initCompiler();

      // Also set up callback for async init
      if (typeof Module !== 'undefined' && !isReady) {
        if (Module.onRuntimeInitialized) {
          const originalCallback = Module.onRuntimeInitialized;
          Module.onRuntimeInitialized = function() {
            originalCallback();
            initCompiler();
          };
        } else {
          Module.onRuntimeInitialized = initCompiler;
        }

        // Also poll as fallback
        let pollCount = 0;
        const pollInterval = setInterval(function() {
          pollCount++;
          if (isReady || pollCount > 100) {
            clearInterval(pollInterval);
            if (!isReady) {
              postMessage({ type: 'error', error: 'Compiler initialization timeout' });
            }
          } else {
            initCompiler();
          }
        }, 100);
      }

      self.onmessage = function(e) {
        if (e.data.type === 'compile') {
          if (!solc) {
            postMessage({ type: 'error', error: 'Compiler not ready. Please wait and try again.' });
            return;
          }
          try {
            const result = solc.compile(e.data.input, 0, 0);
            postMessage({ type: 'result', result: result });
          } catch (err) {
            postMessage({ type: 'error', error: err.message || 'Compilation failed' });
          }
        }
      };
    `;

    const blob = new Blob([workerCode], { type: "application/javascript" })
    const worker = new Worker(URL.createObjectURL(blob))

    const timeout = setTimeout(() => {
      solcLoadPromise = null
      reject(new Error("Compiler load timeout. Please refresh and try again."))
    }, 60000)

    worker.onmessage = (e) => {
      if (e.data.type === "ready") {
        clearTimeout(timeout)
        solcWorker = worker
        resolve(worker)
      } else if (e.data.type === "error") {
        clearTimeout(timeout)
        solcLoadPromise = null
        reject(new Error(e.data.error))
      }
    }

    worker.onerror = (e) => {
      clearTimeout(timeout)
      solcLoadPromise = null
      reject(new Error(`Worker error: ${e.message || 'Unknown error'}`))
    }
  })

  return solcLoadPromise
}

async function compileWithWorker(input: string): Promise<string> {
  const worker = await loadSolcWorker()

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("Compilation timeout"))
    }, 60000)

    const handler = (e: MessageEvent) => {
      if (e.data.type === "result") {
        clearTimeout(timeout)
        worker.removeEventListener("message", handler)
        resolve(e.data.result)
      } else if (e.data.type === "error") {
        clearTimeout(timeout)
        worker.removeEventListener("message", handler)
        reject(new Error(e.data.error))
      }
    }

    worker.addEventListener("message", handler)
    worker.postMessage({ type: "compile", input })
  })
}

export function useCompiler() {
  const [status, setStatus] = useState<CompilerStatus>("idle")
  const [result, setResult] = useState<CompilationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Compile contract
  const compile = useCallback(
    async (
      source: string,
      fileName: string = "Contract.sol",
      optimize: boolean = true,
      runs: number = 200
    ): Promise<CompilationResult> => {
      setStatus("compiling")
      setError(null)

      try {
        // Resolve OpenZeppelin imports if present
        let sources: Record<string, { content: string }> = {
          [fileName]: { content: source }
        }

        if (hasOpenZeppelinImports(source)) {
          setStatus("resolving") // Show resolving while fetching imports
          try {
            sources = await resolveImportsForCompilation(source, fileName)
          } catch (importError: any) {
            // Return a helpful error for import resolution failures
            const errorResult: CompilationResult = {
              success: false,
              errors: [
                {
                  severity: "error",
                  message: importError.message || "Failed to resolve OpenZeppelin imports",
                  formattedMessage: `Import Resolution Error: ${importError.message || "Failed to resolve imports"}\n\nTip: Check your internet connection and try again.`,
                },
              ],
            }
            setResult(errorResult)
            setStatus("error")
            setError(importError.message)
            return errorResult
          }
        }

        // Build solc input with all resolved sources
        const input: SolcInput = {
          language: "Solidity",
          sources,
          settings: {
            optimizer: {
              enabled: optimize,
              runs,
            },
            outputSelection: {
              "*": {
                "*": ["abi", "evm.bytecode", "evm.deployedBytecode"],
              },
            },
          },
        }

        // Load solc worker and compile
        setStatus("loading")
        const outputStr = await compileWithWorker(JSON.stringify(input))
        setStatus("compiling")

        const output = JSON.parse(outputStr)

        // Process errors and warnings
        const errors: CompilationResult["errors"] = []
        const warnings: CompilationResult["warnings"] = []

        if (output.errors) {
          for (const err of output.errors) {
            if (err.severity === "error") {
              errors.push({
                severity: "error",
                message: err.message,
                formattedMessage: err.formattedMessage,
                sourceLocation: err.sourceLocation,
              })
            } else if (err.severity === "warning") {
              warnings.push({
                severity: "warning",
                message: err.message,
                formattedMessage: err.formattedMessage,
                sourceLocation: err.sourceLocation,
              })
            }
          }
        }

        // Extract compiled contracts
        const contracts: CompilationResult["contracts"] = []

        if (output.contracts) {
          for (const file of Object.keys(output.contracts)) {
            for (const name of Object.keys(output.contracts[file])) {
              const contract = output.contracts[file][name]
              contracts.push({
                name,
                abi: contract.abi,
                bytecode: contract.evm?.bytecode?.object
                  ? `0x${contract.evm.bytecode.object}`
                  : "",
                deployedBytecode: contract.evm?.deployedBytecode?.object
                  ? `0x${contract.evm.deployedBytecode.object}`
                  : "",
              })
            }
          }
        }

        const compilationResult: CompilationResult = {
          success: errors.length === 0,
          contracts: contracts.length > 0 ? contracts : undefined,
          errors: errors.length > 0 ? errors : undefined,
          warnings: warnings.length > 0 ? warnings : undefined,
          sources, // Include resolved sources for verification
        }

        setResult(compilationResult)
        setStatus(compilationResult.success ? "success" : "error")

        return compilationResult
      } catch (err: any) {
        const errorResult: CompilationResult = {
          success: false,
          errors: [
            {
              severity: "error",
              message: err.message || "Compilation failed",
            },
          ],
        }
        setResult(errorResult)
        setStatus("error")
        setError(err.message)
        return errorResult
      }
    },
    []
  )

  // Simple compile without solc (parse check only)
  const quickCheck = useCallback((source: string): { valid: boolean; issues: string[] } => {
    const issues: string[] = []

    // Check for pragma
    if (!source.includes("pragma solidity")) {
      issues.push("Missing pragma solidity directive")
    }

    // Check for SPDX license
    if (!source.includes("SPDX-License-Identifier")) {
      issues.push("Missing SPDX license identifier")
    }

    // Check for contract definition
    if (!source.match(/contract\s+\w+/)) {
      issues.push("No contract definition found")
    }

    // Check for unbalanced braces
    const openBraces = (source.match(/{/g) || []).length
    const closeBraces = (source.match(/}/g) || []).length
    if (openBraces !== closeBraces) {
      issues.push("Unbalanced curly braces")
    }

    // Check for unbalanced parentheses
    const openParens = (source.match(/\(/g) || []).length
    const closeParens = (source.match(/\)/g) || []).length
    if (openParens !== closeParens) {
      issues.push("Unbalanced parentheses")
    }

    return {
      valid: issues.length === 0,
      issues,
    }
  }, [])

  const reset = useCallback(() => {
    setStatus("idle")
    setResult(null)
    setError(null)
  }, [])

  return {
    status,
    result,
    error,
    isLoading,
    compile,
    quickCheck,
    reset,
  }
}
