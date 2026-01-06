import { Args, CLValue } from "casper-js-sdk";
import { TokenBase } from "@/data/types";

export type PreparedSwapTransaction = {
  poolAddress: string;
  chainId: string;
  tokenIn: { address: string; decimals: number };
  tokenOut: { address: string; decimals: number };
  amountIn: string; // base units
  minAmountOut: string; // base units after slippage
  slippageBps: number;
};

type PrepareSwapTransactionParams = {
  poolAddress: string;
  sellToken: TokenBase;
  buyToken: TokenBase;
  amountIn: string; // human-readable
  expectedAmountOut?: string; // human-readable
  slippageBps?: number; // basis points
};

const toBaseUnits = (amount: string, decimals: number): string => {
  const [whole = "0", fraction = ""] = amount.split(".");
  const normalizedFraction = (fraction + "0".repeat(decimals)).slice(
    0,
    decimals
  );
  const combined = `${whole}${normalizedFraction}`.replace(/^0+(?=\d)/, "");
  return combined || "0";
};

const applySlippage = (amount: string | undefined, slippageBps: number) => {
  const numericAmount = Number(amount ?? "0");
  if (Number.isNaN(numericAmount) || numericAmount <= 0) return "0";
  const adjusted = numericAmount * (1 - slippageBps / 10_000);
  return adjusted.toString();
};

const stripHashPrefix = (hash: string) =>
  hash.startsWith("hash-") ? hash.slice(5) : hash;

const hexToBytes = (hex: string): Uint8Array => {
  const normalized = stripHashPrefix(hex).trim();
  if (!/^[0-9a-fA-F]+$/.test(normalized)) {
    throw new Error("Invalid Casper hash format");
  }
  if (normalized.length % 2 !== 0) {
    throw new Error("Casper hash must have an even length");
  }

  const pairs = normalized.match(/.{1,2}/g) ?? [];
  const bytes = pairs.map((pair) => Number.parseInt(pair, 16));
  return Uint8Array.from(bytes);
};

export const prepareSwapTransaction = (
  params: PrepareSwapTransactionParams
): PreparedSwapTransaction => {
  const slippageBps = params.slippageBps ?? 100; // default 1%
  const minAmountOutHuman = applySlippage(
    params.expectedAmountOut,
    slippageBps
  );

  return {
    poolAddress: params.poolAddress,
    chainId: params.sellToken.chainId,
    tokenIn: {
      address: params.sellToken.address,
      decimals: params.sellToken.decimals,
    },
    tokenOut: {
      address: params.buyToken.address,
      decimals: params.buyToken.decimals,
    },
    amountIn: toBaseUnits(params.amountIn, params.sellToken.decimals),
    minAmountOut: toBaseUnits(minAmountOutHuman, params.buyToken.decimals),
    slippageBps,
  };
};

export const buildSwapRuntimeArgs = (
  prepared: PreparedSwapTransaction
): Args => {
  const argsMap: Record<string, CLValue> = {
    token_in: CLValue.newCLByteArray(hexToBytes(prepared.tokenIn.address)),
    token_out: CLValue.newCLByteArray(hexToBytes(prepared.tokenOut.address)),
    amount_in: CLValue.newCLUInt256(BigInt(prepared.amountIn)),
    min_amount_out: CLValue.newCLUInt256(BigInt(prepared.minAmountOut)),
  };

  return Args.fromMap(argsMap);
};

export const ensureHashPrefix = (hash: string): string =>
  hash.startsWith("hash-") ? hash : `hash-${hash}`;
