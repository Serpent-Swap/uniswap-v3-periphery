import { ethers, run, network } from 'hardhat';

const main = async () => {
  const deployArgs: any[] = [];

  if (network.name === 'xrplDevnet') {
    deployArgs.push('0x71992849909a5Ed0c8Cc3928F5F5287B13d08aBA'); // pool factory
    deployArgs.push('0x8049c9E3cE496b47E0fE8aa8EdAEf751cF87e07d'); // wxrp (weth9)
  } else if (network.name === 'sepolia') {
    deployArgs.push('0x0227628f3F023bb0B980b67D528571c95c6DaC1c'); // pool factory (uniswap deployment)
    deployArgs.push('0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9'); // weth (weth9)
  }

  const swapRouter = await ethers.deployContract('SwapRouter', deployArgs);
  await swapRouter.waitForDeployment();
  console.log(`SwapRouter deployed to ${swapRouter.target}`);

  // wait for block explorer to index the contract
  console.log('Waiting for block explorer to index the contract...');
  await new Promise((resolve) => setTimeout(resolve, 15000));

  await run('verify:verify', {
    address: swapRouter.target,
    constructorArguments: deployArgs,
    contract: 'contracts/SwapRouter.sol:SwapRouter',
  });
};

main();