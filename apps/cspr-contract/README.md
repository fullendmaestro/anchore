# Anchore Casper Contracts

Decentralized liquidity protocol smart contracts for the Casper Network, written in Rust using the [Odra framework](https://odra.dev).

## Overview

Anchore provides two modular, independently deployable smart contracts:

### 1. **AnchoreAMM** - Automated Market Maker

A constant-product AMM (x\*y=k) that enables:

- **Liquidity Provision**: Users deposit token pairs to earn fees
- **Token Swaps**: Instant token exchanges with 0.3% fee
- **LP Token Management**: Minted shares representing pool ownership

### 2. **AnchoreBridge** - Cross-Chain Bridge

An operator-secured bridge that enables:

- **Asset Bridging**: Unlock tokens bridged from EVM chains
- **Cross-Chain Swaps**: Optionally route bridged assets through the AMM
- **Operator Management**: Admin-controlled decentralized relay network

## Architecture

```
┌─────────────────┐         ┌──────────────────┐
│  AnchoreBridge  │────────▶│   AnchoreAMM     │
│  (Optional)     │ Swap    │   (Standalone)   │
└─────────────────┘         └──────────────────┘
         │                           │
         │                           │
    Bridge Release              Token Swaps
         │                           │
         ▼                           ▼
    [User Wallet]              [Liquidity Pools]
```

The contracts are designed to work independently or together:

- **AMM Only**: Users can swap and provide liquidity without bridging
- **Bridge + AMM**: Bridged assets can be automatically swapped upon arrival

## Build the Contracts

### Prerequisites

- Rust toolchain (nightly)
- Odra CLI: `cargo install cargo-odra`

### Compile to WASM

```bash
cargo odra build
```

This generates WASM binaries in `wasm/`:

- `AnchoreAMM.wasm` - The AMM contract
- `AnchoreBridge.wasm` - The bridge contract

## Test the Contracts

```bash
cargo odra test
```

## Generate Contract Schema

```bash
cargo odra schema
```

## Contract Interfaces

### AnchoreAMM

#### Constructor

```rust
init(token_a: Address, token_b: Address)
```

#### Public Methods

```rust
// Add liquidity to the pool
add_liquidity(amount_a: U256, amount_b: U256)

// Swap exact input for output
swap_exact_tokens(amount_in: U256, token_in: Address, to: Address)
```

#### Events

- `LiquidityAdded(provider, amount_a, amount_b, liquidity)`
- `Swap(sender, amount_in, amount_out, to)`

---

### AnchoreBridge

#### Constructor

```rust
init(amm_address: Address)
```

#### Public Methods

```rust
// Admin: Set operator status
set_operator(operator: Address, is_active: bool)

// Operator: Release bridged funds
receive_from_bridge(
    recipient: Address,
    amount: U256,
    token_address: Address,
    nonce: U256,
    should_swap: bool
)
```

#### Events

- `BridgeRelease(recipient, amount, nonce, token)`
- `OperatorUpdated(operator, is_active)`

## Deployment

### Deployment Workflow

Follow these steps in order for a complete deployment:

#### 1. Build Contracts

```bash
cargo odra build
```

#### 2. Deploy Mock Tokens (for testing)

```bash
# Deploy Token A
make deploy-token-a

# Deploy Token B
make deploy-token-b
```

**After deployment:** Get the contract hashes from the deploy output and add them to `.env`:

```bash
TOKEN_A_HASH=hash-<token-a-hash-from-deploy>
TOKEN_B_HASH=hash-<token-b-hash-from-deploy>
```

#### 3. Deploy AMM

```bash
make deploy-amm
```

**After deployment:** Add the AMM contract hash to `.env`:

```bash
AMM_CONTRACT_HASH=hash-<amm-hash-from-deploy>
```

#### 4. Deploy Bridge

```bash
make deploy-bridge
```

**After deployment:** Add the Bridge contract hash to `.env`:

```bash
BRIDGE_CONTRACT_HASH=hash-<bridge-hash-from-deploy>
```

#### 5. Set Bridge Operators (Optional)

```bash
# Grant operator permissions using casper-client
casper-client put-deploy \
  --node-address https://node.testnet.casper.network \
  --chain-name casper-test \
  --secret-key ./keys/secret_key.pem \
  --payment-amount 5000000000 \
  --session-hash <bridge-contract-hash> \
  --session-entry-point set_operator \
  --session-arg "operator:key='<operator-account-hash>'" \
  --session-arg "is_active:bool='true'"
```

### Using Production Tokens

To deploy with existing CEP-18 tokens instead of mock tokens:

1. Skip steps 2 (mock token deployment)
2. Set `TOKEN_A_HASH` and `TOKEN_B_HASH` in `.env` to your existing token hashes
3. Proceed with AMM and Bridge deployment (steps 3-5)

### Makefile Commands Reference

```bash
make deploy-token-a    # Deploy Mock Token A (1M initial supply)
make deploy-token-b    # Deploy Mock Token B (1M initial supply)
make deploy-amm        # Deploy AnchoreAMM (requires TOKEN_A_HASH, TOKEN_B_HASH in .env)
make deploy-bridge     # Deploy AnchoreBridge (requires AMM_CONTRACT_HASH in .env)
```

## Security Features

- **Nonce Protection**: Prevents replay attacks on bridge releases
- **Operator Authorization**: Only approved operators can release funds
- **Admin Controls**: Single admin manages operator permissions
- **Constant Product**: AMM uses battle-tested x\*y=k formula
- **Fee Protection**: 0.3% swap fee prevents pool drainage

## Integration with EVM

The bridge is designed to work with Anchore's EVM contracts:

1. User locks tokens in EVM `AnchoreVault`
2. Operator detects lock event
3. Operator calls `receive_from_bridge` on Casper
4. If `should_swap=true`, tokens are routed through AMM
5. User receives final tokens in their Casper wallet

## Development

### Project Structure

```
src/
├── lib.rs          # Contract exports
├── amm.rs          # AMM implementation
├── bridge.rs       # Bridge implementation
├── events.rs       # Event definitions
└── crypto.rs       # Signature verification (future)
```

### Testing

Tests are located in the same files as the contracts using `#[cfg(test)]` modules.

## License

MIT

## Resources

- [Odra Documentation](https://docs.odra.dev)
- [Casper Network](https://casper.network)
- [Anchore Protocol](../../README.md)
