// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/AnchoreVault.sol";
import "../src/OperatorRegistry.sol";
import "../src/mocks/MockERC20.sol";

contract DeployAnchore is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployerAddr = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy Fake USDC
        MockERC20 usdc = new MockERC20("Fake USDC", "fUSDC");
        usdc.mint(deployerAddr, 1_000_000 * 10**18); // Mint 1M to yourself

        // 2. Deploy Registry
        OperatorRegistry registry = new OperatorRegistry(deployerAddr);

        // 3. Deploy Vault
        AnchoreVault vault = new AnchoreVault(address(registry), address(usdc));

        // 4. Setup: Whitelist Deployer as Operator (Simulating the backend)
        registry.setOperator(deployerAddr, true);

        vm.stopBroadcast();

        console.log("USDC Deployed at:", address(usdc));
        console.log("Registry Deployed at:", address(registry));
        console.log("Vault Deployed at:", address(vault));
    }
}