import { startListener } from "./services/evmListener";

async function main() {
  console.log("🚀 Starting Anchore Bridge Operator...");
  
  // Start the listener
  await startListener();

  // Keep process alive
  process.on("SIGINT", () => {
    console.log("Stopping operator...");
    process.exit();
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});