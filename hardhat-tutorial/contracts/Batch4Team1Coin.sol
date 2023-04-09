// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Batch4Team1Coin is ERC20 {
    // address private _owner;

    constructor() ERC20("Batch4Team1Coin", "B4T1") {}

    function mint() external {
        _mint(msg.sender, 10 * 10 ** 18);
    }
}
