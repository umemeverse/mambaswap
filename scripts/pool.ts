import '@nomiclabs/hardhat-ethers';
import { ethers } from "hardhat";
import { Pool } from '../typechain-types';

async function deployStakingPool(stakingToken: string, rewardToken: string, begin: number, end: number, rewardPerPeriod: number, decimals: number, transferNoReturn: boolean) :Promise<Pool> {
    const Pool = await ethers.getContractFactory("Pool");
    const pool = await Pool.deploy(stakingToken, rewardToken, rewardPerPeriod, transferNoReturn, begin, end, decimals);

    await pool.deployed();

    return pool;
}

export {
    deployStakingPool
}