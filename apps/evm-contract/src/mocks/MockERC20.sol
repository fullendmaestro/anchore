// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockERC20
 * @dev Simple ERC20 token for testing purposes
 */
contract MockERC20 is ERC20 {
    uint8 private _decimals;

    constructor(
        string memory name,
        string memory symbol
    ) ERC20(name, symbol) {
        _decimals = 6; // Default to 6 decimals (like USDC)
    }

    /**
     * @dev Mint tokens to any address (no restrictions for testing)
     */
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    /**
     * @dev Burn tokens from caller
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    /**
     * @dev Override decimals
     */
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    /**
     * @dev Set custom decimals (for testing different token types)
     */
    function setDecimals(uint8 newDecimals) external {
        _decimals = newDecimals;
    }
}
