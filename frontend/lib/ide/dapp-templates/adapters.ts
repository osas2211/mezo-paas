/**
 * Data-layer adapters for the generated ContractPanel.
 * Both expose the same hook: useContractActions() from "<alias>lib/actions".
 * (No backticks or "${" in generated code — see shared.ts.)
 */

import type { TemplateContext } from "./shared"

const directive = (ctx: TemplateContext) => (ctx.useClient ? '"use client";\n\n' : "")

/** Shared interface text, documented once in each generated file */
const actionsInterface = `export interface ContractActions {
  isConnected: boolean;
  /** Connected to a wallet that is on a different chain than the contract */
  isWrongNetwork: boolean;
  connect: () => void;
  switchNetwork: () => Promise<void>;
  read: (functionName: string, args: unknown[]) => Promise<unknown>;
  /** Simulates first (surfacing revert reasons), then sends and waits for the receipt */
  write: (
    functionName: string,
    args: unknown[],
    value: bigint | undefined,
    onHash: (hash: Hash) => void
  ) => Promise<TransactionReceipt>;
}`

/* ------------------------------------------------------------------ */
/* wagmi + RainbowKit                                                   */
/* ------------------------------------------------------------------ */

export function wagmiActionsFile(ctx: TemplateContext): string {
  const a = ctx.alias
  return `${directive(ctx)}import { useConnectModal } from "@rainbow-me/rainbowkit";
import type { Abi, Hash, TransactionReceipt } from "viem";
import { useAccount, useConfig, useSwitchChain } from "wagmi";
import { readContract, simulateContract, waitForTransactionReceipt, writeContract } from "wagmi/actions";
import { CONTRACT_ABI, CONTRACT_ADDRESS, CONTRACT_CHAIN } from "${a}lib/contract";

const abi = CONTRACT_ABI as unknown as Abi;

${actionsInterface}

export function useContractActions(): ContractActions {
  const config = useConfig();
  const { address, isConnected, chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { openConnectModal } = useConnectModal();

  const isWrongNetwork = isConnected && chainId !== CONTRACT_CHAIN.id;

  const switchNetwork = async () => {
    await switchChainAsync({ chainId: CONTRACT_CHAIN.id });
  };

  return {
    isConnected,
    isWrongNetwork,
    connect: () => openConnectModal?.(),
    switchNetwork,

    read: (functionName, args) =>
      readContract(config, {
        address: CONTRACT_ADDRESS,
        abi,
        functionName,
        args,
        chainId: CONTRACT_CHAIN.id,
      }),

    write: async (functionName, args, value, onHash) => {
      if (!address) throw new Error("Connect a wallet first");
      if (isWrongNetwork) await switchNetwork();

      const { request } = await simulateContract(config, {
        account: address,
        address: CONTRACT_ADDRESS,
        abi,
        functionName,
        args,
        value,
        chainId: CONTRACT_CHAIN.id,
      });
      const hash = await writeContract(config, request);
      onHash(hash);
      return waitForTransactionReceipt(config, { hash, chainId: CONTRACT_CHAIN.id });
    },
  };
}
`
}

