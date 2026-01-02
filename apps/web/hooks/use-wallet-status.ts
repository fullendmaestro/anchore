"use client";

import { useAccount } from "wagmi";
import { useCasperWallet } from "@/lib/casper-wallet-provider";

/**
 * Hook to check wallet connection status for both chains
 */
export function useWalletStatus() {
  const {
    isConnected: evmConnected,
    address: evmAddress,
    chain,
  } = useAccount();

  const {
    isConnected: casperConnected,
    publicKey: casperPublicKey,
    accountHash: casperAccountHash,
  } = useCasperWallet();

  const bothConnected = evmConnected && casperConnected;
  const anyConnected = evmConnected || casperConnected;
  const noneConnected = !evmConnected && !casperConnected;

  return {
    // EVM wallet state
    evm: {
      connected: evmConnected,
      address: evmAddress,
      chainId: chain?.id,
      chainName: chain?.name,
    },
    // Casper wallet state
    casper: {
      connected: casperConnected,
      publicKey: casperPublicKey,
      accountHash: casperAccountHash,
    },
    // Convenience flags
    bothConnected,
    anyConnected,
    noneConnected,
  };
}
