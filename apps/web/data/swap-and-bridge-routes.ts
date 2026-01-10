export const CASPER_SWAP_ROUTES = [
  {
    token0Address:
      "7a1e4d2f2941dfe49694c33f9bcbdf1d72a584d0cf8044a99a9b49e883804ea9", // USDC
    token1Address:
      "398e4293208c2a471c09a21f95105f0b642bad1f100639308ed7648ecc1c87a9", // USDT
    poolAddress:
      "8246ff67338d6baffba3225f1c033c43df7af8abb5e47717b0613fcec9cd3503",
  },
  {
    token0Address:
      "b19b5fce8351a54c061c9e139e4a4f38186ff8fec069380248c6a76d165ae7f6", // WBTC
    token1Address:
      "7a1e4d2f2941dfe49694c33f9bcbdf1d72a584d0cf8044a99a9b49e883804ea9", // USDC
    poolAddress:
      "8388d3cac84df78577d638c2eaba54868ded5e544ed8cba19e404e43d25b0593",
  },
  {
    token0Address:
      "c02606904cdcc86d6c41c769cf0de00dae5999dead3dcf5e05f51e3bf434ab31", // DAI
    token1Address:
      "7a1e4d2f2941dfe49694c33f9bcbdf1d72a584d0cf8044a99a9b49e883804ea9", // USDC
    poolAddress:
      "0424aa5f3b1615864341b2b667d63d8e2c491da4a4c1402a8d156dfa73b1f4a4",
  },
  {
    token0Address:
      "969b0bf0a8147a4070dcb7211e8d317ac835ba59104a87d11cef72366149d206", // WETH
    token1Address:
      "7a1e4d2f2941dfe49694c33f9bcbdf1d72a584d0cf8044a99a9b49e883804ea9", // USDC
    poolAddress:
      "5dd790a221f4d7434710fea747c1bae76655e33e302a5624c31e2ff120066d02",
  },
];

export const BRIDGE_ROUTES = [
  {
    souceChainId: "casper-mainnet",
    destinationChainId: "ethereum-mainnet",
    sourceTokenAddress: "",
    destinationTokenAddress: "",
  },
];
