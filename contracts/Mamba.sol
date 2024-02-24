// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Context.sol";

contract Mamba is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        super._mint(_msgSender(), 10**10 * 10 ** 18);
    }
}