// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title A custom Coin contract
/// @author Deep Kulshreshtha
/// @notice Developed as part of web3 training. Batch 4 Team 1
/// @notice You can use this contract for basic simulation
/// @dev Contract does not have a maxSupply limit
/// @custom:experimental This is an experimental contract.
contract Batch4Team1Coin is ERC20 {
    // address private _owner;

    constructor() ERC20("Batch4Team1Coin", "B4T1") {}

    function mint() external {
        _mint(msg.sender, 10 * 10 ** 18);
    }
}
