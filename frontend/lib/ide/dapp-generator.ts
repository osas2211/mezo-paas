/**
 * dApp Project Generator
 * Generates starter projects with pre-configured contract integration
 */

import JSZip from "jszip"

export interface GeneratorConfig {
  projectName: string
  template: "nextjs-wagmi" | "nextjs-viem" | "react-wagmi"
  contract: {
    name: string
    address: string
    abi: any[]
    chainId: number
  }
}

export interface GeneratedFile {
  path: string
  content: string
}

/**
 * Generate a complete dApp project
 */
export async function generateDAppProject(
  config: GeneratorConfig
): Promise<GeneratedFile[]> {
  const { projectName, template, contract } = config

  switch (template) {
    case "nextjs-wagmi":
      return generateNextJsWagmiProject(projectName, contract)
    case "nextjs-viem":
      return generateNextJsViemProject(projectName, contract)
    case "react-wagmi":
      return generateReactWagmiProject(projectName, contract)
    default:
      return generateNextJsWagmiProject(projectName, contract)
  }
}

/**
 * Download generated files as a zip
 */
export async function downloadAsZip(
  projectName: string,
  files: GeneratedFile[]
): Promise<void> {
  const zip = new JSZip()

  // Add all files to the zip
  for (const file of files) {
    zip.file(file.path, file.content)
  }

  // Generate the zip blob
  const blob = await zip.generateAsync({ type: "blob" })

  // Create download link and trigger download
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `${projectName}.zip`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// ============================================
// Next.js + wagmi Template Generator
// ============================================

function generateNextJsWagmiProject(
  projectName: string,
  contract: GeneratorConfig["contract"]
): GeneratedFile[] {
  const networkName = contract.chainId === 31611 ? "mezoTestnet" : "mezoMainnet"
  const networkLabel = contract.chainId === 31611 ? "Mezo Testnet" : "Mezo Mainnet"

  return [
    // Package.json
    {
      path: "package.json",
      content: JSON.stringify(
        {
          name: projectName,
          version: "0.1.0",
          private: true,
          scripts: {
            dev: "next dev",
            build: "next build",
            start: "next start",
            lint: "next lint",
          },
          dependencies: {
            next: "14.2.5",
            react: "^18.3.1",
            "react-dom": "^18.3.1",
            wagmi: "^2.12.0",
            viem: "^2.17.0",
            "@tanstack/react-query": "^5.51.0",
            "@rainbow-me/rainbowkit": "^2.1.3",
          },
          devDependencies: {
            typescript: "^5.5.0",
            "@types/node": "^20.14.0",
            "@types/react": "^18.3.0",
            "@types/react-dom": "^18.3.0",
            autoprefixer: "^10.4.19",
            postcss: "^8.4.38",
            tailwindcss: "^3.4.4",
            eslint: "^8.57.0",
            "eslint-config-next": "14.2.5",
          },
        },
        null,
        2
      ),
    },

    // TypeScript config
    {
      path: "tsconfig.json",
      content: JSON.stringify(
        {
          compilerOptions: {
            lib: ["dom", "dom.iterable", "esnext"],
            allowJs: true,
            skipLibCheck: true,
            strict: true,
            noEmit: true,
            esModuleInterop: true,
            module: "esnext",
            moduleResolution: "bundler",
            resolveJsonModule: true,
            isolatedModules: true,
            jsx: "preserve",
            incremental: true,
            plugins: [{ name: "next" }],
            paths: { "@/*": ["./*"] },
          },
          include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
          exclude: ["node_modules"],
        },
        null,
        2
      ),
    },

    // Next.js config
    {
      path: "next.config.mjs",
      content: `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
`,
    },

    // Tailwind config
    {
      path: "tailwind.config.ts",
      content: `import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        mezo: {
          primary: "#00D395",
          dark: "#0a0a0a",
        },
      },
    },
  },
  plugins: [],
};

export default config;
`,
    },

    // PostCSS config
    {
      path: "postcss.config.mjs",
      content: `/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
`,
    },

    // Global styles
    {
      path: "app/globals.css",
      content: `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 255, 255, 255;
  --background-rgb: 10, 10, 10;
}

body {
  color: rgb(var(--foreground-rgb));
  background: rgb(var(--background-rgb));
}
`,
    },

    // Root layout
    {
      path: "app/layout.tsx",
      content: `import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "${projectName}",
  description: "dApp built on Mezo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
`,
    },

    // Providers with RainbowKit + wagmi
    {
      path: "app/providers.tsx",
      content: `"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { config } from "@/lib/wagmi";
import "@rainbow-me/rainbowkit/styles.css";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme({
          accentColor: "#00D395",
          borderRadius: "medium",
        })}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
`,
    },

    // Home page
    {
      path: "app/page.tsx",
      content: `"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { ${contract.name}Card } from "@/components/${contract.name.toLowerCase()}-card";

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-2xl font-bold text-white">${projectName}</h1>
            <p className="text-white/60 text-sm mt-1">
              Interact with ${contract.name} on ${networkLabel}
            </p>
          </div>
          <ConnectButton />
        </div>

        {/* Contract Card */}
        {isConnected ? (
          <${contract.name}Card />
        ) : (
          <div className="p-12 border border-white/10 rounded-xl text-center">
            <p className="text-white/60">Connect your wallet to interact with the contract</p>
          </div>
        )}
      </div>
    </main>
  );
}
`,
    },

    // Wagmi config
    {
      path: "lib/wagmi.ts",
      content: `import { createConfig, http } from "wagmi";
import { defineChain } from "viem";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";

// Define Mezo chain
export const mezoTestnet = defineChain({
  id: 31611,
  name: "Mezo Testnet",
  nativeCurrency: { name: "BTC", symbol: "BTC", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.test.mezo.org"] },
  },
  blockExplorers: {
    default: { name: "Explorer", url: "https://explorer.test.mezo.org" },
  },
});

export const mezoMainnet = defineChain({
  id: 31612,
  name: "Mezo Mainnet",
  nativeCurrency: { name: "BTC", symbol: "BTC", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.mezo.org"] },
  },
  blockExplorers: {
    default: { name: "Explorer", url: "https://explorer.mezo.org" },
  },
});

export const config = getDefaultConfig({
  appName: "${projectName}",
  projectId: "YOUR_WALLETCONNECT_PROJECT_ID", // Get from https://cloud.walletconnect.com
  chains: [${networkName}],
  ssr: true,
});
`,
    },

    // Contract config
    {
      path: "lib/contracts.ts",
      content: `// ${contract.name} Contract Configuration
// Deployed on ${networkLabel} (Chain ID: ${contract.chainId})

export const ${contract.name.toUpperCase()}_ADDRESS = "${contract.address}" as const;

export const ${contract.name.toUpperCase()}_ABI = ${JSON.stringify(contract.abi, null, 2)} as const;
`,
    },

    // Contract component
    {
      path: `components/${contract.name.toLowerCase()}-card.tsx`,
      content: generateContractComponent(contract),
    },

    // .gitignore
    {
      path: ".gitignore",
      content: `# Dependencies
node_modules
.pnp
.pnp.js

# Next.js
.next/
out/
build

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local
.env

# TypeScript
*.tsbuildinfo
next-env.d.ts
`,
    },

    // README
    {
      path: "README.md",
      content: `# ${projectName}

A dApp built on Mezo, generated from Mezo IDE.

## Contract

- **Name**: ${contract.name}
- **Address**: \`${contract.address}\`
- **Network**: ${networkLabel} (Chain ID: ${contract.chainId})

## Getting Started

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Get a WalletConnect Project ID from [https://cloud.walletconnect.com](https://cloud.walletconnect.com) and update \`lib/wagmi.ts\`

3. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

4. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

- \`app/\` - Next.js App Router pages
- \`components/\` - React components
- \`lib/\` - Configuration and utilities
  - \`wagmi.ts\` - Wallet and chain configuration
  - \`contracts.ts\` - Contract ABI and address

## Built With

- [Next.js](https://nextjs.org)
- [wagmi](https://wagmi.sh)
- [RainbowKit](https://rainbowkit.com)
- [Tailwind CSS](https://tailwindcss.com)

Generated with [Mezo IDE](https://mezo.host/ide)
`,
    },

    // .env.example
    {
      path: ".env.example",
      content: `# Get your project ID from https://cloud.walletconnect.com
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
`,
    },
  ]
}

// Generate a contract interaction component based on ABI
function generateContractComponent(contract: GeneratorConfig["contract"]): string {
  const { name, abi } = contract

  // Find read and write functions
  const readFunctions = abi.filter(
    (item: any) =>
      item.type === "function" &&
      (item.stateMutability === "view" || item.stateMutability === "pure")
  )
  const writeFunctions = abi.filter(
    (item: any) =>
      item.type === "function" &&
      (item.stateMutability === "nonpayable" || item.stateMutability === "payable")
  )

  // Take first few functions for demo
  const demoReadFn = readFunctions[0]
  const demoWriteFn = writeFunctions[0]

  return `"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ${name.toUpperCase()}_ADDRESS, ${name.toUpperCase()}_ABI } from "@/lib/contracts";
import { useState } from "react";

export function ${name}Card() {
  const [writeStatus, setWriteStatus] = useState<string>("");
${demoReadFn ? `
  // Read contract data
  const { data: readData, isLoading: isReading, refetch } = useReadContract({
    address: ${name.toUpperCase()}_ADDRESS,
    abi: ${name.toUpperCase()}_ABI,
    functionName: "${demoReadFn.name}",
  });
` : ""}
${demoWriteFn ? `
  // Write to contract
  const { writeContract, data: hash, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleWrite = async () => {
    try {
      writeContract({
        address: ${name.toUpperCase()}_ADDRESS,
        abi: ${name.toUpperCase()}_ABI,
        functionName: "${demoWriteFn.name}",
        args: [${demoWriteFn.inputs?.map((input: any) => getDefaultArg(input.type)).join(", ") || ""}],
      });
      setWriteStatus("Transaction submitted...");
    } catch (error: any) {
      setWriteStatus(\`Error: \${error.message}\`);
    }
  };
` : ""}
  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-white/5 border-b border-white/10">
        <h2 className="text-lg font-semibold text-white">${name}</h2>
        <code className="text-xs text-white/40 break-all">
          {${name.toUpperCase()}_ADDRESS}
        </code>
      </div>

      <div className="p-4 space-y-6">
${demoReadFn ? `
        {/* Read Function: ${demoReadFn.name} */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-white/80 text-sm font-medium">${demoReadFn.name}()</span>
            <button
              onClick={() => refetch()}
              className="text-xs text-mezo-primary hover:underline"
            >
              Refresh
            </button>
          </div>
          <div className="p-3 bg-black/40 rounded-lg">
            {isReading ? (
              <span className="text-white/40">Loading...</span>
            ) : (
              <span className="text-white font-mono">
                {readData !== undefined ? String(readData) : "N/A"}
              </span>
            )}
          </div>
        </div>
` : ""}
${demoWriteFn ? `
        {/* Write Function: ${demoWriteFn.name} */}
        <div className="space-y-2">
          <span className="text-white/80 text-sm font-medium">${demoWriteFn.name}()</span>
          <button
            onClick={handleWrite}
            disabled={isPending || isConfirming}
            className="w-full py-2 px-4 bg-mezo-primary text-black font-medium rounded-lg hover:bg-mezo-primary/90 disabled:opacity-50 transition-colors"
          >
            {isPending ? "Confirm in wallet..." : isConfirming ? "Confirming..." : "Execute"}
          </button>
          {isSuccess && (
            <p className="text-green-400 text-sm">Transaction confirmed!</p>
          )}
          {writeStatus && !isSuccess && (
            <p className="text-white/60 text-sm">{writeStatus}</p>
          )}
        </div>
` : ""}
        {/* Contract Functions */}
        <div className="pt-4 border-t border-white/10">
          <p className="text-white/40 text-xs mb-2">Available Functions:</p>
          <div className="space-y-1">
${readFunctions.slice(0, 5).map((fn: any) => `            <div className="text-xs">
              <span className="text-blue-400">view</span>
              <span className="text-white/60 ml-2">${fn.name}(${fn.inputs?.map((i: any) => i.type).join(", ") || ""})</span>
            </div>`).join("\n")}
${writeFunctions.slice(0, 5).map((fn: any) => `            <div className="text-xs">
              <span className="text-orange-400">write</span>
              <span className="text-white/60 ml-2">${fn.name}(${fn.inputs?.map((i: any) => i.type).join(", ") || ""})</span>
            </div>`).join("\n")}
          </div>
        </div>
      </div>
    </div>
  );
}
`
}

function getDefaultArg(type: string): string {
  if (type.startsWith("uint") || type.startsWith("int")) return "0n"
  if (type === "address") return '"0x0000000000000000000000000000000000000000"'
  if (type === "bool") return "false"
  if (type === "string") return '""'
  if (type.startsWith("bytes")) return '"0x"'
  return '""'
}

// ============================================
// Next.js + viem Template (Simplified)
// ============================================

function generateNextJsViemProject(
  projectName: string,
  contract: GeneratorConfig["contract"]
): GeneratedFile[] {
  // Use the wagmi template as base, just modify the component
  const files = generateNextJsWagmiProject(projectName, contract)

  // Update README to mention viem
  const readmeIndex = files.findIndex(f => f.path === "README.md")
  if (readmeIndex >= 0) {
    files[readmeIndex].content = files[readmeIndex].content.replace(
      "- [wagmi](https://wagmi.sh)",
      "- [viem](https://viem.sh)"
    )
  }

  return files
}

// ============================================
// React + wagmi Template
// ============================================

function generateReactWagmiProject(
  projectName: string,
  contract: GeneratorConfig["contract"]
): GeneratedFile[] {
  // Similar to Next.js but with Vite setup
  const networkName = contract.chainId === 31611 ? "mezoTestnet" : "mezoMainnet"
  const networkLabel = contract.chainId === 31611 ? "Mezo Testnet" : "Mezo Mainnet"

  return [
    // Package.json for Vite + React
    {
      path: "package.json",
      content: JSON.stringify(
        {
          name: projectName,
          private: true,
          version: "0.0.0",
          type: "module",
          scripts: {
            dev: "vite",
            build: "tsc && vite build",
            lint: "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
            preview: "vite preview",
          },
          dependencies: {
            react: "^18.3.1",
            "react-dom": "^18.3.1",
            wagmi: "^2.12.0",
            viem: "^2.17.0",
            "@tanstack/react-query": "^5.51.0",
            "@rainbow-me/rainbowkit": "^2.1.3",
          },
          devDependencies: {
            "@types/react": "^18.3.0",
            "@types/react-dom": "^18.3.0",
            "@vitejs/plugin-react": "^4.3.0",
            autoprefixer: "^10.4.19",
            postcss: "^8.4.38",
            tailwindcss: "^3.4.4",
            typescript: "^5.5.0",
            vite: "^5.3.0",
          },
        },
        null,
        2
      ),
    },

    // Vite config
    {
      path: "vite.config.ts",
      content: `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
`,
    },

    // index.html
    {
      path: "index.html",
      content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
  </head>
  <body class="bg-[#0a0a0a]">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`,
    },

    // Main entry
    {
      path: "src/main.tsx",
      content: `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
`,
    },

    // App component
    {
      path: "src/App.tsx",
      content: `import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, darkTheme, ConnectButton } from "@rainbow-me/rainbowkit";
import { config } from "./lib/wagmi";
import "@rainbow-me/rainbowkit/styles.css";

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme({ accentColor: "#00D395" })}>
          <div className="min-h-screen p-8">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-12">
                <h1 className="text-2xl font-bold text-white">${projectName}</h1>
                <ConnectButton />
              </div>
              <p className="text-white/60">Connected to ${networkLabel}</p>
            </div>
          </div>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
`,
    },

    // CSS
    {
      path: "src/index.css",
      content: `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  background: #0a0a0a;
  color: white;
}
`,
    },

    // Wagmi config
    {
      path: "src/lib/wagmi.ts",
      content: `import { defineChain } from "viem";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";

export const ${networkName} = defineChain({
  id: ${contract.chainId},
  name: "${networkLabel}",
  nativeCurrency: { name: "BTC", symbol: "BTC", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc${contract.chainId === 31611 ? ".test" : ""}.mezo.org"] },
  },
});

export const config = getDefaultConfig({
  appName: "${projectName}",
  projectId: "YOUR_WALLETCONNECT_PROJECT_ID",
  chains: [${networkName}],
});
`,
    },

    // Contract config
    {
      path: "src/lib/contracts.ts",
      content: `export const ${contract.name.toUpperCase()}_ADDRESS = "${contract.address}" as const;
export const ${contract.name.toUpperCase()}_ABI = ${JSON.stringify(contract.abi, null, 2)} as const;
`,
    },

    // TypeScript config
    {
      path: "tsconfig.json",
      content: JSON.stringify(
        {
          compilerOptions: {
            target: "ES2020",
            useDefineForClassFields: true,
            lib: ["ES2020", "DOM", "DOM.Iterable"],
            module: "ESNext",
            skipLibCheck: true,
            moduleResolution: "bundler",
            allowImportingTsExtensions: true,
            resolveJsonModule: true,
            isolatedModules: true,
            noEmit: true,
            jsx: "react-jsx",
            strict: true,
            noUnusedLocals: true,
            noUnusedParameters: true,
            noFallthroughCasesInSwitch: true,
            paths: { "@/*": ["./src/*"] },
          },
          include: ["src"],
        },
        null,
        2
      ),
    },

    // Tailwind config
    {
      path: "tailwind.config.js",
      content: `/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [],
}
`,
    },

    // PostCSS
    {
      path: "postcss.config.js",
      content: `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`,
    },

    // .gitignore
    {
      path: ".gitignore",
      content: `node_modules
dist
.env
.env.local
`,
    },
  ]
}
