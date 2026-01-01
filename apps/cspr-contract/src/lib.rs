#![cfg_attr(not(test), no_std)]
#![cfg_attr(not(test), no_main)]
extern crate alloc;

// Declare the modules
pub mod amm;
pub mod bridge;
pub mod events;

// Re-export main contract structs
pub use amm::AnchoreAMM;
pub use bridge::AnchoreBridge;