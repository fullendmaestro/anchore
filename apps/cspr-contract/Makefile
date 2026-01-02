include .env

# WASM paths
BRIDGE_WASM=./wasm/AnchoreBridge.wasm
MOCK_TOKEN_WASM=./wasm/MockToken.wasm

# Odra base args
ODRA_ARGS_BASE=--session-arg "odra_cfg_is_upgradable:bool='false'" --session-arg "odra_cfg_allow_key_override:bool='true'"

deploy-token-a:
	@echo "Deploying Mock Token A..."
	casper-client put-deploy \
		--node-address $(NODE_ADDRESS) \
		--chain-name $(CHAIN_NAME) \
		--secret-key $(SECRET_KEY) \
		--payment-amount $(PAYMENT_AMOUNT) \
		--session-path $(MOCK_TOKEN_WASM) \
		$(ODRA_ARGS_BASE) \
		--session-arg "odra_cfg_package_hash_key_name:string='mock_token_a_package_hash'" \
		--session-arg "name:string='Token A'" \
		--session-arg "symbol:string='TKNA'" \
		--session-arg "decimals:u8='18'" \
		--session-arg "initial_supply:u256='1000000000000000000000000'"

deploy-token-b:
	@echo "Deploying Mock Token B..."
	casper-client put-deploy \
		--node-address $(NODE_ADDRESS) \
		--chain-name $(CHAIN_NAME) \
		--secret-key $(SECRET_KEY) \
		--payment-amount $(PAYMENT_AMOUNT) \
		--session-path $(MOCK_TOKEN_WASM) \
		$(ODRA_ARGS_BASE) \
		--session-arg "odra_cfg_package_hash_key_name:string='mock_token_b_package_hash'" \
		--session-arg "name:string='Token B'" \
		--session-arg "symbol:string='TKNB'" \
		--session-arg "decimals:u8='18'" \
		--session-arg "initial_supply:u256='1000000000000000000000000'"

deploy-amm:
	@echo "Deploying AnchoreAMM..."
	@if [ -z "$(TOKEN_A_HASH)" ] || [ -z "$(TOKEN_B_HASH)" ]; then \
		echo "Error: TOKEN_A_HASH and TOKEN_B_HASH must be set in .env"; exit 1; \
	fi
	casper-client put-deploy \
		--node-address $(NODE_ADDRESS) \
		--chain-name $(CHAIN_NAME) \
		--secret-key $(SECRET_KEY) \
		--payment-amount $(PAYMENT_AMOUNT) \
		--session-path $(AMM_WASM) \
		$(ODRA_ARGS_BASE) \
		--session-arg "odra_cfg_package_hash_key_name:string='anchore_amm_package_hash'" \
		--session-arg "token_a:string='$(TOKEN_A_HASH)'" \
		--session-arg "token_b:string='$(TOKEN_B_HASH)'"

deploy-bridge:
	@echo "Deploying AnchoreBridge..."
	@if [ -z "$(AMM_CONTRACT_HASH)" ]; then \
		echo "Error: AMM_CONTRACT_HASH must be set in .env"; exit 1; \
	fi
	casper-client put-deploy \
		--node-address $(NODE_ADDRESS) \
		--chain-name $(CHAIN_NAME) \
		--secret-key $(SECRET_KEY) \
		--payment-amount $(PAYMENT_AMOUNT) \
		--session-path $(BRIDGE_WASM) \
		$(ODRA_ARGS_BASE) \
		--session-arg "odra_cfg_package_hash_key_name:string='anchore_bridge_package_hash'" \
		--session-arg "amm_address:string='$(AMM_CONTRACT_HASH)'"