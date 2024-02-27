// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ISO is Ownable {
    IERC20 public mamba;
    IERC20 public toSale;
    uint256 price; // mul 1000
    uint256 total; // total mamba quota
    uint256 left; // left mamba quota
    uint256 begin;
    uint256 end;
    mapping(address => uint256) deposited;
    mapping(address => bool) withdrawed;

    constructor(
        address _mamba,
        address _toSale,
        uint256 _begin,
        uint256 _end,
        uint256 _total,
        uint256 _price
    ) {
        mamba = IERC20(_mamba);
        toSale = IERC20(_toSale);
        begin = _begin;
        end = _end;
        total = _total;
        left = _total;
        price = _price;
    }

    function buy(uint256 mambaAmount) external {
        address buyer = _msgSender();
        require(
            block.timestamp >= begin && block.timestamp <= end,
            "MambaSwap ISO: closed"
        );
        require(left > mambaAmount, "MambaSwap ISO: no quota");
        require(mamba.transferFrom(buyer, address(this), mambaAmount));
        deposited[buyer] += mambaAmount;
        left -= mambaAmount;
    }

    function withdraw() external {
        address buyer = _msgSender();
        require(withdrawed[buyer] == false, "MambaSwap ISO: withdrawd");
        require(block.timestamp >= end, "MambaSwap ISO: not finished");
        uint256 saledCount = count(buyer);
        toSale.transfer(buyer, saledCount);
        withdrawed[buyer] = true;
    }

    function adminWithdraw() external onlyOwner {
        mamba.transfer(owner(), mamba.balanceOf(address(this)));
    }

    function count(address buyer) public view returns (uint256) {
        uint256 mambaAmount = deposited[buyer];
        return (mambaAmount * 10000) / price;
    }
}
