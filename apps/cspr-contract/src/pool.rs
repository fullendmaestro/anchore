use odra::prelude::*;
use odra::casper_types::U256;
use odra::ContractRef;
use crate::events::{LiquidityAdded, LiquidityRemoved, Swap};

// Error definitions
#[odra::odra_error]
pub enum Error {
    ZeroAmount = 1,
    ZeroLiquidity = 2,
    InsufficientLpBalance = 3,
    InvalidInputToken = 4,
    OutputBelowMinimum = 5,
    InputExceedsMaximum = 6,
}

// Interface for External CEP-18 Token
#[odra::external_contract]
pub trait Cep18 {
    fn transfer(&mut self, recipient: Address, amount: U256);
    fn transfer_from(&mut self, owner: Address, recipient: Address, amount: U256);
    fn balance_of(&self, address: Address) -> U256;
}

/// AnchorePool: Uniswap V2-like constant product AMM
/// Implements:
/// - add_liquidity: Deposit token pair, receive LP tokens
/// - remove_liquidity: Burn LP tokens, receive token pair
/// - swap_exact_tokens_in: Swap fixed input for variable output
/// - swap_tokens_for_exact: Swap variable input for fixed output
/// - Price oracle functions
#[odra::module]
pub struct AnchorePool {
    pub token_a: Var<Address>,
    pub token_b: Var<Address>,
    pub reserve_a: Var<U256>,
    pub reserve_b: Var<U256>,
    pub total_supply: Var<U256>,
    pub balances: Mapping<Address, U256>,
    pub fee_rate: Var<U256>, // In basis points (3 = 0.3%)
    pub accumulated_fees_a: Var<U256>,
    pub accumulated_fees_b: Var<U256>,
}

#[odra::module]
impl AnchorePool {
    #[odra(init)]
    pub fn init(&mut self, token_a: Address, token_b: Address) {
        self.token_a.set(token_a);
        self.token_b.set(token_b);
        self.reserve_a.set(U256::zero());
        self.reserve_b.set(U256::zero());
        self.total_supply.set(U256::zero());
        self.fee_rate.set(U256::from(3)); // 0.3% fee
    }

    // ============================================================
    // LIQUIDITY MANAGEMENT
    // ============================================================

    /// Add liquidity to the pool
    /// - Caller provides amount_a and amount_b
    /// - Receives LP tokens representing their share
    pub fn add_liquidity(&mut self, amount_a: U256, amount_b: U256) {
        let caller = self.env().caller();
        let t_a = self.token_a.get().unwrap();
        let t_b = self.token_b.get().unwrap();

        // Require non-zero amounts
        if amount_a == U256::zero() || amount_b == U256::zero() {
            self.env().revert(Error::ZeroAmount);
        }

        // Transfer tokens to pool
        Cep18ContractRef::new(self.env(), t_a)
            .transfer_from(caller, self.env().self_address(), amount_a);
        Cep18ContractRef::new(self.env(), t_b)
            .transfer_from(caller, self.env().self_address(), amount_b);

        // Calculate liquidity tokens to mint
        let liquidity = self.calculate_liquidity_to_mint(amount_a, amount_b);

        // Mint LP tokens to caller
        self.balances.set(&caller, self.balances.get_or_default(&caller) + liquidity);
        self.total_supply.set(self.total_supply.get_or_default() + liquidity);

        // Update reserves
        self.sync_reserves();

        self.env().emit_event(LiquidityAdded {
            provider: caller,
            amount_a,
            amount_b,
            liquidity,
        });
    }

    /// Remove liquidity from the pool
    /// - Caller burns LP tokens
    /// - Receives proportional token pair
    pub fn remove_liquidity(&mut self, liquidity_tokens: U256) {
        let caller = self.env().caller();
        let t_a = self.token_a.get().unwrap();
        let t_b = self.token_b.get().unwrap();

        // Require positive liquidity
        if liquidity_tokens == U256::zero() {
            self.env().revert(Error::ZeroLiquidity);
        }

        // Check caller has enough LP tokens
        let caller_balance = self.balances.get_or_default(&caller);
        if caller_balance < liquidity_tokens {
            self.env().revert(Error::InsufficientLpBalance);
        }

        // Calculate amounts to return
        let total_supply = self.total_supply.get_or_default();
        let reserve_a = self.reserve_a.get_or_default();
        let reserve_b = self.reserve_b.get_or_default();

        let amount_a = (liquidity_tokens * reserve_a) / total_supply;
        let amount_b = (liquidity_tokens * reserve_b) / total_supply;

        // Burn LP tokens
        self.balances.set(&caller, caller_balance - liquidity_tokens);
        self.total_supply.set(total_supply - liquidity_tokens);

        // Transfer tokens to caller
        Cep18ContractRef::new(self.env(), t_a).transfer(caller, amount_a);
        Cep18ContractRef::new(self.env(), t_b).transfer(caller, amount_b);

        // Update reserves
        self.sync_reserves();

        self.env().emit_event(LiquidityRemoved {
            provider: caller,
            amount_a,
            amount_b,
            liquidity: liquidity_tokens,
        });
    }

