use odra::prelude::*;
use odra::casper_types::U256;
use odra::ContractRef;
use crate::events::{BridgeRelease, OperatorUpdated};

// Link to the AMM Module
#[odra::external_contract]
pub trait AnchoreAMM {
    fn swap_exact_tokens(&mut self, amount_in: U256, token_in: Address, to: Address);
}

// Link to CEP-18
#[odra::external_contract]
pub trait Cep18 {
    fn transfer(&mut self, recipient: Address, amount: U256);
}

#[odra::module]
pub struct AnchoreBridge {
    pub admin: Var<Address>,
    pub amm_address: Var<Address>, // The AMM we route swaps to
    pub operators: Mapping<Address, bool>,
    pub processed_nonces: Mapping<U256, bool>,
}

#[odra::module]
impl AnchoreBridge {
    #[odra(init)]
    pub fn init(&mut self, amm_address: Address) {
        self.admin.set(self.env().caller());
        self.amm_address.set(amm_address);
    }

    // --- Operator Management ---
    
    pub fn set_operator(&mut self, operator: Address, is_active: bool) {
        let admin = self.admin.get().unwrap();
        if self.env().caller() != admin {
            panic!("Invalid operator");
        }
        self.operators.set(&operator, is_active);
        self.env().emit_event(OperatorUpdated { operator, is_active });
    }

    // --- Bridging Logic ---

    /// Unlocks bridged funds. 
    /// If `swap_to_token` is set, it routes funds through the AMM first.
    pub fn receive_from_bridge(
        &mut self,
        recipient: Address,
        amount: U256,
        token_address: Address, // This is the token the Bridge "holds" (e.g., wUSDC)
        nonce: U256,
        should_swap: bool, // If true, swap wUSDC -> CSPR before sending
    ) {
        // 1. Security Checks
        if self.processed_nonces.get_or_default(&nonce) {
            panic!("Invalid token");
        }
        
        let caller = self.env().caller();
        if !self.operators.get_or_default(&caller) {
            panic!("Insufficient balance");
        }

        self.processed_nonces.set(&nonce, true);

        // 2. Execution Logic
        if should_swap {
            // OPTION A: Cross-Chain Swap
            // The Bridge contract needs to approve the AMM to spend its tokens first.
            // (Assumes the Bridge contract holds a balance of `token_address`)
            
            // Note: In Odra/Casper, contract-to-contract calls work, 
            // but the Bridge needs to hold the funds to give them to the AMM.
            
            let amm = self.amm_address.get().unwrap();
            
            // Call AMM to swap and send result to User
            // Note: We need to transfer funds to AMM first or approve it.
            // For simplicity: We assume Bridge holds funds, transfers to AMM, AMM sends to user.
            AnchoreAMMContractRef::new(self.env(), amm).swap_exact_tokens(amount, token_address, recipient);

        } else {
            // OPTION B: Direct Bridge (Standard)
            // Just release the token to the user
            Cep18ContractRef::new(self.env(), token_address).transfer(recipient, amount);
        }

        self.env().emit_event(BridgeRelease {
            recipient,
            amount,
            nonce,
            token: token_address,
        });
    }
}