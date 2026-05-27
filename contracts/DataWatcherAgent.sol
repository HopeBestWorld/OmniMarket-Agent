// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Placeholder for Somnia L1 Agent Interface
interface ISomniaAgent {
    function requestJsonApi(string calldata url, string calldata jsonPath) external returns (uint256 requestId);
}

contract DataWatcherAgent {
    ISomniaAgent public somniaAgent;
    address public owner;
    
    // Storing the latest real-world risk metric
    uint256 public latestCommodityRiskScore;

    constructor(address _somniaAgentAddress) {
        somniaAgent = ISomniaAgent(_somniaAgentAddress);
        owner = msg.sender;
    }

    // Agent 1: Invokes Somnia's decentralized compute to fetch off-chain API data
    function triggerMarketScan(string memory apiUrl, string memory jsonPathToRiskScore) public {
        require(msg.sender == owner, "Only authorized trigger");
        
        // This calls the Somnia network to verify off-chain data via consensus
        somniaAgent.requestJsonApi(apiUrl, jsonPathToRiskScore);
    }

    // Callback function where Somnia runners return the consensus result
    function fulfillMarketScan(uint256 _requestId, uint256 _riskScore) external {
        // In production, require msg.sender to be the Somnia protocol
        latestCommodityRiskScore = _riskScore;
        
        // If risk is high, this would emit an event to wake up Agent 2 (Risk Strategist)
    }
}