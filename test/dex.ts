import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber } from "ethers";
import { token } from "../typechain-types/@openzeppelin/contracts";

describe("Dex", function () {
  async function deployContracts() {
    const [ owner ] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("Token");
    const tokenA = await Token.deploy("TokenA", "TokenA", BigNumber.from("100000000000000000000000000"));
    const tokenB = await Token.deploy("TokenB", "TokenB", BigNumber.from("100000000000000000000000000"));
    const WETH = await ethers.getContractFactory("WETH9");
    const weth = await WETH.deploy();
    const Factory = await ethers.getContractFactory("MambaswapV2Factory");
    const factory = await Factory.deploy(owner.address);
    const Router = await ethers.getContractFactory("MambaswapV2Router02");
    const router = await Router.deploy(factory.address, weth.address);

    await tokenA.approve(router.address, BigNumber.from("100000000000000000000000000"));
    await tokenB.approve(router.address, BigNumber.from("100000000000000000000000000"));
    await router.addLiquidity(tokenA.address, tokenB.address, BigNumber.from("100000000000000000000"), BigNumber.from("100000000000000000000"), 1, 1, owner.address, 1800000000);

    return { owner, tokenA, tokenB, weth, factory, router };
  }

  describe("Add Liquidity", function () {
    it("can add liquidity", async function () {
      const { factory, router, tokenA, tokenB, owner } = await loadFixture(deployContracts);

      expect(await factory.allPairsLength()).to.equal(1);
    });

    it("has right reservers", async function() {
      const { factory, router, tokenA, tokenB, owner } = await loadFixture(deployContracts);
      const address = await factory.getPair(tokenA.address, tokenB.address);
      const Pair = await ethers.getContractFactory("MambaswapV2Pair");
      const pair = await Pair.attach(address);
      const [reserver0, reserver1] = await pair.getReserves();
      
      expect(reserver0).to.equal("100000000000000000000")
      expect(reserver1).to.equal("100000000000000000000")
    })
  });

  describe("Swap", function () {
    it("sell tokenA", async function () {
      const { factory, router, tokenA, tokenB, owner } = await loadFixture(deployContracts);
      await router.swapExactTokensForTokens("100000000000000000000", 1, [tokenA.address, tokenB.address], owner.address, 1800000000);

      const address = await factory.getPair(tokenA.address, tokenB.address);
      const Pair = await ethers.getContractFactory("MambaswapV2Pair");
      const pair = await Pair.attach(address);
      const [reserver0, reserver1] = await pair.getReserves();
      const token0 = await pair.token0();
      if (token0 === tokenA.address) {
        expect(reserver0).to.equal("200000000000000000000");
      } else {
        expect(reserver1).to.equal("200000000000000000000");
      }

      expect(await factory.allPairsLength()).to.equal(1);
    });

    it("sell tokenB", async function() {
      const { factory, router, tokenA, tokenB, owner } = await loadFixture(deployContracts);
      await router.swapTokensForExactTokens("1000000000000000000", "100000000000000000000", [tokenB.address, tokenA.address], owner.address, 1800000000);

      const address = await factory.getPair(tokenA.address, tokenB.address);
      const Pair = await ethers.getContractFactory("MambaswapV2Pair");
      const pair = await Pair.attach(address);
      const [reserver0, reserver1] = await pair.getReserves();

      const token0 = await pair.token0();
      if (token0 === tokenB.address) {
        expect(reserver1).to.equal("99000000000000000000");
      } else {
        expect(reserver0).to.equal("99000000000000000000");
      }
      
      // expect(reserver1).to.equal("99000000000000000000");

      expect(await factory.allPairsLength()).to.equal(1);
    })
  });

  describe("Remove Liquidity", function () {
    it("remove liquidity", async function () {
      const { factory, router, tokenA, tokenB, owner } = await loadFixture(deployContracts);
      const address = await factory.getPair(tokenA.address, tokenB.address);
      const Pair = await ethers.getContractFactory("MambaswapV2Pair");
      const pair = await Pair.attach(address);
      await pair.approve(router.address, "10000000000000000000000000000")

      await router.removeLiquidity(tokenA.address, tokenB.address, "50000000000000000000", 1, 1, owner.address, 1800000000)
      const [reserver0, reserver1] = await pair.getReserves();
      
      expect(reserver0).to.equal("50000000000000000000");
      expect(reserver0).to.equal("50000000000000000000");
    });
  });
});
