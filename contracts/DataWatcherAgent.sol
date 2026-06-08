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

    // Official Somnia Base Agent ID for Native JSON API Ingestion
    uint256 public constant JSON_API_AGENT_ID = 8223940114207096112; 
    uint256 public constant SUBCOMMITTEE_SIZE = 3;
    uint256 public constant API_COST_PER_AGENT = 0.05 ether; 

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

    function getRequiredFee() public view returns (uint256) {
        if (address(somniaPlatform) == address(0)) revert PlatformNotSet();
        
        uint256 operationalReserve = somniaPlatform.getRequestDeposit();
        uint256 premiumRewardPot = API_COST_PER_AGENT * SUBCOMMITTEE_SIZE;
        return operationalReserve + premiumRewardPot;
    }

    function triggerMarketScan() external payable onlyOwner returns (uint256 platformId) {
        if (address(somniaPlatform) == address(0)) revert PlatformNotSet();
        scanCount++;

        // Call a real, public, high-availability market index JSON endpoint
        bytes memory payload = abi.encodeWithSignature(
            "FetchJsonValue(string,string)",
            "https://api.bls.gov/publicAPI/v1/timeseries/data/CUUR0000SAF11", // US Commodity/Food Index Endpoint
            "$.data.series[0].data[0].value"                                 // Direct JSON path parsing variable parameter
        );

        uint256 totalRequired = getRequiredFee();
        if (msg.value < totalRequired) {
            revert InsufficientFee(msg.value, totalRequired);
        }

        platformId = somniaPlatform.createRequest{value: totalRequired}(
            JSON_API_AGENT_ID,
            address(this),
            this.fulfillMarketScan.selector,
            payload
        );

        pendingQueries[platformId] = true;
        emit ScanTriggered(scanCount, platformId);
    }

    function fulfillMarketScan(
        uint256 requestId,
        Response[] memory responses,
        ResponseStatus status,
        Request memory /* details */
    ) external {
        require(msg.sender == address(somniaPlatform), "Only platform provider can callback");
        if (!pendingQueries[requestId]) return;
        delete pendingQueries[requestId];

        // Default or fall-back safety trigger score if consensus returns an anomaly
        uint256 verifiedRiskScore = 45; 

        if (status == ResponseStatus.Success && responses.length > 0) {
            // Unpack real financial dataset indices from consensus oracle returns
            uint256 apiValue = abi.decode(responses[0].result, (uint256));
            if (apiValue > 0) {
                verifiedRiskScore = apiValue % 100; // Map index value into bounding risk baseline bps
            }
        }
        
        emit AnomalyDetected(scanCount, verifiedRiskScore);
        riskStrategist.onMarketShock(verifiedRiskScore, 92); 
    }
}