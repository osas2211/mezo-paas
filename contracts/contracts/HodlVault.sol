// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract HodlHostBilling is ReentrancyGuard, Ownable {
    IERC20 public immutable token;
    address public treasury;
    
    // 5% penalty for Whales who rage-quit their lock early
    uint256 public constant PENALTY_PERCENT = 5;

    // Track B: The Whale's Locked Vault structure
    struct LockRecord {
        uint256 amount;
        uint256 unlockTimestamp;
        bool isActive;
    }
    
    // Maps the Whale's address to their collateral lock
    mapping(address => LockRecord) public lockedVaults;

    // ==========================================
    // EVENTS (Crucial for your NestJS Listeners)
    // ==========================================
    event AccountToppedUp(address indexed user, uint256 amount);
    event CollateralLocked(address indexed whale, uint256 amount, uint256 unlockTime);
    event CollateralWithdrawn(address indexed whale, uint256 amount, bool wasSlashed);
    event TreasuryUpdated(address newTreasury);

    // Pass the Mezo MockBTC address and your Treasury Wallet on deployment
    constructor(address _token, address _treasury) Ownable(msg.sender) {
        token = IERC20(_token);
        treasury = _treasury;
    }

    // ==========================================
    // TRACK A: Regular Devs (Pay-as-you-go)
    // ==========================================
    
    /**
     * @notice Devs pay for compute directly. 
     * Money routes instantly to the treasury and is non-refundable.
     */
    function topUpAccount(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Amount must be greater than 0");
        
        // Transfer directly from the Dev to your Treasury
        require(token.transferFrom(msg.sender, treasury, _amount), "Transfer failed");
        
        // NestJS sees this and adds +500 consumable credits to their Postgres record
        emit AccountToppedUp(msg.sender, _amount);
    }

    // ==========================================
    // TRACK B: Whales (Yield-Backed Workspaces)
    // ==========================================

    /**
     * @notice Whales lock capital to get permanent staked capacity.
     * Money stays in THIS contract.
     */
    function lockCollateral(uint256 _amount, uint256 _durationInSeconds) external nonReentrant {
        require(!lockedVaults[msg.sender].isActive, "Vault already active. Withdraw first.");
        require(_amount > 0, "Must deposit collateral");

        // Transfer from the Whale to the Smart Contract Vault
        require(token.transferFrom(msg.sender, address(this), _amount), "Transfer failed");

        uint256 unlockTime = block.timestamp + _durationInSeconds;

        lockedVaults[msg.sender] = LockRecord({
            amount: _amount,
            unlockTimestamp: unlockTime,
            isActive: true
        });

        // NestJS sees this and sets their staked capacity (e.g., 10,000 Credits)
        emit CollateralLocked(msg.sender, _amount, unlockTime);
    }

    /**
     * @notice Whales withdraw their collateral. 
     * Early withdrawal slashes 5% to protect your AWS bills.
     */
    function withdrawCollateral() external nonReentrant {
        LockRecord storage record = lockedVaults[msg.sender];
        require(record.isActive, "No active vault");

        uint256 amountToReturn = record.amount;
        bool isEarly = block.timestamp < record.unlockTimestamp;

        if (isEarly) {
            uint256 penalty = (amountToReturn * PENALTY_PERCENT) / 100;
            amountToReturn = amountToReturn - penalty;
            
            // Send the 5% penalty to your treasury
            require(token.transfer(treasury, penalty), "Penalty transfer failed");
        }

        // Security: Reset the record BEFORE transferring out to prevent reentrancy
        record.isActive = false;
        record.amount = 0;

        // Return the principal to the Whale
        require(token.transfer(msg.sender, amountToReturn), "Return transfer failed");

        // NestJS sees this, revokes the staked capacity, and shuts down their PM2 apps
        emit CollateralWithdrawn(msg.sender, amountToReturn, isEarly);
    }

    /**
     * @notice Helper function for your NestJS Cron Job to query vault status
     */
    function getLockStatus(address _whale) external view returns (bool isActive, uint256 amount, uint256 unlockTimestamp) {
        LockRecord memory record = lockedVaults[_whale];
        return (record.isActive, record.amount, record.unlockTimestamp);
    }

    // ==========================================
    // ADMIN FUNCTIONS
    // ==========================================
    
    /**
     * @notice Allows you (the owner) to change where the top-up money and penalties go
     */
    function updateTreasury(address _newTreasury) external onlyOwner {
        require(_newTreasury != address(0), "Invalid address");
        treasury = _newTreasury;
        emit TreasuryUpdated(_newTreasury);
    }
}