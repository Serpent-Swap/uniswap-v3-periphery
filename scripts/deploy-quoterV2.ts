import { ethers, run, network } from 'hardhat';

const main = async () => {
  const deployArgs: any[] = [];

  if (network.name === 'xrplDevnet') {
    deployArgs.push('0x123b5c88Cc98f8f73b686cd8bdEA213EAa4360e8'); // pool factory
    deployArgs.push('0x8049c9E3cE496b47E0fE8aa8EdAEf751cF87e07d'); // wxrp (weth9)
  } else if (network.name === 'sepolia') {
    deployArgs.push('0x19f217A65E827f6fA955F89b7ABfACcCcf7c9860'); // pool factory (uniswap deployment)
    deployArgs.push('0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9'); // weth (weth9)
  }

  const quoterV2 = await ethers.deployContract('QuoterV2', deployArgs);
  await quoterV2.waitForDeployment();
  console.log(`Quoter2 deployed to ${quoterV2.target}`);

  // wait for block explorer to index the contract
  console.log('Waiting for block explorer to index the contract...');
  await new Promise((resolve) => setTimeout(resolve, 15000));

  await run('verify:verify', {
    address: quoterV2.target,
    constructorArguments: deployArgs,
    contract: 'contracts/lens/QuoterV2.sol:QuoterV2',
  });
};

main();