// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IRWAIndexVault {
    function deposit() external payable;
}

contract ActionTaker {
    address public riskStrategist;
    IRWAIndexVault public vault;

    modifier onlyRiskStrategist() {
        require(msg.sender == riskStrategist, "Unauthorized");
        _;
    }

    constructor(address _riskStrategist, address _vault) {
        riskStrategist = _riskStrategist;
        vault = IRWAIndexVault(_vault);
    }

    function executeHedge(uint256 hedgeBps)
        external
        payable
        onlyRiskStrategist
    {
        require(hedgeBps > 0, "Invalid hedge");

        // For demo: hedge entire msg.value
        vault.deposit{value: msg.value}();
    }
}