# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.ts
npx hardhat ignition deploy ./ignition/modules/Token.js --network customize

```

## build

```shell
export RPC_URL=https://sepolia.infura.io/v3/7cb673f9a1324974899fc4cd4429b450 
export RPC_URL=https://evmrpc-testnet.0g.ai
export PRIVATE_KEY=

# https://16600.rpc.thirdweb.com
# https://rpc.ankr.com/0g_newton
# https://evmrpc-testnet.0g.ai

npx hardhat vars set RPC_URL

npx hardhat vars set PRIVATE_KEY

npx hardhat compile
```

## test

```shell
npx hardhat test
```

## clean
```
rm -rf ignition/deployments/*
```

## deploy

``` shell

npx hardhat ignition deploy ./ignition/modules/ERC20Factory.ts --network customize
npx hardhat ignition deploy ./ignition/modules/ERC721Factory.ts --network customize

# nft 0x75baF100beEc535C8CA0A2938084Fa1f1037D6e0
# token   0x02E0BfC376978CdFd269FB6AaAdfB1086D51299E
```