// Casper Network Configuration
export const CASPER_CONFIG = {
  NODE_URL:
    process.env.NEXT_PUBLIC_CASPER_NODE_URL ||
    "https://rpc.testnet.casperlabs.io",
  CHAIN_NAME: process.env.NEXT_PUBLIC_CASPER_CHAIN_NAME || "casper-test",
  BRIDGE_HASH:
    process.env.NEXT_PUBLIC_CASPER_BRIDGE_HASH ||
    "hash-52169eef45afecd1b402b937eaf8b02cd6b69c267f858a9515fcfdcc4ab53935",
  AMM_HASH:
    process.env.NEXT_PUBLIC_CASPER_AMM_HASH ||
    "hash-82fb370bb92ef6da7dc383af5d1788b6a1c60c2af47c0f9fcf5a70477dc5dedd",
};

// Token addresses on Casper network
export const CASPER_TOKENS = {
  TOKEN_A:
    process.env.NEXT_PUBLIC_CASPER_TOKEN_A_HASH ||
    "hash-cd222d2af1b19840a430181dd58a0993a95250394169ec2b32b76aa1057bb034",
  TOKEN_B:
    process.env.NEXT_PUBLIC_CASPER_TOKEN_B_HASH ||
    "hash-8fca2f3d9891fa9882e4d0732711b4adc30b165b549004489c1d81370efe9b42",
};
