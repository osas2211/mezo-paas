/**
 * Mezo Protocol Registry
 * Live addresses, ABIs, and integration guides for Mezo core protocols
 */

export interface ProtocolFunction {
  name: string
  signature: string
  description: string
  type: "read" | "write"
}

export interface ProtocolEvent {
  name: string
  signature: string
  description: string
}

export interface Protocol {
  id: string
  name: string
  description: string
  category: "defi" | "token" | "infrastructure" | "governance"
  status: "live" | "testnet" | "coming-soon"
  docs?: string
  github?: string
  addresses: {
    testnet?: string
    mainnet?: string
  }
  abi: any[]
  functions: ProtocolFunction[]
  events: ProtocolEvent[]
  integrationGuide?: string
}

// ============================================================================
// MUSD Stablecoin
// ============================================================================

const MUSD_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
]

const MUSD_PROTOCOL: Protocol = {
  id: "musd",
  name: "MUSD Stablecoin",
  description: "Bitcoin-backed stablecoin. Mint MUSD by depositing BTC collateral in a CDP with minimum 150% collateral ratio.",
  category: "defi",
  status: "testnet",
  docs: "https://docs.mezo.org/musd",
  addresses: {
    testnet: "0x0000000000000000000000000000000000000000", // Placeholder
    mainnet: "0x0000000000000000000000000000000000000000", // Placeholder
  },
  abi: MUSD_ABI,
  functions: [
    { name: "balanceOf", signature: "balanceOf(address) → uint256", description: "Get MUSD balance of an address", type: "read" },
    { name: "totalSupply", signature: "totalSupply() → uint256", description: "Get total MUSD supply", type: "read" },
    { name: "transfer", signature: "transfer(address to, uint256 amount) → bool", description: "Transfer MUSD to another address", type: "write" },
    { name: "approve", signature: "approve(address spender, uint256 amount) → bool", description: "Approve spender to use MUSD", type: "write" },
  ],
  events: [
    { name: "Transfer", signature: "Transfer(address indexed from, address indexed to, uint256 value)", description: "Emitted on MUSD transfer" },
  ],
  integrationGuide: `
// Import MUSD interface
interface IMUSD {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

// Use in your contract
IMUSD public constant MUSD = IMUSD(0x...); // Replace with actual address

function checkBalance(address user) external view returns (uint256) {
    return MUSD.balanceOf(user);
}
`,
}

// ============================================================================
// CDP Manager
// ============================================================================

const CDP_MANAGER_ABI = [
  "function openCDP(uint256 collateral, uint256 debt) returns (uint256 cdpId)",
  "function closeCDP(uint256 cdpId)",
  "function addCollateral(uint256 cdpId, uint256 amount)",
  "function withdrawCollateral(uint256 cdpId, uint256 amount)",
  "function borrowMore(uint256 cdpId, uint256 amount)",
  "function repayDebt(uint256 cdpId, uint256 amount)",
  "function getCollateralRatio(uint256 cdpId) view returns (uint256)",
  "function isLiquidatable(uint256 cdpId) view returns (bool)",
  "function getCDP(uint256 cdpId) view returns (address owner, uint256 collateral, uint256 debt, uint256 lastUpdate)",
  "function liquidate(uint256 cdpId)",
  "event CDPOpened(address indexed owner, uint256 indexed cdpId, uint256 collateral, uint256 debt)",
  "event CDPClosed(address indexed owner, uint256 indexed cdpId)",
  "event CollateralAdded(uint256 indexed cdpId, uint256 amount)",
  "event CollateralWithdrawn(uint256 indexed cdpId, uint256 amount)",
  "event DebtIncreased(uint256 indexed cdpId, uint256 amount)",
  "event DebtRepaid(uint256 indexed cdpId, uint256 amount)",
  "event Liquidation(uint256 indexed cdpId, address indexed liquidator, uint256 collateralSeized)",
]

