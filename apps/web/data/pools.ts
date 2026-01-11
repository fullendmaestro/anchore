import { CASPER_CONTRACTS } from "./index";

export interface LiquidityPool {
  address: string;
  token0Address: string;
  token1Address: string;
  token0Symbol: string;
  token1Symbol: string;
  token0Logo: string;
  token1Logo: string;
  // Static/mock data for UI
  reserve0: string;
  reserve1: string;
  totalValueLocked: string;
  apr: string;
  volume24h: string;
  fees24h: string;
}

// Mock pool data based on deployed contracts
export const LIQUIDITY_POOLS: LiquidityPool[] = [
  {
    address: CASPER_CONTRACTS.POOL_USDC_USDT,
    token0Address: CASPER_CONTRACTS.USDC,
    token1Address: CASPER_CONTRACTS.USDT,
    token0Symbol: "USDC",
    token1Symbol: "USDT",
    token0Logo: "/icons/tokens/usdc.svg",
    token1Logo: "/icons/tokens/usdt.svg",
    reserve0: "1,250,000",
    reserve1: "1,248,500",
    totalValueLocked: "$2,498,500",
    apr: "12.5%",
    volume24h: "$450,320",
    fees24h: "$1,350",
  },
  {
    address: CASPER_CONTRACTS.POOL_WBTC_USDC,
    token0Address: CASPER_CONTRACTS.WBTC,
    token1Address: CASPER_CONTRACTS.USDC,
    token0Symbol: "WBTC",
    token1Symbol: "USDC",
    token0Logo: "/icons/tokens/wbtc.svg",
    token1Logo: "/icons/tokens/usdc.svg",
    reserve0: "28.5",
    reserve1: "1,282,500",
    totalValueLocked: "$2,565,000",
    apr: "18.3%",
    volume24h: "$780,240",
    fees24h: "$2,340",
  },
  {
    address: CASPER_CONTRACTS.POOL_DAI_USDC,
    token0Address: CASPER_CONTRACTS.DAI,
    token1Address: CASPER_CONTRACTS.USDC,
    token0Symbol: "DAI",
    token1Symbol: "USDC",
    token0Logo: "/icons/tokens/dai.svg",
    token1Logo: "/icons/tokens/usdc.svg",
    reserve0: "980,000",
    reserve1: "978,500",
    totalValueLocked: "$1,958,500",
    apr: "9.8%",
    volume24h: "$320,150",
    fees24h: "$960",
  },
  {
    address: CASPER_CONTRACTS.POOL_WETH_USDC,
    token0Address: CASPER_CONTRACTS.WETH,
    token1Address: CASPER_CONTRACTS.USDC,
    token0Symbol: "WETH",
    token1Symbol: "USDC",
    token0Logo: "/icons/tokens/weth.svg",
    token1Logo: "/icons/tokens/usdc.svg",
    reserve0: "642.8",
    reserve1: "1,542,720",
    totalValueLocked: "$3,085,440",
    apr: "15.7%",
    volume24h: "$890,450",
    fees24h: "$2,671",
  },
  {
    address: CASPER_CONTRACTS.POOL_WBTC_DAI,
    token0Address: CASPER_CONTRACTS.WBTC,
    token1Address: CASPER_CONTRACTS.DAI,
    token0Symbol: "WBTC",
    token1Symbol: "DAI",
    token0Logo: "/icons/tokens/wbtc.svg",
    token1Logo: "/icons/tokens/dai.svg",
    reserve0: "15.2",
    reserve1: "684,000",
    totalValueLocked: "$1,368,000",
    apr: "14.2%",
    volume24h: "$420,680",
    fees24h: "$1,262",
  },
  {
    address: CASPER_CONTRACTS.POOL_WETH_DAI,
    token0Address: CASPER_CONTRACTS.WETH,
    token1Address: CASPER_CONTRACTS.DAI,
    token0Symbol: "WETH",
    token1Symbol: "DAI",
    token0Logo: "/icons/tokens/weth.svg",
    token1Logo: "/icons/tokens/dai.svg",
    reserve0: "385.5",
    reserve1: "925,200",
    totalValueLocked: "$1,850,400",
    apr: "11.9%",
    volume24h: "$510,320",
    fees24h: "$1,530",
  },
];

export const getPoolByAddress = (address: string): LiquidityPool | undefined =>
  LIQUIDITY_POOLS.find(
    (pool) => pool.address.toLowerCase() === address.toLowerCase()
  );

export const getPoolByTokens = (
  token0: string,
  token1: string
): LiquidityPool | undefined =>
  LIQUIDITY_POOLS.find(
    (pool) =>
      (pool.token0Address.toLowerCase() === token0.toLowerCase() &&
        pool.token1Address.toLowerCase() === token1.toLowerCase()) ||
      (pool.token0Address.toLowerCase() === token1.toLowerCase() &&
        pool.token1Address.toLowerCase() === token0.toLowerCase())
  );
