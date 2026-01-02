// Common types for wallet and contract interactions

export interface BridgeTransaction {
  hash: string;
  from: string;
  to: string;
  amount: string;
  token: string;
  timestamp: number;
  status: "pending" | "confirmed" | "failed";
  sourceChain: "ethereum" | "casper";
  destinationChain: "ethereum" | "casper";
}

export interface LiquidityPosition {
  tokenA: string;
  tokenB: string;
  shares: string;
  reserveA: string;
  reserveB: string;
}

export interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
}

export interface WalletState {
  evm: {
    connected: boolean;
    address?: string;
    chainId?: number;
  };
  casper: {
    connected: boolean;
    publicKey?: string;
    accountHash?: string;
  };
}
