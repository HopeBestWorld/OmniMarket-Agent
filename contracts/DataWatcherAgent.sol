// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ISomniaAgent {
    function requestJsonApi(
        string calldata url,
        string calldata jsonPath
    ) external returns (uint256 requestId);
}

interface IRiskStrategist {
    function onMarketShock(uint256 severity, uint256 confidence) external;
}

contract DataWatcherAgent {
    ISomniaAgent public somniaAgent;
    IRiskStrategist public riskStrategist;
    address public owner;

    uint256 public latestCommodityRiskScore;

    event ScanTriggered(uint256 requestId, string apiUrl);
    event AnomalyDetected(uint256 riskScore, string message);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    constructor(
        address _somniaAgentAddress,
        address _riskStrategist
    ) {
        somniaAgent = ISomniaAgent(_somniaAgentAddress);
        riskStrategist = IRiskStrategist(_riskStrategist);
        owner = msg.sender;
    }

    function triggerMarketScan(
        string memory apiUrl,
        string memory jsonPathToRiskScore
    ) external onlyOwner {
        uint256 reqId =
            somniaAgent.requestJsonApi(apiUrl, jsonPathToRiskScore);

        emit ScanTriggered(reqId, apiUrl);
    }

    function fulfillMarketScan(
        uint256,
        uint256 riskScore
    ) external {
        latestCommodityRiskScore = riskScore;

        if (riskScore > 80) {
            emit AnomalyDetected(
                riskScore,
                "High Risk Detected — Escalating to Risk Strategist"
            );

            // 🔥 REAL AGENT-TO-AGENT CALL
            riskStrategist.onMarketShock(
                riskScore,   // severity
                90           // confidence (example)
            );
        }
    }
}