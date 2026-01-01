// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IAnchoreVault {
    // Events
    event BridgeRequested(
        address indexed sender,
        uint256 amount,
        string targetAddress,
        uint256 nonce
    );
    event BridgeReleased(address indexed recipient, uint256 amount, bytes32 txHash);
    event LiquidityAdded(address indexed provider, uint256 amount, uint256 sharesMinted);
    event LiquidityRemoved(address indexed provider, uint256 amount, uint256 sharesBurned);

    // Functions
    function addLiquidity(uint256 _amount) external;
    function removeLiquidity(uint256 _shares) external;
    function bridgeOut(uint256 _amount, string calldata _casperRecipient) external;
    function bridgeIn(
        uint256 _amount,
        address _recipient,
        uint256 _sourceNonce,
        bytes[] calldata _signatures
    ) external;
}
