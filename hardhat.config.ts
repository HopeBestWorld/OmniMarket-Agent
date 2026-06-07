import "dotenv/config";
import { defineConfig } from "hardhat/config";
import hardhatViem from "@nomicfoundation/hardhat-viem"; // Note the change here

export default defineConfig({
  plugins: [hardhatViem], // <-- This tells Hardhat v3 to actually load the plugin!
  solidity: "0.8.20",
  networks: {
    somnia: {
      type: "http",
      url: "https://api.infra.testnet.somnia.network",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
});