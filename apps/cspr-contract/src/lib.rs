#![cfg_attr(not(test), no_std)]
#![cfg_attr(not(test), no_main)]
extern crate alloc;

// Declare the modules
pub mod pool;
pub mod events;
pub mod mock_token;

// Re-export main contract structs
pub use pool::AnchorePool;
pub use mock_token::MockToken;