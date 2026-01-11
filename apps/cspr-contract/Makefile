include .env

# Build with Odra
build:
	@echo "Building contracts with Odra..."
	cargo odra build

# Deploy all tokens and AMM pools using the deployment script
deploy-all:
	@echo "Deploying all tokens and AMM pools..."
	cargo run --bin anchore_deploy -- deploy

# Deploy to testnet
deploy-testnet:
	@echo "Deploying to Casper Testnet..."
	cargo run --bin anchore_deploy -- deploy --network testnet

