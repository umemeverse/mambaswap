import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber } from "ethers";

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

    return { owner, tokenA, tokenB, weth, factory, router };
  }

  describe("Add Liquidity", function () {
    it("can add liquidity", async function () {
      const { factory, router, tokenA, tokenB, owner } = await loadFixture(deployContracts);
      await router.addLiquidity(tokenA.address, tokenB.address, "100000000000000000000", "100000000000000000000", 1, 1, owner.address, 1800000000);

      // expect(await factory.allPairsLength()).to.equal(1);
    });

    // it("Should have right name", async function () {
    //   const { ft } = await loadFixture(deployFT);

    //   expect(await ft.name()).to.equal(name);
    // });
  });

  // describe("Mintable", function () {
  //   it("Should mintable by owner", async function () {
  //     const { ft } = await loadFixture(deployFT);
  //     const [owner] = await ethers.getSigners();
  //     const signedFt = ft.connect(owner)
  //     const amount = 100
  //     await signedFt.mint(owner.address, amount)

  //     expect(await ft.balanceOf(owner.address)).to.equal(amount);
  //   });

  //   it("Should mintable by owner for other account", async function () {
  //     const { ft } = await loadFixture(deployFT);
  //     const [owner, otherAccount] = await ethers.getSigners();
  //     const signedFt = ft.connect(owner)
  //     const amount = 1000
  //     await signedFt.mint(otherAccount.address, amount)

  //     expect(await ft.balanceOf(otherAccount.address)).to.equal(amount);
  //   });

  //   it("Should not mintable by other account", async function () {
  //     const { ft } = await loadFixture(deployFT);
  //     const [owner, otherAccount] = await ethers.getSigners();
  //     const signedFt = ft.connect(otherAccount)
  //     const amount = 100

  //     signedFt.mint(otherAccount.address, amount).catch(async (e) => {
  //       expect(await ft.balanceOf(owner.address)).to.equal(0);
  //     })
  //   });
  // });

  // describe("Pausable", function () {
  //   it("Should pause and resume by owner", async function () {
  //     const { ft } = await loadFixture(deployFT);
  //     const [owner, otherAccount] = await ethers.getSigners();
  //     const signedFt = ft.connect(owner)
      
  //     await signedFt.mint(owner.address, 1000)

  //     await signedFt.pause()

  //     signedFt.transfer(otherAccount.address, 100).catch( async (e)=>{
  //       expect(await ft.balanceOf(owner.address)).to.equal(1000);
  //       expect(await ft.balanceOf(otherAccount.address)).to.equal(0);
  //     })

  //     await signedFt.unpause()
  //     await signedFt.transfer(otherAccount.address, 100)
  //     expect(await ft.balanceOf(owner.address)).to.equal(900);
  //     expect(await ft.balanceOf(otherAccount.address)).to.equal(100);
  //   });

  //   it("Should not pausable by other account", async function () {
      
  //   });
  // });
});
