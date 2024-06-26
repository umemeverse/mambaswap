import '@nomiclabs/hardhat-ethers';
import { ethers } from "hardhat";

import { deployMamba } from './mamba';
// import { deployStakingPool } from './pool';
import { deployDex } from './dex';


async function main() {
  const mamba = await deployMamba("MambaSwap", "MBS");

  console.log(`Mamba deployed at ${mamba.address}`);

  const [user1] = await ethers.getSigners();

  const balance = await mamba.balanceOf(user1.address);
  console.log(`balance of ${user1.address}: ${balance}`);

  const [weth, factory, router] = await deployDex();
  console.log(weth.address, factory.address, router.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

