// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/* ============================
   RISK STRATEGIST INTERFACE
   ============================ */
interface IRiskStrategist {
    function onMarketShock(
        uint256 severity,
        uint256 confidence
    ) external;
}

/* ============================
   DATA WATCHER AGENT (AGENT 1)
   ============================ */
contract DataWatcherAgent {
    address public owner;
    IRiskStrategist public riskStrategist;

    uint256 public scanCount;

    /* ============================
       EVENTS (Frontend listens here)
       ============================ */
    event ScanTriggered(uint256 indexed scanId, string source);
    event AnomalyDetected(
        uint256 indexed scanId,
        uint256 riskScore,
        uint256 confidence,
        string message
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Unauthorized");
        _;
    }

    constructor(address _riskStrategist) {
        owner = msg.sender;
        riskStrategist = IRiskStrategist(_riskStrategist);
    }

    /* ============================
       AGENT ENTRYPOINT
       ============================ */
    function triggerMarketScan(
        string calldata source,
        uint256 riskScore,
        uint256 confidence
    ) external onlyOwner {
        scanCount++;

        emit ScanTriggered(scanCount, source);

        // Simple anomaly threshold (production logic can be upgraded)
        if (riskScore >= 30 && confidence >= 70) {
            emit AnomalyDetected(
                scanCount,
                riskScore,
                confidence,
                "Market anomaly detected"
            );

            // Wake Agent 2 (Risk Strategist)
            riskStrategist.onMarketShock(riskScore, confidence);
        }
    }
}