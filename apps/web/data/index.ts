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
  // Casper Testnet Tokens (deployment hashes - CEP-18 compliant)
  {
    address: "252b389809b60443e752964db503c3c2e9637fe35d0e7241209c140244ef953f",
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    logoURI: "/icons/tokens/usdc.svg",
    chainId: CASPER_CHAIN_ID,
    priceUSD: "1.00",
    coinKey: "usd-coin",
  },
  {
    address: "2c527d04604b9c18109ce2d7637ee264476d99ff22392cf3cf018909e90bad7b",
    symbol: "USDT",
    name: "Tether USD",
    decimals: 6,
    logoURI: "/icons/tokens/usdt.svg",
    chainId: CASPER_CHAIN_ID,
    priceUSD: "1.00",
    coinKey: "tether",
  },
  {
    address: "f5b61fcedd8d66a7e374d624ed5a10bc648977dd7fe3c01e4c378f5d88088b8e",
    symbol: "WBTC",
    name: "Wrapped Bitcoin",
    decimals: 8,
    logoURI: "/icons/tokens/wbtc.svg",
    chainId: CASPER_CHAIN_ID,
    priceUSD: "45000",
    coinKey: "wrapped-bitcoin",
  },
  {
    address: "619eda605ee74b8281c31198575d370ad96c821fcc9519d17d3caa60f409ea36",
    symbol: "DAI",
    name: "Dai Stablecoin",
    decimals: 18,
    logoURI: "/icons/tokens/dai.svg",
    chainId: CASPER_CHAIN_ID,
    priceUSD: "1.00",
    coinKey: "dai",
  },
  {
    address: "480b1223fe4773767c9d781644d218b8f86d2c6ba8f106fc958915fa30d5b580",
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

// Contract deployment hashes (Updated with latest CEP-18 compliant tokens)
export const CASPER_CONTRACTS = {
  // Token deployment hashes - CEP-18 Standard
  USDC: "252b389809b60443e752964db503c3c2e9637fe35d0e7241209c140244ef953f",
  USDT: "2c527d04604b9c18109ce2d7637ee264476d99ff22392cf3cf018909e90bad7b",
  WBTC: "f5b61fcedd8d66a7e374d624ed5a10bc648977dd7fe3c01e4c378f5d88088b8e",
  DAI: "619eda605ee74b8281c31198575d370ad96c821fcc9519d17d3caa60f409ea36",
  WETH: "480b1223fe4773767c9d781644d218b8f86d2c6ba8f106fc958915fa30d5b580",
  // Liquidity Pool deployment hashes - Uniswap V2 Style
  POOL_USDC_USDT:
    "d23c99bc29ed124dd6aa9057f8c24f0e94cad3ca9009be3f15b23a591833de0d",
  POOL_WBTC_USDC:
    "258a5b70b858f9a836d3216f74e5b560d3b642a816f119f415c230638ded8c14",
  POOL_DAI_USDC:
    "066212bb048020ce9c22957712dbe750c693bdeec8131ce33ba00e4b155041fc",
  POOL_WETH_USDC:
    "3263687842c9c2cfba7439e21d73157e34d14bd0026ca33909f2791d58e534ed",
  POOL_WBTC_DAI:
    "9e8bf586e08cb27326a9d1b7ea81cce02007305434f8075625995827b3736a3f",
  POOL_WETH_DAI:
    "c13d5bdece209b039f9574a6da072c7129abe70ca90a4e73a13415c588e7ad47",
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
