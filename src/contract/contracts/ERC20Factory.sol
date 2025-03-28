// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ERC20Custom.sol";

contract ERC20Factory {
    event TokenCreated(address indexed tokenAddress, string name, string symbol);

    function createERC20(
        string memory name,
        string memory symbol,
        uint8 decimals,
        uint256 initialSupply,
        address initialHolder
    ) external returns (address) {
        ERC20Custom token = new ERC20Custom(
            name,
            symbol,
            decimals,
            initialSupply,
            initialHolder
        );

        address tokenAddress = address(token);
        emit TokenCreated(tokenAddress, name, symbol);
        return tokenAddress;
    }
}