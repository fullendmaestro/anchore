# Anchore Web App

Next.js-based frontend for the Anchore cross-chain liquidity protocol with integrated deployment tools.

## Features

- 🌉 Cross-chain bridge interface (EVM ↔ Casper)
- 💱 AMM swap interface
- 💰 Liquidity provision & yield tracking
- 🔐 Multi-chain wallet support (MetaMask + CSPRClick)
- 🚀 Integrated Casper testnet deployment scripts

## Prerequisites

- Node.js 18+
- pnpm
- CSPR.cloud access token ([Get one here](https://cspr.cloud))
- Casper wallet keys for deployments

## Quick Start

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build
```

## Deploying Casper Contracts

The web app includes TypeScript deployment scripts that use CSPR.cloud authenticated endpoints.

### Setup

1. Get your CSPR.cloud access token from [cspr.cloud](https://cspr.cloud)
2. Create `.env` file:

```bash
cp .env.example .env
# Edit .env and add your CSPR_CLOUD_ACCESS_TOKEN
```

3. Ensure you have compiled WASM contracts:

```bash
cd ../cspr-contract
cargo odra build
```

4. Make sure your Casper keys exist at `../cspr-contract/keys/secret_key.pem`

### Deploy AMM Contract

```bash
pnpm deploy:amm -- --token-a hash-abc123... --token-b hash-def456...
```

**Parameters:**

- `--token-a`: CEP-18 token A contract hash
- `--token-b`: CEP-18 token B contract hash

### Deploy Bridge Contract

```bash
pnpm deploy:bridge -- --amm hash-xyz789...
```

**Parameters:**

- `--amm`: Previously deployed AMM contract hash

### Example Full Deployment

```bash
# 1. Deploy AMM
pnpm deploy:amm -- \
  --token-a hash-0a1b2c3d... \
  --token-b hash-4e5f6g7h...

# Note the AMM deploy hash from output

# 2. Deploy Bridge (using AMM hash)
pnpm deploy:bridge -- --amm hash-9i0j1k2l...
```

### Environment Variables

| Variable                  | Description                    | Default                                   |
| ------------------------- | ------------------------------ | ----------------------------------------- |
| `CSPR_CLOUD_ACCESS_TOKEN` | Your CSPR.cloud API token      | Required                                  |
| `SECRET_KEY_PATH`         | Path to Casper private key PEM | `../../cspr-contract/keys/secret_key.pem` |

### Troubleshooting

**401 Unauthorized Error**

- Verify your `CSPR_CLOUD_ACCESS_TOKEN` is correct
- Check token hasn't expired at [cspr.cloud](https://cspr.cloud)

**Deployment Timeout**

- Testnet may be congested
- Check deploy status manually using the deploy hash at [testnet.cspr.live](https://testnet.cspr.live)

**WASM File Not Found**

- Run `cargo odra build` in `apps/cspr-contract/`
- Check that `wasm/AnchoreAMM.wasm` and `wasm/AnchoreBridge.wasm` exist

## Architecture

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS + shadcn/ui
- **EVM Integration**: Wagmi v3 + Viem
- **Casper Integration**: CSPRClick + casper-js-sdk
- **Type Safety**: TypeScript with strict mode

## Project Structure

```
apps/web/
├── app/                    # Next.js app router pages
│   ├── (app)/             # Main app layout
│   │   ├── bridge/        # Bridge interface
│   │   ├── earn/          # Liquidity provision
│   │   └── history/       # Transaction history
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   ├── header.tsx        # App header
│   └── wallet-selector.tsx
├── hooks/                # Custom React hooks
├── lib/                  # Utilities & helpers
├── scripts/              # Deployment scripts
│   └── deploy-testnet.ts # CSPR.cloud deployment
└── public/              # Static assets
```

## Development

```bash
# Run type checking
pnpm typecheck

# Lint code
pnpm lint

# Fix linting issues
pnpm lint:fix
```

## Deployment Scripts Technical Details

The deployment scripts use the modern casper-js-sdk v5 with CSPR.cloud authentication:

```typescript
import { HttpHandler, RpcClient } from "casper-js-sdk";

// Create authenticated client
const rpcHandler = new HttpHandler("https://node.testnet.cspr.cloud/rpc");
rpcHandler.setCustomHeaders({
  Authorization: "your-access-token",
});
const rpcClient = new RpcClient(rpcHandler);
```

This approach:

- ✅ Uses proper SDK authentication (no custom fetch overrides)
- ✅ Works with CSPR.cloud rate limits and quotas
- ✅ Supports both testnet and mainnet endpoints
- ✅ Compatible with casper-js-sdk v5+

## License

See root [LICENSE](../../LICENSE)

## Learn More

- [Anchore Documentation](../../README.md)
- [Casper JS SDK](https://github.com/casper-ecosystem/casper-js-sdk)
- [CSPR.cloud Docs](https://docs.cspr.cloud)
- [Next.js Documentation](https://nextjs.org/docs)
