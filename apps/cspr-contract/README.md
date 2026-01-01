# Anchore Casper Contracts

Decentralized liquidity protocol smart contracts for the Casper Network, written in Rust using the [Odra framework](https://odra.dev).

## Overview

Anchore provides two modular, independently deployable smart contracts:

### 1. **AnchoreAMM** - Automated Market Maker
A constant-product AMM (x*y=k) that enables:
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

### 1. Deploy the AMM
```bash
# Set your token addresses
TOKEN_A="hash-abc123..."
TOKEN_B="hash-def456..."

cargo odra deploy AnchoreAMM --args "$TOKEN_A $TOKEN_B"
```

### 2. Deploy the Bridge
```bash
# Use the deployed AMM address
AMM_ADDRESS="hash-xyz789..."

cargo odra deploy AnchoreBridge --args "$AMM_ADDRESS"
```

### 3. Set Bridge Operators
```bash
# Grant operator permissions
cargo odra call set_operator --address <bridge-hash> --args "hash-operator123 true"
```

## Security Features

- **Nonce Protection**: Prevents replay attacks on bridge releases
- **Operator Authorization**: Only approved operators can release funds
- **Admin Controls**: Single admin manages operator permissions
- **Constant Product**: AMM uses battle-tested x*y=k formula
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
