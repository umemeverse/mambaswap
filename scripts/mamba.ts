import { Mamba } from './../typechain-types/contracts/Mamba';
import '@nomiclabs/hardhat-ethers';
import { ethers } from "hardhat";

async function deployMamba(name: string, symbol: string) :Promise<Mamba> {
    const Mamba = await ethers.getContractFactory("Mamba");
    const mamba = await Mamba.deploy(name, symbol);

    await mamba.deployed();

    return mamba;
}

export {
    deployMamba
}