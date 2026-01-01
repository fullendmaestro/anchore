# Anchore Operator Node

The bridge operator service that relays cross-chain transactions between EVM chains and Casper Network.

## Overview

The operator node is a TypeScript/Node.js service that:

1. **Listens** to `BridgeRequested` events on the EVM chain (Polygon)
2. **Validates** bridge requests and checks operator authorization
3. **Dispatches** transactions to the Casper Network bridge contract
4. **Signs** transactions with Ed25519 keys for security

## Architecture

```
┌─────────────────────────────────────────────────────┐
│             Anchore Operator Node                   │
│                                                     │
│  ┌──────────────────┐      ┌───────────────────┐  │
│  │  EVM Listener    │      │ Casper Dispatcher │  │
│  │                  │      │                   │  │
│  │  - Poll Events   │─────▶│  - Build Deploy   │  │
│  │  - Decode Logs   │      │  - Sign with Keys │  │
│  │  - Queue Tasks   │      │  - Submit to Node │  │
│  └──────────────────┘      └───────────────────┘  │
│           │                          │             │
└───────────┼──────────────────────────┼─────────────┘
            │                          │
            ▼                          ▼
    ┌───────────────┐          ┌──────────────┐
    │  EVM Chain    │          │ Casper Node  │
    │  (Polygon)    │          │              │
    └───────────────┘          └──────────────┘
```

## Setup

### Prerequisites

- Node.js v18+
- pnpm (or npm/yarn)
- Casper keys (Ed25519 key pair)

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Generate Casper Keys (if needed)

If you don't have Casper keys yet:

```bash
# Install casper-client
# On Ubuntu/Debian:
sudo apt install casper-client

# OR build from source:
cargo install casper-client

# Generate keys
mkdir -p keys
cd keys
casper-client keygen .
cd ..
```

This creates:

- `secret_key.pem` - Your private key (keep secure!)
- `public_key.pem` - Your public key
- `public_key_hex` - Public key in hex format

### 3. Configure Environment

Create `.env` file:

```bash
# EVM Configuration (Polygon Amoy Testnet)
EVM_RPC_URL=https://rpc-amoy.polygon.technology
EVM_VAULT_ADDRESS=0x... # Your deployed AnchoreVault address
EVM_REGISTRY_ADDRESS=0x... # Your deployed OperatorRegistry address

# Casper Configuration
CASPER_NODE_URL=https://rpc.testnet.casperlabs.io
CASPER_CHAIN_NAME=casper-test
CASPER_BRIDGE_HASH=hash-... # Your deployed AnchoreBridge contract
CASPER_AMM_HASH=hash-... # Optional: Your deployed AnchoreAMM contract
CASPER_DEFAULT_TOKEN_HASH=hash-... # Default CEP-18 token on Casper (e.g., wUSDC)

# Operator Keys
CASPER_OPERATOR_PRIVATE_KEY_PATH=./keys/secret_key.pem
```

### 4. Register as Operator

Your operator address must be whitelisted in the `OperatorRegistry` contract:

```bash
# Using cast (from Foundry)
cast send $REGISTRY_ADDRESS \
  "setOperator(address,bool)" \
  $YOUR_OPERATOR_ADDRESS \
  true \
  --rpc-url $EVM_RPC_URL \
  --private-key $ADMIN_PRIVATE_KEY
```

## Running the Node

### Development Mode

```bash
pnpm dev
```

### Production Mode

```bash
pnpm build
pnpm start
```

### With PM2 (for production)

```bash
# Install PM2
pnpm add -g pm2

# Start the operator
pm2 start dist/index.js --name anchore-operator

# Monitor
pm2 logs anchore-operator

# Auto-restart on system reboot
pm2 startup
pm2 save
```

## Usage

### Monitoring Bridge Events

Once running, the operator will output:

```
🚀 Anchore Bridge Operator - EVM Listener
==================================================
📡 Network: https://rpc-amoy.polygon.technology
📦 Vault Contract: 0x...
🔗 Listening for BridgeRequested events...

──────────────────────────────────────────────────
🔔 [NEW BRIDGE REQUEST DETECTED]
──────────────────────────────────────────────────
📤 From (EVM):        0xabc123...
💰 Amount:            100.0 tokens
📥 To (Casper):       01a1b2c3...
#️⃣  Nonce:             42
🔗 Block:             12345678
📜 Tx Hash:           0xdef456...
──────────────────────────────────────────────────
🔄 Processing bridge release on Casper...
✅ Successfully dispatched to Casper!
📋 Deploy Hash: abc123...
```

## Configuration Options

### Token Mapping

To support multiple tokens, edit `evmListener.ts`:

```typescript
const TOKEN_MAPPING: Record<string, string> = {
  "0x...": "hash-...", // USDC on EVM -> wUSDC on Casper
  "0x...": "hash-...", // DAI on EVM -> wDAI on Casper
};
```

### Cross-Chain Swaps

To enable automatic swaps upon bridging (route through AMM):

In `evmListener.ts`, set:

```typescript
const deployHash = await releaseOnCasper(
  targetAddress,
  amount,
  nonce,
  casperTokenAddress,
  true // <- Set to true for swap
);
```

This requires `CASPER_AMM_HASH` to be configured.

## Testing

### Unit Tests

```bash
pnpm test
```

### Integration Test (End-to-End)

1. Deploy contracts on testnet (see EVM contract README)
2. Start the operator node
3. Execute a bridge transaction:

```typescript
// Using ethers.js
const vault = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, signer);
await vault.bridgeOut(
  ethers.parseUnits("100", 6), // 100 tokens (6 decimals)
  "01abc123..." // Your Casper public key
);
```

4. Monitor operator logs for execution

## Security Considerations

- 🔒 **Private Keys**: Never commit `secret_key.pem` to version control
- 🔐 **Access Control**: Only whitelisted operators can release funds
- 🚫 **Nonce Protection**: Each bridge request has a unique nonce
- ✅ **Signature Validation**: All transactions are cryptographically signed

### Best Practices

1. **Use Hardware Security Module (HSM)** for production keys
2. **Rotate keys** periodically
3. **Monitor** all transactions and set up alerts
4. **Run multiple operators** for decentralization
5. **Test thoroughly** on testnet before mainnet

## Troubleshooting

### "Missing required environment variable"

- Ensure all variables in `.env` are set
- Check for typos in variable names

### "Failed to load Casper keys"

- Verify `CASPER_OPERATOR_PRIVATE_KEY_PATH` points to valid `.pem` file
- Ensure file has correct permissions (chmod 600)

### "Deploy failed: Invalid key"

- Check Casper public key format (should start with "01" for Ed25519)
- Remove "0x" prefix if present

### "Transaction reverted: Not Authorized Operator"

- Ensure your operator address is whitelisted in `OperatorRegistry`
- Verify you're using the correct operator keys

## Development

### Project Structure

```
src/
├── index.ts                    # Main entry point
├── config.ts                   # Configuration & env validation
├── abis.ts                     # Contract ABIs
└── services/
    ├── evmListener.ts         # EVM event listener
    └── casperDispatcher.ts    # Casper transaction dispatcher
```

### Adding New Features

To add support for additional chains:

1. Create new listener in `services/`
2. Add chain config to `config.ts`
3. Update dispatcher logic for routing
4. Test thoroughly on testnet

## License

MIT

## Resources

- [Casper SDK Docs](https://docs.casper.network/sdk/)
- [Ethers.js Docs](https://docs.ethers.org/)
- [Anchore Protocol](../../README.md)
