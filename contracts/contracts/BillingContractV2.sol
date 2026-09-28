// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title MezoHostBillingV2
 * @notice Billing contract with treasury management for yield generation
 * @dev Supports moving collateral to treasury for off-chain yield strategies
 * @dev IMPORTANT: Only supports standard ERC-20 tokens. Fee-on-transfer tokens are NOT supported.
 *
 * Security fixes (2026-09-19):
 * - Two-step treasury change with 24-hour timelock
 * - emergencyWithdraw restricted to excess funds only
 * - Permissionless claimQueuedWithdrawal for users
 * - totalPendingWithdrawals tracked for accurate reserve calculation
 * - Cannot lock while withdrawal is pending
 * - Reserve ratio includes pending withdrawals in calculation
 *
 * Security fixes (2026-09-28, round 2):
 * - Finding 6: early-withdrawal penalty only leaves the contract together with the payout;
 *   on the queued path it is recorded on the request and settled at claim time
 * - Finding 7: exits (withdrawCollateral, claimQueuedWithdrawal) are no longer pausable;
 *   pause only gates entry points and outflows to treasury
 * - Finding 8: minimum reserve raised to 20%; moving collateral to treasury is a
 *   propose -> execute flow with a 48-hour timelock so users can exit ahead of a large move;
 *   getLiquidityStatus() discloses how much is redeemable on demand
 * - Immediate payouts no longer consume funds already owed to queued withdrawals
 *
 * RESERVE POLICY DISCLOSURE: only reserveRatioBps (min 20%) of user liabilities is guaranteed
 * to stay in this contract. The rest may be held by the treasury off-chain for yield, and
 * withdrawals beyond on-hand liquidity are queued until the treasury returns funds.
 */
