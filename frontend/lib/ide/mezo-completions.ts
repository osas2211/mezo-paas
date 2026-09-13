/**
 * Mezo-specific code completions and snippets for the IDE
 * These provide contextual autocomplete for Mezo development patterns
 */

export interface MezoCompletion {
  label: string
  kind: "snippet" | "function" | "interface" | "constant" | "keyword"
  insertText: string
  documentation: string
  detail?: string
}

// ============================================================================
// MUSD & CDP Patterns
// ============================================================================

export const MUSD_COMPLETIONS: MezoCompletion[] = [
  {
    label: "IMUSD",
    kind: "interface",
    insertText: `interface IMUSD {
    function mint(address to, uint256 amount) external;
    function burn(address from, uint256 amount) external;
    function balanceOf(address account) external view returns (uint256);
    function totalSupply() external view returns (uint256);
}`,
    documentation: "MUSD stablecoin interface - Mezo's Bitcoin-backed stablecoin",
    detail: "Mezo MUSD Interface",
  },
  {
    label: "ICDPManager",
    kind: "interface",
    insertText: `interface ICDPManager {
    function openCDP(uint256 collateral, uint256 debt) external returns (uint256 cdpId);
    function closeCDP(uint256 cdpId) external;
    function addCollateral(uint256 cdpId, uint256 amount) external;
    function withdrawCollateral(uint256 cdpId, uint256 amount) external;
    function borrowMore(uint256 cdpId, uint256 amount) external;
    function repayDebt(uint256 cdpId, uint256 amount) external;
    function getCollateralRatio(uint256 cdpId) external view returns (uint256);
    function isLiquidatable(uint256 cdpId) external view returns (bool);
}`,
    documentation: "CDP Manager interface for managing Collateralized Debt Positions on Mezo",
    detail: "Mezo CDP Manager",
  },
  {
    label: "musd-mint-pattern",
    kind: "snippet",
    insertText: `// MUSD Minting Pattern
IMUSD public immutable musd;
ICDPManager public immutable cdpManager;

function mintMUSD(uint256 collateralAmount, uint256 musdAmount) external {
    // Transfer BTC collateral
    IERC20(btcToken).transferFrom(msg.sender, address(this), collateralAmount);
    IERC20(btcToken).approve(address(cdpManager), collateralAmount);

    // Open CDP and mint MUSD
    uint256 cdpId = cdpManager.openCDP(collateralAmount, musdAmount);

    // Verify collateral ratio >= 150%
    require(cdpManager.getCollateralRatio(cdpId) >= 15000, "Below min collateral ratio");

    emit CDPOpened(msg.sender, cdpId, collateralAmount, musdAmount);
}`,
    documentation: "Pattern for minting MUSD by opening a CDP with BTC collateral. Includes 150% collateral ratio check.",
    detail: "MUSD Minting Pattern",
  },
  {
    label: "musd-liquidation-check",
    kind: "snippet",
    insertText: `// Check if CDP is liquidatable (below 150% collateral ratio)
function checkLiquidation(uint256 cdpId) public view returns (bool canLiquidate, uint256 collateralRatio) {
    collateralRatio = cdpManager.getCollateralRatio(cdpId);
    canLiquidate = collateralRatio < 15000; // 150% = 15000 basis points
}

function liquidateCDP(uint256 cdpId) external {
    require(cdpManager.isLiquidatable(cdpId), "CDP not liquidatable");
    // Liquidation logic...
}`,
    documentation: "Pattern for checking and executing CDP liquidations on Mezo",
    detail: "CDP Liquidation Check",
  },
]

// ============================================================================
// Mezo Earn / veBTC / veMEZO Patterns
// ============================================================================

