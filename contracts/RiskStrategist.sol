// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IActionTaker {
    function executeHedge(uint256 hedgeBps) external;
}

contract RiskStrategist {
    address public dataWatcher;
    address public actionTaker;

    uint256 public constant MAX_HEDGE_BPS = 10_000;
    uint256 public shockCount;

    struct ShockAssessment {
        uint256 severity;
        uint256 confidence;
        uint256 hedgeBps;
        uint256 timestamp;
    }

    mapping(uint256 => ShockAssessment) public assessments;

    event ShockReceived(uint256 shockId, uint256 severity, uint256 confidence);
    event HedgeCalculated(uint256 shockId, uint256 hedgeBps);
    event HedgeTriggered(uint256 shockId, uint256 hedgeBps);

    modifier onlyDataWatcher() {
        require(msg.sender == dataWatcher, "Unauthorized");
        _;
    }

    constructor(address _dataWatcher, address _actionTaker) {
        dataWatcher = _dataWatcher;
        actionTaker = _actionTaker;
    }

    function onMarketShock(
        uint256 severity,
        uint256 confidence
    ) external onlyDataWatcher {
        shockCount++;

        emit ShockReceived(shockCount, severity, confidence);

        uint256 hedgeBps = _calculateHedge(severity, confidence);

        assessments[shockCount] = ShockAssessment({
            severity: severity,
            confidence: confidence,
            hedgeBps: hedgeBps,
            timestamp: block.timestamp
        });

        emit HedgeCalculated(shockCount, hedgeBps);

        if (hedgeBps > 0) {
            IActionTaker(actionTaker).executeHedge{value: address(this).balance}(hedgeBps);
            emit HedgeTriggered(shockCount, hedgeBps);
        }
    }

    function _calculateHedge(
        uint256 severity,
        uint256 confidence
    ) internal pure returns (uint256) {
        if (confidence < 70 || severity < 30) return 0;

        uint256 hedge = severity * 100;
        if (hedge > MAX_HEDGE_BPS) hedge = MAX_HEDGE_BPS;

        return hedge;
    }
}