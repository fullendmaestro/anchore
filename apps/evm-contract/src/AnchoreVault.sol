// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./OperatorRegistry.sol";

contract AnchoreVault is ReentrancyGuard {
    using SafeERC20 for IERC20;
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    // --- State Variables ---
    OperatorRegistry public registry;
    IERC20 public supportedToken; // e.g., USDC
    
    uint256 public nonce;
    mapping(bytes32 => bool) public processedHashes;

    // Liquidity Provider Shares (Simplified "Share" tracking)
    uint256 public totalShares;
    mapping(address => uint256) public shares;

    // --- Events ---
    event BridgeRequested(
        address indexed sender, 
        uint256 amount, 
        string targetAddress, 
        uint256 nonce
    );
    event BridgeReleased(address indexed recipient, uint256 amount, bytes32 txHash);
    event LiquidityAdded(address indexed provider, uint256 amount, uint256 sharesMinted);
    event LiquidityRemoved(address indexed provider, uint256 amount, uint256 sharesBurned);

    constructor(address _registry, address _token) {
        registry = OperatorRegistry(_registry);
        supportedToken = IERC20(_token);
    }

    // ==========================================
    // 1. LIQUIDITY PROVIDER LOGIC
    // ==========================================

    /**
     * @notice Anyone can become a 'Node Operator' backer by providing liquidity.
     * @dev Simple linear share calculation for Hackathon.
     */
    function addLiquidity(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Amount 0");
        
        uint256 currentBalance = supportedToken.balanceOf(address(this));
        uint256 sharesToMint;

        if (totalShares == 0) {
            sharesToMint = _amount;
        } else {
            // Calculate share based on pool ownership *before* this deposit
            // Formula: (amount / (currentBalance - amount)) * totalShares
            // Note: Since we transfer first, we subtract _amount from balance to get 'pre-deposit' state
             supportedToken.safeTransferFrom(msg.sender, address(this), _amount);
             sharesToMint = (_amount * totalShares) / (currentBalance); 
             // Note: For hackathon simplicity, we might just use 1:1 if balance tracking is tricky
             // Let's stick to safeTransfer first:
        }
        
        // Correct flow for clarity:
        // 1. Calculate 'Pre-Deposit' Balance
        uint256 preBalance = supportedToken.balanceOf(address(this)); 
        // 2. Transfer
        supportedToken.safeTransferFrom(msg.sender, address(this), _amount);
        // 3. Mint
        if (totalShares == 0) {
            sharesToMint = _amount;
        } else {
            sharesToMint = (_amount * totalShares) / preBalance;
        }

        shares[msg.sender] += sharesToMint;
        totalShares += sharesToMint;

        emit LiquidityAdded(msg.sender, _amount, sharesToMint);
    }

    function removeLiquidity(uint256 _shares) external nonReentrant {
        require(shares[msg.sender] >= _shares, "Insufficient shares");

        uint256 currentBalance = supportedToken.balanceOf(address(this));
        uint256 amount = (_shares * currentBalance) / totalShares;

        shares[msg.sender] -= _shares;
        totalShares -= _shares;
        supportedToken.safeTransfer(msg.sender, amount);

        emit LiquidityRemoved(msg.sender, amount, _shares);
    }

    // ==========================================
    // 2. BRIDGE OUT (USER -> CASPER)
    // ==========================================

    /**
     * @notice Locks funds here and triggers the event for Casper Operators.
     * @param _amount Amount of USDC to bridge.
     * @param _casperRecipient The hex string of the Casper Public Key.
     */
    function bridgeOut(uint256 _amount, string calldata _casperRecipient) external nonReentrant {
        require(_amount > 0, "Amount 0");

        // 1. Collect Tokens
        supportedToken.safeTransferFrom(msg.sender, address(this), _amount);

        // 2. Increment Nonce (Unique ID for this interaction)
        uint256 currentNonce = nonce++;

        // 3. Emit Event (Off-chain Nodes listen to this)
        emit BridgeRequested(msg.sender, _amount, _casperRecipient, currentNonce);
    }

    // ==========================================
    // 3. BRIDGE IN (CASPER -> USER)
    // ==========================================

    /**
     * @notice Releases funds to user if Operators signed the request.
     * @dev Uses ECDSA signature recovery.
     */
    function bridgeIn(
        uint256 _amount,
        address _recipient,
        uint256 _sourceNonce,
        bytes[] calldata _signatures
    ) external nonReentrant {
        // 1. Replay Protection
        bytes32 txHash = keccak256(abi.encodePacked(_amount, _recipient, _sourceNonce, block.chainid));
        require(!processedHashes[txHash], "Tx already processed");

        // 2. Verify Signatures (Simple Threshold: 1 for demo, loop for production)
        // Ideally, check for unique signers >= threshold.
        // For Hackathon: We check if the FIRST signature belongs to a valid operator.
        address signer = _recoverSigner(txHash, _signatures[0]);
        require(registry.isOperator(signer), "Invalid Operator Signature");

        // 3. Mark Processed
        processedHashes[txHash] = true;

        // 4. Transfer
        supportedToken.safeTransfer(_recipient, _amount);

        emit BridgeReleased(_recipient, _amount, txHash);
    }

    // --- Helper: Signature Recovery ---
    function _recoverSigner(bytes32 _hash, bytes memory _signature) internal pure returns (address) {
        // EVM specific: Must use 'toEthSignedMessageHash' to match off-chain signing tools
        return _hash.toEthSignedMessageHash().recover(_signature);
    }
}