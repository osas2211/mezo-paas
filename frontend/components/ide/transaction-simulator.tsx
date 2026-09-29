"use client"

import { useEffect, useMemo, useState } from "react"
import { formatEther, formatGwei, isAddress, parseEther } from "viem"
import { CheckCircle2, History, Play, XCircle, Zap } from "lucide-react"
import { useTransactionSimulator } from "@/hooks/ide/use-transaction-simulator"
import { parseInputValue } from "@/lib/ide/abi-utils"
import { networkForChainId } from "@/lib/ide/mezo-network"
import type { SimulationResult } from "@/lib/ide/transaction-simulator"
import type { DeployedContract } from "@/types/ide"
import { formatUSD } from "@/hooks/ide/use-btc-price"
import { EmptyState, Field, IdeButton, IdeModal, Notice, Spinner, StatusPill, ide } from "./ui"

interface TransactionSimulatorProps {
  open: boolean
  onClose: () => void
  deployedContracts: DeployedContract[]
  addLog: (type: "info" | "success" | "warning" | "error", message: string, details?: string) => void
}

const fnKey = (fn: any) => `${fn.name}(${(fn.inputs ?? []).map((i: any) => i.type).join(",")})`

export default function TransactionSimulator({
  open,
  onClose,
  deployedContracts,
  addLog,
}: TransactionSimulatorProps) {
  const sim = useTransactionSimulator()

  const [contractId, setContractId] = useState<string>("")
  const [functionKey, setFunctionKey] = useState<string>("")
  const [args, setArgs] = useState<Record<string, string>>({})
  const [value, setValue] = useState("")
  const [from, setFrom] = useState("")
  const [formError, setFormError] = useState<string | null>(null)

  const contract = deployedContracts.find((c) => c.id === contractId) ?? deployedContracts[0]
  const functions = useMemo(
    () =>
      (contract?.abi ?? [])
        .filter((x: any) => x.type === "function")
        // State-changing functions first — they're what you simulate
        .sort((a: any, b: any) => Number(isRead(a)) - Number(isRead(b))),
    [contract]
  )
  const fn = functions.find((f: any) => fnKey(f) === functionKey) ?? functions[0]
  const isPayable = fn?.stateMutability === "payable"

  // Reset inputs when the contract or function changes
  useEffect(() => {
    setArgs({})
    setValue("")
    setFormError(null)
  }, [contract?.id, fn && fnKey(fn)])

  const run = async () => {
    if (!contract || !fn) return
    setFormError(null)

    let parsedArgs: any[]
    let parsedValue: bigint | undefined
    try {
      parsedArgs = (fn.inputs ?? []).map((input: any, i: number) => parseInputValue(input.type, args[i] ?? ""))
      parsedValue = isPayable && value.trim() ? parseEther(value.trim()) : undefined
      if (from.trim() && !isAddress(from.trim())) throw new Error("Caller must be a valid address")
    } catch (e: any) {
      setFormError(e.message || "Invalid input")
      return
    }

    const result = await sim.simulate({
      contractAddress: contract.address,
      contractName: contract.name,
      abi: contract.abi,
      functionName: fn.name,
      args: parsedArgs,
      value: parsedValue,
      from: from.trim() || undefined,
      chainId: contract.chainId,
    })

    if (result) {
      addLog(
        result.success ? "success" : "warning",
        `Simulated ${contract.name}.${fn.name}(): ${result.success ? "would succeed" : "would revert"}`,
        result.error?.reason ?? undefined
      )
    }
  }

  return (
    <IdeModal open={open} onClose={onClose} title="Transaction Simulator" icon={<Zap />} width={960} bodyClassName="pt-3">
      {deployedContracts.length === 0 ? (
        <EmptyState
          icon={<Zap size={32} />}
          title="No deployed contracts yet"
          caption="Deploy a contract from the Deploy tab, then simulate its functions here without spending gas."
        />
      ) : (
        <div className="grid grid-cols-[340px_minmax(0,1fr)] grid-rows-[minmax(0,1fr)] h-[calc(72vh-1rem)] min-h-[320px] overflow-hidden border border-white/10">
          {/* Form */}
          <div className="flex flex-col min-h-0 border-r border-white/10">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <Field label="Contract">
                <select
                  value={contract?.id}
                  onChange={(e) => {
                    setContractId(e.target.value)
                    setFunctionKey("")
                  }}
                  className={ide.input}
                >
                  {deployedContracts.map((c) => (
                    <option key={c.id} value={c.id} className="bg-dark">
                      {c.name} · {networkForChainId(c.chainId) ?? `chain ${c.chainId}`} · {c.address.slice(0, 6)}…{c.address.slice(-4)}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Function">
                <select value={fn ? fnKey(fn) : ""} onChange={(e) => setFunctionKey(e.target.value)} className={ide.inputMono}>
                  {functions.map((f: any) => (
                    <option key={fnKey(f)} value={fnKey(f)} className="bg-dark">
                      {fnKey(f)}
                      {isRead(f) ? "  · view" : f.stateMutability === "payable" ? "  · payable" : ""}
                    </option>
                  ))}
                </select>
              </Field>

              {fn?.inputs?.map((input: any, i: number) => (
                <Field
                  key={`${fnKey(fn)}-${i}`}
                  label={
                    <>
                      {input.name || `arg${i}`}
                      <span className="normal-case tracking-normal font-mono text-white/30">{input.type}</span>
                    </>
                  }
                >
                  <input
                    value={args[i] ?? ""}
                    onChange={(e) => setArgs((prev) => ({ ...prev, [i]: e.target.value }))}
                    placeholder={input.type}
                    className={ide.inputMono}
                  />
                </Field>
              ))}

              {isPayable && (
                <Field label="Value (BTC)">
                  <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="0.0" className={ide.inputMono} />
                </Field>
              )}

              <Field
                label="Simulate as"
                hint={sim.connectedAddress ? "Defaults to your connected wallet." : "Optional. Any address works — nothing is signed."}
              >
                <input
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  placeholder={sim.connectedAddress ?? "0x… (optional)"}
                  className={ide.inputMono}
                />
              </Field>

              {formError && <Notice tone="error">{formError}</Notice>}
            </div>

            <div className="p-4 border-t border-white/10">
              <IdeButton
                variant="primary"
                size="md"
                block
                icon={<Play size={14} />}
                loading={sim.status === "simulating"}
                onClick={run}
                disabled={!fn}
              >
                {sim.status === "simulating" ? "Simulating…" : "Simulate"}
              </IdeButton>
            </div>
          </div>

          {/* Result + history */}
          <div className="flex flex-col min-h-0 min-w-0">
            <div className="flex-1 overflow-y-auto">
              {sim.status === "simulating" ? (
                <div className="h-full flex items-center justify-center gap-2 text-xs text-white/40">
                  <Spinner size={14} /> Running eth_call…
                </div>
              ) : sim.error ? (
                <div className="p-5">
                  <Notice tone="error" title="Couldn't reach the network">{sim.error}</Notice>
                </div>
              ) : sim.result ? (
                <ResultView result={sim.result} btcPrice={sim.btcPrice} />
              ) : (
                <EmptyState
                  className="h-full"
                  icon={<Play size={28} />}
                  title="Run a simulation"
                  caption="See whether the call would succeed, what it returns or why it reverts, and what it would cost. Nothing is sent."
                />
              )}
            </div>

            {sim.history.length > 0 && (
              <div className="border-t border-white/10 max-h-[32%] flex flex-col">
                <div className="flex items-center justify-between h-8 px-4 shrink-0">
                  <span className={`${ide.label} flex items-center gap-1.5`}>
                    <History size={11} /> Recent
                  </span>
                  <button onClick={sim.clearHistory} className="text-[10px] text-white/40 hover:text-white cursor-pointer">
                    Clear
                  </button>
                </div>
                <ul className="overflow-y-auto">
                  {sim.history.map((h) => (
                    <li key={h.id}>
                      <button
                        onClick={() => sim.select(h)}
                        className={`w-full flex items-center gap-2 px-4 py-1.5 text-left text-xs hover:bg-white/5 cursor-pointer ${
                          sim.result?.id === h.id ? "bg-white/5" : ""
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${h.success ? "bg-green-500" : "bg-red-500"}`} />
                        <span className="font-mono text-white/80 truncate">
                          {h.request.contractName}.{h.request.functionName}()
                        </span>
                        <span className="ml-auto font-mono text-white/30 shrink-0">
                          {h.gasUsed !== null ? `${h.gasUsed.toLocaleString()} gas` : h.success ? "" : "reverted"}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </IdeModal>
  )
}

function isRead(fn: any) {
  return fn.stateMutability === "view" || fn.stateMutability === "pure"
}

function ResultView({ result, btcPrice }: { result: SimulationResult; btcPrice: number | null }) {
  const costBtc = result.costWei !== null ? Number(formatEther(result.costWei)) : null

  return (
    <div className="p-5 space-y-5">
      {/* Status */}
      <div className="flex items-start gap-3">
        {result.success ? (
          <CheckCircle2 size={22} className="text-green-500 shrink-0" />
        ) : (
          <XCircle size={22} className="text-red-500 shrink-0" />
        )}
        <div className="min-w-0">
          <p className="text-white font-medium">{result.success ? "Would succeed" : result.error?.title}</p>
          <p className="font-mono text-xs text-white/50 truncate">
            {result.request.contractName}.{result.request.functionName}()
          </p>
        </div>
        <StatusPill tone={result.request.network === "mainnet" ? "primary" : "neutral"} className="ml-auto">
          {result.request.network}
        </StatusPill>
      </div>

      {!result.success && result.error?.reason && (
        <section className="space-y-1.5">
          <h4 className={ide.label}>Revert reason</h4>
          <pre className={`${ide.codeBlock} text-red-400 whitespace-pre-wrap break-all`}>{result.error.reason}</pre>
        </section>
      )}

      {result.success && (
        <section className="space-y-1.5">
          <h4 className={ide.label}>Return value</h4>
          <pre className={`${ide.codeBlock} whitespace-pre-wrap break-all`}>
            {result.returnValue ?? <span className="text-white/40">No return value</span>}
          </pre>
        </section>
      )}

      {result.success && (
        <section className="space-y-1.5">
          <h4 className={ide.label}>Gas</h4>
          {result.gasUsed !== null ? (
            <dl className="grid grid-cols-3 gap-px bg-white/10 border border-white/10 text-xs">
              <Stat label="Gas used" value={result.gasUsed.toLocaleString()} />
              <Stat label="Gas price" value={result.gasPrice !== null ? `${formatGwei(result.gasPrice)} gwei` : "—"} />
              <Stat
                label="Cost"
                value={costBtc !== null ? `${costBtc.toPrecision(3)} BTC` : "—"}
                sub={costBtc !== null && btcPrice !== null ? `≈ ${formatUSD(costBtc * btcPrice)}` : undefined}
              />
            </dl>
          ) : (
            <p className="text-xs text-white/50">Gas couldn&apos;t be estimated for this caller.</p>
          )}
        </section>
      )}

      <p className="text-[10px] text-white/30 leading-relaxed">
        eth_call on Mezo {result.request.network} at block {result.blockNumber.toString()}
        {result.request.from ? ` as ${result.request.from}` : ""}. No transaction was sent. State changes and events
        aren&apos;t shown because Mezo&apos;s public RPCs don&apos;t support call tracing.
      </p>
    </div>
  )
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-dark p-2.5">
      <dt className={ide.label}>{label}</dt>
      <dd className="font-mono text-white/80 mt-0.5">{value}</dd>
      {sub && <dd className="text-[10px] text-white/40 mt-0.5">{sub}</dd>}
    </div>
  )
}
