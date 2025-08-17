// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ViurlToken is ERC20, Ownable {
    constructor(uint256 initialSupply) ERC20("ViurlToken", "VRT") {
        _mint(msg.sender, initialSupply);
    }

    function rewardUser(address user, uint256 amount) external onlyOwner {
        _transfer(owner(), user, amount);
    }
}