export const EARN_COMPLETIONS: MezoCompletion[] = [
  {
    label: "IveBTC",
    kind: "interface",
    insertText: `interface IveBTC {
    function lock(uint256 amount, uint256 duration) external returns (uint256 veBTCAmount);
    function unlock(uint256 lockId) external;
    function getVotingPower(address account) external view returns (uint256);
    function getLockInfo(uint256 lockId) external view returns (
        uint256 amount,
        uint256 unlockTime,
        uint256 votingPower
    );
}`,
    documentation: "veBTC interface - Vote-escrowed BTC for Mezo Earn yield and governance",
    detail: "Mezo veBTC Interface",
  },
  {
    label: "IveMEZO",
    kind: "interface",
    insertText: `interface IveMEZO {
    function lock(uint256 amount, uint256 duration) external returns (uint256 veMEZOAmount);
    function unlock(uint256 lockId) external;
    function getBoostMultiplier(address account) external view returns (uint256);
    function getEpochRewards(uint256 epoch) external view returns (uint256);
}`,
    documentation: "veMEZO interface - Emissions coordinator and yield multiplier token",
    detail: "Mezo veMEZO Interface",
  },
  {
    label: "IGauge",
    kind: "interface",
    insertText: `interface IGauge {
    function deposit(uint256 amount) external;
    function withdraw(uint256 amount) external;
    function claimRewards() external returns (uint256);
    function getRewardRate() external view returns (uint256);
    function getWeight() external view returns (uint256);
    function vote(uint256 weight) external;
}`,
    documentation: "Gauge interface for Mezo liquidity mining and vote-directed emissions",
    detail: "Mezo Gauge Interface",
  },
  {
    label: "vebtc-lock-pattern",
    kind: "snippet",
    insertText: `// veBTC Locking Pattern for Mezo Earn
uint256 constant MIN_LOCK_DURATION = 7 days;
uint256 constant MAX_LOCK_DURATION = 4 * 365 days; // 4 years max

function lockBTCForVoting(uint256 btcAmount, uint256 lockDuration) external {
    require(lockDuration >= MIN_LOCK_DURATION, "Lock too short");
    require(lockDuration <= MAX_LOCK_DURATION, "Lock too long");

    // Transfer BTC
    IERC20(btcToken).transferFrom(msg.sender, address(this), btcAmount);
    IERC20(btcToken).approve(address(veBTC), btcAmount);

    // Lock and receive veBTC (voting power)
    uint256 vePower = veBTC.lock(btcAmount, lockDuration);

    // Voting power scales with lock duration
    // 1 BTC locked for 4 years = 1 veBTC
    // 1 BTC locked for 1 year = 0.25 veBTC

    emit BTCLocked(msg.sender, btcAmount, lockDuration, vePower);
}`,
    documentation: "Pattern for locking BTC to receive veBTC voting power on Mezo Earn",
    detail: "veBTC Lock Pattern",
  },
  {
    label: "yield-multiplier-calc",
    kind: "snippet",
    insertText: `// Calculate yield multiplier based on veBTC + veMEZO
function calculateYieldMultiplier(address user) public view returns (uint256 multiplier) {
    uint256 veBTCPower = veBTC.getVotingPower(user);
    uint256 veMEZOBoost = veMEZO.getBoostMultiplier(user);

    // Base multiplier: 1x (10000 basis points)
    multiplier = 10000;

    // veBTC adds up to 1.5x boost
    if (veBTCPower > 0) {
        uint256 veBTCBoost = (veBTCPower * 5000) / totalVeBTC; // Max 0.5x
        multiplier += veBTCBoost;
    }

    // veMEZO adds up to 2x boost
    multiplier = (multiplier * veMEZOBoost) / 10000;

    return multiplier; // Returns basis points (10000 = 1x, 25000 = 2.5x)
}`,
    documentation: "Calculate combined yield multiplier from veBTC and veMEZO positions",
    detail: "Yield Multiplier Calculation",
  },
]

// ============================================================================
// Mezo Passport / Multi-Wallet Patterns
// ============================================================================

