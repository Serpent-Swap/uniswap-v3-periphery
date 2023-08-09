import { ethers, run } from 'hardhat';

async function main() {
  console.log('Deploying periphery contracts...');
  const nonfungiblePositionManager = await ethers.deployContract('NonfungiblePositionManager');
  await nonfungiblePositionManager.waitForDeployment();
  console.log(`UniswapV3Factory deployed to ${nonfungiblePositionManager.target}`);

  await run('verify:verify', {
    address: nonfungiblePositionManager.target,
    constructorArguments: [],
    contract: 'contracts/WrappedXRP.sol:WrappedXRP',
  });
  console.log(`Verified WrappedXRP at ${nonfungiblePositionManager.target}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
