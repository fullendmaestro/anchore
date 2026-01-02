// Casper Token Configuration
export interface CasperToken {
  hash: string;
  symbol: string;
  name: string;
  decimals: number;
  icon?: string;
}

// From contract deployment
const TOKEN_A_HASH = "cd222d2af1b19840a430181dd58a0993a95250394169ec2b32b76aa1057bb034";
const TOKEN_B_HASH = "8fca2f3d9891fa9882e4d0732711b4adc30b165b549004489c1d81370efe9b42";

export const CASPER_TOKENS: CasperToken[] = [
  {
    hash: `hash-${TOKEN_A_HASH}`,
    symbol: "TOKENA",
    name: "Token A",
    decimals: 9,
    icon: "/icons/tokens/token-a.svg",
  },
  {
    hash: `hash-${TOKEN_B_HASH}`,
    symbol: "TOKENB",
    name: "Token B",
    decimals: 9,
    icon: "/icons/tokens/token-b.svg",
  },
];

export const AMM_CONTRACT_HASH = "hash-82fb370bb92ef6da7dc383af5d1788b6a1c60c2af47c0f9fcf5a70477dc5dedd";
export const BRIDGE_CONTRACT_HASH = "hash-52169eef45afecd1b402b937eaf8b02cd6b69c267f858a9515fcfdcc4ab53935";

// Helper functions
export const getCasperTokenByHash = (hash: string): CasperToken | undefined =>
  CASPER_TOKENS.find((token) => token.hash === hash);

export const getCasperTokenBySymbol = (symbol: string): CasperToken | undefined =>
  CASPER_TOKENS.find((token) => token.symbol === symbol);