export const PASSPORT_COMPLETIONS: MezoCompletion[] = [
  {
    label: "IMezoPassport",
    kind: "interface",
    insertText: `interface IMezoPassport {
    function getLinkedAddresses(address evmAddress) external view returns (
        address[] memory evmAddresses,
        bytes[] memory btcAddresses
    );
    function isLinked(address evmAddress, bytes calldata btcAddress) external view returns (bool);
    function getBTCBalance(bytes calldata btcAddress) external view returns (uint256);
}`,
    documentation: "Mezo Passport interface for linking BTC and EVM wallets",
    detail: "Mezo Passport Interface",
  },
  {
    label: "passport-check-pattern",
    kind: "snippet",
    insertText: `// Check if user has linked BTC wallet via Mezo Passport
IMezoPassport public immutable passport;

modifier hasLinkedBTCWallet() {
    (address[] memory evmAddrs, bytes[] memory btcAddrs) = passport.getLinkedAddresses(msg.sender);
    require(btcAddrs.length > 0, "No BTC wallet linked via Passport");
    _;
}

function getLinkedBTCAddress(address user) public view returns (bytes memory) {
    (, bytes[] memory btcAddrs) = passport.getLinkedAddresses(user);
    require(btcAddrs.length > 0, "No linked BTC address");
    return btcAddrs[0]; // Return primary BTC address
}`,
    documentation: "Pattern for checking Mezo Passport linked wallets in smart contracts",
    detail: "Passport Check Pattern",
  },
  {
    label: "dual-wallet-rewards",
    kind: "snippet",
    insertText: `// Distribute rewards to both EVM and BTC wallets via Passport
function distributeRewards(address user, uint256 amount) internal {
    (address[] memory evmAddrs, bytes[] memory btcAddrs) = passport.getLinkedAddresses(user);

    uint256 evmShare = amount / 2;
    uint256 btcShare = amount - evmShare;

    // Send to EVM wallet
    if (evmAddrs.length > 0) {
        rewardToken.transfer(evmAddrs[0], evmShare);
    }

    // Queue BTC rewards (bridge to Bitcoin)
    if (btcAddrs.length > 0) {
        btcBridge.queueWithdrawal(btcAddrs[0], btcShare);
    }

    emit RewardsDistributed(user, evmShare, btcShare);
}`,
    documentation: "Pattern for distributing rewards to linked EVM and BTC wallets",
    detail: "Dual Wallet Rewards",
  },
]

// ============================================================================
// BTC-Native Patterns (tBTC, Native Gas)
// ============================================================================

