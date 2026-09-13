export interface ContractTemplate {
  id: string
  name: string
  description: string
  category: "billing" | "token" | "example" | "utility" | "defi" | "nft" | "governance"
  content: string
}

export const TEMPLATES: ContractTemplate[] = [
  {
    id: "simple-storage",
    name: "Simple Storage",
    description: "Basic storage contract for learning Solidity on Mezo",
    category: "example",
    content: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SimpleStorage
 * @dev A basic storage contract for Mezo
 */
contract SimpleStorage {
    uint256 private value;
    address public owner;

    event ValueChanged(uint256 indexed oldValue, uint256 indexed newValue, address indexed changedBy);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    constructor(uint256 _initialValue) {
        owner = msg.sender;
        value = _initialValue;
    }

    /**
     * @dev Store a new value
     * @param _value The new value to store
     */
    function set(uint256 _value) public onlyOwner {
        uint256 oldValue = value;
        value = _value;
        emit ValueChanged(oldValue, _value, msg.sender);
    }

    /**
     * @dev Return the current stored value
     * @return The current value
     */
    function get() public view returns (uint256) {
        return value;
    }

    /**
     * @dev Increment the stored value by 1
     */
    function increment() public onlyOwner {
        uint256 oldValue = value;
        value += 1;
        emit ValueChanged(oldValue, value, msg.sender);
    }
}
`,
  },
  {
    id: "erc20-token",
    name: "ERC20 Token",
    description: "Standard ERC20 token template for Mezo",
    category: "token",
    content: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MezoToken
 * @dev A standard ERC20 token for the Mezo network
 */
contract MezoToken is ERC20, Ownable {
    uint8 private _decimals;

    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 initialSupply_
    ) ERC20(name_, symbol_) Ownable(msg.sender) {
        _decimals = decimals_;
        _mint(msg.sender, initialSupply_ * 10 ** decimals_);
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    /**
     * @dev Mint new tokens (only owner)
     * @param to The address to mint tokens to
     * @param amount The amount of tokens to mint
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    /**
     * @dev Burn tokens from caller's balance
     * @param amount The amount of tokens to burn
     */
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
}
`,
  },
  {
    id: "billing-simple",
    name: "Simple Billing",
    description: "Basic billing contract for Mezo applications",
    category: "billing",
    content: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SimpleBilling
 * @dev A simple billing contract for Mezo applications
 */
contract SimpleBilling is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable paymentToken;
    address public treasury;

    mapping(address => uint256) public balances;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event Charged(address indexed user, uint256 amount, string reason);

    constructor(address _paymentToken, address _treasury) Ownable(msg.sender) {
        require(_paymentToken != address(0), "Invalid token");
        require(_treasury != address(0), "Invalid treasury");
        paymentToken = IERC20(_paymentToken);
        treasury = _treasury;
    }

    /**
     * @dev Deposit tokens to your billing account
     * @param amount Amount of tokens to deposit
     */
    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        paymentToken.safeTransferFrom(msg.sender, address(this), amount);
        balances[msg.sender] += amount;
        emit Deposited(msg.sender, amount);
    }

    /**
     * @dev Withdraw tokens from your billing account
     * @param amount Amount of tokens to withdraw
     */
    function withdraw(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        paymentToken.safeTransfer(msg.sender, amount);
        emit Withdrawn(msg.sender, amount);
    }

    /**
     * @dev Charge a user (only owner)
     * @param user User to charge
     * @param amount Amount to charge
     * @param reason Reason for the charge
     */
    function charge(address user, uint256 amount, string calldata reason) external onlyOwner nonReentrant {
        require(balances[user] >= amount, "Insufficient user balance");
        balances[user] -= amount;
        paymentToken.safeTransfer(treasury, amount);
        emit Charged(user, amount, reason);
    }

    /**
     * @dev Update treasury address (only owner)
     * @param _treasury New treasury address
     */
    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Invalid treasury");
        treasury = _treasury;
    }

    /**
     * @dev Get user balance
     * @param user User address
     */
    function getBalance(address user) external view returns (uint256) {
        return balances[user];
    }
}
`,
  },
  {
    id: "counter",
    name: "Counter",
    description: "Simple counter contract - great for testing deployments",
    category: "example",
    content: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Counter
 * @dev A simple counter contract for testing on Mezo
 */
contract Counter {
    uint256 public count;

    event CountChanged(uint256 indexed newCount);

    constructor() {
        count = 0;
    }

    function increment() public {
        count += 1;
        emit CountChanged(count);
    }

    function decrement() public {
        require(count > 0, "Counter: cannot decrement below zero");
        count -= 1;
        emit CountChanged(count);
    }

    function reset() public {
        count = 0;
        emit CountChanged(count);
    }

    function setCount(uint256 _count) public {
        count = _count;
        emit CountChanged(count);
    }
}
`,
  },
  {
    id: "multisig-wallet",
    name: "Multi-Signature Wallet",
    description: "Basic multi-sig wallet requiring multiple approvals",
    category: "utility",
    content: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MultiSigWallet
 * @dev A simple multi-signature wallet for Mezo
 */
contract MultiSigWallet {
    event Deposit(address indexed sender, uint256 amount);
    event Submit(uint256 indexed txId);
    event Approve(address indexed owner, uint256 indexed txId);
    event Revoke(address indexed owner, uint256 indexed txId);
    event Execute(uint256 indexed txId);

    struct Transaction {
        address to;
        uint256 value;
        bytes data;
        bool executed;
    }

    address[] public owners;
    mapping(address => bool) public isOwner;
    uint256 public required;

    Transaction[] public transactions;
    mapping(uint256 => mapping(address => bool)) public approved;

    modifier onlyOwner() {
        require(isOwner[msg.sender], "Not owner");
        _;
    }

    modifier txExists(uint256 _txId) {
        require(_txId < transactions.length, "Tx does not exist");
        _;
    }

    modifier notApproved(uint256 _txId) {
        require(!approved[_txId][msg.sender], "Already approved");
        _;
    }

    modifier notExecuted(uint256 _txId) {
        require(!transactions[_txId].executed, "Already executed");
        _;
    }

    constructor(address[] memory _owners, uint256 _required) {
        require(_owners.length > 0, "Owners required");
        require(_required > 0 && _required <= _owners.length, "Invalid required");

        for (uint256 i = 0; i < _owners.length; i++) {
            address owner = _owners[i];
            require(owner != address(0), "Invalid owner");
            require(!isOwner[owner], "Duplicate owner");
            isOwner[owner] = true;
            owners.push(owner);
        }
        required = _required;
    }

    receive() external payable {
        emit Deposit(msg.sender, msg.value);
    }

    function submit(address _to, uint256 _value, bytes calldata _data) external onlyOwner {
        transactions.push(Transaction({
            to: _to,
            value: _value,
            data: _data,
            executed: false
        }));
        emit Submit(transactions.length - 1);
    }

    function approve(uint256 _txId) external onlyOwner txExists(_txId) notApproved(_txId) notExecuted(_txId) {
        approved[_txId][msg.sender] = true;
        emit Approve(msg.sender, _txId);
    }

    function _getApprovalCount(uint256 _txId) private view returns (uint256 count) {
        for (uint256 i = 0; i < owners.length; i++) {
            if (approved[_txId][owners[i]]) {
                count += 1;
            }
        }
    }

    function execute(uint256 _txId) external txExists(_txId) notExecuted(_txId) {
        require(_getApprovalCount(_txId) >= required, "Not enough approvals");
        Transaction storage transaction = transactions[_txId];
        transaction.executed = true;
        (bool success, ) = transaction.to.call{value: transaction.value}(transaction.data);
        require(success, "Tx failed");
        emit Execute(_txId);
    }

    function revoke(uint256 _txId) external onlyOwner txExists(_txId) notExecuted(_txId) {
        require(approved[_txId][msg.sender], "Not approved");
        approved[_txId][msg.sender] = false;
        emit Revoke(msg.sender, _txId);
    }
}
`,
  },
  {
    id: "erc721-nft",
    name: "ERC721 NFT Collection",
    description: "NFT collection with minting, metadata, and royalties for Mezo",
    category: "nft",
    content: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title MezoNFT
 * @dev ERC721 NFT collection for Mezo with minting and metadata
 */
contract MezoNFT is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable {
    using Strings for uint256;

    uint256 private _nextTokenId;
    uint256 public maxSupply;
    uint256 public mintPrice;
    string public baseURI;
    bool public mintingEnabled;

    // Royalty info (EIP-2981)
    address public royaltyReceiver;
    uint96 public royaltyFeeNumerator; // Basis points (e.g., 500 = 5%)

    event MintingToggled(bool enabled);
    event BaseURIUpdated(string newBaseURI);
    event RoyaltyUpdated(address receiver, uint96 feeNumerator);

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 maxSupply_,
        uint256 mintPrice_,
        string memory baseURI_
    ) ERC721(name_, symbol_) Ownable(msg.sender) {
        maxSupply = maxSupply_;
        mintPrice = mintPrice_;
        baseURI = baseURI_;
        mintingEnabled = false;
        royaltyReceiver = msg.sender;
        royaltyFeeNumerator = 500; // 5% default royalty
    }

    /**
     * @dev Mint a new NFT (public mint)
     */
    function mint() public payable {
        require(mintingEnabled, "Minting not enabled");
        require(msg.value >= mintPrice, "Insufficient payment");
        require(_nextTokenId < maxSupply, "Max supply reached");

        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
    }

    /**
     * @dev Mint multiple NFTs
     * @param quantity Number of NFTs to mint
     */
    function mintBatch(uint256 quantity) public payable {
        require(mintingEnabled, "Minting not enabled");
        require(msg.value >= mintPrice * quantity, "Insufficient payment");
        require(_nextTokenId + quantity <= maxSupply, "Exceeds max supply");

        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = _nextTokenId++;
            _safeMint(msg.sender, tokenId);
        }
    }

    /**
     * @dev Owner mint (free, for airdrops/team)
     * @param to Recipient address
     * @param quantity Number of NFTs to mint
     */
    function ownerMint(address to, uint256 quantity) public onlyOwner {
        require(_nextTokenId + quantity <= maxSupply, "Exceeds max supply");

        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = _nextTokenId++;
            _safeMint(to, tokenId);
        }
    }

    /**
     * @dev Toggle minting on/off
     */
    function toggleMinting() public onlyOwner {
        mintingEnabled = !mintingEnabled;
        emit MintingToggled(mintingEnabled);
    }

    /**
     * @dev Update base URI for metadata
     * @param newBaseURI New base URI
     */
    function setBaseURI(string memory newBaseURI) public onlyOwner {
        baseURI = newBaseURI;
        emit BaseURIUpdated(newBaseURI);
    }

    /**
     * @dev Update mint price
     * @param newPrice New mint price in wei
     */
    function setMintPrice(uint256 newPrice) public onlyOwner {
        mintPrice = newPrice;
    }

    /**
     * @dev Set royalty info (EIP-2981)
     * @param receiver Royalty recipient
     * @param feeNumerator Royalty in basis points
     */
    function setRoyaltyInfo(address receiver, uint96 feeNumerator) public onlyOwner {
        require(feeNumerator <= 1000, "Royalty too high"); // Max 10%
        royaltyReceiver = receiver;
        royaltyFeeNumerator = feeNumerator;
        emit RoyaltyUpdated(receiver, feeNumerator);
    }

    /**
     * @dev EIP-2981 royalty info
     */
    function royaltyInfo(uint256, uint256 salePrice) external view returns (address, uint256) {
        uint256 royaltyAmount = (salePrice * royaltyFeeNumerator) / 10000;
        return (royaltyReceiver, royaltyAmount);
    }

    /**
     * @dev Withdraw contract balance
     */
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance");
        payable(owner()).transfer(balance);
    }

    // Required overrides
    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return string(abi.encodePacked(baseURI, tokenId.toString(), ".json"));
    }

    function _update(address to, uint256 tokenId, address auth) internal override(ERC721, ERC721Enumerable) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable, ERC721URIStorage) returns (bool) {
        return interfaceId == 0x2a55205a || super.supportsInterface(interfaceId); // EIP-2981
    }
}
`,
  },
  {
    id: "token-vesting",
    name: "Token Vesting",
    description: "Linear vesting contract for team tokens, investors, or grants",
    category: "defi",
    content: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title TokenVesting
 * @dev Linear token vesting contract for Mezo
 */
contract TokenVesting is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct VestingSchedule {
        uint256 totalAmount;      // Total tokens to vest
        uint256 startTime;        // Vesting start timestamp
        uint256 cliffDuration;    // Cliff period in seconds
        uint256 vestingDuration;  // Total vesting period in seconds
        uint256 released;         // Tokens already released
        bool revocable;           // Can be revoked by owner
        bool revoked;             // Has been revoked
    }

    IERC20 public immutable token;
    mapping(address => VestingSchedule) public vestingSchedules;
    address[] public beneficiaries;

    event VestingCreated(address indexed beneficiary, uint256 amount, uint256 startTime, uint256 cliffDuration, uint256 vestingDuration);
    event TokensReleased(address indexed beneficiary, uint256 amount);
    event VestingRevoked(address indexed beneficiary, uint256 refundedAmount);

    constructor(address _token) Ownable(msg.sender) {
        require(_token != address(0), "Invalid token");
        token = IERC20(_token);
    }

    /**
     * @dev Create a vesting schedule for a beneficiary
     * @param beneficiary Address receiving the vested tokens
     * @param amount Total tokens to vest
     * @param startTime Vesting start timestamp
     * @param cliffDuration Cliff period in seconds
     * @param vestingDuration Total vesting period in seconds
     * @param revocable Whether the vesting can be revoked
     */
    function createVesting(
        address beneficiary,
        uint256 amount,
        uint256 startTime,
        uint256 cliffDuration,
        uint256 vestingDuration,
        bool revocable
    ) external onlyOwner {
        require(beneficiary != address(0), "Invalid beneficiary");
        require(amount > 0, "Amount must be > 0");
        require(vestingDuration > 0, "Duration must be > 0");
        require(vestingSchedules[beneficiary].totalAmount == 0, "Schedule exists");

        token.safeTransferFrom(msg.sender, address(this), amount);

        vestingSchedules[beneficiary] = VestingSchedule({
            totalAmount: amount,
            startTime: startTime,
            cliffDuration: cliffDuration,
            vestingDuration: vestingDuration,
            released: 0,
            revocable: revocable,
            revoked: false
        });

        beneficiaries.push(beneficiary);

        emit VestingCreated(beneficiary, amount, startTime, cliffDuration, vestingDuration);
    }

    /**
     * @dev Release vested tokens to the beneficiary
     */
    function release() external nonReentrant {
        VestingSchedule storage schedule = vestingSchedules[msg.sender];
        require(schedule.totalAmount > 0, "No vesting schedule");
        require(!schedule.revoked, "Vesting revoked");

        uint256 releasable = _releasableAmount(msg.sender);
        require(releasable > 0, "No tokens to release");

        schedule.released += releasable;
        token.safeTransfer(msg.sender, releasable);

        emit TokensReleased(msg.sender, releasable);
    }

    /**
     * @dev Revoke vesting and return unvested tokens to owner
     * @param beneficiary Address whose vesting to revoke
     */
    function revoke(address beneficiary) external onlyOwner {
        VestingSchedule storage schedule = vestingSchedules[beneficiary];
        require(schedule.revocable, "Not revocable");
        require(!schedule.revoked, "Already revoked");

        uint256 vested = _vestedAmount(beneficiary);
        uint256 refund = schedule.totalAmount - vested;

        schedule.revoked = true;

        if (refund > 0) {
            token.safeTransfer(owner(), refund);
        }

        emit VestingRevoked(beneficiary, refund);
    }

    /**
     * @dev Get the vested amount for a beneficiary
     */
    function vestedAmount(address beneficiary) external view returns (uint256) {
        return _vestedAmount(beneficiary);
    }

    /**
     * @dev Get the releasable amount for a beneficiary
     */
    function releasableAmount(address beneficiary) external view returns (uint256) {
        return _releasableAmount(beneficiary);
    }

    function _vestedAmount(address beneficiary) internal view returns (uint256) {
        VestingSchedule memory schedule = vestingSchedules[beneficiary];

        if (schedule.revoked) {
            return schedule.released;
        }

        if (block.timestamp < schedule.startTime + schedule.cliffDuration) {
            return 0;
        }

        if (block.timestamp >= schedule.startTime + schedule.vestingDuration) {
            return schedule.totalAmount;
        }

        uint256 elapsed = block.timestamp - schedule.startTime;
        return (schedule.totalAmount * elapsed) / schedule.vestingDuration;
    }

    function _releasableAmount(address beneficiary) internal view returns (uint256) {
        return _vestedAmount(beneficiary) - vestingSchedules[beneficiary].released;
    }

    /**
     * @dev Get number of beneficiaries
     */
    function getBeneficiaryCount() external view returns (uint256) {
        return beneficiaries.length;
    }
}
`,
  },
  {
    id: "timelock",
    name: "Timelock Controller",
    description: "Timelock for governance actions with configurable delay",
    category: "governance",
    content: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Timelock
 * @dev Timelock controller for governance actions on Mezo
 */
contract Timelock is Ownable {
    uint256 public constant MINIMUM_DELAY = 1 days;
    uint256 public constant MAXIMUM_DELAY = 30 days;
    uint256 public constant GRACE_PERIOD = 14 days;

    uint256 public delay;

    mapping(bytes32 => bool) public queuedTransactions;

    event NewDelay(uint256 indexed delay);
    event QueueTransaction(bytes32 indexed txHash, address indexed target, uint256 value, string signature, bytes data, uint256 eta);
    event CancelTransaction(bytes32 indexed txHash, address indexed target, uint256 value, string signature, bytes data, uint256 eta);
    event ExecuteTransaction(bytes32 indexed txHash, address indexed target, uint256 value, string signature, bytes data, uint256 eta);

    constructor(uint256 _delay) Ownable(msg.sender) {
        require(_delay >= MINIMUM_DELAY, "Delay too short");
        require(_delay <= MAXIMUM_DELAY, "Delay too long");
        delay = _delay;
    }

    receive() external payable {}

    /**
     * @dev Set new delay
     * @param _delay New delay in seconds
     */
    function setDelay(uint256 _delay) public onlyOwner {
        require(_delay >= MINIMUM_DELAY, "Delay too short");
        require(_delay <= MAXIMUM_DELAY, "Delay too long");
        delay = _delay;
        emit NewDelay(_delay);
    }

    /**
     * @dev Queue a transaction
     * @param target Target contract address
     * @param value ETH value to send
     * @param signature Function signature
     * @param data Function calldata
     * @param eta Estimated time of execution
     */
    function queueTransaction(
        address target,
        uint256 value,
        string memory signature,
        bytes memory data,
        uint256 eta
    ) public onlyOwner returns (bytes32) {
        require(eta >= block.timestamp + delay, "ETA too soon");

        bytes32 txHash = keccak256(abi.encode(target, value, signature, data, eta));
        queuedTransactions[txHash] = true;

        emit QueueTransaction(txHash, target, value, signature, data, eta);
        return txHash;
    }

    /**
     * @dev Cancel a queued transaction
     */
    function cancelTransaction(
        address target,
        uint256 value,
        string memory signature,
        bytes memory data,
        uint256 eta
    ) public onlyOwner {
        bytes32 txHash = keccak256(abi.encode(target, value, signature, data, eta));
        queuedTransactions[txHash] = false;

        emit CancelTransaction(txHash, target, value, signature, data, eta);
    }

    /**
     * @dev Execute a queued transaction
     */
    function executeTransaction(
        address target,
        uint256 value,
        string memory signature,
        bytes memory data,
        uint256 eta
    ) public payable onlyOwner returns (bytes memory) {
        bytes32 txHash = keccak256(abi.encode(target, value, signature, data, eta));

        require(queuedTransactions[txHash], "Not queued");
        require(block.timestamp >= eta, "Too early");
        require(block.timestamp <= eta + GRACE_PERIOD, "Tx stale");

        queuedTransactions[txHash] = false;

        bytes memory callData;
        if (bytes(signature).length == 0) {
            callData = data;
        } else {
            callData = abi.encodePacked(bytes4(keccak256(bytes(signature))), data);
        }

        (bool success, bytes memory returnData) = target.call{value: value}(callData);
        require(success, "Tx reverted");

        emit ExecuteTransaction(txHash, target, value, signature, data, eta);
        return returnData;
    }

    /**
     * @dev Get transaction hash
     */
    function getTxHash(
        address target,
        uint256 value,
        string memory signature,
        bytes memory data,
        uint256 eta
    ) public pure returns (bytes32) {
        return keccak256(abi.encode(target, value, signature, data, eta));
    }
}
`,
  },
  {
    id: "staking",
    name: "Staking Pool",
    description: "Stake tokens to earn rewards over time",
    category: "defi",
    content: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title StakingPool
 * @dev Stake tokens to earn rewards on Mezo
 */
contract StakingPool is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable stakingToken;
    IERC20 public immutable rewardToken;

    uint256 public rewardRate;          // Reward tokens per second
    uint256 public lastUpdateTime;
    uint256 public rewardPerTokenStored;
    uint256 public totalStaked;

    mapping(address => uint256) public stakedBalance;
    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public rewards;

    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);
    event RewardRateUpdated(uint256 newRate);

    constructor(
        address _stakingToken,
        address _rewardToken,
        uint256 _rewardRate
    ) Ownable(msg.sender) {
        require(_stakingToken != address(0), "Invalid staking token");
        require(_rewardToken != address(0), "Invalid reward token");

        stakingToken = IERC20(_stakingToken);
        rewardToken = IERC20(_rewardToken);
        rewardRate = _rewardRate;
        lastUpdateTime = block.timestamp;
    }

    /**
     * @dev Update reward calculations
     */
    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = block.timestamp;

        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }

    /**
     * @dev Calculate reward per token
     */
    function rewardPerToken() public view returns (uint256) {
        if (totalStaked == 0) {
            return rewardPerTokenStored;
        }
        return rewardPerTokenStored + (
            (block.timestamp - lastUpdateTime) * rewardRate * 1e18 / totalStaked
        );
    }

    /**
     * @dev Calculate earned rewards for an account
     * @param account User address
     */
    function earned(address account) public view returns (uint256) {
        return (
            stakedBalance[account] * (rewardPerToken() - userRewardPerTokenPaid[account]) / 1e18
        ) + rewards[account];
    }

    /**
     * @dev Stake tokens
     * @param amount Amount to stake
     */
    function stake(uint256 amount) external nonReentrant updateReward(msg.sender) {
        require(amount > 0, "Cannot stake 0");

        totalStaked += amount;
        stakedBalance[msg.sender] += amount;

        stakingToken.safeTransferFrom(msg.sender, address(this), amount);

        emit Staked(msg.sender, amount);
    }

    /**
     * @dev Withdraw staked tokens
     * @param amount Amount to withdraw
     */
    function withdraw(uint256 amount) external nonReentrant updateReward(msg.sender) {
        require(amount > 0, "Cannot withdraw 0");
        require(stakedBalance[msg.sender] >= amount, "Insufficient balance");

        totalStaked -= amount;
        stakedBalance[msg.sender] -= amount;

        stakingToken.safeTransfer(msg.sender, amount);

        emit Withdrawn(msg.sender, amount);
    }

    /**
     * @dev Claim pending rewards
     */
    function claimRewards() external nonReentrant updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];
        require(reward > 0, "No rewards");

        rewards[msg.sender] = 0;
        rewardToken.safeTransfer(msg.sender, reward);

        emit RewardsClaimed(msg.sender, reward);
    }

    /**
     * @dev Withdraw all and claim rewards
     */
    function exit() external {
        withdraw(stakedBalance[msg.sender]);
        claimRewards();
    }

    /**
     * @dev Update reward rate (only owner)
     * @param newRate New reward rate per second
     */
    function setRewardRate(uint256 newRate) external onlyOwner updateReward(address(0)) {
        rewardRate = newRate;
        emit RewardRateUpdated(newRate);
    }

    /**
     * @dev Deposit reward tokens (only owner)
     * @param amount Amount of reward tokens to deposit
     */
    function depositRewards(uint256 amount) external onlyOwner {
        rewardToken.safeTransferFrom(msg.sender, address(this), amount);
    }

    /**
     * @dev Get staking info for a user
     * @param account User address
     */
    function getStakeInfo(address account) external view returns (
        uint256 staked,
        uint256 earnedRewards,
        uint256 totalPoolStaked
    ) {
        return (stakedBalance[account], earned(account), totalStaked);
    }
}
`,
  },
  {
    id: "simple-swap",
    name: "Simple Token Swap",
    description: "Basic AMM-style token swap with liquidity pools",
    category: "defi",
    content: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SimpleSwap
 * @dev Basic constant-product AMM for Mezo
 */
contract SimpleSwap is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable tokenA;
    IERC20 public immutable tokenB;

    uint256 public reserveA;
    uint256 public reserveB;

    uint256 public totalLiquidity;
    mapping(address => uint256) public liquidity;

    uint256 public constant FEE_NUMERATOR = 3;    // 0.3% fee
    uint256 public constant FEE_DENOMINATOR = 1000;

    event LiquidityAdded(address indexed provider, uint256 amountA, uint256 amountB, uint256 liquidity);
    event LiquidityRemoved(address indexed provider, uint256 amountA, uint256 amountB, uint256 liquidity);
    event Swap(address indexed user, address tokenIn, uint256 amountIn, uint256 amountOut);

    constructor(address _tokenA, address _tokenB) Ownable(msg.sender) {
        require(_tokenA != address(0) && _tokenB != address(0), "Invalid tokens");
        require(_tokenA != _tokenB, "Same token");
        tokenA = IERC20(_tokenA);
        tokenB = IERC20(_tokenB);
    }

    /**
     * @dev Add liquidity to the pool
     * @param amountA Amount of token A to add
     * @param amountB Amount of token B to add
     */
    function addLiquidity(uint256 amountA, uint256 amountB) external nonReentrant returns (uint256) {
        require(amountA > 0 && amountB > 0, "Amounts must be > 0");

        uint256 liquidityMinted;

        if (totalLiquidity == 0) {
            // First liquidity provider
            liquidityMinted = sqrt(amountA * amountB);
        } else {
            // Subsequent providers must match ratio
            uint256 liquidityA = (amountA * totalLiquidity) / reserveA;
            uint256 liquidityB = (amountB * totalLiquidity) / reserveB;
            liquidityMinted = liquidityA < liquidityB ? liquidityA : liquidityB;
        }

        require(liquidityMinted > 0, "Insufficient liquidity");

        tokenA.safeTransferFrom(msg.sender, address(this), amountA);
        tokenB.safeTransferFrom(msg.sender, address(this), amountB);

        reserveA += amountA;
        reserveB += amountB;
        totalLiquidity += liquidityMinted;
        liquidity[msg.sender] += liquidityMinted;

        emit LiquidityAdded(msg.sender, amountA, amountB, liquidityMinted);
        return liquidityMinted;
    }

    /**
     * @dev Remove liquidity from the pool
     * @param liquidityAmount Amount of liquidity tokens to burn
     */
    function removeLiquidity(uint256 liquidityAmount) external nonReentrant returns (uint256, uint256) {
        require(liquidityAmount > 0, "Amount must be > 0");
        require(liquidity[msg.sender] >= liquidityAmount, "Insufficient liquidity");

        uint256 amountA = (liquidityAmount * reserveA) / totalLiquidity;
        uint256 amountB = (liquidityAmount * reserveB) / totalLiquidity;

        require(amountA > 0 && amountB > 0, "Insufficient amounts");

        liquidity[msg.sender] -= liquidityAmount;
        totalLiquidity -= liquidityAmount;
        reserveA -= amountA;
        reserveB -= amountB;

        tokenA.safeTransfer(msg.sender, amountA);
        tokenB.safeTransfer(msg.sender, amountB);

        emit LiquidityRemoved(msg.sender, amountA, amountB, liquidityAmount);
        return (amountA, amountB);
    }

    /**
     * @dev Swap token A for token B
     * @param amountAIn Amount of token A to swap
     * @param minAmountBOut Minimum amount of token B to receive
     */
    function swapAForB(uint256 amountAIn, uint256 minAmountBOut) external nonReentrant returns (uint256) {
        require(amountAIn > 0, "Amount must be > 0");

        uint256 amountBOut = getAmountOut(amountAIn, reserveA, reserveB);
        require(amountBOut >= minAmountBOut, "Slippage too high");

        tokenA.safeTransferFrom(msg.sender, address(this), amountAIn);
        tokenB.safeTransfer(msg.sender, amountBOut);

        reserveA += amountAIn;
        reserveB -= amountBOut;

        emit Swap(msg.sender, address(tokenA), amountAIn, amountBOut);
        return amountBOut;
    }

    /**
     * @dev Swap token B for token A
     * @param amountBIn Amount of token B to swap
     * @param minAmountAOut Minimum amount of token A to receive
     */
    function swapBForA(uint256 amountBIn, uint256 minAmountAOut) external nonReentrant returns (uint256) {
        require(amountBIn > 0, "Amount must be > 0");

        uint256 amountAOut = getAmountOut(amountBIn, reserveB, reserveA);
        require(amountAOut >= minAmountAOut, "Slippage too high");

        tokenB.safeTransferFrom(msg.sender, address(this), amountBIn);
        tokenA.safeTransfer(msg.sender, amountAOut);

        reserveB += amountBIn;
        reserveA -= amountAOut;

        emit Swap(msg.sender, address(tokenB), amountBIn, amountAOut);
        return amountAOut;
    }

    /**
     * @dev Calculate output amount for a swap
     */
    function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) public pure returns (uint256) {
        require(amountIn > 0, "Invalid input");
        require(reserveIn > 0 && reserveOut > 0, "No liquidity");

        uint256 amountInWithFee = amountIn * (FEE_DENOMINATOR - FEE_NUMERATOR);
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = (reserveIn * FEE_DENOMINATOR) + amountInWithFee;

        return numerator / denominator;
    }

    /**
     * @dev Get current price of token A in terms of token B
     */
    function getPriceAinB() external view returns (uint256) {
        require(reserveA > 0, "No liquidity");
        return (reserveB * 1e18) / reserveA;
    }

    /**
     * @dev Get pool reserves
     */
    function getReserves() external view returns (uint256, uint256) {
        return (reserveA, reserveB);
    }

    /**
     * @dev Square root function (Babylonian method)
     */
    function sqrt(uint256 x) internal pure returns (uint256 y) {
        if (x == 0) return 0;
        uint256 z = (x + 1) / 2;
        y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
    }
}
`,
  },
  {
    id: "airdrop",
    name: "Merkle Airdrop",
    description: "Gas-efficient airdrop using Merkle proofs",
    category: "utility",
    content: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/**
 * @title MerkleAirdrop
 * @dev Gas-efficient airdrop using Merkle proofs for Mezo
 */
contract MerkleAirdrop is Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable token;
    bytes32 public merkleRoot;
    uint256 public claimDeadline;

    mapping(address => bool) public hasClaimed;

    event Claimed(address indexed account, uint256 amount);
    event MerkleRootUpdated(bytes32 newRoot);
    event DeadlineUpdated(uint256 newDeadline);
    event TokensRecovered(uint256 amount);

    constructor(
        address _token,
        bytes32 _merkleRoot,
        uint256 _claimDeadline
    ) Ownable(msg.sender) {
        require(_token != address(0), "Invalid token");
        require(_claimDeadline > block.timestamp, "Invalid deadline");

        token = IERC20(_token);
        merkleRoot = _merkleRoot;
        claimDeadline = _claimDeadline;
    }

    /**
     * @dev Claim airdrop tokens
     * @param amount Amount to claim
     * @param merkleProof Merkle proof for verification
     */
    function claim(uint256 amount, bytes32[] calldata merkleProof) external {
        require(block.timestamp <= claimDeadline, "Claim period ended");
        require(!hasClaimed[msg.sender], "Already claimed");

        // Verify the Merkle proof
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender, amount));
        require(MerkleProof.verify(merkleProof, merkleRoot, leaf), "Invalid proof");

        hasClaimed[msg.sender] = true;
        token.safeTransfer(msg.sender, amount);

        emit Claimed(msg.sender, amount);
    }

    /**
     * @dev Check if an account can claim
     * @param account Address to check
     * @param amount Amount they should receive
     * @param merkleProof Merkle proof
     */
    function canClaim(
        address account,
        uint256 amount,
        bytes32[] calldata merkleProof
    ) external view returns (bool) {
        if (block.timestamp > claimDeadline) return false;
        if (hasClaimed[account]) return false;

        bytes32 leaf = keccak256(abi.encodePacked(account, amount));
        return MerkleProof.verify(merkleProof, merkleRoot, leaf);
    }

    /**
     * @dev Update Merkle root (only owner)
     * @param newRoot New Merkle root
     */
    function setMerkleRoot(bytes32 newRoot) external onlyOwner {
        merkleRoot = newRoot;
        emit MerkleRootUpdated(newRoot);
    }

    /**
     * @dev Extend claim deadline (only owner)
     * @param newDeadline New deadline timestamp
     */
    function setDeadline(uint256 newDeadline) external onlyOwner {
        require(newDeadline > block.timestamp, "Invalid deadline");
        claimDeadline = newDeadline;
        emit DeadlineUpdated(newDeadline);
    }

    /**
     * @dev Recover unclaimed tokens after deadline (only owner)
     */
    function recoverTokens() external onlyOwner {
        require(block.timestamp > claimDeadline, "Claim period not ended");
        uint256 balance = token.balanceOf(address(this));
        require(balance > 0, "No tokens to recover");

        token.safeTransfer(owner(), balance);
        emit TokensRecovered(balance);
    }

    /**
     * @dev Get remaining time to claim
     */
    function getTimeRemaining() external view returns (uint256) {
        if (block.timestamp >= claimDeadline) return 0;
        return claimDeadline - block.timestamp;
    }
}
`,
  },
]

export function getTemplateById(id: string): ContractTemplate | undefined {
  return TEMPLATES.find((t) => t.id === id)
}

export function getTemplatesByCategory(category: ContractTemplate["category"]): ContractTemplate[] {
  return TEMPLATES.filter((t) => t.category === category)
}

export const BLANK_CONTRACT = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MyContract {
    // Your code here
}
`