    // ============================================================
    // SWAP FUNCTIONS
    // ============================================================

    /// Swap exact amount of input token for output token
    /// - Caller specifies exact input amount
    /// - Receives variable output amount based on reserves
    pub fn swap_exact_tokens_in(
        &mut self,
        amount_in: U256,
        token_in: Address,
        min_amount_out: U256,
        to: Address,
    ) {
        let t_a = self.token_a.get().unwrap();
        let t_b = self.token_b.get().unwrap();

        // Validate token_in
        if token_in != t_a && token_in != t_b {
            self.env().revert(Error::InvalidInputToken);
        }

        // Determine output token and reserves
        let (token_out, reserve_in, reserve_out) = if token_in == t_a {
            (t_b, self.reserve_a.get_or_default(), self.reserve_b.get_or_default())
        } else {
            (t_a, self.reserve_b.get_or_default(), self.reserve_a.get_or_default())
        };

        // Calculate output amount (with 0.3% fee)
        let amount_out = self.calculate_output_amount(amount_in, reserve_in, reserve_out);

        // Check minimum output
        if amount_out < min_amount_out {
            self.env().revert(Error::OutputBelowMinimum);
        }

        // Transfer input from caller to pool
        Cep18ContractRef::new(self.env(), token_in)
            .transfer_from(self.env().caller(), self.env().self_address(), amount_in);

        // Transfer output to recipient
        Cep18ContractRef::new(self.env(), token_out).transfer(to, amount_out);

        // Update reserves
        self.sync_reserves();

        self.env().emit_event(Swap {
            sender: self.env().caller(),
            token_in,
            token_out,
            amount_in,
            amount_out,
            to,
        });
    }

    /// Swap input token for exact amount of output token
    /// - Caller specifies exact output amount desired
    /// - Pays variable input amount based on reserves
    pub fn swap_tokens_for_exact_out(
        &mut self,
        amount_out: U256,
        token_in: Address,
        max_amount_in: U256,
        to: Address,
    ) {
        let t_a = self.token_a.get().unwrap();
        let t_b = self.token_b.get().unwrap();

        // Validate token_in
        if token_in != t_a && token_in != t_b {
            self.env().revert(Error::InvalidInputToken);
        }

        // Determine output token and reserves
        let (token_out, reserve_in, reserve_out) = if token_in == t_a {
            (t_b, self.reserve_a.get_or_default(), self.reserve_b.get_or_default())
        } else {
            (t_a, self.reserve_b.get_or_default(), self.reserve_a.get_or_default())
        };

        // Calculate required input amount
        let amount_in = self.calculate_input_for_output(amount_out, reserve_in, reserve_out);

        // Check maximum input
        if amount_in > max_amount_in {
            self.env().revert(Error::InputExceedsMaximum);
        }

        // Transfer input from caller to pool
        Cep18ContractRef::new(self.env(), token_in)
            .transfer_from(self.env().caller(), self.env().self_address(), amount_in);

        // Transfer output to recipient
        Cep18ContractRef::new(self.env(), token_out).transfer(to, amount_out);

        // Update reserves
        self.sync_reserves();

        self.env().emit_event(Swap {
            sender: self.env().caller(),
            token_in,
            token_out,
            amount_in,
            amount_out,
            to,
        });
    }

    // ============================================================
    // VIEW FUNCTIONS
    // ============================================================

    /// Get current reserves of both tokens
    pub fn get_reserves(&self) -> (U256, U256) {
        (
            self.reserve_a.get_or_default(),
            self.reserve_b.get_or_default(),
        )
    }

    /// Get total LP token supply
    pub fn get_lp_token_supply(&self) -> U256 {
        self.total_supply.get_or_default()
    }

    /// Get LP token balance of an address
    pub fn get_lp_balance(&self, address: Address) -> U256 {
        self.balances.get_or_default(&address)
    }

    /// Get current price of token_a in terms of token_b
    /// Price = reserve_b / reserve_a
    pub fn get_price(&self, token: Address) -> U256 {
        let t_a = self.token_a.get().unwrap();
        let reserve_a = self.reserve_a.get_or_default();
        let reserve_b = self.reserve_b.get_or_default();

        if reserve_a == U256::zero() || reserve_b == U256::zero() {
            return U256::zero();
        }

        if token == t_a {
            (reserve_b * U256::from(1_000_000_000_000_000_000u128)) / reserve_a
        } else {
            (reserve_a * U256::from(1_000_000_000_000_000_000u128)) / reserve_b
        }
    }