export const BTC_COMPLETIONS: MezoCompletion[] = [
  {
    label: "ItBTC",
    kind: "interface",
    insertText: `interface ItBTC is IERC20 {
    function mint(address to, uint256 amount) external;
    function burn(uint256 amount) external;
    function bridgeToL1(bytes calldata btcAddress, uint256 amount) external;
}`,
    documentation: "tBTC interface - Threshold BTC token used on Mezo",
    detail: "tBTC Interface",
  },
  {
    label: "btc-gas-estimation",
    kind: "snippet",
    insertText: `// Estimate gas cost in Satoshis (Mezo native)
function estimateGasCostInSats(uint256 gasUnits) public view returns (uint256 sats) {
    uint256 gasPrice = tx.gasprice;
    uint256 totalWei = gasUnits * gasPrice;

    // On Mezo: 1 BTC = 10^18 wei, 1 sat = 10^10 wei
    sats = totalWei / 1e10;

    return sats;
}

function requireSufficientBTCForGas(uint256 estimatedGas) internal view {
    uint256 costInSats = estimateGasCostInSats(estimatedGas);
    uint256 userBalanceInSats = address(msg.sender).balance / 1e10;
    require(userBalanceInSats >= costInSats, "Insufficient BTC for gas");
}`,
    documentation: "Pattern for estimating and checking gas costs in Satoshis on Mezo",
    detail: "BTC Gas Estimation",
  },
  {
    label: "btc-fee-calculation",
    kind: "snippet",
    insertText: `// Calculate fees in BTC terms
uint256 constant SATS_PER_BTC = 100_000_000;
uint256 constant WEI_PER_SAT = 1e10;

function calculateFeeInBTC(uint256 feeInWei) public pure returns (
    uint256 sats,
    uint256 btcWhole,
    uint256 btcFraction
) {
    sats = feeInWei / WEI_PER_SAT;
    btcWhole = sats / SATS_PER_BTC;
    btcFraction = sats % SATS_PER_BTC;
}

function formatBTCAmount(uint256 sats) public pure returns (string memory) {
    // Returns formatted BTC string (e.g., "0.00045230")
    uint256 btc = sats / SATS_PER_BTC;
    uint256 remainder = sats % SATS_PER_BTC;
    // Format logic...
}`,
    documentation: "Utilities for calculating and formatting BTC fees on Mezo",
    detail: "BTC Fee Calculation",
  },
  {
    label: "native-btc-transfer",
    kind: "snippet",
    insertText: `// Transfer native BTC on Mezo (like ETH transfer on Ethereum)
function transferBTC(address payable recipient, uint256 amountInSats) external {
    uint256 amountInWei = amountInSats * 1e10;
    require(address(this).balance >= amountInWei, "Insufficient BTC balance");

    (bool success, ) = recipient.call{value: amountInWei}("");
    require(success, "BTC transfer failed");

    emit BTCTransferred(msg.sender, recipient, amountInSats);
}

// Receive native BTC
receive() external payable {
    uint256 satsReceived = msg.value / 1e10;
    emit BTCReceived(msg.sender, satsReceived);
}`,
    documentation: "Pattern for transferring native BTC on Mezo (similar to ETH on Ethereum)",
    detail: "Native BTC Transfer",
  },
]

// ============================================================================
// Mezo-Specific Events
// ============================================================================

export const EVENT_COMPLETIONS: MezoCompletion[] = [
  {
    label: "mezo-events",
    kind: "snippet",
    insertText: `// Mezo-specific events for indexing and monitoring
event CDPOpened(address indexed owner, uint256 indexed cdpId, uint256 collateral, uint256 debt);
event CDPClosed(address indexed owner, uint256 indexed cdpId);
event CollateralAdded(uint256 indexed cdpId, uint256 amount);
event DebtRepaid(uint256 indexed cdpId, uint256 amount);
event Liquidation(uint256 indexed cdpId, address indexed liquidator, uint256 collateralSeized);
event MUSDMinted(address indexed to, uint256 amount);
event MUSDBurned(address indexed from, uint256 amount);
event BTCLocked(address indexed user, uint256 amount, uint256 duration, uint256 vePower);
event BTCUnlocked(address indexed user, uint256 amount);
event RewardsDistributed(address indexed user, uint256 evmAmount, uint256 btcAmount);`,
    documentation: "Common Mezo-specific events for DeFi operations",
    detail: "Mezo Events",
  },
]

// ============================================================================
// Common Mezo Constants
// ============================================================================

export const CONSTANT_COMPLETIONS: MezoCompletion[] = [
  {
    label: "mezo-constants",
    kind: "constant",
    insertText: `// Mezo Network Constants
uint256 constant MEZO_CHAIN_ID_TESTNET = 31611;
uint256 constant MEZO_CHAIN_ID_MAINNET = 31612;

// BTC Conversion Constants
uint256 constant SATS_PER_BTC = 100_000_000;
uint256 constant WEI_PER_SAT = 1e10;
uint256 constant WEI_PER_BTC = 1e18;

// CDP Constants
uint256 constant MIN_COLLATERAL_RATIO = 15000; // 150% in basis points
uint256 constant LIQUIDATION_PENALTY = 1000;   // 10% penalty

// veBTC Lock Constants
uint256 constant MIN_LOCK_DURATION = 7 days;
uint256 constant MAX_LOCK_DURATION = 4 * 365 days;
uint256 constant MAX_BOOST_MULTIPLIER = 25000; // 2.5x`,
    documentation: "Common constants used in Mezo smart contract development",
    detail: "Mezo Constants",
  },
  {
    label: "mezo-testnet-addresses",
    kind: "constant",
    insertText: `// Mezo Testnet Contract Addresses
address constant MUSD_ADDRESS = 0x0000000000000000000000000000000000000000; // TODO: Update
address constant TBTC_ADDRESS = 0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503;
address constant CDP_MANAGER_ADDRESS = 0x0000000000000000000000000000000000000000; // TODO: Update
address constant VEBTC_ADDRESS = 0x0000000000000000000000000000000000000000; // TODO: Update
address constant VEMEZO_ADDRESS = 0x0000000000000000000000000000000000000000; // TODO: Update
address constant PASSPORT_ADDRESS = 0x0000000000000000000000000000000000000000; // TODO: Update`,
    documentation: "Mezo testnet contract addresses (update with actual deployed addresses)",
    detail: "Testnet Addresses",
  },
]

