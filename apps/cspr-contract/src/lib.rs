#![cfg_attr(not(test), no_std)]
#![cfg_attr(not(test), no_main)]
extern crate alloc;

// Declare the modules
pub mod amm;
pub mod bridge;
pub mod events;
pub mod mock_token;

// Re-export main contract structs
pub use amm::AnchoreAMM;
pub use bridge::AnchoreBridge;
pub use mock_token::MockToken;