contract MezoHostBillingV2 is ReentrancyGuard, Ownable, Pausable {
    // ==========================================
    // STATE VARIABLES
    // ==========================================

    IERC20 public immutable token;
    address public treasury;

    /// @notice 5% penalty for early withdrawal
    uint256 public constant PENALTY_PERCENT = 5;

    /// @notice Timelock delay for treasury changes (24 hours)
    uint256 public constant TREASURY_CHANGE_DELAY = 24 hours;

    /// @notice Timelock delay before a proposed treasury move can execute (48 hours)
    uint256 public constant TREASURY_MOVE_DELAY = 48 hours;

    /// @notice Window after the delay in which a proposed move can execute before it expires
    uint256 public constant TREASURY_MOVE_EXECUTION_WINDOW = 7 days;

    /// @notice Reserve ratio bounds in basis points
    uint256 public constant MIN_RESERVE_RATIO_BPS = 2000;
    uint256 public constant MAX_RESERVE_RATIO_BPS = 5000;

    /// @notice Minimum reserve ratio (20% = 2000 basis points)
    uint256 public reserveRatioBps = 2000;

    /// @notice Total collateral locked across all users
    uint256 public totalLockedCollateral;

    /// @notice Total collateral currently in treasury (moved for yield)
    uint256 public totalInTreasury;

    /// @notice Total pending withdrawal amounts (user liabilities in queue)
    uint256 public totalPendingWithdrawals;

    /// @notice Pending treasury address for two-step change
    address public pendingTreasury;

    /// @notice Timestamp when treasury change was proposed
    uint256 public treasuryChangeTimestamp;

    /// @notice Amount of collateral proposed to move to treasury (0 = none pending)
    uint256 public pendingMoveAmount;

    /// @notice Timestamp when the pending treasury move was proposed
    uint256 public pendingMoveTimestamp;

    /// @notice Enhanced vault structure with lock timestamp
    struct LockRecord {
        uint256 amount;
        uint256 unlockTimestamp;
        uint256 lockTimestamp;
        bool isActive;
    }

    /// @notice Withdrawal request for queued withdrawals
    /// @dev amount is the net payout to the user; penalty is sent to treasury at claim time.
    ///      Both are included in totalPendingWithdrawals.
    struct WithdrawalRequest {
        uint256 amount;
        uint256 requestTimestamp;
        bool isPending;
        uint256 penalty;
    }

    /// @notice Maps user address to their locked vault
    mapping(address => LockRecord) public lockedVaults;

    /// @notice Maps user address to their withdrawal request
    mapping(address => WithdrawalRequest) public withdrawalRequests;

    /// @notice Track total yield credited per user (for transparency)
    mapping(address => uint256) public totalYieldCredited;

    /// @notice Track last yield credit timestamp per user
    mapping(address => uint256) public lastYieldTimestamp;

    // ==========================================
    // EVENTS
    // ==========================================

    /// @notice Emitted when a regular dev tops up their account
    event AccountToppedUp(address indexed user, uint256 amount);

    /// @notice Emitted when a whale locks collateral
    event CollateralLocked(
        address indexed whale,
        uint256 amount,
        uint256 unlockTime,
        uint256 lockTime
    );

    /// @notice Emitted when a whale withdraws collateral
    event CollateralWithdrawn(
        address indexed whale,
        uint256 amount,
        bool wasSlashed
    );

    /// @notice Emitted when treasury change is proposed
    event TreasuryChangeProposed(address indexed newTreasury, uint256 effectiveTime);

    /// @notice Emitted when treasury change is executed
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);

    /// @notice Emitted when treasury change is cancelled
    event TreasuryChangeCancelled(address indexed cancelledTreasury);

    /// @notice Emitted when yield is credited to a user
    event YieldCredited(
        address indexed whale,
        uint256 yieldAmount,
        uint256 timestamp
    );

    /// @notice Emitted when collateral is moved to treasury for yield
    event CollateralMovedToTreasury(uint256 amount, uint256 timestamp);

    /// @notice Emitted when collateral is returned from treasury
    event CollateralReturnedFromTreasury(uint256 amount, uint256 timestamp);

    /// @notice Emitted when a withdrawal is queued
    event WithdrawalQueued(
        address indexed whale,
        uint256 amount,
        uint256 timestamp
    );

    /// @notice Emitted when a queued withdrawal is processed
    event WithdrawalProcessed(address indexed whale, uint256 amount);

    /// @notice Emitted when reserve ratio is updated
    event ReserveRatioUpdated(uint256 oldRatio, uint256 newRatio);

    /// @notice Emitted for emergency withdrawals (excess funds only)
    event EmergencyExcessWithdrawn(uint256 amount, uint256 timestamp);

    /// @notice Emitted when an early-withdrawal penalty is actually transferred to treasury
    event EarlyWithdrawalPenaltyPaid(address indexed whale, uint256 penalty);

    /// @notice Emitted when a move of collateral to treasury is proposed
    event TreasuryMoveProposed(uint256 amount, uint256 executeAfter, uint256 expiresAt);

    /// @notice Emitted when a pending treasury move is cancelled
    event TreasuryMoveCancelled(uint256 amount);

    // ==========================================
    // CONSTRUCTOR
    // ==========================================

    /**
     * @notice Initialize the billing contract
     * @param _token The ERC20 token used for payments (standard ERC-20 only, no fee-on-transfer)
     * @param _treasury The treasury wallet address
     * @dev IMPORTANT: _treasury should be different from msg.sender (owner) for trust separation
     */
    constructor(address _token, address _treasury) Ownable(msg.sender) {
        require(_token != address(0), "Invalid token address");
        require(_treasury != address(0), "Invalid treasury address");

        token = IERC20(_token);
        treasury = _treasury;
    }

    // ==========================================
    // TRACK A: REGULAR DEVS (Pay-as-you-go)
    // ==========================================

    /**
     * @notice Regular devs pay for compute directly
     * @param userAppWallet The user's app wallet address (for event tracking)
     * @param _amount Amount to top up
     * @dev Funds go directly to treasury - non-refundable
     */
    function topUpAccount(
        address userAppWallet,
        uint256 _amount
    ) external nonReentrant whenNotPaused {
        require(_amount > 0, "Amount must be greater than 0");
        require(userAppWallet != address(0), "Invalid wallet address");

        require(
            token.transferFrom(msg.sender, treasury, _amount),
            "Transfer failed"
        );

        emit AccountToppedUp(userAppWallet, _amount);
    }

    // ==========================================
    // TRACK B: WHALES (Yield-Backed Workspaces)
    // ==========================================

    /**
     * @notice Lock collateral to get yield-backed compute credits
     * @param userAppWallet The user's app wallet address (for event tracking)
     * @param _amount Amount to lock
     * @param _durationInSeconds Lock duration in seconds
     * @dev Only supports standard ERC-20 tokens. Fee-on-transfer tokens will cause accounting issues.
     */
    function lockCollateral(
        address userAppWallet,
        uint256 _amount,
        uint256 _durationInSeconds
    ) external nonReentrant whenNotPaused {
        require(!lockedVaults[msg.sender].isActive, "Vault already active");
        require(!withdrawalRequests[msg.sender].isPending, "Pending withdrawal exists - claim first");
        require(_amount > 0, "Must deposit collateral");
        require(_durationInSeconds >= 7 days, "Minimum lock: 7 days");
        require(userAppWallet != address(0), "Invalid wallet address");

        require(
            token.transferFrom(msg.sender, address(this), _amount),
            "Transfer failed"
        );

        uint256 unlockTime = block.timestamp + _durationInSeconds;

        lockedVaults[msg.sender] = LockRecord({
            amount: _amount,
            unlockTimestamp: unlockTime,
            lockTimestamp: block.timestamp,
            isActive: true
        });

        totalLockedCollateral += _amount;

        emit CollateralLocked(userAppWallet, _amount, unlockTime, block.timestamp);
    }

    /**
     * @notice Withdraw locked collateral
     * @param userAppWallet The user's app wallet address (for event tracking)
     * @dev Early withdrawal incurs 5% penalty
     * @dev Lock record is deactivated immediately to prevent double-payout
     * @dev If the contract cannot pay the full amount (payout + penalty) from funds not already
     *      owed to queued withdrawals, nothing is transferred: payout and penalty are queued
     *      together and settled in claimQueuedWithdrawal / processQueuedWithdrawal
     * @dev Not pausable: this is a user exit path
     */
    function withdrawCollateral(
        address userAppWallet
    ) external nonReentrant {
        LockRecord storage record = lockedVaults[msg.sender];
        require(record.isActive, "No active vault");
        require(!withdrawalRequests[msg.sender].isPending, "Already have pending withdrawal");

        uint256 originalAmount = record.amount;
        bool isEarly = block.timestamp < record.unlockTimestamp;
        uint256 penalty = isEarly ? (originalAmount * PENALTY_PERCENT) / 100 : 0;
        uint256 amountToReturn = originalAmount - penalty;

        // Deactivate lock record immediately to prevent double-payout
        totalLockedCollateral -= originalAmount;
        record.isActive = false;
        record.amount = 0;
        record.unlockTimestamp = 0;
        record.lockTimestamp = 0;

        // Solvency check BEFORE any transfer. Funds already owed to queued
        // withdrawals are not available for new immediate payouts.
        uint256 contractBalance = token.balanceOf(address(this));
        uint256 freeBalance = contractBalance > totalPendingWithdrawals
            ? contractBalance - totalPendingWithdrawals
            : 0;

        if (freeBalance < originalAmount) {
            // Queue payout and penalty together - nothing leaves the contract
            totalPendingWithdrawals += originalAmount;

            withdrawalRequests[msg.sender] = WithdrawalRequest({
                amount: amountToReturn,
                requestTimestamp: block.timestamp,
                isPending: true,
                penalty: penalty
            });

            emit WithdrawalQueued(msg.sender, amountToReturn, block.timestamp);
            return;
        }

        if (penalty > 0) {
            require(token.transfer(treasury, penalty), "Penalty transfer failed");
            emit EarlyWithdrawalPenaltyPaid(msg.sender, penalty);
        }

        require(
            token.transfer(msg.sender, amountToReturn),
            "Return transfer failed"
        );

        emit CollateralWithdrawn(userAppWallet, amountToReturn, isEarly);
    }

    /**
     * @notice Claim a queued withdrawal (permissionless)
     * @dev Any user can call this to claim their own pending withdrawal once funds are available
     * @dev Not pausable: an owner pause must not block users from funds they are owed
     */
    function claimQueuedWithdrawal() external nonReentrant {
        (uint256 amountSent, ) = _settleQueuedWithdrawal(
            msg.sender,
            "Insufficient contract balance - try again later"
        );
        emit WithdrawalProcessed(msg.sender, amountSent);
    }

    /**
     * @notice Process a queued withdrawal (admin function, kept for backwards compatibility)
     * @param whale The whale's address
     * @param userAppWallet The user's app wallet address
     * @dev Users can also use claimQueuedWithdrawal() directly
     */
    function processQueuedWithdrawal(
        address whale,
        address userAppWallet
    ) external onlyOwner nonReentrant {
        (uint256 amountSent, uint256 penalty) = _settleQueuedWithdrawal(
            whale,
            "Insufficient funds - return from treasury first"
        );
        emit WithdrawalProcessed(whale, amountSent);
        emit CollateralWithdrawn(userAppWallet, amountSent, penalty > 0);
    }

    /**
     * @dev Pays out a queued withdrawal. The recorded penalty (if any) is transferred to
     *      treasury in the same call, so the fee and the payout succeed or fail together.
     */
    function _settleQueuedWithdrawal(
        address whale,
        string memory insufficientMessage
    ) internal returns (uint256 amountSent, uint256 penalty) {
        WithdrawalRequest storage request = withdrawalRequests[whale];
        require(request.isPending, "No pending withdrawal");
        require(request.amount > 0, "Invalid withdrawal amount");

        amountSent = request.amount;
        penalty = request.penalty;
        uint256 gross = amountSent + penalty;

        require(token.balanceOf(address(this)) >= gross, insufficientMessage);

        // Update state before transfers
        totalPendingWithdrawals -= gross;
        request.isPending = false;
        request.amount = 0;
        request.penalty = 0;

        if (penalty > 0) {
            require(token.transfer(treasury, penalty), "Penalty transfer failed");
            emit EarlyWithdrawalPenaltyPaid(whale, penalty);
        }

        require(token.transfer(whale, amountSent), "Transfer failed");
    }

    // ==========================================
    // TREASURY MANAGEMENT (For Yield Generation)
    // ==========================================

    /**
     * @notice Propose moving collateral to treasury for yield generation (step 1 of 2)
     * @param _amount Amount to move
     * @dev Executable after TREASURY_MOVE_DELAY, giving users notice to exit ahead of a
     *      large move. Only one move may be pending at a time.
     */
    function proposeTreasuryMove(
        uint256 _amount
    ) external onlyOwner whenNotPaused {
        require(_amount > 0, "Amount must be greater than 0");
        require(pendingMoveAmount == 0, "Treasury move already pending");
        require(_amount <= _movableAmount(), "Would breach reserve ratio");

        pendingMoveAmount = _amount;
        pendingMoveTimestamp = block.timestamp;

        uint256 executeAfter = block.timestamp + TREASURY_MOVE_DELAY;
        emit TreasuryMoveProposed(
            _amount,
            executeAfter,
            executeAfter + TREASURY_MOVE_EXECUTION_WINDOW
        );
    }

    /**
     * @notice Execute a proposed treasury move (step 2 of 2)
     * @dev Reserve ratio is re-checked at execution time against current liabilities
     */
    function executeTreasuryMove() external onlyOwner nonReentrant whenNotPaused {
        uint256 amount = pendingMoveAmount;
        require(amount > 0, "No pending treasury move");

        uint256 executeAfter = pendingMoveTimestamp + TREASURY_MOVE_DELAY;
        require(block.timestamp >= executeAfter, "Timelock not expired");
        require(
            block.timestamp <= executeAfter + TREASURY_MOVE_EXECUTION_WINDOW,
            "Treasury move expired"
        );
        require(amount <= _movableAmount(), "Would breach reserve ratio");

        pendingMoveAmount = 0;
        pendingMoveTimestamp = 0;

        require(
            token.transfer(treasury, amount),
            "Transfer to treasury failed"
        );

        totalInTreasury += amount;

        emit CollateralMovedToTreasury(amount, block.timestamp);
    }

    /**
     * @notice Cancel a pending treasury move (also used to clear an expired proposal)
     */
    function cancelTreasuryMove() external onlyOwner {
        uint256 amount = pendingMoveAmount;
        require(amount > 0, "No pending treasury move");

        pendingMoveAmount = 0;
        pendingMoveTimestamp = 0;

        emit TreasuryMoveCancelled(amount);
    }

    /**
     * @dev Balance that can leave the contract while keeping reserveRatioBps of total liabilities
     */
    function _movableAmount() internal view returns (uint256) {
        uint256 balance = token.balanceOf(address(this));
        uint256 totalLiabilities = totalLockedCollateral + totalPendingWithdrawals;
        uint256 requiredReserve = (totalLiabilities * reserveRatioBps) / 10000;
        return balance > requiredReserve ? balance - requiredReserve : 0;
    }

    /**
     * @notice Return collateral from treasury (for withdrawals)
     * @param _amount Amount to return
     * @dev Treasury must have approved this contract
     */
    function returnCollateralFromTreasury(
        uint256 _amount
    ) external onlyOwner nonReentrant {
        require(_amount <= totalInTreasury, "Amount exceeds treasury holdings");

        require(
            token.transferFrom(treasury, address(this), _amount),
            "Transfer from treasury failed"
        );

        totalInTreasury -= _amount;

        emit CollateralReturnedFromTreasury(_amount, block.timestamp);
    }

    /**
     * @notice Credit yield to a whale's account
     * @param whale The whale's address
     * @param yieldAmount Amount of yield (in credits/tokens)
     * @dev Called by backend cron job for record-keeping
     */
    function creditYield(
        address whale,
        uint256 yieldAmount
    ) external onlyOwner {
        require(lockedVaults[whale].isActive, "No active vault");
        require(yieldAmount > 0, "Yield must be positive");

        totalYieldCredited[whale] += yieldAmount;
        lastYieldTimestamp[whale] = block.timestamp;

        emit YieldCredited(whale, yieldAmount, block.timestamp);
    }

    /**
     * @notice Batch credit yield to multiple whales
     * @param whales Array of whale addresses
     * @param yieldAmounts Array of yield amounts
     */
    function batchCreditYield(
        address[] calldata whales,
        uint256[] calldata yieldAmounts
    ) external onlyOwner {
        require(whales.length == yieldAmounts.length, "Array length mismatch");
        require(whales.length <= 100, "Batch too large");

        for (uint256 i = 0; i < whales.length; i++) {
            if (lockedVaults[whales[i]].isActive && yieldAmounts[i] > 0) {
                totalYieldCredited[whales[i]] += yieldAmounts[i];
                lastYieldTimestamp[whales[i]] = block.timestamp;

                emit YieldCredited(whales[i], yieldAmounts[i], block.timestamp);
            }
        }
    }

    // ==========================================
    // VIEW FUNCTIONS
    // ==========================================

    /**
     * @notice Get vault status for a whale
     * @param _whale The whale's address
     */
    function getLockStatus(
        address _whale
    ) external view returns (
        bool isActive,
        uint256 amount,
        uint256 unlockTimestamp,
        uint256 lockTimestamp
    ) {
        LockRecord memory record = lockedVaults[_whale];
        return (
            record.isActive,
            record.amount,
            record.unlockTimestamp,
            record.lockTimestamp
        );
    }

    /**
     * @notice Get yield statistics for a whale
     * @param _whale The whale's address
     */
    function getYieldStats(
        address _whale
    ) external view returns (
        uint256 totalYield,
        uint256 lastCreditTime,
        uint256 lockedAmount,
        uint256 lockDurationRemaining
    ) {
        LockRecord memory record = lockedVaults[_whale];
        uint256 remaining = 0;

        if (record.isActive && record.unlockTimestamp > block.timestamp) {
            remaining = record.unlockTimestamp - block.timestamp;
        }

        return (
            totalYieldCredited[_whale],
            lastYieldTimestamp[_whale],
            record.amount,
            remaining
        );
    }

    /**
     * @notice Get contract financial status
     */
    function getContractStatus() external view returns (
        uint256 _totalLocked,
        uint256 _totalInTreasury,
        uint256 _contractBalance,
        uint256 _reserveRatio,
        uint256 _availableToMove,
        uint256 _totalPendingWithdrawals
    ) {
        return (
            totalLockedCollateral,
            totalInTreasury,
            token.balanceOf(address(this)),
            reserveRatioBps,
            _movableAmount(),
            totalPendingWithdrawals
        );
    }

    /**
     * @notice On-demand liquidity disclosure for users
     * @return contractBalance Tokens currently held by this contract
     * @return totalLiabilities Locked collateral plus queued withdrawals (incl. queued penalties)
     * @return liquidityBps contractBalance / totalLiabilities in bps, capped at 10000 (fully backed on-chain)
     * @return guaranteedReserveBps Minimum share of liabilities that must stay in the contract
     * @return pendingMove Amount of a proposed-but-not-executed treasury move (0 = none)
     * @return pendingMoveExecuteAfter Earliest time the pending move can execute (0 = none)
     */
    function getLiquidityStatus() external view returns (
        uint256 contractBalance,
        uint256 totalLiabilities,
        uint256 liquidityBps,
        uint256 guaranteedReserveBps,
        uint256 pendingMove,
        uint256 pendingMoveExecuteAfter
    ) {
        contractBalance = token.balanceOf(address(this));
        totalLiabilities = totalLockedCollateral + totalPendingWithdrawals;
        if (totalLiabilities == 0) {
            liquidityBps = 10000;
        } else {
            uint256 ratio = (contractBalance * 10000) / totalLiabilities;
            liquidityBps = ratio > 10000 ? 10000 : ratio;
        }
        guaranteedReserveBps = reserveRatioBps;
        pendingMove = pendingMoveAmount;
        pendingMoveExecuteAfter = pendingMoveAmount > 0
            ? pendingMoveTimestamp + TREASURY_MOVE_DELAY
            : 0;
    }

    /**
     * @notice Check if a withdrawal request is pending
     * @param _whale The whale's address
     */
    function getWithdrawalRequest(
        address _whale
    ) external view returns (
        uint256 amount,
        uint256 requestTimestamp,
        bool isPending
    ) {
        WithdrawalRequest memory request = withdrawalRequests[_whale];
        return (request.amount, request.requestTimestamp, request.isPending);
    }

    /**
     * @notice Full queued-withdrawal details including the deferred penalty
     * @param _whale The whale's address
     * @return amount Net payout the user will receive
     * @return penalty Early-withdrawal penalty, charged only when the payout is delivered
     * @return requestTimestamp When the withdrawal was queued
     * @return isPending Whether a queued withdrawal exists
     * @return claimableNow Whether claimQueuedWithdrawal() would succeed on the current balance
     */
    function getQueuedWithdrawal(
        address _whale
    ) external view returns (
        uint256 amount,
        uint256 penalty,
        uint256 requestTimestamp,
        bool isPending,
        bool claimableNow
    ) {
        WithdrawalRequest memory request = withdrawalRequests[_whale];
        bool claimable = request.isPending &&
            token.balanceOf(address(this)) >= request.amount + request.penalty;
        return (
            request.amount,
            request.penalty,
            request.requestTimestamp,
            request.isPending,
            claimable
        );
    }

    /**
     * @notice Get pending treasury move info
     */
    function getPendingTreasuryMove() external view returns (
        uint256 _amount,
        uint256 _executeAfter,
        uint256 _expiresAt,
        bool _canExecute
    ) {
        if (pendingMoveAmount == 0) {
            return (0, 0, 0, false);
        }
        uint256 executeAfter = pendingMoveTimestamp + TREASURY_MOVE_DELAY;
        uint256 expiresAt = executeAfter + TREASURY_MOVE_EXECUTION_WINDOW;
        bool canExecute = !paused() &&
            block.timestamp >= executeAfter &&
            block.timestamp <= expiresAt &&
            pendingMoveAmount <= _movableAmount();
        return (pendingMoveAmount, executeAfter, expiresAt, canExecute);
    }

    /**
     * @notice Get pending treasury change info
     */
    function getPendingTreasuryChange() external view returns (
        address _pendingTreasury,
        uint256 _effectiveTime,
        bool _canExecute
    ) {
        uint256 effectiveTime = treasuryChangeTimestamp + TREASURY_CHANGE_DELAY;
        bool canExecute = pendingTreasury != address(0) && block.timestamp >= effectiveTime;
        return (pendingTreasury, effectiveTime, canExecute);
    }

    /**
     * @notice Calculate estimated daily yield for a locked amount
     * @param lockedAmount The amount locked
     * @param annualYieldBps Annual yield in basis points (e.g., 800 = 8%)
     */
    function estimateDailyYield(
        uint256 lockedAmount,
        uint256 annualYieldBps
    ) external pure returns (uint256) {
        return (lockedAmount * annualYieldBps) / (10000 * 365);
    }

    // ==========================================
    // ADMIN FUNCTIONS
    // ==========================================

    /**
     * @notice Propose a treasury address change (step 1 of 2)
     * @param _newTreasury New treasury address
     * @dev Change takes effect after TREASURY_CHANGE_DELAY (24 hours)
     */
    function proposeTreasuryChange(address _newTreasury) external onlyOwner {
        require(_newTreasury != address(0), "Invalid address");
        require(_newTreasury != treasury, "Same as current treasury");

        pendingTreasury = _newTreasury;
        treasuryChangeTimestamp = block.timestamp;

        emit TreasuryChangeProposed(_newTreasury, block.timestamp + TREASURY_CHANGE_DELAY);
    }

    /**
     * @notice Execute a proposed treasury change (step 2 of 2)
     * @dev Can only be called after TREASURY_CHANGE_DELAY has passed
     */
    function executeTreasuryChange() external onlyOwner {
        require(pendingTreasury != address(0), "No pending treasury change");
        require(
            block.timestamp >= treasuryChangeTimestamp + TREASURY_CHANGE_DELAY,
            "Timelock not expired"
        );

        address oldTreasury = treasury;
        treasury = pendingTreasury;
        pendingTreasury = address(0);
        treasuryChangeTimestamp = 0;

        emit TreasuryUpdated(oldTreasury, treasury);
    }

    /**
     * @notice Cancel a pending treasury change
     */
    function cancelTreasuryChange() external onlyOwner {
        require(pendingTreasury != address(0), "No pending treasury change");

        address cancelled = pendingTreasury;
        pendingTreasury = address(0);
        treasuryChangeTimestamp = 0;

        emit TreasuryChangeCancelled(cancelled);
    }

    /**
     * @notice Update the reserve ratio
     * @param _newRatioBps New ratio in basis points (e.g., 2000 = 20%)
     */
    function updateReserveRatio(uint256 _newRatioBps) external onlyOwner {
        require(_newRatioBps >= MIN_RESERVE_RATIO_BPS, "Minimum reserve: 20%");
        require(_newRatioBps <= MAX_RESERVE_RATIO_BPS, "Maximum reserve: 50%");

        uint256 oldRatio = reserveRatioBps;
        reserveRatioBps = _newRatioBps;

        emit ReserveRatioUpdated(oldRatio, _newRatioBps);
    }

    /**
     * @notice Pause the contract in emergency
     * @dev Blocks new deposits (topUpAccount, lockCollateral) and treasury moves.
     *      User exits (withdrawCollateral, claimQueuedWithdrawal) remain available.
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Emergency withdraw ONLY excess funds to treasury
     * @dev Cannot withdraw funds backing user collateral or pending withdrawals
     * @dev This is a safety mechanism, not a drain function
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = token.balanceOf(address(this));
        uint256 userLiabilities = totalLockedCollateral + totalPendingWithdrawals;

        require(balance > userLiabilities, "No excess funds to withdraw");

        uint256 excessFunds = balance - userLiabilities;

        require(
            token.transfer(treasury, excessFunds),
            "Emergency withdraw failed"
        );

        totalInTreasury += excessFunds;

        emit EmergencyExcessWithdrawn(excessFunds, block.timestamp);
    }
}