// ============================================================================
// OpenZeppelin + Mezo Combinations
// ============================================================================

export const OZ_MEZO_COMPLETIONS: MezoCompletion[] = [
  {
    label: "mezo-erc20-btc",
    kind: "snippet",
    insertText: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MezoBTCToken
 * @dev ERC20 token backed by BTC on Mezo
 */
contract MezoBTCToken is ERC20, ERC20Burnable, Ownable {
    uint256 public constant SATS_PER_TOKEN = 100_000_000; // 1 token = 1 BTC worth

    constructor() ERC20("Mezo BTC Token", "mBTC") Ownable(msg.sender) {}

    function mint(address to, uint256 amountInSats) external onlyOwner {
        uint256 tokens = amountInSats * 1e18 / SATS_PER_TOKEN;
        _mint(to, tokens);
    }

    function burnForBTC(uint256 amount) external {
        _burn(msg.sender, amount);
        uint256 satsToReturn = amount * SATS_PER_TOKEN / 1e18;
        emit BTCRedemption(msg.sender, satsToReturn);
    }

    event BTCRedemption(address indexed redeemer, uint256 satsAmount);
}`,
    documentation: "ERC20 token template with BTC-native features for Mezo",
    detail: "Mezo BTC Token Template",
  },
  {
    label: "mezo-vault",
    kind: "snippet",
    insertText: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MezoVault
 * @dev BTC yield vault for Mezo Earn integration
 */
contract MezoVault is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable btcToken;

    struct UserStake {
        uint256 amount;
        uint256 lockEnd;
        uint256 rewardDebt;
    }

    mapping(address => UserStake) public stakes;
    uint256 public totalStaked;
    uint256 public rewardPerShare;

    constructor(address _btcToken) Ownable(msg.sender) {
        btcToken = IERC20(_btcToken);
    }

    function stake(uint256 amount, uint256 lockDuration) external nonReentrant {
        require(amount > 0, "Cannot stake 0");
        require(lockDuration >= 7 days, "Min lock: 7 days");

        btcToken.safeTransferFrom(msg.sender, address(this), amount);

        stakes[msg.sender] = UserStake({
            amount: amount,
            lockEnd: block.timestamp + lockDuration,
            rewardDebt: (amount * rewardPerShare) / 1e18
        });

        totalStaked += amount;
        emit Staked(msg.sender, amount, lockDuration);
    }

    function withdraw() external nonReentrant {
        UserStake storage userStake = stakes[msg.sender];
        require(userStake.amount > 0, "No stake");
        require(block.timestamp >= userStake.lockEnd, "Still locked");

        uint256 amount = userStake.amount;
        uint256 pending = pendingRewards(msg.sender);

        totalStaked -= amount;
        delete stakes[msg.sender];

        btcToken.safeTransfer(msg.sender, amount + pending);
        emit Withdrawn(msg.sender, amount, pending);
    }

    function pendingRewards(address user) public view returns (uint256) {
        UserStake storage userStake = stakes[user];
        return (userStake.amount * rewardPerShare / 1e18) - userStake.rewardDebt;
    }

    event Staked(address indexed user, uint256 amount, uint256 lockDuration);
    event Withdrawn(address indexed user, uint256 amount, uint256 rewards);
}`,
    documentation: "BTC yield vault template with Mezo Earn integration patterns",
    detail: "Mezo Vault Template",
  },
]