    /// Simulate output amount for given input
    pub fn get_amount_out(&self, amount_in: U256, token_in: Address) -> U256 {
        let t_a = self.token_a.get().unwrap();
        let (reserve_in, reserve_out) = if token_in == t_a {
            (self.reserve_a.get_or_default(), self.reserve_b.get_or_default())
        } else {
            (self.reserve_b.get_or_default(), self.reserve_a.get_or_default())
        };

        self.calculate_output_amount(amount_in, reserve_in, reserve_out)
    }

    /// Simulate input amount needed for desired output
    pub fn get_amount_in(&self, amount_out: U256, token_in: Address) -> U256 {
        let t_a = self.token_a.get().unwrap();
        let (reserve_in, reserve_out) = if token_in == t_a {
            (self.reserve_a.get_or_default(), self.reserve_b.get_or_default())
        } else {
            (self.reserve_b.get_or_default(), self.reserve_a.get_or_default())
        };

        self.calculate_input_for_output(amount_out, reserve_in, reserve_out)
    }

    // ============================================================
    // INTERNAL HELPER FUNCTIONS
    // ============================================================

    fn sync_reserves(&mut self) {
        let t_a = self.token_a.get().unwrap();
        let t_b = self.token_b.get().unwrap();
        self.reserve_a.set(Cep18ContractRef::new(self.env(), t_a).balance_of(self.env().self_address()));
        self.reserve_b.set(Cep18ContractRef::new(self.env(), t_b).balance_of(self.env().self_address()));
    }

    /// Calculate LP tokens to mint for given deposit amounts
    fn calculate_liquidity_to_mint(&self, amount_a: U256, amount_b: U256) -> U256 {
        let total_supply = self.total_supply.get_or_default();
        let reserve_a = self.reserve_a.get_or_default();
        let reserve_b = self.reserve_b.get_or_default();

        if total_supply == U256::zero() {
            // Initial liquidity: sqrt(amount_a * amount_b)
            // Simplified: use geometric mean approximation
            self.isqrt(amount_a * amount_b)
        } else {
            // Liquidity = min((amount_a * total_supply) / reserve_a, (amount_b * total_supply) / reserve_b)
            let liq_a = (amount_a * total_supply) / reserve_a;
            let liq_b = (amount_b * total_supply) / reserve_b;
            if liq_a < liq_b { liq_a } else { liq_b }
        }
    }

    /// Calculate output amount for given input using constant product formula
    /// Formula: amount_out = (amount_in * 997 * reserve_out) / (reserve_in * 1000 + amount_in * 997)
    fn calculate_output_amount(&self, amount_in: U256, reserve_in: U256, reserve_out: U256) -> U256 {
        if amount_in == U256::zero() || reserve_in == U256::zero() || reserve_out == U256::zero() {
            return U256::zero();
        }

        let fee_rate = self.fee_rate.get_or_default();
        let amount_in_with_fee = amount_in * (U256::from(10000) - fee_rate) / U256::from(10000);
        let numerator = amount_in_with_fee * reserve_out;
        let denominator = reserve_in * U256::from(10000) + amount_in_with_fee;
        
        numerator / denominator
    }

    /// Calculate input amount needed for desired output
    /// Formula (inverted): amount_in = (reserve_in * amount_out * 1000) / (reserve_out * 997 - amount_out * 997)
    fn calculate_input_for_output(&self, amount_out: U256, reserve_in: U256, reserve_out: U256) -> U256 {
        if amount_out == U256::zero() || reserve_in == U256::zero() || reserve_out == U256::zero() {
            return U256::zero();
        }

        // Prevent slippage > 100%
        if amount_out >= reserve_out {
            return U256::MAX;
        }

        let fee_rate = self.fee_rate.get_or_default();
        let fee_factor = U256::from(10000) - fee_rate;
        let numerator = reserve_in * amount_out * U256::from(10000);
        let denominator = (reserve_out - amount_out) * fee_factor;
        
        (numerator / denominator) + U256::from(1) // Add 1 for rounding up
    }

    /// Integer square root using Newton's method
    fn isqrt(&self, n: U256) -> U256 {
        if n == U256::zero() {
            return U256::zero();
        }
        if n == U256::one() {
            return U256::one();
        }

        let mut x = n;
        let mut y = (x + U256::one()) / U256::from(2);
        
        while y < x {
            x = y;
            y = (x + n / x) / U256::from(2);
        }
        
        x
    }
}