const CDP_MANAGER_PROTOCOL: Protocol = {
  id: "cdp-manager",
  name: "CDP Manager",
  description: "Manages Collateralized Debt Positions for MUSD minting. Deposit BTC, mint MUSD, manage collateral ratios.",
  category: "defi",
  status: "testnet",
  docs: "https://docs.mezo.org/cdp",
  addresses: {
    testnet: "0x0000000000000000000000000000000000000000", // Placeholder
    mainnet: "0x0000000000000000000000000000000000000000", // Placeholder
  },
  abi: CDP_MANAGER_ABI,
  functions: [
    { name: "openCDP", signature: "openCDP(uint256 collateral, uint256 debt) → uint256", description: "Open new CDP with BTC collateral", type: "write" },
    { name: "closeCDP", signature: "closeCDP(uint256 cdpId)", description: "Close CDP by repaying all debt", type: "write" },
    { name: "getCollateralRatio", signature: "getCollateralRatio(uint256 cdpId) → uint256", description: "Get collateral ratio in basis points (15000 = 150%)", type: "read" },
    { name: "isLiquidatable", signature: "isLiquidatable(uint256 cdpId) → bool", description: "Check if CDP can be liquidated", type: "read" },
    { name: "addCollateral", signature: "addCollateral(uint256 cdpId, uint256 amount)", description: "Add more collateral to CDP", type: "write" },
    { name: "repayDebt", signature: "repayDebt(uint256 cdpId, uint256 amount)", description: "Repay MUSD debt", type: "write" },
    { name: "liquidate", signature: "liquidate(uint256 cdpId)", description: "Liquidate undercollateralized CDP", type: "write" },
  ],
  events: [
    { name: "CDPOpened", signature: "CDPOpened(address indexed owner, uint256 indexed cdpId, uint256 collateral, uint256 debt)", description: "Emitted when CDP is opened" },
    { name: "Liquidation", signature: "Liquidation(uint256 indexed cdpId, address indexed liquidator, uint256 collateralSeized)", description: "Emitted on liquidation" },
  ],
  integrationGuide: `
// CDP Manager Interface
interface ICDPManager {
    function openCDP(uint256 collateral, uint256 debt) external returns (uint256 cdpId);
    function closeCDP(uint256 cdpId) external;
    function addCollateral(uint256 cdpId, uint256 amount) external;
    function getCollateralRatio(uint256 cdpId) external view returns (uint256);
    function isLiquidatable(uint256 cdpId) external view returns (bool);
}

// Example: Open a CDP
function openPosition(uint256 btcAmount, uint256 musdAmount) external {
    // Transfer BTC collateral
    IERC20(BTC).transferFrom(msg.sender, address(this), btcAmount);
    IERC20(BTC).approve(address(cdpManager), btcAmount);

    // Open CDP (must maintain 150% collateral ratio)
    uint256 cdpId = cdpManager.openCDP(btcAmount, musdAmount);

    // Verify ratio
    require(cdpManager.getCollateralRatio(cdpId) >= 15000, "Below min ratio");
}
`,
}

// ============================================================================
// tBTC Token
// ============================================================================

const TBTC_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
]

const TBTC_PROTOCOL: Protocol = {
  id: "tbtc",
  name: "tBTC",
  description: "Threshold BTC - The primary Bitcoin representation on Mezo. Bridged from Bitcoin mainnet via Threshold Network.",
  category: "token",
  status: "live",
  docs: "https://docs.threshold.network/applications/tbtc",
  addresses: {
    testnet: "0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503",
    mainnet: "0x0000000000000000000000000000000000000000", // Placeholder
  },
  abi: TBTC_ABI,
  functions: [
    { name: "balanceOf", signature: "balanceOf(address) → uint256", description: "Get tBTC balance", type: "read" },
    { name: "transfer", signature: "transfer(address to, uint256 amount) → bool", description: "Transfer tBTC", type: "write" },
    { name: "approve", signature: "approve(address spender, uint256 amount) → bool", description: "Approve tBTC spending", type: "write" },
  ],
  events: [
    { name: "Transfer", signature: "Transfer(address indexed from, address indexed to, uint256 value)", description: "Emitted on transfer" },
  ],
  integrationGuide: `
// tBTC is an ERC20 token
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// Testnet address
address constant TBTC = 0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503;

// Use in your contract
function depositBTC(uint256 amount) external {
    IERC20(TBTC).transferFrom(msg.sender, address(this), amount);
}
`,
}

