import '@nomiclabs/hardhat-ethers';
import { ethers } from "hardhat";

async function deployDex() {
    console.log('deploying dex...');
    const [ owner ] = await ethers.getSigners();
    const WETH = await ethers.getContractFactory("WETH9");
    // 请注意，WETH一般会使用链上共用的合约，不用自己单独部署
    // const weth = await WETH.attach('weth address');
    const weth = await WETH.deploy();
    const Factory = await ethers.getContractFactory("MambaswapV2Factory");
    const factory = await Factory.deploy(owner.address);
    const Router = await ethers.getContractFactory("MambaswapV2Router02");
    const router = await Router.deploy(factory.address, weth.address);

    return [weth, factory, router];
}

export {
    deployDex
}