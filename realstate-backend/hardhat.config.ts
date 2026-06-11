import { defineConfig } from "hardhat/config";
import hardhatToolboxMochaEthers from "@nomicfoundation/hardhat-toolbox-mocha-ethers";

export default defineConfig({
  plugins: [hardhatToolboxMochaEthers],
  
  solidity: {
    // 1. Root 'version' is removed because 'profiles' is active.
    profiles: {
      // 2. The 'default' profile is mandatory in Hardhat 3
      default: {
        version: "0.8.24",
        settings: {
          optimizer: { enabled: true, runs: 200 },
          evmVersion: "cancun"
        }
      },
      // Your custom deployment profile targeting the MCOPY ruleset
      production: {
        version: "0.8.24", 
        settings: {
          optimizer: { enabled: true, runs: 200 },
          evmVersion: "cancun" 
        }
      }
    }
  },
  
  networks: {
    localhost: {
      type: "http",
      url: "http://127.0.0.1:8545",
      chainId: 31337
    }
  }
});
