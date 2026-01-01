// AnchoreVault ABI (minimal - only what we need)
export const VAULT_ABI = [
  "event BridgeRequested(address indexed sender, uint256 amount, string targetAddress, uint256 nonce)",
  "event BridgeReleased(address indexed recipient, uint256 amount, bytes32 txHash)",
  "event LiquidityAdded(address indexed provider, uint256 amount, uint256 sharesMinted)",
  "event LiquidityRemoved(address indexed provider, uint256 amount, uint256 sharesBurned)",
  "function bridgeOut(uint256 _amount, string calldata _casperRecipient) external",
  "function addLiquidity(uint256 _amount) external",
  "function removeLiquidity(uint256 _shares) external",
];

// OperatorRegistry ABI
export const REGISTRY_ABI = [
  "event OperatorUpdated(address indexed operator, bool isActive)",
  "function setOperator(address _operator, bool _isActive) external",
  "function isOperator(address _account) external view returns (bool)",
  "function operatorCount() external view returns (uint256)",
];
