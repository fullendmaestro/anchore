use odra::prelude::*;
use odra::casper_types::U256;

/// Simple CEP-18 compatible token for testing
#[odra::module]
pub struct MockToken {
    name: Var<String>,
    symbol: Var<String>,
    decimals: Var<u8>,
    total_supply: Var<U256>,
    balances: Mapping<Address, U256>,
    allowances: Mapping<(Address, Address), U256>,
}

#[odra::module]
impl MockToken {
    #[odra(init)]
    pub fn init(&mut self, name: String, symbol: String, decimals: u8, initial_supply: U256) {
        self.name.set(name);
        self.symbol.set(symbol);
        self.decimals.set(decimals);
        self.total_supply.set(initial_supply);
        
        // Mint initial supply to deployer
        let deployer = self.env().caller();
        self.balances.set(&deployer, initial_supply);
    }

    // CEP-18 Standard Methods
    
    pub fn name(&self) -> String {
        self.name.get().unwrap_or_default()
    }

    pub fn symbol(&self) -> String {
        self.symbol.get().unwrap_or_default()
    }

    pub fn decimals(&self) -> u8 {
        self.decimals.get().unwrap_or(0)
    }

    pub fn total_supply(&self) -> U256 {
        self.total_supply.get_or_default()
    }

    pub fn balance_of(&self, owner: Address) -> U256 {
        self.balances.get_or_default(&owner)
    }

    pub fn transfer(&mut self, recipient: Address, amount: U256) {
        let sender = self.env().caller();
        let sender_balance = self.balances.get_or_default(&sender);
        
        // For simplicity in test token, we assume balance is sufficient
        self.balances.set(&sender, sender_balance - amount);
        self.balances.set(&recipient, self.balances.get_or_default(&recipient) + amount);
    }

    pub fn approve(&mut self, spender: Address, amount: U256) {
        let owner = self.env().caller();
        self.allowances.set(&(owner, spender), amount);
    }

    pub fn allowance(&self, owner: Address, spender: Address) -> U256 {
        self.allowances.get_or_default(&(owner, spender))
    }

    pub fn transfer_from(&mut self, owner: Address, recipient: Address, amount: U256) {
        let spender = self.env().caller();
        let current_allowance = self.allowances.get_or_default(&(owner, spender));
        
        // For simplicity in test token, we assume checks pass
        let owner_balance = self.balances.get_or_default(&owner);

        self.allowances.set(&(owner, spender), current_allowance - amount);
        self.balances.set(&owner, owner_balance - amount);
        self.balances.set(&recipient, self.balances.get_or_default(&recipient) + amount);
    }

    pub fn mint(&mut self, to: Address, amount: U256) {
        let total = self.total_supply.get_or_default();
        self.total_supply.set(total + amount);
        self.balances.set(&to, self.balances.get_or_default(&to) + amount);
    }
}
