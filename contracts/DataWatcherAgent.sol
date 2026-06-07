// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/* ===================== PLATFORM TYPE DEFINITIONS ===================== */
enum ConsensusType { Majority, Threshold }
enum ResponseStatus { None, Pending, Success, Failed, TimedOut }

struct Response {
    address validator;
    bytes result;
    ResponseStatus status;
    uint256 receipt;
    uint256 timestamp;
    uint256 executionCost;
}

struct Request {
    uint256 id;
    address requester;
    address callbackAddress;
    bytes4 callbackSelector;
    address[] subcommittee;
    Response[] responses;
    uint256 responseCount;
    uint256 failureCount;
    uint256 threshold;
    uint256 createdAt;
    uint256 deadline;
    ResponseStatus status;
    ConsensusType consensusType;
    uint256 remainingBudget;
    uint256 perAgentBudget;
}

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

    // Official platform configuration parameters
    uint256 public constant PARSE_WEBSITE_AGENT_ID = 12875401142070969085;
    uint256 public constant SUBCOMMITTEE_SIZE = 3;
    uint256 public constant PARSE_COST_PER_AGENT = 0.10 ether; // Flat rate for Website Extraction runners

    /* ===================== EVENTS ===================== */
    event ScanTriggered(uint256 indexed scanId, uint256 platformRequestId);
    event AnomalyDetected(uint256 indexed scanId, uint256 riskScore);

    error NotOwner(address caller);
    error PlatformNotSet();
    error InsufficientFee(uint256 sent, uint256 required);

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
       TYPE-SAFE FEE CALCULATION
       ===================================================== */
    function getRequiredFee() external view returns (uint256) {
        if (address(somniaPlatform) == address(0)) revert PlatformNotSet();
        
        uint256 operationalReserve = somniaPlatform.getRequestDeposit();
        uint256 premiumRewardPot = PARSE_COST_PER_AGENT * SUBCOMMITTEE_SIZE;
        return operationalReserve + premiumRewardPot;
    }

    /* =====================================================
       MAIN ENTRYPOINT
       ===================================================== */
    function triggerMarketScan() external payable onlyOwner returns (uint256 platformId) {
        if (address(somniaPlatform) == address(0)) revert PlatformNotSet();
        scanCount++;

        // Target real dynamic data vectors on-chain without hardcoded values
        bytes memory payload = abi.encodeWithSignature(
            "ExtractANumber(string,string,uint256,uint256,string,string,bool,uint8,uint8)",
            "milk_supply_drop_pct",
            "Percentage reduction metrics in global dairy supply output indices.",
            uint256(0),
            uint256(100),
            "Identify current drops across global milk commodity index datasets.",
            "barchart.com/futures/commodities",
            true, // resolve URL via platform automated search parameters
            uint8(3),
            uint8(70)
        );

        uint256 reserve = somniaPlatform.getRequestDeposit();
        uint256 reward = PARSE_COST_PER_AGENT * SUBCOMMITTEE_SIZE;
        uint256 totalRequired = reserve + reward;

        if (msg.value < totalRequired) {
            revert InsufficientFee(msg.value, totalRequired);
        }

        // Call the platform architecture using the corrected standardized callback handler selector
        platformId = somniaPlatform.createRequest{value: totalRequired}(
            PARSE_WEBSITE_AGENT_ID,
            address(this),
            this.fulfillMarketScan.selector,
            payload
        );

        pendingQueries[platformId] = true;
        emit ScanTriggered(scanCount, platformId);
    }

    /* =====================================================
       STANDARDIZED SOMNIA CALLBACK HANDLER
       ===================================================== */
    function fulfillMarketScan(
        uint256 requestId,
        Response[] memory responses,
        ResponseStatus status,
        Request memory /* details */
    ) external {
        require(msg.sender == address(somniaPlatform), "Only platform provider can callback");
        if (!pendingQueries[requestId]) return;
        delete pendingQueries[requestId];

        if (status == ResponseStatus.Success && responses.length > 0) {
            // Unpack real data parsed via consensus nodes directly into internal application layers
            uint256 verifiedRiskScore = abi.decode(responses[0].result, (uint256));
            
            emit AnomalyDetected(scanCount, verifiedRiskScore);

            // Execute downstream pipeline interaction natively
            riskStrategist.onMarketShock(verifiedRiskScore, 95); 
        }
    }
}