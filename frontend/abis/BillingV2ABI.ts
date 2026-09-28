export const MezoBillingV2ABI = {
  _format: "hh3-artifact-1",
  contractName: "MezoHostBillingV2",
  sourceName: "contracts/BillingContractV2.sol",
  abi: [
    {
      inputs: [
        {
          internalType: "address",
          name: "_token",
          type: "address",
        },
        {
          internalType: "address",
          name: "_treasury",
          type: "address",
        },
      ],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      inputs: [],
      name: "EnforcedPause",
      type: "error",
    },
    {
      inputs: [],
      name: "ExpectedPause",
      type: "error",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "owner",
          type: "address",
        },
      ],
      name: "OwnableInvalidOwner",
      type: "error",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "account",
          type: "address",
        },
      ],
      name: "OwnableUnauthorizedAccount",
      type: "error",
    },
    {
      inputs: [],
      name: "ReentrancyGuardReentrantCall",
      type: "error",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "user",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "AccountToppedUp",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "whale",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "unlockTime",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "lockTime",
          type: "uint256",
        },
      ],
      name: "CollateralLocked",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "timestamp",
          type: "uint256",
        },
      ],
      name: "CollateralMovedToTreasury",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "timestamp",
          type: "uint256",
        },
      ],
      name: "CollateralReturnedFromTreasury",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "whale",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "bool",
          name: "wasSlashed",
          type: "bool",
        },
      ],
      name: "CollateralWithdrawn",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "whale",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "penalty",
          type: "uint256",
        },
      ],
      name: "EarlyWithdrawalPenaltyPaid",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "timestamp",
          type: "uint256",
        },
      ],
      name: "EmergencyExcessWithdrawn",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "previousOwner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "newOwner",
          type: "address",
        },
      ],
      name: "OwnershipTransferred",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "address",
          name: "account",
          type: "address",
        },
      ],
      name: "Paused",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint256",
          name: "oldRatio",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "newRatio",
          type: "uint256",
        },
      ],
      name: "ReserveRatioUpdated",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "cancelledTreasury",
          type: "address",
        },
      ],
      name: "TreasuryChangeCancelled",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "newTreasury",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "effectiveTime",
          type: "uint256",
        },
      ],
      name: "TreasuryChangeProposed",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "TreasuryMoveCancelled",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "executeAfter",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "expiresAt",
          type: "uint256",
        },
      ],
      name: "TreasuryMoveProposed",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "oldTreasury",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "newTreasury",
          type: "address",
        },
      ],
      name: "TreasuryUpdated",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "address",
          name: "account",
          type: "address",
        },
      ],
      name: "Unpaused",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "whale",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "WithdrawalProcessed",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "whale",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "timestamp",
          type: "uint256",
        },
      ],
      name: "WithdrawalQueued",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "whale",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "yieldAmount",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "timestamp",
          type: "uint256",
        },
      ],
      name: "YieldCredited",
      type: "event",
    },
    {
      inputs: [],
      name: "MAX_RESERVE_RATIO_BPS",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "MIN_RESERVE_RATIO_BPS",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "PENALTY_PERCENT",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "TREASURY_CHANGE_DELAY",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "TREASURY_MOVE_DELAY",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "TREASURY_MOVE_EXECUTION_WINDOW",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address[]",
          name: "whales",
          type: "address[]",
        },
        {
          internalType: "uint256[]",
          name: "yieldAmounts",
          type: "uint256[]",
        },
      ],
      name: "batchCreditYield",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "cancelTreasuryChange",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "cancelTreasuryMove",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "claimQueuedWithdrawal",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "whale",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "yieldAmount",
          type: "uint256",
        },
      ],
      name: "creditYield",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "emergencyWithdraw",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "lockedAmount",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "annualYieldBps",
          type: "uint256",
        },
      ],
      name: "estimateDailyYield",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "pure",
      type: "function",
    },
    {
      inputs: [],
      name: "executeTreasuryChange",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "executeTreasuryMove",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "getContractStatus",
      outputs: [
        {
          internalType: "uint256",
          name: "_totalLocked",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "_totalInTreasury",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "_contractBalance",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "_reserveRatio",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "_availableToMove",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "_totalPendingWithdrawals",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getLiquidityStatus",
      outputs: [
        {
          internalType: "uint256",
          name: "contractBalance",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "totalLiabilities",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "liquidityBps",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "guaranteedReserveBps",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "pendingMove",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "pendingMoveExecuteAfter",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_whale",
          type: "address",
        },
      ],
      name: "getLockStatus",
      outputs: [
        {
          internalType: "bool",
          name: "isActive",
          type: "bool",
        },
        {
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "unlockTimestamp",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "lockTimestamp",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getPendingTreasuryChange",
      outputs: [
        {
          internalType: "address",
          name: "_pendingTreasury",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "_effectiveTime",
          type: "uint256",
        },
        {
          internalType: "bool",
          name: "_canExecute",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getPendingTreasuryMove",
      outputs: [
        {
          internalType: "uint256",
          name: "_amount",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "_executeAfter",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "_expiresAt",
          type: "uint256",
        },
        {
          internalType: "bool",
          name: "_canExecute",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_whale",
          type: "address",
        },
      ],
      name: "getQueuedWithdrawal",
      outputs: [
        {
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "penalty",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "requestTimestamp",
          type: "uint256",
        },
        {
          internalType: "bool",
          name: "isPending",
          type: "bool",
        },
        {
          internalType: "bool",
          name: "claimableNow",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_whale",
          type: "address",
        },
      ],
      name: "getWithdrawalRequest",
      outputs: [
        {
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "requestTimestamp",
          type: "uint256",
        },
        {
          internalType: "bool",
          name: "isPending",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_whale",
          type: "address",
        },
      ],
      name: "getYieldStats",
      outputs: [
        {
          internalType: "uint256",
          name: "totalYield",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "lastCreditTime",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "lockedAmount",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "lockDurationRemaining",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      name: "lastYieldTimestamp",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "userAppWallet",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "_amount",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "_durationInSeconds",
          type: "uint256",
        },
      ],
      name: "lockCollateral",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      name: "lockedVaults",
      outputs: [
        {
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "unlockTimestamp",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "lockTimestamp",
          type: "uint256",
        },
        {
          internalType: "bool",
          name: "isActive",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "owner",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "pause",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "paused",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "pendingMoveAmount",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "pendingMoveTimestamp",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "pendingTreasury",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "whale",
          type: "address",
        },
        {
          internalType: "address",
          name: "userAppWallet",
          type: "address",
        },
      ],
      name: "processQueuedWithdrawal",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_newTreasury",
          type: "address",
        },
      ],
      name: "proposeTreasuryChange",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_amount",
          type: "uint256",
        },
      ],
      name: "proposeTreasuryMove",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "renounceOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "reserveRatioBps",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_amount",
          type: "uint256",
        },
      ],
      name: "returnCollateralFromTreasury",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "token",
      outputs: [
        {
          internalType: "contract IERC20",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "userAppWallet",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "_amount",
          type: "uint256",
        },
      ],
      name: "topUpAccount",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "totalInTreasury",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "totalLockedCollateral",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "totalPendingWithdrawals",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      name: "totalYieldCredited",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "newOwner",
          type: "address",
        },
      ],
      name: "transferOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "treasury",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "treasuryChangeTimestamp",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "unpause",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_newRatioBps",
          type: "uint256",
        },
      ],
      name: "updateReserveRatio",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "userAppWallet",
          type: "address",
        },
      ],
      name: "withdrawCollateral",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      name: "withdrawalRequests",
      outputs: [
        {
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "requestTimestamp",
          type: "uint256",
        },
        {
          internalType: "bool",
          name: "isPending",
          type: "bool",
        },
        {
          internalType: "uint256",
          name: "penalty",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
  ],
};
