// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract OperatorRegistry is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    // List of active operators
    mapping(address => bool) public operators;
    uint256 public operatorCount;

    event OperatorUpdated(address indexed operator, bool isActive);

    constructor(address _admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(ADMIN_ROLE, _admin);
    }

    function setOperator(address _operator, bool _isActive) external onlyRole(ADMIN_ROLE) {
        if (_isActive && !operators[_operator]) {
            operatorCount++;
        } else if (!_isActive && operators[_operator]) {
            operatorCount--;
        }
        
        operators[_operator] = _isActive;
        emit OperatorUpdated(_operator, _isActive);
    }

    function isOperator(address _account) external view returns (bool) {
        return operators[_account];
    }
}