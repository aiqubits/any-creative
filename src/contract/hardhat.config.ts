import { HardhatUserConfig, vars } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const RPC_URL = vars.get("RPC_URL");
const PRIVATE_KEY = vars.get("PRIVATE_KEY");

// export RPC_URL=https://sepolia.infura.io/v3/7cb673f9a1324974899fc4cd4429b450 
// export RPC_URL=https://evmrpc-testnet.0g.ai
// export PRIVATE_KEY=

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 500,
      },
      evmVersion: "istanbul",
    },    
  },
  networks: {
    customize: {
      url: process.env.RPC_URL,
      // chainId: 11155111,
      accounts: [process.env.PRIVATE_KEY!],
      gasPrice: 2000000000000,
      gas: 500_000_000_000_000,
      gasMultiplier: 1.5,
    },
  },
};

export default config;
