import { ethers } from "ethers";
import { CONFIG } from "../config";
import { VAULT_ABI } from "../abis";
import { releaseOnCasper } from "./casperDispatcher";

// Token Mapping: EVM Token -> Casper CEP-18 Token
// In production, this would be stored in a database or config
const TOKEN_MAPPING: Record<string, string> = {
  // Example: USDC on EVM -> wUSDC on Casper
  // "0x...": "hash-...",
};

// Fallback token address for hackathon
const CASPER_DEFAULT_TOKEN = process.env.CASPER_DEFAULT_TOKEN_HASH || "";

export async function startListener() {
  const provider = new ethers.JsonRpcProvider(CONFIG.EVM.RPC);
  const vaultContract = new ethers.Contract(
    CONFIG.EVM.VAULT_ADDR,
    VAULT_ABI,
    provider
  );

  console.log("\n" + "=".repeat(50));
  console.log("🚀 Anchore Bridge Operator - EVM Listener");
  console.log("=".repeat(50));
  console.log(`📡 Network: ${CONFIG.EVM.RPC}`);
  console.log(`📦 Vault Contract: ${CONFIG.EVM.VAULT_ADDR}`);
  console.log(`🔗 Listening for BridgeRequested events...\n`);

  // Listen for new bridge requests
  vaultContract.on(
    "BridgeRequested",
    async (sender, amount, targetAddress, nonce, event) => {
      console.log("\n" + "─".repeat(50));
      console.log(`🔔 [NEW BRIDGE REQUEST DETECTED]`);
      console.log("─".repeat(50));
      console.log(`📤 From (EVM):        ${sender}`);
      console.log(
        `💰 Amount:            ${ethers.formatUnits(amount, 6)} tokens`
      );
      console.log(`📥 To (Casper):       ${targetAddress}`);
      console.log(`#️⃣  Nonce:             ${nonce}`);
      console.log(`🔗 Block:             ${event.log.blockNumber}`);
      console.log(`📜 Tx Hash:           ${event.log.transactionHash}`);
      console.log("─".repeat(50));

      try {
        // Determine target token on Casper
        const casperTokenAddress = CASPER_DEFAULT_TOKEN;

        if (!casperTokenAddress) {
          throw new Error(
            "No Casper token address configured. Set CASPER_DEFAULT_TOKEN_HASH in .env"
          );
        }

        console.log(`🔄 Processing bridge release on Casper...`);

        // Trigger the release on destination chain
        const deployHash = await releaseOnCasper(
          targetAddress.trim(),
          amount,
          nonce,
          casperTokenAddress,
          false // should_swap: set to true if you want to route through AMM
        );

        console.log(`✅ Successfully dispatched to Casper!`);
        console.log(`📋 Deploy Hash: ${deployHash}`);
      } catch (err) {
        console.error("\n❌ Error processing bridge request:", err);
        console.error("   This transaction will need manual intervention.\n");
      }
    }
  );

  // Handle connection errors
  provider.on("error", (error) => {
    console.error("\n⚠️  Provider error:", error);
  });

  // Log when we're back online after a disconnect
  provider.on("network", (newNetwork, oldNetwork) => {
    if (oldNetwork) {
      console.log("\n🔄 Network changed or reconnected");
    }
  });
}
