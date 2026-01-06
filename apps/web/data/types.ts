export type TokenBase = {
  chainId: string;
  address: string;
  symbol: string;
  displaySymbol?: string;
  name: string;
  decimals: number;
  priceUSD: string;
  coinKey: string;
  logoURI: string;
};

export interface Chain {
  chainId: string;
  name: string;
  icon: string;
  rpcUrl?: string;
}
