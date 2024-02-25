import { BigNumber } from 'ethers';
import '@nomiclabs/hardhat-ethers';
import { ethers } from "hardhat";

async function main() {
  const Mamba = await ethers.getContractFactory("Mamba");
  const mamba = await Mamba.deploy("MambaSwap", "MBS");

  await mamba.deployed();

  console.log(`Mamba deployed at ${ mamba.address }`);

  const [ user1 ] = await ethers.getSigners();

  const balance = await mamba.balanceOf(user1.address);
  console.log(`balance of ${ user1.address }: ${ balance }`);
}

async function deployStakingPool(stakingToken: string, rewardToken: string, begin: number, end: number, rewardPerPeriod: number, decimals: number, transferNoReturn: boolean) {
  const Pool = await ethers.getContractFactory("Pool");
  const pool = await Pool.deploy(stakingToken, rewardToken, rewardPerPeriod, transferNoReturn, begin, end, decimals);

  await pool.deployed();

  console.log(`Pool deployed at ${ pool.address }`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});