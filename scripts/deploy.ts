import { ethers, run } from 'hardhat';

async function main() {
  const currentNetwork = await ethers.provider.getNetwork();

  let poolFactory = '';
  let wrappedNative = '';
  let nativeCurrencyLabel = '';

  switch (currentNetwork.name) {
    case 'xrplDevnet':
      poolFactory = '0x71992849909a5Ed0c8Cc3928F5F5287B13d08aBA';
      wrappedNative = '0xb560eF7E09609C939E09a1a15961043278D27b03';
      nativeCurrencyLabel = 'XRP';
      break;
    case 'sepolia':
      poolFactory = '0x76DDF5E3Cb4412fD8dc39440c56c0C58D0705290';
      wrappedNative = '0x0c5C1D094f92eFfd9A6a9b0546b7b1B852B442a2';
      nativeCurrencyLabel = 'ETH';
      break;
  }

  const nativeCurrencyLabelBytes = ethers.encodeBytes32String(nativeCurrencyLabel);

  console.log(`Deploying periphery contracts to ${currentNetwork.name}...`);

  const NFTDescriptor = await ethers.getContractFactory('NFTDescriptor');
  const nftDescriptor = await NFTDescriptor.deploy();
  const nftDescriptorAddress = await nftDescriptor.getAddress();
  console.log(`NFTDescriptor deployed to ${nftDescriptorAddress}`);

  const NftPositionDescriptor = await ethers.getContractFactory('NonfungibleTokenPositionDescriptor', {
    libraries: {
      NFTDescriptor: nftDescriptor
    }
  });
  const nftPositionDescriptor = await NftPositionDescriptor.deploy(wrappedNative, nativeCurrencyLabelBytes);
  const nftPositionDescriptorAddress = await nftPositionDescriptor.getAddress();
  console.log(`NonfungibleTokenPositionDescriptor deployed to ${nftPositionDescriptorAddress}`);

  const NonfungiblePositionManager = await ethers.getContractFactory('NonfungiblePositionManager');
  const nonfungiblePositionManager = await NonfungiblePositionManager.deploy(poolFactory, wrappedNative, nftPositionDescriptorAddress);
  const nonfungiblePositionManagerAddress = await nonfungiblePositionManager.getAddress();
  console.log(`NonfungiblePositionManager deployed to ${nonfungiblePositionManagerAddress}`);

  const SwapRouter = await ethers.getContractFactory('SwapRouter');
  const swapRouter = await SwapRouter.deploy(poolFactory, wrappedNative);
  const swapRouterAddress = await swapRouter.getAddress();
  console.log(`SwapRouter deployed to ${swapRouterAddress}`);

  // sleep for 30 seconds to allow for etherscan to index the contracts
  await new Promise((resolve) => setTimeout(resolve, 30000));

  console.log(`Verifying contracts on ${currentNetwork.name}...`);
  await run('verify:verify', {
    address: await nftDescriptor.getAddress(),
    constructorArguments: [],
    contract: 'contracts/libraries/NFTDescriptor.sol:NFTDescriptor',
  });

  await run('verify:verify', {
    address: await nftPositionDescriptor.getAddress(),
    constructorArguments: [wrappedNative, nativeCurrencyLabelBytes],
    contract: 'contracts/NonfungibleTokenPositionDescriptor.sol:NonfungibleTokenPositionDescriptor',
  });

  await run('verify:verify', {
    address: await nonfungiblePositionManager.getAddress(),
    constructorArguments: [poolFactory, wrappedNative, nftPositionDescriptorAddress],
    contract: 'contracts/NonfungiblePositionManager.sol:NonfungiblePositionManager',
  });

  await run('verify:verify', {
    address: await swapRouter.getAddress(),
    constructorArguments: [poolFactory, wrappedNative],
    contract: 'contracts/SwapRouter.sol:SwapRouter',
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
