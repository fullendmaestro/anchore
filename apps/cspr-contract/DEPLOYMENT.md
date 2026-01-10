# Anchore Token & AMM Deployment Guide

This guide explains how to deploy the Anchore tokens and AMM pools to the Casper network.

## Quick Start

### 1. Build Contracts

```bash
make build
# or
cargo odra build
```

### 2. Deploy Everything

```bash
make deploy-all
# or
cargo run --bin anchore_deploy -- deploy
```

## What Gets Deployed

### Tokens (5 total)

1. **USDC** - USD Coin (6 decimals, 1M supply)
2. **USDT** - Tether USD (6 decimals, 1M supply)
3. **WBTC** - Wrapped Bitcoin (8 decimals, 100 supply)
4. **DAI** - Dai Stablecoin (18 decimals, 1M supply)
5. **WETH** - Wrapped Ether (18 decimals, 1K supply)

### AMM Pools (4 total)

1. **USDC-USDT Pool** - Stablecoin pair
2. **WBTC-USDC Pool** - BTC trading pair
3. **DAI-USDC Pool** - Stablecoin pair
4. **WETH-USDC Pool** - ETH trading pair

## Post-Deployment Steps

After deployment completes, you'll see output like:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 DEPLOYMENT SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🪙 TOKENS:
  USDC:  hash-...
  USDT:  hash-...
  WBTC:  hash-...
  DAI:   hash-...
  WETH:  hash-...

🏊 AMM POOLS:
  USDC-USDT: hash-...
  WBTC-USDC: hash-...
  DAI-USDC:  hash-...
  WETH-USDC: hash-...
```

### 1. Update Web App Token Addresses

Edit `apps/web/data/index.ts` and replace the token addresses:

```typescript
export const TOKENS: TokenBase[] = [
  {
    address: "YOUR_USDC_HASH", // Replace with deployed USDC hash
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    chainId: CASPER_CHAIN_ID,
    // ... rest of config
  },
  // ... update other tokens
];
```

### 2. Update Swap Routes

Edit `apps/web/data/swap-and-bridge-routes.ts` with pool addresses:

```typescript
export const CASPER_SWAP_ROUTES = [
  {
    token0Address: "YOUR_USDC_HASH",
    token1Address: "YOUR_USDT_HASH",
    poolAddress: "YOUR_USDC_USDT_POOL_HASH",
  },
  // ... add other pools
];
```

### 3. Add Initial Liquidity

Before users can swap, you need to add liquidity to the pools:

```bash
# Example: Add liquidity to USDC-USDT pool
cargo run --bin cspr_contract_cli -- call \
  --contract POOL_HASH \
  --entry-point add_liquidity \
  --args amount_a:u256=1000000000 amount_b:u256=1000000000
```

Or use the web interface once addresses are updated.

## Network-Specific Deployment

### Testnet

```bash
make deploy-testnet
```

Configure `.env`:

```bash
NODE_ADDRESS=https://rpc.testnet.casperlabs.io
CHAIN_NAME=casper-test
SECRET_KEY=path/to/your/secret_key.pem
```

### Mainnet

```bash
make deploy-mainnet
```

Configure `.env`:

```bash
NODE_ADDRESS=https://rpc.mainnet.casperlabs.io
CHAIN_NAME=casper
SECRET_KEY=path/to/your/secret_key.pem
```

## Troubleshooting

### "Invalid payment amount"

Increase gas in the deployment script (default: 400 CSPR):

```rust
env.set_gas(500_000_000_000u64); // 500 CSPR
```

### "Contract already exists"

The Odra CLI will load existing contracts from `.odra/state` if they're already deployed. To force redeployment:

```bash
rm -rf .odra/state
make deploy-all
```

### Token addresses don't match

Casper contract hashes are deterministic based on:

- Deployment account
- Contract bytecode
- Timestamp

To get consistent addresses, use the same deployment account and don't modify contract code between builds.

## Development Workflow

1. **Build**: `make build` - Compile contracts to WASM
2. **Test**: `cargo test` - Run unit tests
3. **Deploy**: `make deploy-all` - Deploy to configured network
4. **Update Frontend**: Copy addresses from deployment output
5. **Add Liquidity**: Initialize pools with tokens
6. **Test Swaps**: Use web interface to verify functionality

## Gas Costs (Approximate)

- Token Deployment: ~50-100 CSPR each
- AMM Pool Deployment: ~100-150 CSPR each
- Total Estimated: ~800-1200 CSPR for full deployment

Always ensure your deployment account has sufficient CSPR before deploying to mainnet.
