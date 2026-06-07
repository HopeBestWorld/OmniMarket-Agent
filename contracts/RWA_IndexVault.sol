// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract RWA_IndexVault {
    mapping(address => uint256) public balances;

    event CapitalHedged(address indexed source, uint256 amount);

    function deposit() external payable {
        require(msg.value > 0, "No capital");
        balances[msg.sender] += msg.value;
        emit CapitalHedged(msg.sender, msg.value);
    }
}