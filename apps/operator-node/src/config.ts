import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  "EVM_RPC_URL",
  "EVM_VAULT_ADDRESS",
  "CASPER_NODE_URL",
  "CASPER_CHAIN_NAME",
  "CASPER_BRIDGE_HASH",
  "CASPER_OPERATOR_PRIVATE_KEY_PATH",
];

for (const varName of requiredEnvVars) {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
}

export const CONFIG = {
  EVM: {
    RPC: process.env.EVM_RPC_URL!,
    VAULT_ADDR: process.env.EVM_VAULT_ADDRESS!,
    REGISTRY_ADDR: process.env.EVM_REGISTRY_ADDRESS || "",
  },
  CASPER: {
    NODE: process.env.CASPER_NODE_URL!,
    CHAIN: process.env.CASPER_CHAIN_NAME!,
    BRIDGE_HASH: process.env.CASPER_BRIDGE_HASH!,
    AMM_HASH: process.env.CASPER_AMM_HASH || "", // Optional - only if using cross-chain swaps
    OPERATOR_KEY_PATH: process.env.CASPER_OPERATOR_PRIVATE_KEY_PATH!,
  },
};
