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
pub struct Swap {
    pub sender: Address,
    pub amount_in: U256,
    pub amount_out: U256,
    pub to: Address,
}

#[odra::event]
pub struct BridgeRelease {
    pub recipient: Address,
    pub amount: U256,
    pub nonce: U256,
    pub token: Address,
}

#[odra::event]
pub struct OperatorUpdated {
    pub operator: Address,
    pub is_active: bool,
}