// ============================================================================
// veBTC (Vote-Escrowed BTC)
// ============================================================================

const VEBTC_ABI = [
  "function lock(uint256 amount, uint256 duration) returns (uint256 lockId)",
  "function unlock(uint256 lockId)",
  "function extendLock(uint256 lockId, uint256 newDuration)",
  "function increaseAmount(uint256 lockId, uint256 amount)",
  "function getVotingPower(address account) view returns (uint256)",
  "function getLockInfo(uint256 lockId) view returns (uint256 amount, uint256 unlockTime, uint256 votingPower)",
  "function totalVotingPower() view returns (uint256)",
  "event Locked(address indexed user, uint256 indexed lockId, uint256 amount, uint256 duration)",
  "event Unlocked(address indexed user, uint256 indexed lockId, uint256 amount)",
]

const VEBTC_PROTOCOL: Protocol = {
  id: "vebtc",
  name: "veBTC (Vote-Escrowed BTC)",
  description: "Lock BTC to receive voting power and yield boosts on Mezo Earn. Longer locks = more voting power (up to 4 years).",
  category: "governance",
  status: "coming-soon",
  docs: "https://docs.mezo.org/earn/vebtc",
  addresses: {
    testnet: "0x0000000000000000000000000000000000000000", // Placeholder
    mainnet: "0x0000000000000000000000000000000000000000", // Placeholder
  },
  abi: VEBTC_ABI,
  functions: [
    { name: "lock", signature: "lock(uint256 amount, uint256 duration) → uint256", description: "Lock BTC for voting power", type: "write" },
    { name: "unlock", signature: "unlock(uint256 lockId)", description: "Unlock BTC after lock period", type: "write" },
    { name: "getVotingPower", signature: "getVotingPower(address) → uint256", description: "Get voting power of address", type: "read" },
    { name: "getLockInfo", signature: "getLockInfo(uint256 lockId) → (uint256, uint256, uint256)", description: "Get lock details", type: "read" },
  ],
  events: [
    { name: "Locked", signature: "Locked(address indexed user, uint256 indexed lockId, uint256 amount, uint256 duration)", description: "Emitted when BTC is locked" },
  ],
  integrationGuide: `
// veBTC Interface
interface IveBTC {
    function lock(uint256 amount, uint256 duration) external returns (uint256 lockId);
    function unlock(uint256 lockId) external;
    function getVotingPower(address account) external view returns (uint256);
}

// Lock BTC for 1 year
uint256 constant ONE_YEAR = 365 days;

function lockForVoting(uint256 btcAmount) external {
    IERC20(BTC).transferFrom(msg.sender, address(this), btcAmount);
    IERC20(BTC).approve(address(veBTC), btcAmount);

    uint256 lockId = veBTC.lock(btcAmount, ONE_YEAR);
    // Voting power = amount * (duration / MAX_DURATION)
    // 1 BTC locked for 4 years = 1 veBTC
    // 1 BTC locked for 1 year = 0.25 veBTC
}
`,
}

// ============================================================================
// veMEZO (Vote-Escrowed MEZO)
// ============================================================================

const VEMEZO_ABI = [
  "function lock(uint256 amount, uint256 duration) returns (uint256 lockId)",
  "function unlock(uint256 lockId)",
  "function getBoostMultiplier(address account) view returns (uint256)",
  "function getEpochRewards(uint256 epoch) view returns (uint256)",
  "function claimRewards() returns (uint256)",
  "event Locked(address indexed user, uint256 indexed lockId, uint256 amount, uint256 duration)",
  "event RewardsClaimed(address indexed user, uint256 amount)",
]

