use odra::prelude::*;
use odra::casper_types::U256;

#[odra::event]
pub struct LiquidityAdded {
    pub provider: Address,
    pub amount_a: U256,
    pub amount_b: U256,
    pub liquidity: U256,
}

#[odra::event]
pub struct LiquidityRemoved {
    pub provider: Address,
    pub amount_a: U256,
    pub amount_b: U256,
    pub liquidity: U256,
}

#[odra::event]
pub struct Swap {
    pub sender: Address,
    pub token_in: Address,
    pub token_out: Address,
    pub amount_in: U256,
    pub amount_out: U256,
    pub to: Address,
}