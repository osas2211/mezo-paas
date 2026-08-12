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
 *
 * Key improvements over V1:
 * - Track total locked collateral
 * - Track lock timestamps for yield calculations
 * - Treasury management functions for yield generation
 * - On-chain yield credit tracking
 * - Pausable for emergency situations
 * - Withdrawal queue support for large withdrawals
 */
contract MezoHostBillingV2 is ReentrancyGuard, Ownable, Pausable {
    // ==========================================
    // STATE VARIABLES
    // ==========================================

    IERC20 public immutable token;
    address public treasury;

    /// @notice 5% penalty for early withdrawal
    uint256 public constant PENALTY_PERCENT = 5;

    /// @notice Minimum reserve ratio (20% = 2000 basis points)
    uint256 public reserveRatioBps = 2000;

    /// @notice Total collateral locked across all users
    uint256 public totalLockedCollateral;

    /// @notice Total collateral currently in treasury (moved for yield)
    uint256 public totalInTreasury;

    /// @notice Enhanced vault structure with lock timestamp
    struct LockRecord {
        uint256 amount;
        uint256 unlockTimestamp;
        uint256 lockTimestamp;
        bool isActive;
    }

    /// @notice Withdrawal request for queued withdrawals
    struct WithdrawalRequest {
        uint256 amount;
        uint256 requestTimestamp;
        bool isPending;
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

    /// @notice Emitted when treasury address is updated
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);

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

    // ==========================================
    // CONSTRUCTOR
    // ==========================================

    /**
     * @notice Initialize the billing contract
     * @param _token The ERC20 token used for payments (e.g., MockBTC, MUSD)
     * @param _treasury The treasury wallet address
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
     */
    function lockCollateral(
        address userAppWallet,
        uint256 _amount,
        uint256 _durationInSeconds
    ) external nonReentrant whenNotPaused {
        require(!lockedVaults[msg.sender].isActive, "Vault already active");
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
     */
    function withdrawCollateral(
        address userAppWallet
    ) external nonReentrant whenNotPaused {
        LockRecord storage record = lockedVaults[msg.sender];
        require(record.isActive, "No active vault");

        uint256 amountToReturn = record.amount;
        bool isEarly = block.timestamp < record.unlockTimestamp;

        // Calculate penalty if early withdrawal
        if (isEarly) {
            uint256 penalty = (amountToReturn * PENALTY_PERCENT) / 100;
            amountToReturn -= penalty;

            // Send penalty to treasury
            require(
                token.transfer(treasury, penalty),
                "Penalty transfer failed"
            );
        }

        // Check if we have enough in contract
        uint256 contractBalance = token.balanceOf(address(this));

        if (contractBalance < amountToReturn) {
            // Queue the withdrawal - funds are in treasury
            withdrawalRequests[msg.sender] = WithdrawalRequest({
                amount: amountToReturn,
                requestTimestamp: block.timestamp,
                isPending: true
            });

            emit WithdrawalQueued(msg.sender, amountToReturn, block.timestamp);
            return;
        }

        // Update state before transfer (reentrancy protection)
        totalLockedCollateral -= record.amount;
        record.isActive = false;
        record.amount = 0;
        record.unlockTimestamp = 0;
        record.lockTimestamp = 0;

        // Transfer to user
        require(
            token.transfer(msg.sender, amountToReturn),
            "Return transfer failed"
        );

        emit CollateralWithdrawn(userAppWallet, amountToReturn, isEarly);
    }

    /**
     * @notice Process a queued withdrawal after funds returned from treasury
     * @param whale The whale's address
     * @param userAppWallet The user's app wallet address
     */
    function processQueuedWithdrawal(
        address whale,
        address userAppWallet
    ) external onlyOwner nonReentrant {
        WithdrawalRequest storage request = withdrawalRequests[whale];
        require(request.isPending, "No pending withdrawal");

        LockRecord storage record = lockedVaults[whale];
        uint256 contractBalance = token.balanceOf(address(this));

        require(
            contractBalance >= request.amount,
            "Insufficient funds - return from treasury first"
        );

        // Update state
        totalLockedCollateral -= record.amount;
        record.isActive = false;
        record.amount = 0;
        request.isPending = false;

        uint256 amountToSend = request.amount;
        request.amount = 0;

        // Transfer to whale
        require(
            token.transfer(whale, amountToSend),
            "Transfer failed"
        );

        emit WithdrawalProcessed(whale, amountToSend);
        emit CollateralWithdrawn(userAppWallet, amountToSend, false);
    }

    // ==========================================
    // TREASURY MANAGEMENT (For Yield Generation)
    // ==========================================

    /**
     * @notice Move collateral to treasury for yield generation
     * @param _amount Amount to move
     * @dev Only callable by owner. Maintains reserve ratio.
     */
    function moveCollateralToTreasury(
        uint256 _amount
    ) external onlyOwner nonReentrant {
        uint256 contractBalance = token.balanceOf(address(this));
        require(_amount <= contractBalance, "Insufficient balance");

        // Ensure we maintain minimum reserve
        uint256 requiredReserve = (totalLockedCollateral * reserveRatioBps) / 10000;
        uint256 availableToMove = contractBalance > requiredReserve
            ? contractBalance - requiredReserve
            : 0;

        require(_amount <= availableToMove, "Would breach reserve ratio");

        require(
            token.transfer(treasury, _amount),
            "Transfer to treasury failed"
        );

        totalInTreasury += _amount;

        emit CollateralMovedToTreasury(_amount, block.timestamp);
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
        uint256 _availableToMove
    ) {
        uint256 balance = token.balanceOf(address(this));
        uint256 requiredReserve = (totalLockedCollateral * reserveRatioBps) / 10000;
        uint256 available = balance > requiredReserve ? balance - requiredReserve : 0;

        return (
            totalLockedCollateral,
            totalInTreasury,
            balance,
            reserveRatioBps,
            available
        );
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
     * @notice Update the treasury address
     * @param _newTreasury New treasury address
     */
    function updateTreasury(address _newTreasury) external onlyOwner {
        require(_newTreasury != address(0), "Invalid address");

        address oldTreasury = treasury;
        treasury = _newTreasury;

        emit TreasuryUpdated(oldTreasury, _newTreasury);
    }

    /**
     * @notice Update the reserve ratio
     * @param _newRatioBps New ratio in basis points (e.g., 2000 = 20%)
     */
    function updateReserveRatio(uint256 _newRatioBps) external onlyOwner {
        require(_newRatioBps >= 1000, "Minimum reserve: 10%");
        require(_newRatioBps <= 5000, "Maximum reserve: 50%");

        uint256 oldRatio = reserveRatioBps;
        reserveRatioBps = _newRatioBps;

        emit ReserveRatioUpdated(oldRatio, _newRatioBps);
    }

    /**
     * @notice Pause the contract in emergency
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
     * @notice Emergency withdraw all funds to treasury
     * @dev Only use in critical situations
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = token.balanceOf(address(this));
        require(balance > 0, "No funds to withdraw");

        require(
            token.transfer(treasury, balance),
            "Emergency withdraw failed"
        );

        totalInTreasury += balance;

        emit CollateralMovedToTreasury(balance, block.timestamp);
    }
}
