//! Deployment script for Anchore tokens and AMM pools
//! Deploys: USDC, USDT, WBTC, DAI, WETH tokens and AMM pools for pairs

use cspr_contract::amm::{AnchoreAMM, AnchoreAMMInitArgs};
use cspr_contract::mock_token::{MockToken, MockTokenInitArgs};
use odra::host::{Deployer, HostEnv};
use odra::prelude::*;
use odra::casper_types::U256;
use odra_cli::{
    deploy::{DeployScript, Error},
    DeployedContractsContainer, OdraCli,
};

/// Deployment script that creates all tokens and AMM pools
pub struct AnchoreDeployScript;

impl DeployScript for AnchoreDeployScript {
    fn deploy(
        &self,
        env: &HostEnv,
        _container: &mut DeployedContractsContainer,
    ) -> Result<(), Error> {
        // Gas amounts in motes (1 CSPR = 1_000_000_000 motes)
        // REDUCED: 1000 CSPR is too high and hits block limits on some networks.
        // A release build of CEP-18 usually takes ~150-200 CSPR. 
        // We set 400 CSPR as a safe upper bound.
        const TOKEN_DEPLOY_GAS: u64 = 400_000_000_000; // 400 CSPR
        const POOL_DEPLOY_GAS: u64 = 400_000_000_000;  // 400 CSPR
        
        println!("🚀 Starting Anchore Token & AMM Deployment...\n");

        // ============================================================
        // STEP 1: Deploy Tokens
        // ============================================================
        
        println!("📝 Deploying Tokens...");
        
        // USDC - 6 decimals, 1M initial supply
        env.set_gas(TOKEN_DEPLOY_GAS);
        let usdc_args = MockTokenInitArgs {
            name: "USD Coin".to_string(),
            symbol: "USDC".to_string(),
            decimals: 6,
            initial_supply: U256::from(1_000_000) * U256::from(10u64.pow(6)),
        };
        let usdc = MockToken::try_deploy(env, usdc_args)?;
        println!("  ✅ USDC deployed at: {:?}", usdc.address());

        // USDT - 6 decimals, 1M initial supply
        env.set_gas(TOKEN_DEPLOY_GAS);
        let usdt_args = MockTokenInitArgs {
            name: "Tether USD".to_string(),
            symbol: "USDT".to_string(),
            decimals: 6,
            initial_supply: U256::from(1_000_000) * U256::from(10u64.pow(6)),
        };
        let usdt = MockToken::try_deploy(env, usdt_args)?;
        println!("  ✅ USDT deployed at: {:?}", usdt.address());

        // WBTC - 8 decimals, 100 initial supply
        env.set_gas(TOKEN_DEPLOY_GAS);
        let wbtc_args = MockTokenInitArgs {
            name: "Wrapped Bitcoin".to_string(),
            symbol: "WBTC".to_string(),
            decimals: 8,
            initial_supply: U256::from(100) * U256::from(10u64.pow(8)),
        };
        let wbtc = MockToken::try_deploy(env, wbtc_args)?;
        println!("  ✅ WBTC deployed at: {:?}", wbtc.address());

        // DAI - 18 decimals, 1M initial supply
        env.set_gas(TOKEN_DEPLOY_GAS);
        let dai_args = MockTokenInitArgs {
            name: "Dai Stablecoin".to_string(),
            symbol: "DAI".to_string(),
            decimals: 18,
            initial_supply: U256::from(1_000_000) * U256::exp10(18),
        };
        let dai = MockToken::try_deploy(env, dai_args)?;
        println!("  ✅ DAI deployed at: {:?}", dai.address());

        // WETH - 18 decimals, 1000 initial supply
        env.set_gas(TOKEN_DEPLOY_GAS);
        let weth_args = MockTokenInitArgs {
            name: "Wrapped Ether".to_string(),
            symbol: "WETH".to_string(),
            decimals: 18,
            initial_supply: U256::from(1_000) * U256::exp10(18),
        };
        let weth = MockToken::try_deploy(env, weth_args)?;
        println!("  ✅ WETH deployed at: {:?}", weth.address());

        println!("\n📊 All tokens deployed successfully!\n");

        // ============================================================
        // STEP 2: Deploy AMM Pools
        // ============================================================
        
        println!("🏊 Deploying AMM Pools...");

        // USDC-USDT Pool
        env.set_gas(POOL_DEPLOY_GAS);
        let usdc_usdt_pool_args = AnchoreAMMInitArgs {
            token_a: usdc.address(),
            token_b: usdt.address(),
        };
        let usdc_usdt_pool = AnchoreAMM::try_deploy(env, usdc_usdt_pool_args)?;
        println!("  ✅ USDC-USDT Pool deployed at: {:?}", usdc_usdt_pool.address());

        // WBTC-USDC Pool
        env.set_gas(POOL_DEPLOY_GAS);
        let wbtc_usdc_pool_args = AnchoreAMMInitArgs {
            token_a: wbtc.address(),
            token_b: usdc.address(),
        };
        let wbtc_usdc_pool = AnchoreAMM::try_deploy(env, wbtc_usdc_pool_args)?;
        println!("  ✅ WBTC-USDC Pool deployed at: {:?}", wbtc_usdc_pool.address());

        // DAI-USDC Pool
        env.set_gas(POOL_DEPLOY_GAS);
        let dai_usdc_pool_args = AnchoreAMMInitArgs {
            token_a: dai.address(),
            token_b: usdc.address(),
        };
        let dai_usdc_pool = AnchoreAMM::try_deploy(env, dai_usdc_pool_args)?;
        println!("  ✅ DAI-USDC Pool deployed at: {:?}", dai_usdc_pool.address());

        // WETH-USDC Pool
        env.set_gas(POOL_DEPLOY_GAS);
        let weth_usdc_pool_args = AnchoreAMMInitArgs {
            token_a: weth.address(),
            token_b: usdc.address(),
        };
        let weth_usdc_pool = AnchoreAMM::try_deploy(env, weth_usdc_pool_args)?;
        println!("  ✅ WETH-USDC Pool deployed at: {:?}", weth_usdc_pool.address());

        println!("\n🎉 Deployment Complete!\n");
        println!("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        println!("📋 DEPLOYMENT SUMMARY");
        println!("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        println!("\n🪙 TOKENS:");
        println!("  USDC:  {:?}", usdc.address());
        println!("  USDT:  {:?}", usdt.address());
        println!("  WBTC:  {:?}", wbtc.address());
        println!("  DAI:   {:?}", dai.address());
        println!("  WETH:  {:?}", weth.address());
        println!("\n🏊 AMM POOLS:");
        println!("  USDC-USDT: {:?}", usdc_usdt_pool.address());
        println!("  WBTC-USDC: {:?}", wbtc_usdc_pool.address());
        println!("  DAI-USDC:  {:?}", dai_usdc_pool.address());
        println!("  WETH-USDC: {:?}", weth_usdc_pool.address());
        println!("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
        println!("💡 Next Steps:");
        println!("  1. Update apps/web/data/index.ts with token addresses");
        println!("  2. Update apps/web/data/swap-and-bridge-routes.ts with pool addresses");
        println!("  3. Add liquidity to pools before enabling swaps");
        println!();

        Ok(())
    }
}

fn main() {
    OdraCli::new()
        .about("Anchore Token & AMM Deployment Tool")
        .deploy(AnchoreDeployScript)
        .contract::<MockToken>()
        .contract::<AnchoreAMM>()
        .run();
}