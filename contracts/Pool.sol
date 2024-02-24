// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Pool is Ownable {
    IERC20 public stakeToken;
    IERC20 public rewardToken;

    uint256 private _totalSupply = 0;                               // current total supply
    mapping(address => uint256) private _balances;                  // user's balance
    mapping(address => uint256) public userDebt;                    // user's debt
    mapping(address => uint256) private paidReward;                 // user earned and harvested

    uint256 public startTime;
    uint256 public period;
    uint256 public totalPeriod;
    uint256 public decimals;
    uint256 public rewardPerPeriod;                                 // reward of some period
    uint256 public accRewardPerUnit;                                // acc reward
    uint256 public lastRewardPeriod;                                // last reward period
    bool public transferNoReturn;

    constructor(address _stakeToken, address _rewardToken, uint256 _rewardPerPeriod, bool _transferNoReturn, uint256 _startTime, uint256 _decimals, uint256 _period, uint256 _totalPeriod) {
        accRewardPerUnit = 0;
        rewardToken = IERC20(_rewardToken);
        stakeToken = IERC20(_stakeToken);
        rewardPerPeriod = _rewardPerPeriod;
        transferNoReturn = _transferNoReturn;
        startTime = _startTime;
        decimals = _decimals;
        period = _period;
        totalPeriod = _totalPeriod;
    }

    function updateRewardPerPeriod(uint256 _rewardPerPeriod) external onlyOwner returns (bool) {
        rewardPerPeriod = _rewardPerPeriod;
        return true;
    }

    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }

    function paidRewardOf(address account) public view returns (uint256) {
        return paidReward[account];
    }

    function getUserEarned(address account) public view returns (uint256) {
        uint256 lastP = currentPeriod();
        if(balanceOf(account) == 0 || lastP == 0) {
            return 0;
        }
        uint256 periods = lastP - lastRewardPeriod;
        uint256 reward = periods*rewardPerPeriod;
        uint256 perReward = accRewardPerUnit + reward*decimals/_totalSupply;
        uint256 debt = userDebt[account];
        uint256 balance = balanceOf(account);
        return balance*perReward/decimals-debt;
    }

    function rewardOf(address account) public view returns (uint256) {
        return paidRewardOf(account)+getUserEarned(account);
    }

    function stake(uint256 amount) public returns (bool) {
        address user = msg.sender;
        
        if (balanceOf(user) > 0) {
            harvest();   
        }

        _totalSupply = _totalSupply+amount;
        _balances[user] = _balances[user]+amount;
        require(stakeToken.transferFrom(user, address(this), amount), "stake failed");

        return updateUserDebt();
    }

    function withdraw(uint256 amount) public returns (bool) {
        harvest();

        _totalSupply = _totalSupply-amount;
        _balances[msg.sender] = _balances[msg.sender]-amount;
        if (transferNoReturn && stakeToken.balanceOf(address(this)) >= amount) {
            stakeToken.transfer(msg.sender, amount);
        } else {
            require(stakeToken.transfer(msg.sender, amount), "withdraw failed");
        }

        return updateUserDebt();
    }

    function updateUserDebt() private returns (bool) {
        updatePool();
        userDebt[msg.sender] = balanceOf(msg.sender)*(accRewardPerUnit)/(decimals);
        return true;
    }

    function harvest() public returns (bool) {
        updatePool();
        uint256 reward = getUserEarned(msg.sender);
        require(rewardToken.transfer(msg.sender, reward), "harvest failed");
        paidReward[msg.sender] = paidReward[msg.sender]+(reward);
        return updateUserDebt();
    }

    function exit() public returns (bool) {
        uint256 amount = balanceOf(msg.sender);
        withdraw(amount);
        return true;
    }

    function currentPeriod() public view returns (uint256) {
        if (block.timestamp < startTime) {
            return 0;
        }
        uint256 time = block.timestamp - startTime;
        uint256 mod = time % period;
        time = time - mod;
        uint256 _period = time / period;
        if (_period > totalPeriod) {
            _period = totalPeriod;
        }
        return _period;
    }

    function updatePool() private returns (bool) {
        if (_totalSupply == 0 || block.timestamp <= startTime) {
            return false;
        }
        uint256 lastP = currentPeriod();
        uint256 periods = lastP - lastRewardPeriod;
        uint256 reward = periods*(rewardPerPeriod);
        accRewardPerUnit = accRewardPerUnit+(reward*(decimals)/(_totalSupply));
        lastRewardPeriod = lastP;
        return true;
    }
}
