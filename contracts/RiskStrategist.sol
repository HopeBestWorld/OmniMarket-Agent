// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IActionTaker {
    function executeHedge(uint256 hedgeBps) external;
}

contract RiskStrategist {
    address public owner;
    address public dataWatcher;
    IActionTaker public actionTaker;

    uint256 public constant MAX_HEDGE_BPS = 10_000;
    uint256 public shockCount;

    event ShockReceived(uint256 shockId, uint256 severity, uint256 confidence);
    event HedgeTriggered(uint256 shockId, uint256 hedgeBps);

    modifier onlyDataWatcher() {
        require(msg.sender == dataWatcher, "Unauthorized");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Unauthorized");
        _;
    }

    constructor(address _actionTaker) {
        owner = msg.sender;
        actionTaker = IActionTaker(_actionTaker);
    }

    function setDataWatcher(address _dataWatcher) external onlyOwner {
        dataWatcher = _dataWatcher;
    }

    function onMarketShock(
        uint256 severity,
        uint256 confidence
    ) external onlyDataWatcher {
        shockCount++;
        emit ShockReceived(shockCount, severity, confidence);

        uint256 hedgeBps = _calculateHedge(severity, confidence);

        if (hedgeBps > 0) {
            actionTaker.executeHedge(hedgeBps);
            emit HedgeTriggered(shockCount, hedgeBps);
        }
    }

    function _calculateHedge(
        uint256 severity,
        uint256 confidence
    ) internal pure returns (uint256) {
        if (confidence < 70 || severity < 30) return 0;

        uint256 hedge = severity * 100;
        return hedge > MAX_HEDGE_BPS ? MAX_HEDGE_BPS : hedge;
    }
}