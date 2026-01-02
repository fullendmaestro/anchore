"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits } from "viem";

// Contract addresses - update with actual deployed addresses
const VAULT_ADDRESS =
  (process.env.NEXT_PUBLIC_EVM_VAULT_ADDRESS as `0x${string}`) ||
  "0x0000000000000000000000000000000000000000";

// Minimal ABI for AnchoreVault
const VAULT_ABI = [
  {
    name: "deposit",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "shares", type: "uint256" }],
  },
  {
    name: "withdraw",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "token", type: "address" },
      { name: "shares", type: "uint256" },
    ],
    outputs: [{ name: "amount", type: "uint256" }],
  },
  {
    name: "bridgeOut",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "casperRecipient", type: "string" },
      { name: "shouldSwap", type: "bool" },
    ],
    outputs: [],
  },
] as const;

export function useEVMContracts() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  /**
   * Deposit tokens into the vault
   */
  const deposit = async (tokenAddress: `0x${string}`, amount: string) => {
    return writeContract({
      address: VAULT_ADDRESS,
      abi: VAULT_ABI,
      functionName: "deposit",
      args: [tokenAddress, parseUnits(amount, 18)],
    });
  };

  /**
   * Withdraw tokens from the vault
   */
  const withdraw = async (tokenAddress: `0x${string}`, shares: string) => {
    return writeContract({
      address: VAULT_ADDRESS,
      abi: VAULT_ABI,
      functionName: "withdraw",
      args: [tokenAddress, parseUnits(shares, 18)],
    });
  };

  /**
   * Bridge tokens from EVM to Casper
   */
  const bridgeToCasper = async (
    tokenAddress: `0x${string}`,
    amount: string,
    casperRecipient: string,
    shouldSwap: boolean = false
  ) => {
    return writeContract({
      address: VAULT_ADDRESS,
      abi: VAULT_ABI,
      functionName: "bridgeOut",
      args: [tokenAddress, parseUnits(amount, 18), casperRecipient, shouldSwap],
    });
  };

  return {
    deposit,
    withdraw,
    bridgeToCasper,
    isPending: isPending || isConfirming,
    isSuccess,
    transactionHash: hash,
  };
}
