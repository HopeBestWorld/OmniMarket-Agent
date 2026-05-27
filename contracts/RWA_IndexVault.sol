// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract RWA_IndexVault {
    // Simulating a tokenized broad-market index fund
    string public indexName = "OmniMarket Broad Equity Proxy";
    string public symbol = "omaVTI";
    
    mapping(address => uint256) public balances;
    
    // Event emitted when Agent 3 successfully moves the funds
    event CapitalHedged(address indexed user, uint256 amount, string message);

    // Agent 3 (Action Taker) calls this function to shift funds to safety
    function shiftToSafety() external payable {
        require(msg.value > 0, "Must hedge real capital");
        
        // Lock the capital in the stable index
        balances[msg.sender] += msg.value;
        
        emit CapitalHedged(msg.sender, msg.value, "Capital secured in RWA Broad-Market Index");
    }

    // Function to check secured balance
    function getBalance(address user) external view returns (uint256) {
        return balances[user];
    }
}