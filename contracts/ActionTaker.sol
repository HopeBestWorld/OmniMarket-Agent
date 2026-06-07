// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IRWAIndexVault {
    function deposit() external payable;
}

contract ActionTaker {
    address public owner;
    address public riskStrategist;
    IRWAIndexVault public vault;

    modifier onlyRiskStrategist() {
        require(msg.sender == riskStrategist, "Unauthorized");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Unauthorized");
        _;
    }

    constructor(address _vault) {
        owner = msg.sender;
        vault = IRWAIndexVault(_vault);
    }

    function setRiskStrategist(address _riskStrategist) external onlyOwner {
        riskStrategist = _riskStrategist;
    }

    receive() external payable {}

    function executeHedge(uint256 hedgeBps)
        external
        onlyRiskStrategist
    {
        require(hedgeBps > 0, "Invalid hedge");

        uint256 amount = address(this).balance * hedgeBps / 10_000;
        require(amount > 0, "No funds");

        vault.deposit{value: amount}();
    }
}