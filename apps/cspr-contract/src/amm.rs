use odra::prelude::*;
use odra::casper_types::U256;
use odra::ContractRef;
use crate::events::{LiquidityAdded, Swap};

// Interface for External CEP-18 Token
#[odra::external_contract]
pub trait Cep18 {
    fn transfer(&mut self, recipient: Address, amount: U256);
    fn transfer_from(&mut self, owner: Address, recipient: Address, amount: U256);
    fn balance_of(&self, address: Address) -> U256;
}

#[odra::module]
pub struct AnchoreAMM {
    pub token_a: Var<Address>,
    pub token_b: Var<Address>,
    pub reserve_a: Var<U256>,
    pub reserve_b: Var<U256>,
    pub total_supply: Var<U256>,
    pub balances: Mapping<Address, U256>,
}

#[odra::module]
impl AnchoreAMM {
    #[odra(init)]
    pub fn init(&mut self, token_a: Address, token_b: Address) {
        self.token_a.set(token_a);
        self.token_b.set(token_b);
        self.reserve_a.set(U256::zero());
        self.reserve_b.set(U256::zero());
    }

    // --- Core Market Maker Logic ---

    pub fn add_liquidity(&mut self, amount_a: U256, amount_b: U256) {
        let caller = self.env().caller();
        let t_a = self.token_a.get().unwrap();
        let t_b = self.token_b.get().unwrap();

        // 1. Pull Tokens
        Cep18ContractRef::new(self.env(), t_a).transfer_from(caller, self.env().self_address(), amount_a);
        Cep18ContractRef::new(self.env(), t_b).transfer_from(caller, self.env().self_address(), amount_b);

        // 2. Mint LP Tokens (Simplified Logic)
        let liquidity = if self.total_supply.get_or_default() == U256::zero() {
            amount_a // Initial liquidity 
        } else {
            (amount_a * self.total_supply.get_or_default()) / self.reserve_a.get_or_default()
        };

        self.balances.set(&caller, self.balances.get_or_default(&caller) + liquidity);
        self.total_supply.set(self.total_supply.get_or_default() + liquidity);
        self.sync_reserves();

        self.env().emit_event(LiquidityAdded {
            provider: caller,
            amount_a,
            amount_b,
            liquidity,
        });
    }

    /// Swaps an exact input amount for an output amount
    pub fn swap_exact_tokens(&mut self, amount_in: U256, token_in: Address, to: Address) {
        let t_a = self.token_a.get().unwrap();
        let t_b = self.token_b.get().unwrap();
        
        let is_token_a = token_in == t_a;
        let (token_out, reserve_in, reserve_out) = if is_token_a {
            (t_b, self.reserve_a.get_or_default(), self.reserve_b.get_or_default())
        } else {
            (t_a, self.reserve_b.get_or_default(), self.reserve_a.get_or_default())
        };

        // 1. Transfer In
        Cep18ContractRef::new(self.env(), token_in).transfer_from(self.env().caller(), self.env().self_address(), amount_in);

        // 2. Calculate Output (Input * 997 / 1000 for 0.3% fee)
        let amount_in_with_fee = amount_in * U256::from(997);
        let numerator = amount_in_with_fee * reserve_out;
        let denominator = (reserve_in * U256::from(1000)) + amount_in_with_fee;
        let amount_out = numerator / denominator;

        // 3. Transfer Out
        Cep18ContractRef::new(self.env(), token_out).transfer(to, amount_out);
        
        self.sync_reserves();

        self.env().emit_event(Swap {
            sender: self.env().caller(),
            amount_in,
            amount_out,
            to,
        });
    }

    fn sync_reserves(&mut self) {
        let t_a = self.token_a.get().unwrap();
        let t_b = self.token_b.get().unwrap();
        self.reserve_a.set(Cep18ContractRef::new(self.env(), t_a).balance_of(self.env().self_address()));
        self.reserve_b.set(Cep18ContractRef::new(self.env(), t_b).balance_of(self.env().self_address()));
    }
}