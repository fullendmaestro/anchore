//! Deployment script for Anchore Liquidity Pool tokens and pools
//! Deploys: USDC, USDT, WBTC, DAI, WETH tokens and Liquidity Pools for token pairs

use cspr_contract::pool::{AnchorePool, AnchorePoolInitArgs};
use cspr_contract::mock_token::{MockToken, MockTokenInitArgs};
use odra::host::{Deployer, HostEnv};
use odra::prelude::*;
use odra::casper_types::U256;
use odra_cli::{
    deploy::{DeployScript, Error},
    DeployedContractsContainer, OdraCli,
};

/// Deployment script that creates all tokens and Liquidity Pools
pub struct AnchoreDeployScript;

impl DeployScript for AnchoreDeployScript {
    fn deploy(
        &self,
        env: &HostEnv,
        _container: &mut DeployedContractsContainer,
    ) -> Result<(), Error> {
        // Gas amounts in motes (1 CSPR = 1_000_000_000 motes)
        // Tokens: 400 CSPR is sufficient for CEP-18 tokens
        // Pools: 600 CSPR for larger pool contracts with more logic
        const TOKEN_DEPLOY_GAS: u64 = 400_000_000_000; // 400 CSPR
        const POOL_DEPLOY_GAS: u64 = 600_000_000_000;  // 600 CSPR
        
        println!("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        println!("🚀 Starting Anchore Liquidity Pool Deployment");
        println!("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

        // ============================================================
        // STEP 1: Deploy Tokens
        // ============================================================
        
        println!("📝 STEP 1: Deploying Tokens\n");
        
        // USDC - 6 decimals, 1M initial supply
        env.set_gas(TOKEN_DEPLOY_GAS);
        let usdc_args = MockTokenInitArgs {
            name: "USD Coin".to_string(),
            symbol: "USDC".to_string(),
            decimals: 6,
            initial_supply: U256::from(1_000_000) * U256::from(10u64.pow(6)),
        };
        let usdc = MockToken::try_deploy(env, usdc_args)?;
        println!("  ✅ USDC deployed at: {:?}\n", usdc.address());

        // USDT - 6 decimals, 1M initial supply
        env.set_gas(TOKEN_DEPLOY_GAS);
        let usdt_args = MockTokenInitArgs {
            name: "Tether USD".to_string(),
            symbol: "USDT".to_string(),
            decimals: 6,
            initial_supply: U256::from(1_000_000) * U256::from(10u64.pow(6)),
        };
        let usdt = MockToken::try_deploy(env, usdt_args)?;
        println!("  ✅ USDT deployed at: {:?}\n", usdt.address());

        // WBTC - 8 decimals, 100 initial supply
        env.set_gas(TOKEN_DEPLOY_GAS);
        let wbtc_args = MockTokenInitArgs {
            name: "Wrapped Bitcoin".to_string(),
            symbol: "WBTC".to_string(),
            decimals: 8,
            initial_supply: U256::from(100) * U256::from(10u64.pow(8)),
        };
        let wbtc = MockToken::try_deploy(env, wbtc_args)?;
        println!("  ✅ WBTC deployed at: {:?}\n", wbtc.address());

        // DAI - 18 decimals, 1M initial supply
        env.set_gas(TOKEN_DEPLOY_GAS);
        let dai_args = MockTokenInitArgs {
            name: "Dai Stablecoin".to_string(),
            symbol: "DAI".to_string(),
            decimals: 18,
            initial_supply: U256::from(1_000_000) * U256::exp10(18),
        };
        let dai = MockToken::try_deploy(env, dai_args)?;
        println!("  ✅ DAI deployed at: {:?}\n", dai.address());

        // WETH - 18 decimals, 1000 initial supply
        env.set_gas(TOKEN_DEPLOY_GAS);
        let weth_args = MockTokenInitArgs {
            name: "Wrapped Ether".to_string(),
            symbol: "WETH".to_string(),
            decimals: 18,
            initial_supply: U256::from(1_000) * U256::exp10(18),
        };
        let weth = MockToken::try_deploy(env, weth_args)?;
        println!("  ✅ WETH deployed at: {:?}\n", weth.address());

        println!("✨ All tokens deployed successfully!\n");

        // ============================================================
        // STEP 2: Deploy Liquidity Pools
        // ============================================================
        
        println!("🏊 STEP 2: Deploying Liquidity Pools\n");

        // USDC-USDT Pool
        env.set_gas(POOL_DEPLOY_GAS);
        let usdc_usdt_pool_args = AnchorePoolInitArgs {
            token_a: usdc.address(),
            token_b: usdt.address(),
        };
        let usdc_usdt_pool = AnchorePool::try_deploy(env, usdc_usdt_pool_args)?;
        println!("  ✅ USDC-USDT Pool deployed at: {:?}\n", usdc_usdt_pool.address());

        // WBTC-USDC Pool
        env.set_gas(POOL_DEPLOY_GAS);
        let wbtc_usdc_pool_args = AnchorePoolInitArgs {
            token_a: wbtc.address(),
            token_b: usdc.address(),
        };
        let wbtc_usdc_pool = AnchorePool::try_deploy(env, wbtc_usdc_pool_args)?;
        println!("  ✅ WBTC-USDC Pool deployed at: {:?}\n", wbtc_usdc_pool.address());

        // DAI-USDC Pool
        env.set_gas(POOL_DEPLOY_GAS);
        let dai_usdc_pool_args = AnchorePoolInitArgs {
            token_a: dai.address(),
            token_b: usdc.address(),
        };
        let dai_usdc_pool = AnchorePool::try_deploy(env, dai_usdc_pool_args)?;
        println!("  ✅ DAI-USDC Pool deployed at: {:?}\n", dai_usdc_pool.address());

        // WETH-USDC Pool
        env.set_gas(POOL_DEPLOY_GAS);
        let weth_usdc_pool_args = AnchorePoolInitArgs {
            token_a: weth.address(),
            token_b: usdc.address(),
        };
        let weth_usdc_pool = AnchorePool::try_deploy(env, weth_usdc_pool_args)?;
        println!("  ✅ WETH-USDC Pool deployed at: {:?}\n", weth_usdc_pool.address());

        // WBTC-DAI Pool
        env.set_gas(POOL_DEPLOY_GAS);
        let wbtc_dai_pool_args = AnchorePoolInitArgs {
            token_a: wbtc.address(),
            token_b: dai.address(),
        };
        let wbtc_dai_pool = AnchorePool::try_deploy(env, wbtc_dai_pool_args)?;
        println!("  ✅ WBTC-DAI Pool deployed at: {:?}\n", wbtc_dai_pool.address());

        // WETH-DAI Pool
        env.set_gas(POOL_DEPLOY_GAS);
        let weth_dai_pool_args = AnchorePoolInitArgs {
            token_a: weth.address(),
            token_b: dai.address(),
        };
        let weth_dai_pool = AnchorePool::try_deploy(env, weth_dai_pool_args)?;
        println!("  ✅ WETH-DAI Pool deployed at: {:?}\n", weth_dai_pool.address());

        println!("✨ All pools deployed successfully!\n");

        // ============================================================
        // DEPLOYMENT SUMMARY
        // ============================================================

        println!("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        println!("✅ DEPLOYMENT SUMMARY");
        println!("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        
        println!("\n🪙 TOKENS DEPLOYED:");
        println!("  USDC:    {}", format_address(usdc.address()));
        println!("  USDT:    {}", format_address(usdt.address()));
        println!("  WBTC:    {}", format_address(wbtc.address()));
        println!("  DAI:     {}", format_address(dai.address()));
        println!("  WETH:    {}", format_address(weth.address()));
        
        println!("\n🏊 POOLS DEPLOYED:");
        println!("  USDC-USDT: {}", format_address(usdc_usdt_pool.address()));
        println!("  WBTC-USDC: {}", format_address(wbtc_usdc_pool.address()));
        println!("  DAI-USDC:  {}", format_address(dai_usdc_pool.address()));
        println!("  WETH-USDC: {}", format_address(weth_usdc_pool.address()));
        println!("  WBTC-DAI:  {}", format_address(wbtc_dai_pool.address()));
        println!("  WETH-DAI:  {}", format_address(weth_dai_pool.address()));

        println!("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        println!("💡 NEXT STEPS:");
        println!("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        println!("\n1. ✓ Save these addresses for your configuration");
        println!("2. ✓ Users can now mint tokens (public mint function)");
        println!("3. ✓ Users can provide liquidity to pools");
        println!("4. ✓ Users can swap between tokens");
        println!("5. ✓ Update your frontend with these addresses\n");

        Ok(())
    }
}

/// Format address for display
fn format_address(addr: Address) -> String {
    format!("{:?}", addr)
}

fn main() {
    OdraCli::new()
        .about("Anchore Liquidity Pool Deployment Tool")
        .deploy(AnchoreDeployScript)
        .contract::<MockToken>()
        .contract::<AnchorePool>()
        .run();
}