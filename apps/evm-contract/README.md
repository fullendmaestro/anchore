# Anchore EVM Contracts

Solidity smart contracts for the EVM side of the Anchore cross-chain liquidity protocol. Built with [Foundry](https://getfoundry.sh/).

## Overview

The EVM contracts handle the source-chain side of bridging:

### **AnchoreVault**

The main bridge vault that:

- Locks user tokens for bridging to Casper
- Manages liquidity provider deposits
- Releases tokens when bridging back from Casper
- Validates operator signatures for security

### **OperatorRegistry**

Access control contract that:

- Maintains whitelist of authorized bridge operators
- Allows admin to add/remove operators
- Provides operator validation for the vault

## Architecture

```
┌──────────────────────┐
│     User Wallet      │
│                      │
└──────────┬───────────┘
           │
           │ 1. bridgeOut(amount, casperAddress)
           │
           ▼
┌──────────────────────┐         ┌─────────────────────┐
│   AnchoreVault       │────────▶│ OperatorRegistry    │
│                      │ verify  │                     │
│  - Lock Tokens       │         │  - Whitelist        │
│  - Emit Event        │         │  - Access Control   │
│  - LP Management     │         └─────────────────────┘
└──────────┬───────────┘
           │
           │ 2. BridgeRequested Event
           │
           ▼
    [Operator Node Listens]
           │
           │ 3. Dispatches to Casper
           ▼
    [Casper Bridge Contract]
```

## Build & Test

### Prerequisites

```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### Build

```bash
forge build
```

### Test

```bash
forge test
```

### Gas Snapshots

```bash
forge snapshot
```

## Deployment

### 1. Setup Environment

Create `.env` file (see `.env.example`):

```bash
PRIVATE_KEY=0x...
RPC_URL=https://rpc-amoy.polygon.technology
ETHERSCAN_API_KEY=... # Optional, for verification
```

### 2. Deploy to Testnet

```bash
forge script script/DeployAnchore.s.sol:DeployAnchore \\
  --rpc-url $RPC_URL \\
  --broadcast \\
  --verify
```

### 3. Save Contract Addresses

The script outputs:

```
USDC Deployed at: 0x...
Registry Deployed at: 0x...
Vault Deployed at: 0x...
```

## Contract Interfaces

### AnchoreVault

#### Liquidity Functions

```solidity
function addLiquidity(uint256 _amount) external
function removeLiquidity(uint256 _shares) external
```

#### Bridge Functions

```solidity
function bridgeOut(uint256 _amount, string calldata _casperRecipient) external
function bridgeIn(uint256 _amount, address _recipient, uint256 _sourceNonce, bytes[] calldata _signatures) external
```

### OperatorRegistry

```solidity
function setOperator(address _operator, bool _isActive) external
function isOperator(address _account) external view returns (bool)
```

## Development

### Project Structure

```
src/
├── AnchoreVault.sol           # Main bridge vault
├── OperatorRegistry.sol       # Operator whitelist
├── interfaces/
│   └── IAnchoreVault.sol     # Vault interface
└── mocks/
    └── MockERC20.sol         # Test token

script/
└── DeployAnchore.s.sol       # Deployment script
```

### Local Development

```bash
# Start local node
anvil

# Deploy to local
forge script script/DeployAnchore.s.sol --rpc-url http://localhost:8545 --broadcast
```

## License

MIT

## Resources

- [Foundry Book](https://book.getfoundry.sh/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [Anchore Protocol](../../README.md)
