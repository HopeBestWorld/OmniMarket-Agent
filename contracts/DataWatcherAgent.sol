// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ISomniaAgent {
    function requestJsonApi(string calldata url, string calldata jsonPath) external returns (uint256 requestId);
}

contract DataWatcherAgent {
    ISomniaAgent public somniaAgent;
    address public owner;
    uint256 public latestCommodityRiskScore;

    // NEW: Events tell the React frontend when things happen
    event ScanTriggered(uint256 requestId, string apiUrl);
    event AnomalyDetected(uint256 riskScore, string message);

    constructor(address _somniaAgentAddress) {
        somniaAgent = ISomniaAgent(_somniaAgentAddress);
        owner = msg.sender;
    }

    function triggerMarketScan(string memory apiUrl, string memory jsonPathToRiskScore) public {
        require(msg.sender == owner, "Only authorized trigger");
        uint256 reqId = somniaAgent.requestJsonApi(apiUrl, jsonPathToRiskScore);
        
        // Broadcast that the scan started
        emit ScanTriggered(reqId, apiUrl);
    }

    function fulfillMarketScan(uint256 _requestId, uint256 _riskScore) external {
        latestCommodityRiskScore = _riskScore;
        
        // If the risk score is unusually high (e.g., above 80), wake up Agent 2
        if (_riskScore > 80) {
            emit AnomalyDetected(_riskScore, "High Risk: Waking up Agent 2 (Risk Strategist)");
        }
    }
}