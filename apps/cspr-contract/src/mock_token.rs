use odra::prelude::*;
use odra::casper_types::U256;
use odra_modules::cep18_token::Cep18;

/// Standard CEP-18 token with public minting
/// Uses odra_modules::cep18_token::Cep18 for full CEP-18 compliance
/// Anyone can mint/burn tokens (no access control for testing/demo)
#[odra::module]
pub struct MockToken {
    /// Internal CEP-18 implementation from odra_modules
    token: SubModule<Cep18>,
}

#[odra::module]
impl MockToken {
    /// Initialize a new mock token with CEP-18 standard
    pub fn init(&mut self, name: String, symbol: String, decimals: u8, initial_supply: U256) {
        // Initialize the internal CEP-18 module
        self.token.init(symbol, name, decimals, initial_supply);
    }

    // ============================================================
    // PUBLIC MINTING/BURNING (Anyone can mint/burn for testing)
    // ============================================================

    /// Mint tokens to any address (public, no access control)
    /// This allows anyone to mint tokens for testing purposes
    pub fn mint(&mut self, recipient: &Address, amount: &U256) {
        self.token.raw_mint(recipient, amount);
    }

    /// Burn tokens from any address (public, no access control)
    /// This allows anyone to burn tokens for testing purposes
    pub fn burn(&mut self, owner: &Address, amount: &U256) {
        self.token.raw_burn(owner, amount);
    }

    // ============================================================
    // CEP-18 Standard Methods (Delegated to internal module)
    // ============================================================
    
    delegate! {
        to self.token {
            fn name(&self) -> String;
            fn symbol(&self) -> String;
            fn decimals(&self) -> u8;
            fn total_supply(&self) -> U256;
            fn balance_of(&self, address: &Address) -> U256;
            fn allowance(&self, owner: &Address, spender: &Address) -> U256;
            fn approve(&mut self, spender: &Address, amount: &U256);
            fn decrease_allowance(&mut self, spender: &Address, decr_by: &U256);
            fn increase_allowance(&mut self, spender: &Address, inc_by: &U256);
            fn transfer(&mut self, recipient: &Address, amount: &U256);
            fn transfer_from(&mut self, owner: &Address, recipient: &Address, amount: &U256);
        }
    }
}