export function wagmiConfigFile(
  ctx: TemplateContext,
  opts: { envExpr: string; ssr: boolean }
): string {
  const isMainnet = ctx.contract.chainId === 31612
  // Contract network first so wallets default to it
  const chains = isMainnet ? "[mezoMainnet, mezoTestnet] as const" : "[mezoTestnet, mezoMainnet] as const"
  const appName = ctx.projectName.replace(/"/g, "")
  return `import { connectorsForWallets, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { injectedWallet } from "@rainbow-me/rainbowkit/wallets";
import { createConfig } from "wagmi";
import { mezoMainnet, mezoTestnet, rpcTransport } from "${ctx.alias}lib/chains";

const appName = "${appName}";

// Optional: enables WalletConnect / mobile wallets. Free at https://cloud.reown.com
const projectId = ${opts.envExpr};

const chains = ${chains};

const transports = {
  [mezoMainnet.id]: rpcTransport(mezoMainnet),
  [mezoTestnet.id]: rpcTransport(mezoTestnet),
};

export const config = projectId
  ? getDefaultConfig({ appName, projectId, chains, transports, ssr: ${opts.ssr} })
  : // Without a project ID, fall back to browser (injected) wallets such as MetaMask
    createConfig({
      chains,
      transports,
      ssr: ${opts.ssr},
      connectors: connectorsForWallets(
        [{ groupName: "Browser wallet", wallets: [injectedWallet] }],
        { appName, projectId: "injected-only" }
      ),
    });
`
}

export function wagmiProvidersFile(ctx: TemplateContext): string {
  const a = ctx.alias
  return `${directive(ctx)}import "@rainbow-me/rainbowkit/styles.css";
import { useState, type ReactNode } from "react";
import { darkTheme, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { CONTRACT_CHAIN } from "${a}lib/contract";
import { config } from "${a}lib/wagmi";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          initialChain={CONTRACT_CHAIN}
          theme={darkTheme({ accentColor: "#b3ec11", accentColorForeground: "#000", borderRadius: "small" })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
`
}

/* ------------------------------------------------------------------ */
/* Plain viem + injected wallet (EIP-1193)                              */
/* ------------------------------------------------------------------ */

export function viemWalletFile(ctx: TemplateContext): string {
  const a = ctx.alias
  return `${directive(ctx)}import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  createPublicClient,
  createWalletClient,
  custom,
  type Address,
  type EIP1193Provider,
  type WalletClient,
} from "viem";
import { rpcTransport } from "${a}lib/chains";
import { CONTRACT_CHAIN } from "${a}lib/contract";

declare global {
  interface Window {
    ethereum?: EIP1193Provider;
  }
}

/** Read-only client — works without a wallet */
export const publicClient = createPublicClient({ chain: CONTRACT_CHAIN, transport: rpcTransport(CONTRACT_CHAIN) });

interface WalletState {
  account: Address | null;
  chainId: number | null;
  walletClient: WalletClient | null;
  hasWallet: boolean;
  connect: () => Promise<void>;
  switchNetwork: () => Promise<void>;
}

const WalletContext = createContext<WalletState | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<Address | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [provider, setProvider] = useState<EIP1193Provider | null>(null);

  // Pick up an injected wallet (MetaMask, Rabby, OKX, ...) after mount
  useEffect(() => {
    const eth = window.ethereum;
    if (!eth) return;
    setProvider(eth);

    eth.request({ method: "eth_accounts" }).then((accounts) => setAccount((accounts[0] as Address) ?? null));
    eth.request({ method: "eth_chainId" }).then((id) => setChainId(Number(id)));

    const onAccounts = (accounts: string[]) => setAccount((accounts[0] as Address) ?? null);
    const onChain = (id: string) => setChainId(Number(id));
    eth.on("accountsChanged", onAccounts);
    eth.on("chainChanged", onChain);
    return () => {
      eth.removeListener("accountsChanged", onAccounts);
      eth.removeListener("chainChanged", onChain);
    };
  }, []);

  const walletClient = useMemo(
    () => (provider ? createWalletClient({ chain: CONTRACT_CHAIN, transport: custom(provider) }) : null),
    [provider]
  );

  const connect = useCallback(async () => {
    if (!walletClient) {
      window.open("https://metamask.io/download/", "_blank", "noreferrer");
      return;
    }
    const [address] = await walletClient.requestAddresses();
    setAccount(address ?? null);
  }, [walletClient]);

  const switchNetwork = useCallback(async () => {
    if (!walletClient) throw new Error("No wallet found");
    try {
      await walletClient.switchChain({ id: CONTRACT_CHAIN.id });
    } catch {
      // Chain not added to the wallet yet
      await walletClient.addChain({ chain: CONTRACT_CHAIN });
      await walletClient.switchChain({ id: CONTRACT_CHAIN.id });
    }
  }, [walletClient]);

  const value = useMemo(
    () => ({ account, chainId, walletClient, hasWallet: !!provider, connect, switchNetwork }),
    [account, chainId, walletClient, provider, connect, switchNetwork]
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletState {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside <WalletProvider>");
  return ctx;
}

export function ConnectButton() {
  const { account, chainId, connect, switchNetwork, hasWallet } = useWallet();
  const [error, setError] = useState<string | null>(null);

  const run = (fn: () => Promise<void>) => () => {
    setError(null);
    fn().catch((e: { shortMessage?: string; message?: string }) => setError(e.shortMessage ?? e.message ?? "Wallet error"));
  };

  if (account && chainId !== CONTRACT_CHAIN.id) {
    return (
      <button onClick={run(switchNetwork)} className="bg-amber-400 px-4 py-2 text-sm font-medium text-black" title={error ?? undefined}>
        Switch to {CONTRACT_CHAIN.name}
      </button>
    );
  }

  if (account) {
    return (
      <span className="border border-white/10 px-4 py-2 font-mono text-sm">
        {account.slice(0, 6)}...{account.slice(-4)}
      </span>
    );
  }

  return (
    <button onClick={run(connect)} className="bg-accent px-4 py-2 text-sm font-medium text-black" title={error ?? undefined}>
      {hasWallet ? "Connect wallet" : "Install a wallet"}
    </button>
  );
}
`
}

export function viemActionsFile(ctx: TemplateContext): string {
  const a = ctx.alias
  return `${directive(ctx)}import type { Abi, Hash, TransactionReceipt } from "viem";
import { CONTRACT_ABI, CONTRACT_ADDRESS, CONTRACT_CHAIN } from "${a}lib/contract";
import { publicClient, useWallet } from "${a}lib/wallet";

const abi = CONTRACT_ABI as unknown as Abi;

${actionsInterface}

export function useContractActions(): ContractActions {
  const { account, chainId, walletClient, connect, switchNetwork } = useWallet();
  const isConnected = !!account;
  const isWrongNetwork = isConnected && chainId !== CONTRACT_CHAIN.id;

  return {
    isConnected,
    isWrongNetwork,
    connect: () => void connect(),
    switchNetwork,

    read: (functionName, args) =>
      publicClient.readContract({ address: CONTRACT_ADDRESS, abi, functionName, args }),

    write: async (functionName, args, value, onHash) => {
      if (!account || !walletClient) throw new Error("Connect a wallet first");
      if (isWrongNetwork) await switchNetwork();

      const { request } = await publicClient.simulateContract({
        account,
        address: CONTRACT_ADDRESS,
        abi,
        functionName,
        args,
        value,
      });
      const hash = await walletClient.writeContract(request);
      onHash(hash);
      return publicClient.waitForTransactionReceipt({ hash });
    },
  };
}
`
}
