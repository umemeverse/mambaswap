// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ISO is Ownable {
    IERC20 public mamba;

    struct TokenOffering {
        address token;
        uint256 price;          // mul 1000
        uint256 total;          // total mamba quota
        uint256 left;           // left mamba quota
        mapping(address => uint256) deposited;
    }

    mapping(uint256 => TokenOffering) public offerings;

    constructor(address _mamba) {
        mamba = IERC20(_mamba);
    }

    function buy(uint256 offeringId, uint256 amount) external {
        address buyer = _msgSender();
        TokenOffering storage offering = offerings[offeringId];
        require(offering.left > amount);
        require(mamba.transferFrom(buyer, address(this), amount));
    }
}