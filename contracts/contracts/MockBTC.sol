// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockBTC is ERC20 {
    constructor() ERC20("Mock Mezo BTC", "mBTC") {
        // Mint 1,000,000 tokens to the deployer for testing
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }
}