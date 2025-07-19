import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@typechain/hardhat";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.22",
    settings: {
      viaIR: true, // Enable viaIR to handle stack too deep errors
      optimizer: {
        enabled: true,
        runs: 1, // Optimize for size instead of runtime gas efficiency
      },
    },
  },
  typechain: {
    outDir: "typechain-types",
  },
};

export default config;