// ============================================================================
// All completions combined
// ============================================================================

export const ALL_MEZO_COMPLETIONS: MezoCompletion[] = [
  ...MUSD_COMPLETIONS,
  ...EARN_COMPLETIONS,
  ...PASSPORT_COMPLETIONS,
  ...BTC_COMPLETIONS,
  ...EVENT_COMPLETIONS,
  ...CONSTANT_COMPLETIONS,
  ...OZ_MEZO_COMPLETIONS,
]

// ============================================================================
// Hover Documentation
// ============================================================================

export const MEZO_HOVER_DOCS: Record<string, string> = {
  // Core Mezo Keywords
  "MUSD": "**MUSD** - Mezo's Bitcoin-backed stablecoin. Minted by depositing BTC as collateral in a CDP with minimum 150% collateral ratio.",
  "musd": "**MUSD** - Mezo's Bitcoin-backed stablecoin. Minted by depositing BTC as collateral in a CDP with minimum 150% collateral ratio.",
  "tBTC": "**tBTC** - Threshold BTC token, the primary BTC representation on Mezo. Bridged from Bitcoin mainnet.",
  "veBTC": "**veBTC** - Vote-escrowed BTC. Lock BTC to receive voting power and yield boosts on Mezo Earn. Longer locks = more power.",
  "veMEZO": "**veMEZO** - Vote-escrowed MEZO token. Acts as emissions coordinator and yield multiplier in Mezo Earn.",
  "CDP": "**CDP** - Collateralized Debt Position. Deposit BTC collateral to mint MUSD. Liquidated if ratio falls below 150%.",
  "cdp": "**CDP** - Collateralized Debt Position. Deposit BTC collateral to mint MUSD. Liquidated if ratio falls below 150%.",
  "Passport": "**Mezo Passport** - Links EVM wallets with native Bitcoin wallets. Enables dual-wallet UX for Mezo dApps.",
  "passport": "**Mezo Passport** - Links EVM wallets with native Bitcoin wallets. Enables dual-wallet UX for Mezo dApps.",
  "Mezo": "**Mezo** - Bitcoin economic layer. EVM-compatible L2 where gas is paid in BTC (satoshis). Chain IDs: 31611 (testnet), 31612 (mainnet).",
  "mezo": "**Mezo** - Bitcoin economic layer. EVM-compatible L2 where gas is paid in BTC (satoshis). Chain IDs: 31611 (testnet), 31612 (mainnet).",

  // Interfaces
  "IMUSD": "**IMUSD** - Interface for Mezo's MUSD stablecoin. Includes mint, burn, and balance functions.",
  "ICDPManager": "**ICDPManager** - Interface for managing Collateralized Debt Positions. Open/close CDPs, manage collateral, borrow/repay.",
  "IveBTC": "**IveBTC** - Interface for vote-escrowed BTC. Lock BTC to get voting power in Mezo governance.",
  "IveMEZO": "**IveMEZO** - Interface for vote-escrowed MEZO. Provides yield boosts in Mezo Earn.",
  "IGauge": "**IGauge** - Interface for Mezo liquidity gauges. Stake LP tokens to earn rewards.",
  "IMezoPassport": "**IMezoPassport** - Interface for wallet linking. Get linked BTC and EVM addresses.",
  "ItBTC": "**ItBTC** - Interface for Threshold BTC token with mint, burn, and bridge functions.",

  // Functions
  "openCDP": "Opens a new Collateralized Debt Position with BTC collateral to mint MUSD.",
  "closeCDP": "Closes a CDP by repaying all debt and returning collateral.",
  "getCollateralRatio": "Returns the current collateral ratio of a CDP in basis points (15000 = 150%).",
  "isLiquidatable": "Returns true if CDP is below 150% collateral ratio and can be liquidated.",
  "liquidateCDP": "Liquidates an undercollateralized CDP. Caller receives liquidation bonus.",
  "addCollateral": "Adds more BTC collateral to an existing CDP to improve its health ratio.",
  "withdrawCollateral": "Withdraws excess collateral from a CDP (must stay above 150% ratio).",
  "borrowMore": "Borrows additional MUSD from an existing CDP.",
  "repayDebt": "Repays MUSD debt to a CDP.",
  "getVotingPower": "Returns the veBTC voting power for an account based on their locked BTC.",
  "getBoostMultiplier": "Returns the yield boost multiplier from veMEZO holdings.",
  "getLinkedAddresses": "Returns all EVM and BTC addresses linked via Mezo Passport.",
  "lock": "Locks tokens (BTC or MEZO) for a duration to receive vote-escrowed tokens.",
  "unlock": "Unlocks tokens after the lock period expires.",
  "claimRewards": "Claims pending rewards from a gauge or vault.",
  "bridgeToL1": "Bridges tBTC back to Bitcoin mainnet.",

  // Constants & Numbers
  "31611": "**Mezo Testnet** chain ID - Use for development and testing.",
  "31612": "**Mezo Mainnet** chain ID - Production network.",
  "15000": "**150%** - Minimum collateral ratio for CDPs (in basis points). Below this = liquidatable.",
  "SATS_PER_BTC": "**100,000,000** - Number of satoshis in 1 BTC.",
  "WEI_PER_SAT": "**10^10** - Wei per satoshi on Mezo (1 BTC = 10^18 wei).",
  "MIN_COLLATERAL_RATIO": "**150%** - Minimum safe collateral ratio for CDPs.",
  "LIQUIDATION_PENALTY": "**10%** - Penalty paid during CDP liquidation.",
  "MIN_LOCK_DURATION": "**7 days** - Minimum veBTC/veMEZO lock duration.",
  "MAX_LOCK_DURATION": "**4 years** - Maximum lock for maximum voting power.",

  // Gas & Fees
  "gasprice": "On Mezo, gas is priced in satoshis (BTC). Use `tx.gasprice / 1e10` for sats.",
  "sats": "**Satoshis** - The smallest unit of Bitcoin. 1 BTC = 100,000,000 sats.",
  "satoshis": "**Satoshis** - The smallest unit of Bitcoin. 1 BTC = 100,000,000 sats.",

  // Common Patterns
  "collateralRatio": "Ratio of collateral value to debt value. Expressed in basis points (10000 = 100%).",
  "votingPower": "Governance voting weight from veBTC. Scales with lock duration.",
  "boostMultiplier": "Yield multiplier from veMEZO. Can boost rewards up to 2.5x.",
}

// Get hover documentation for a word (case-insensitive search)
export function getMezoHoverDoc(word: string): string | null {
  // Direct match
  if (MEZO_HOVER_DOCS[word]) {
    return MEZO_HOVER_DOCS[word]
  }

  // Case-insensitive search
  const lowerWord = word.toLowerCase()
  for (const [key, value] of Object.entries(MEZO_HOVER_DOCS)) {
    if (key.toLowerCase() === lowerWord) {
      return value
    }
  }

  // Partial matches for common patterns
  if (lowerWord.includes("cdp")) {
    return MEZO_HOVER_DOCS["CDP"]
  }
  if (lowerWord.includes("musd")) {
    return MEZO_HOVER_DOCS["MUSD"]
  }
  if (lowerWord.includes("vebtc")) {
    return MEZO_HOVER_DOCS["veBTC"]
  }
  if (lowerWord.includes("vemezo")) {
    return MEZO_HOVER_DOCS["veMEZO"]
  }

  return null
}
