// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/* ===================== ERRORS ===================== */
error InsufficientFee(uint256 sent, uint256 required);
error NotOwner(address caller);

/* ===================== INTERFACES ===================== */
interface IAgentRequester {
    function createRequest(
        uint256 agentId,
        address callbackAddress,
        bytes4 callbackSelector,
        bytes calldata payload
    ) external payable returns (uint256);

    function getRequestDeposit() external view returns (uint256);
}

interface IRiskStrategist {
    function onMarketShock(uint256 severity, uint256 confidence) external;
}

/* ===================== CONTRACT ===================== */
contract DataWatcherAgent {
    address public owner;
    IRiskStrategist public riskStrategist;
    IAgentRequester public somniaPlatform;

    uint256 public scanCount;
    mapping(uint256 => bool) public pendingQueries;

    uint256 public constant SUBCOMMITTEE_SIZE = 3;

    /* ===================== EVENTS ===================== */
    event ScanTriggered(uint256 indexed scanId, uint256 platformRequestId);
    event DebugFee(uint256 reserve, uint256 reward, uint256 total);
    event DebugCaller(address caller, address owner);

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner(msg.sender);
        _;
    }

    constructor(address _riskStrategist, address _somniaPlatform) {
        owner = msg.sender;
        riskStrategist = IRiskStrategist(_riskStrategist);
        somniaPlatform = IAgentRequester(_somniaPlatform);
    }

    /* =====================================================
       ✅ FRONTEND-SAFE FEE QUOTE (NO HARDCODING)
       ===================================================== */
    function getRequiredFee() external view returns (uint256 total) {
        uint256 reserve = somniaPlatform.getRequestDeposit();
        uint256 reward = reserve * SUBCOMMITTEE_SIZE;
        return reserve + reward;
    }

    /* =====================================================
       MAIN ENTRYPOINT
       ===================================================== */
    function triggerMarketScan()
        external
        payable
        onlyOwner
        returns (uint256 platformId)
    {
        scanCount++;

        bytes memory payload = abi.encode(
            "milk_supply_drop_pct",
            "global dairy supply contraction"
        );

        uint256 reserve = somniaPlatform.getRequestDeposit();
        uint256 reward = reserve * SUBCOMMITTEE_SIZE;
        uint256 total = reserve + reward;

        emit DebugCaller(msg.sender, owner);
        emit DebugFee(reserve, reward, total);

        if (msg.value < total) {
            revert InsufficientFee(msg.value, total);
        }

        platformId = somniaPlatform.createRequest{value: total}(
            12875401142070969085,
            address(this),
            this.fulfillMarketScan.selector,
            payload
        );

        pendingQueries[platformId] = true;
        emit ScanTriggered(scanCount, platformId);
    }

    /* =====================================================
       SOMNIA CALLBACK (unchanged)
       ===================================================== */
    function fulfillMarketScan(
        uint256 requestId,
        bytes[] calldata responses
    ) external {
        // omitted for brevity
    }
}