pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract VIURLtoken is ERC20, Ownable {
    IERC20 public stablecoin;  // Declare the stablecoin interface

    constructor(address _stablecoinAddress) ERC20("VIURL Token", "VIURL") {
        stablecoin = IERC20(_stablecoinAddress);  // Initialize the stablecoin
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }

    // Function to swap VIURL tokens for stablecoins
    function swapForStablecoin(uint256 amount) public {
        require(balanceOf(msg.sender) >= amount, "Insufficient VIURL balance");
        _burn(msg.sender, amount);
        require(stablecoin.transfer(msg.sender, amount), "Stablecoin transfer failed");
    }
}