const VEMEZO_PROTOCOL: Protocol = {
  id: "vemezo",
  name: "veMEZO (Vote-Escrowed MEZO)",
  description: "Lock MEZO tokens for yield multipliers and emissions coordination. Boost your Mezo Earn rewards up to 2.5x.",
  category: "governance",
  status: "coming-soon",
  docs: "https://docs.mezo.org/earn/vemezo",
  addresses: {
    testnet: "0x0000000000000000000000000000000000000000", // Placeholder
    mainnet: "0x0000000000000000000000000000000000000000", // Placeholder
  },
  abi: VEMEZO_ABI,
  functions: [
    { name: "lock", signature: "lock(uint256 amount, uint256 duration) → uint256", description: "Lock MEZO for boost multiplier", type: "write" },
    { name: "getBoostMultiplier", signature: "getBoostMultiplier(address) → uint256", description: "Get yield boost (10000 = 1x, 25000 = 2.5x)", type: "read" },
    { name: "claimRewards", signature: "claimRewards() → uint256", description: "Claim accumulated rewards", type: "write" },
  ],
  events: [
    { name: "RewardsClaimed", signature: "RewardsClaimed(address indexed user, uint256 amount)", description: "Emitted when rewards claimed" },
  ],
  integrationGuide: `
// veMEZO Interface
interface IveMEZO {
    function lock(uint256 amount, uint256 duration) external returns (uint256 lockId);
    function getBoostMultiplier(address account) external view returns (uint256);
    function claimRewards() external returns (uint256);
}

// Calculate boosted yield
function calculateBoostedYield(address user, uint256 baseYield) external view returns (uint256) {
    uint256 multiplier = veMEZO.getBoostMultiplier(user);
    // multiplier is in basis points (10000 = 1x)
    return (baseYield * multiplier) / 10000;
}
`,
}

// ============================================================================
// Gauge Controller
// ============================================================================

const GAUGE_ABI = [
  "function deposit(uint256 amount)",
  "function withdraw(uint256 amount)",
  "function claimRewards() returns (uint256)",
  "function getRewardRate() view returns (uint256)",
  "function getWeight() view returns (uint256)",
  "function vote(uint256 weight)",
  "function balanceOf(address account) view returns (uint256)",
  "event Deposited(address indexed user, uint256 amount)",
  "event Withdrawn(address indexed user, uint256 amount)",
  "event RewardPaid(address indexed user, uint256 reward)",
]

const GAUGE_PROTOCOL: Protocol = {
  id: "gauge",
  name: "Liquidity Gauge",
  description: "Stake LP tokens in gauges to earn MEZO rewards. Vote with veBTC to direct emissions to your preferred gauges.",
  category: "defi",
  status: "coming-soon",
  docs: "https://docs.mezo.org/earn/gauges",
  addresses: {
    testnet: "0x0000000000000000000000000000000000000000", // Placeholder
    mainnet: "0x0000000000000000000000000000000000000000", // Placeholder
  },
  abi: GAUGE_ABI,
  functions: [
    { name: "deposit", signature: "deposit(uint256 amount)", description: "Stake LP tokens in gauge", type: "write" },
    { name: "withdraw", signature: "withdraw(uint256 amount)", description: "Withdraw LP tokens", type: "write" },
    { name: "claimRewards", signature: "claimRewards() → uint256", description: "Claim MEZO rewards", type: "write" },
    { name: "getRewardRate", signature: "getRewardRate() → uint256", description: "Current reward rate per second", type: "read" },
    { name: "vote", signature: "vote(uint256 weight)", description: "Vote for gauge weight (requires veBTC)", type: "write" },
  ],
  events: [
    { name: "RewardPaid", signature: "RewardPaid(address indexed user, uint256 reward)", description: "Emitted when rewards claimed" },
  ],
  integrationGuide: `
// Gauge Interface
interface IGauge {
    function deposit(uint256 amount) external;
    function withdraw(uint256 amount) external;
    function claimRewards() external returns (uint256);
    function getRewardRate() external view returns (uint256);
}

// Stake LP tokens
function stakeLPTokens(address gauge, uint256 amount) external {
    IERC20(lpToken).transferFrom(msg.sender, address(this), amount);
    IERC20(lpToken).approve(gauge, amount);
    IGauge(gauge).deposit(amount);
}

// Harvest rewards
function harvest(address gauge) external returns (uint256) {
    return IGauge(gauge).claimRewards();
}
`,
}

