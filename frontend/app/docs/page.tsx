"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ChevronRight,
  Code2,
  Rocket,
  Coins,
  Shield,
  Zap,
  Users,
  GitBranch,
  Globe,
  Terminal,
  Wallet,
  TrendingUp,
  Clock,
  CheckCircle2,
  ArrowRight,
  Menu,
  X,
  ExternalLink
} from "lucide-react"

const sections = [
  { id: "overview", label: "Overview" },
  { id: "getting-started", label: "Getting Started" },
  { id: "ide", label: "Solidity IDE" },
  { id: "deployments", label: "App Deployments" },
  { id: "yield-for-compute", label: "Yield for Compute" },
  { id: "billing", label: "Billing & Credits" },
  { id: "benefits", label: "Community Benefits" },
  { id: "faq", label: "FAQ" },
]

export default function DocsPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("overview")

  const scrollToSection = (id: string) => {
    setActiveSection(id)
    setMobileMenuOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-sm">M</span>
              </div>
              <span className="font-medium text-lg">Mezo PaaS</span>
              <span className="text-zinc-500 text-sm ml-2">/ Docs</span>
            </Link>

            <div className="flex items-center gap-4">
              <Link
                href="/ide"
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary text-black rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Open IDE <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                className="sm:hidden p-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-64 fixed left-0 top-16 bottom-0 border-r border-zinc-800/50 overflow-y-auto">
          <nav className="p-6 space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`w-full text-left px-4 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                  activeSection === section.id
                    ? "bg-primary/10 text-primary border-l-2 border-primary"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                }`}
              >
                <ChevronRight className={`w-4 h-4 transition-transform ${activeSection === section.id ? "rotate-90" : ""}`} />
                {section.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 top-16 z-40 bg-black/95 backdrop-blur-xl">
            <nav className="p-6 space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className="w-full text-left px-4 py-3 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800/50 transition-colors"
                >
                  {section.label}
                </button>
              ))}
            </nav>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 px-4 sm:px-6 lg:px-12 py-12 max-w-4xl">

          {/* Overview Section */}
          <section id="overview" className="mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm mb-6">
              <Zap className="w-4 h-4" />
              Platform Overview
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
              Build on Bitcoin.<br />
              <span className="text-primary">Deploy Anywhere.</span>
            </h1>
            <p className="text-xl text-zinc-400 mb-8 leading-relaxed">
              Mezo PaaS is a decentralized Platform-as-a-Service built on Bitcoin. Write smart contracts,
              deploy applications, and earn yield on your compute costs — all without giving up your BTC.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-12">
              <FeatureCard
                icon={<Code2 className="w-6 h-6" />}
                title="Solidity IDE"
                description="Browser-based development environment with full compiler support"
              />
              <FeatureCard
                icon={<Rocket className="w-6 h-6" />}
                title="One-Click Deploy"
                description="Deploy smart contracts and web apps with zero configuration"
              />
              <FeatureCard
                icon={<Coins className="w-6 h-6" />}
                title="Yield for Compute"
                description="Stake collateral to earn 8% APY while getting 10x compute credits"
              />
              <FeatureCard
                icon={<Shield className="w-6 h-6" />}
                title="Bitcoin Security"
                description="Built on Mezo protocol with Bitcoin-backed infrastructure"
              />
            </div>

            <div className="p-6 bg-zinc-900/50 rounded-2xl border border-zinc-800">
              <h3 className="text-lg font-semibold mb-4">What can you build?</h3>
              <div className="grid sm:grid-cols-2 gap-3 text-zinc-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  Smart Contracts (Solidity)
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  DeFi Applications
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  Next.js & React Apps
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  API Backends (NestJS, Bun)
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  NFT Marketplaces
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  Static Sites (Astro, Vite)
                </div>
              </div>
            </div>
          </section>

          {/* Getting Started */}
          <section id="getting-started" className="mb-20">
            <SectionHeader icon={<Rocket />} title="Getting Started" />

            <p className="text-zinc-400 mb-8">
              Get up and running with Mezo PaaS in minutes. No complex setup required — just connect your wallet and start building.
            </p>

            <div className="space-y-6">
              <Step
                number={1}
                title="Connect Your Wallet"
                description="Click 'Connect Wallet' and select your preferred Web3 wallet (MetaMask, WalletConnect, etc.). We support both Mezo Testnet and Mainnet."
              />
              <Step
                number={2}
                title="Fund Your Account"
                description="Purchase compute credits using MUSD tokens, or lock collateral for 10x more credits plus yield earnings."
              />
              <Step
                number={3}
                title="Start Building"
                description="Use the browser-based IDE for smart contracts, or connect your GitHub to deploy web applications."
              />
              <Step
                number={4}
                title="Deploy & Ship"
                description="Compile, deploy, and verify your contracts with one click. Your web apps get automatic SSL and custom domains."
              />
            </div>

            <div className="mt-8 p-4 bg-primary/5 border border-primary/20 rounded-xl">
              <p className="text-sm text-zinc-400">
                <span className="text-primary font-medium">Pro Tip:</span> Start with Testnet (Chain ID: 31611) to experiment without using real funds. Switch to Mainnet (Chain ID: 31612) when you&apos;re ready to go live.
              </p>
            </div>
          </section>

          {/* Solidity IDE */}
          <section id="ide" className="mb-20">
            <SectionHeader icon={<Terminal />} title="Solidity IDE" />

            <p className="text-zinc-400 mb-8">
              A powerful browser-based development environment for writing, compiling, and deploying Solidity smart contracts directly to Mezo.
            </p>

            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-primary" />
                  Code Editor
                </h3>
                <ul className="space-y-2 text-zinc-400">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    Monaco Editor (VS Code&apos;s editor) with full Solidity syntax highlighting
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    Auto-completion and error detection
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    Multiple file support with file explorer
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    Pre-built contract templates (ERC20, ERC721, and more)
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Compiler
                </h3>
                <ul className="space-y-2 text-zinc-400">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    Multiple Solidity version support
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    Optimizer settings with customizable runs
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    OpenZeppelin import resolution
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    Clear error messages and warnings
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Rocket className="w-5 h-5 text-primary" />
                  Deploy
                </h3>
                <ul className="space-y-2 text-zinc-400">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    One-click deployment to Testnet or Mainnet
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    Constructor argument input with type validation
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    Gas estimation with real-time BTC/USD pricing
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>
                      Auto-verification on Mezo Explorer{" "}
                      <span className="inline-flex items-center px-2 py-0.5 bg-yellow-500/10 text-yellow-500 text-xs rounded-full ml-1">
                        Coming Soon
                      </span>
                    </span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  Interact & Test
                </h3>
                <ul className="space-y-2 text-zinc-400">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    Call read/write functions on deployed contracts
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    Transaction simulator with impersonation mode
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    Event logs and state change tracking
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    dApp generator for quick frontend creation
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8 p-6 bg-zinc-900/50 rounded-2xl border border-zinc-800">
              <h4 className="font-semibold mb-2">Keyboard Shortcuts</h4>
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-3 text-zinc-400">
                  <kbd className="px-2 py-1 bg-zinc-800 rounded text-xs">Ctrl/Cmd + S</kbd>
                  <span>Save file</span>
                </div>
                <div className="flex items-center gap-3 text-zinc-400">
                  <kbd className="px-2 py-1 bg-zinc-800 rounded text-xs">Ctrl/Cmd + B</kbd>
                  <span>Compile contract</span>
                </div>
              </div>
            </div>
          </section>

          {/* App Deployments */}
          <section id="deployments" className="mb-20">
            <SectionHeader icon={<GitBranch />} title="Application Deployments" />

            <p className="text-zinc-400 mb-8">
              Deploy full-stack web applications directly from your GitHub repository. Automatic builds, SSL certificates, and zero-downtime deployments included.
            </p>

            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Supported Frameworks</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {["Next.js", "React", "Vite", "Astro", "NestJS", "Bun", "HTML", "Node.js"].map((framework) => (
                  <div key={framework} className="p-3 bg-zinc-900/50 rounded-lg text-center text-sm border border-zinc-800">
                    {framework}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">How It Works</h3>
                <ol className="space-y-4">
                  <li className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-medium">1</span>
                    <div>
                      <p className="font-medium">Connect GitHub</p>
                      <p className="text-sm text-zinc-500">Link your GitHub account to access repositories</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-medium">2</span>
                    <div>
                      <p className="font-medium">Select Repository</p>
                      <p className="text-sm text-zinc-500">Choose any public or private repo to deploy</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-medium">3</span>
                    <div>
                      <p className="font-medium">Configure Build</p>
                      <p className="text-sm text-zinc-500">Auto-detect or customize build commands & environment variables</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-medium">4</span>
                    <div>
                      <p className="font-medium">Deploy</p>
                      <p className="text-sm text-zinc-500">Docker containerization, auto-scaling, and SSL provisioning</p>
                    </div>
                  </li>
                </ol>
              </div>
            </div>

            <div className="mt-8 grid sm:grid-cols-2 gap-4">
              <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  Real-time Logs
                </h4>
                <p className="text-sm text-zinc-400">
                  Watch your build progress live with streaming logs and deployment status updates via WebSocket.
                </p>
              </div>
              <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  Environment Variables
                </h4>
                <p className="text-sm text-zinc-400">
                  Securely store API keys and secrets. Encrypted at rest and injected at build time.
                </p>
              </div>
            </div>
          </section>

          {/* Yield for Compute */}
          <section id="yield-for-compute" className="mb-20">
            <SectionHeader icon={<TrendingUp />} title="Yield for Compute" />

            <div className="p-6 bg-gradient-to-br from-primary/10 to-transparent rounded-2xl border border-primary/20 mb-8">
              <h3 className="text-2xl font-bold mb-2">Earn While You Build</h3>
              <p className="text-zinc-400">
                A revolutionary DeFi mechanism that lets developers earn yield on their compute costs. Lock your MUSD tokens to get 10x more compute credits plus 8% annual yield.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 mb-8">
              <div className="p-6 bg-zinc-900/50 rounded-2xl border border-zinc-800">
                <h4 className="font-semibold mb-4 text-zinc-400">Regular Purchase</h4>
                <div className="text-3xl font-bold mb-2">1 MUSD = 135 Credits</div>
                <p className="text-sm text-zinc-500">Direct purchase, immediate use, no yield</p>
              </div>
              <div className="p-6 bg-zinc-900/50 rounded-2xl border border-primary/30 relative overflow-hidden">
                <div className="absolute top-2 right-2 px-2 py-1 bg-primary/20 text-primary text-xs rounded-full">
                  Recommended
                </div>
                <h4 className="font-semibold mb-4 text-primary">Lock Collateral</h4>
                <div className="text-3xl font-bold mb-2">1 MUSD = 1,350 Credits</div>
                <p className="text-sm text-zinc-500">10x more credits + 8% APY on locked amount</p>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-semibold">How Yield for Compute Works</h3>

              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Wallet className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Lock Your MUSD</h4>
                    <p className="text-sm text-zinc-400">
                      Stake MUSD tokens into the Mezo Billing V2 contract. Your funds are held securely in the protocol treasury.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Coins className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Receive Staked Credits</h4>
                    <p className="text-sm text-zinc-400">
                      Instantly receive 10x the compute credits compared to regular purchases. Use these credits for deployments, hosting, and IDE operations.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Earn 8% APY</h4>
                    <p className="text-sm text-zinc-400">
                      While your collateral is locked, it earns 8% annual yield. View your accrued yield anytime in the billing dashboard.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Withdraw Anytime</h4>
                    <p className="text-sm text-zinc-400">
                      Request withdrawal of your collateral plus earned yield. Funds are queued and released after the lock period ends.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
              <h4 className="font-semibold mb-3">Example Calculation</h4>
              <div className="text-sm text-zinc-400 space-y-2">
                <p>If you lock <span className="text-white font-medium">100 MUSD</span> for 30 days:</p>
                <ul className="ml-4 space-y-1">
                  <li>• Receive <span className="text-primary font-medium">135,000</span> Staked Credits (vs 13,500 with regular purchase)</li>
                  <li>• Earn approximately <span className="text-primary font-medium">0.66 MUSD</span> in yield (8% APY prorated)</li>
                  <li>• After 30 days, withdraw <span className="text-primary font-medium">100.66 MUSD</span> back to your wallet</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Billing & Credits */}
          <section id="billing" className="mb-20">
            <SectionHeader icon={<Coins />} title="Billing & Credits" />

            <p className="text-zinc-400 mb-8">
              Mezo PaaS uses a credit-based billing system. Purchase credits with MUSD tokens or lock collateral for bonus credits and yield.
            </p>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Credit Types</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
                    <h4 className="font-medium mb-2">MHCredits</h4>
                    <p className="text-sm text-zinc-400">
                      Regular credits purchased directly with MUSD. 1 MUSD = 135 MHCredits. Non-refundable, use immediately.
                    </p>
                  </div>
                  <div className="p-4 bg-zinc-900/50 rounded-xl border border-primary/30">
                    <h4 className="font-medium mb-2 text-primary">Staked Credits</h4>
                    <p className="text-sm text-zinc-400">
                      Premium credits from locked collateral. 1 MUSD = 1,350 Staked Credits. Collateral is returnable with yield.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">What Credits Pay For</h3>
                <ul className="space-y-2 text-zinc-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    Build minutes for application deployments
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    Hosting uptime for deployed services
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    Smart contract compilation and deployment gas
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    Add-on services (PostgreSQL, Redis, etc.)
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Transaction History</h3>
                <p className="text-sm text-zinc-400">
                  View all your credit purchases, usage, and yield earnings in the billing dashboard. Export transaction history for accounting purposes.
                </p>
              </div>
            </div>
          </section>

          {/* Community Benefits */}
          <section id="benefits" className="mb-20">
            <SectionHeader icon={<Users />} title="Community Benefits" />

            <p className="text-zinc-400 mb-8">
              Mezo PaaS is designed to empower the Bitcoin developer community with tools, economics, and infrastructure that puts developers first.
            </p>

            <div className="grid gap-6">
              <BenefitCard
                icon={<Zap className="w-6 h-6" />}
                title="Zero Setup Development"
                description="No local installation required. Open your browser, connect your wallet, and start coding. The IDE runs entirely in the cloud with all tools pre-configured."
              />
              <BenefitCard
                icon={<Coins className="w-6 h-6" />}
                title="Sustainable Economics"
                description="Yield for Compute creates a win-win: developers get cheap compute while the protocol gains deep liquidity. No burning tokens, no unsustainable subsidies."
              />
              <BenefitCard
                icon={<Shield className="w-6 h-6" />}
                title="Bitcoin Security"
                description="Built on the Mezo protocol, inheriting Bitcoin's security guarantees. Your funds and deployments are protected by the most secure blockchain network."
              />
              <BenefitCard
                icon={<Globe className="w-6 h-6" />}
                title="Protocol Integration"
                description="Native access to Mezo DeFi protocols. Import ABIs from the protocol registry, interact with existing contracts, and build on top of established infrastructure."
              />
              <BenefitCard
                icon={<Rocket className="w-6 h-6" />}
                title="Production Ready"
                description="Auto-scaling, SSL certificates, zero-downtime deployments, and custom domains included. Ship production applications from day one."
              />
              <BenefitCard
                icon={<Users className="w-6 h-6" />}
                title="Community Driven"
                description="Open development, transparent economics, and community governance. Help shape the future of Bitcoin-native infrastructure."
              />
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" className="mb-20">
            <SectionHeader icon={<Users />} title="Frequently Asked Questions" />

            <div className="space-y-6">
              <FAQItem
                question="What is MUSD?"
                answer="MUSD is the Mezo stablecoin, pegged to USD. It's used for all transactions on Mezo PaaS including credit purchases and collateral locking."
              />
              <FAQItem
                question="Is the IDE free to use?"
                answer="The IDE itself is free to use for writing and compiling contracts. You only pay when deploying contracts (gas fees) or when running hosted applications (compute credits)."
              />
              <FAQItem
                question="Can I deploy private GitHub repositories?"
                answer="Yes! Connect your GitHub account in the Integrations page to access both public and private repositories for deployment."
              />
              <FAQItem
                question="What happens to my collateral if I run out of credits?"
                answer="Your collateral remains locked and continues earning yield. You can add more collateral for additional credits or wait for your existing credits to cover your usage."
              />
              <FAQItem
                question="Which networks are supported?"
                answer="Mezo Testnet (Chain ID: 31611) for development and testing, and Mezo Mainnet (Chain ID: 31612) for production deployments."
              />
              <FAQItem
                question="How do I get testnet tokens?"
                answer="Visit the Mezo faucet to receive free testnet MUSD and BTC for development purposes."
              />
            </div>
          </section>

          {/* CTA */}
          <section className="text-center py-12 px-6 bg-gradient-to-br from-primary/10 to-transparent rounded-2xl border border-primary/20">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to Build on Bitcoin?</h2>
            <p className="text-zinc-400 mb-8 max-w-xl mx-auto">
              Join the growing community of developers building the future of Bitcoin DeFi with Mezo PaaS.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/ide"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-black rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Open IDE <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-zinc-800 text-white rounded-lg font-medium hover:bg-zinc-700 transition-colors"
              >
                Create Account <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          </section>

          {/* Footer */}
          <footer className="mt-20 pt-8 border-t border-zinc-800/50 text-center text-sm text-zinc-500">
            <p>Mezo PaaS Documentation</p>
            <p className="mt-1">Built with Bitcoin. Powered by Mezo Protocol.</p>
          </footer>
        </main>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-5 bg-zinc-900/50 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors">
      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-3">
        {icon}
      </div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-zinc-400">{description}</p>
    </div>
  )
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
        {icon}
      </div>
      <h2 className="text-2xl sm:text-3xl font-bold">{title}</h2>
    </div>
  )
}

function Step({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-10 h-10 bg-primary text-black rounded-full flex items-center justify-center font-bold">
        {number}
      </div>
      <div className="pt-1">
        <h4 className="font-semibold mb-1">{title}</h4>
        <p className="text-zinc-400 text-sm">{description}</p>
      </div>
    </div>
  )
}

function BenefitCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex gap-4 p-5 bg-zinc-900/30 rounded-xl border border-zinc-800/50 hover:border-zinc-700 transition-colors">
      <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold mb-1">{title}</h3>
        <p className="text-sm text-zinc-400">{description}</p>
      </div>
    </div>
  )
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="p-5 bg-zinc-900/30 rounded-xl border border-zinc-800/50">
      <h4 className="font-semibold mb-2">{question}</h4>
      <p className="text-sm text-zinc-400">{answer}</p>
    </div>
  )
}
