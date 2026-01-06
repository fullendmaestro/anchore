import { Chain, TokenBase } from "./types";

// Chain IDs
export const CASPER_CHAIN_ID = "casper";
export const SEPOLIA_CHAIN_ID = "11155111";

export const CHAINS: Chain[] = [
  {
    chainId: SEPOLIA_CHAIN_ID,
    name: "Ethereum Sepolia",
    icon: "/icons/networks/ethereum.svg",
  },
  {
    chainId: CASPER_CHAIN_ID,
    name: "Casper Testnet",
    icon: "/icons/networks/casper.png",
  },
];

// All tokens across both chains
export const TOKENS: TokenBase[] = [
  // Casper Testnet Tokens (deployment hashes)
  {
    address: "ce4cd13f6a7c5b476e8b274185c7220d008bfde349ad7bde7d501e65d82378fe",
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    logoURI: "/icons/tokens/usdc.svg",
    chainId: CASPER_CHAIN_ID,
    priceUSD: "1.00",
    coinKey: "usd-coin",
  },
  {
    address: "e49d542ac3a14e2646f68abf3f5ea4f52b0ba55a67b2346f99e80a6abbad8a42",
    symbol: "USDT",
    name: "Tether USD",
    decimals: 6,
    logoURI: "/icons/tokens/usdt.svg",
    chainId: CASPER_CHAIN_ID,
    priceUSD: "1.00",
    coinKey: "tether",
  },
  {
    address: "116b474729c4465dad00d160c5aa7300e9aa9af9cbc10c64cbecf1962e5a9d93",
    symbol: "WBTC",
    name: "Wrapped Bitcoin",
    decimals: 8,
    logoURI: "/icons/tokens/wbtc.svg",
    chainId: CASPER_CHAIN_ID,
    priceUSD: "45000",
    coinKey: "wrapped-bitcoin",
  },
  {
    address: "1fb34dfa7457cf52966bbeb55851e13a279f385fed8dfaf64a5f952c5371a258",
    symbol: "DAI",
    name: "Dai Stablecoin",
    decimals: 18,
    logoURI: "/icons/tokens/dai.svg",
    chainId: CASPER_CHAIN_ID,
    priceUSD: "1.00",
    coinKey: "dai",
  },
  {
    address: "034b78040da89a7087fd353f409e6244fe4d18915efd1cefce86cc3c986b9125",
    symbol: "WETH",
    name: "Wrapped Ether",
    decimals: 18,
    logoURI: "/icons/tokens/weth.svg",
    chainId: CASPER_CHAIN_ID,
    priceUSD: "2400",
    coinKey: "weth",
  },
  // Ethereum Sepolia Tokens
  {
    address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    logoURI: "/icons/tokens/usdc.svg",
    chainId: SEPOLIA_CHAIN_ID,
    priceUSD: "1.00",
    coinKey: "usd-coin",
  },
];

// Contract deployment hashes
export const CASPER_CONTRACTS = {
  FACTORY: "8ce883a23b3c0d96a35d468c78b34596ec778cfd77060f8798c1b98c04069029",
  ROUTER: "", // To be deployed
  // Token deployment hashes
  USDC: "525cb6adf4887f78aafbfdd2a2569d8ae609d0572f155d3d79b2e0341431ffef",
  USDT: "15b0e467a816ede3cc7880f0180670c7802ea7dbb03996715869779c68a788fb",
  WBTC: "9a8dd054d5bf1602e3b37754a2eb2e29f74320e200d242a33ece719c451d1645",
  DAI: "fb87a15c16c69e2889e1dd5708d54271064ee0f4ecf152f5fb8c03fc00eae360",
  WETH: "66556a2c6afdc37246d52783f1b8cedc66944c7b3c702be4bed7cb2393ffd7d1",
} as const;

// Helper functions
export const getChainById = (chainId: string): Chain | undefined =>
  CHAINS.find((chain) => chain.chainId === chainId);

export const getTokensByChain = (chainId: string): TokenBase[] =>
  TOKENS.filter((token) => token.chainId === chainId);

export const getTokenByAddress = (
  address: string,
  chainId: string
): TokenBase | undefined =>
  TOKENS.find(
    (token) =>
      token.address.toLowerCase() === address.toLowerCase() &&
      token.chainId === chainId
  );

export const getTokenBySymbol = (
  symbol: string,
  chainId: string
): TokenBase | undefined =>
  TOKENS.find((token) => token.symbol === symbol && token.chainId === chainId);

// Determine routing: AMM if same chain (both Casper), Bridge if different chains
export const shouldUseBridge = (
  fromChainId: string,
  toChainId: string
): boolean => fromChainId !== toChainId;

export const shouldUseAMM = (fromChainId: string, toChainId: string): boolean =>
  fromChainId === toChainId && fromChainId === CASPER_CHAIN_ID;