// ============================================================================
// MEZO Token
// ============================================================================

const MEZO_TOKEN_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
]

const MEZO_TOKEN_PROTOCOL: Protocol = {
  id: "mezo-token",
  name: "MEZO Token",
  description: "The native governance and utility token of the Mezo ecosystem. Used for staking, governance, and fee payments.",
  category: "token",
  status: "live",
  docs: "https://docs.mezo.org/token",
  addresses: {
    testnet: "0x7B7c000000000000000000000000000000000001",
    mainnet: "0x7B7c000000000000000000000000000000000001",
  },
  abi: MEZO_TOKEN_ABI,
  functions: [
    { name: "balanceOf", signature: "balanceOf(address) → uint256", description: "Get MEZO balance", type: "read" },
    { name: "transfer", signature: "transfer(address to, uint256 amount) → bool", description: "Transfer MEZO", type: "write" },
    { name: "approve", signature: "approve(address spender, uint256 amount) → bool", description: "Approve MEZO spending", type: "write" },
  ],
  events: [
    { name: "Transfer", signature: "Transfer(address indexed from, address indexed to, uint256 value)", description: "Emitted on transfer" },
  ],
  integrationGuide: `
// MEZO is the native token (precompile)
address constant MEZO = 0x7B7c000000000000000000000000000000000001;

// Use standard ERC20 interface
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

function getMezoBalance(address user) external view returns (uint256) {
    return IERC20(MEZO).balanceOf(user);
}
`,
}

// ============================================================================
// All Protocols
// ============================================================================

export const PROTOCOLS: Protocol[] = [
  TBTC_PROTOCOL,
  MEZO_TOKEN_PROTOCOL,
  MUSD_PROTOCOL,
  CDP_MANAGER_PROTOCOL,
  VEBTC_PROTOCOL,
  VEMEZO_PROTOCOL,
  GAUGE_PROTOCOL,
]

// Get protocol by ID
export function getProtocol(id: string): Protocol | undefined {
  return PROTOCOLS.find((p) => p.id === id)
}

// Get protocols by category
export function getProtocolsByCategory(category: Protocol["category"]): Protocol[] {
  return PROTOCOLS.filter((p) => p.category === category)
}

// Get protocols by status
export function getProtocolsByStatus(status: Protocol["status"]): Protocol[] {
  return PROTOCOLS.filter((p) => p.status === status)
}

// Search protocols
export function searchProtocols(query: string): Protocol[] {
  const lowerQuery = query.toLowerCase()
  return PROTOCOLS.filter(
    (p) =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery) ||
      p.id.toLowerCase().includes(lowerQuery)
  )
}

// Generate Solidity interface from protocol
export function generateInterface(protocol: Protocol): string {
  const lines = [
    `// SPDX-License-Identifier: MIT`,
    `pragma solidity ^0.8.20;`,
    ``,
    `/**`,
    ` * @title I${protocol.name.replace(/[^a-zA-Z0-9]/g, "")}`,
    ` * @notice ${protocol.description}`,
    ` */`,
    `interface I${protocol.name.replace(/[^a-zA-Z0-9]/g, "")} {`,
  ]

  // Add functions
  for (const fn of protocol.functions) {
    const viewMod = fn.type === "read" ? " view" : ""
    const returnType = fn.signature.includes("→")
      ? ` returns (${fn.signature.split("→")[1].trim()})`
      : ""
    const params = fn.signature.split("(")[1].split(")")[0]
    lines.push(`    /// @notice ${fn.description}`)
    lines.push(`    function ${fn.name}(${params}) external${viewMod}${returnType};`)
    lines.push(``)
  }

  // Add events
  for (const event of protocol.events) {
    lines.push(`    /// @notice ${event.description}`)
    lines.push(`    event ${event.signature};`)
    lines.push(``)
  }

  lines.push(`}`)

  return lines.join("\n")
}
