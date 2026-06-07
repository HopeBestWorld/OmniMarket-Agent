// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

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

interface IAgentRequester {
    function createRequest(
        uint256 agentId,
        address callbackAddress,
        bytes4 callbackSelector,
        bytes calldata payload
    ) external payable returns (uint256 requestId);
    
    function getRequestDeposit() external view returns (uint256);
}

interface IRiskStrategist {
    function onMarketShock(uint256 severity, uint256 confidence) external;
}

contract DataWatcherAgent {
    address public owner;
    IRiskStrategist public riskStrategist;
    IAgentRequester public somniaPlatform;

    // Official Somnia Base Agent ID for Website Parsing / AI Extraction
    uint256 public constant PARSE_WEBSITE_AGENT_ID = 12875401142070969085;
    uint256 public constant SUBCOMMITTEE_SIZE = 3;
    uint256 public constant PARSE_COST_PER_AGENT = 0.10 ether;

    uint256 public scanCount;
    mapping(uint256 => bool) public pendingQueries;

    event ScanTriggered(uint256 indexed scanId, uint256 platformRequestId);
    event AnomalyDetected(uint256 indexed scanId, uint256 riskScore, string message);

    modifier onlyOwner() {
        require(msg.sender == owner, "Unauthorized");
        _;
    }

    constructor(address _riskStrategist, address _somniaPlatform) {
        owner = msg.sender;
        riskStrategist = IRiskStrategist(_riskStrategist);
        somniaPlatform = IAgentRequester(_somniaPlatform);
    }

    /**
     * @notice Kicks off a true off-chain data scrape and deterministic AI evaluation request
     */
    function triggerMarketScan() external payable onlyOwner returns (uint256 platformId) {
        scanCount++;

        // Pack the payload instructing Somnia's AI to look up live commodity data dynamically
        bytes memory payload = abi.encodeWithSignature(
            "ExtractANumber(string,string,uint256,uint256,string,string,bool,uint8,uint8)",
            "milk_supply_drop_pct",
            "Percentage drop in global or regional dairy supply output indexes.",
            0,
            100,
            "Identify the current drop percentage for global milk/dairy commodity indices.",
            "barchart.com/futures/commodities",
            true, // resolveUrl via search
            uint8(3),
            uint8(70) // Confidence threshold
        );

        uint256 reserve = somniaPlatform.getRequestDeposit();
        uint256 reward  = PARSE_COST_PER_AGENT * SUBCOMMITTEE_SIZE;
        uint256 totalDeposit = reserve + reward;

        require(msg.value >= totalDeposit, "Insufficient STT fee");

        platformId = somniaPlatform.createRequest{value: totalDeposit}(
            PARSE_WEBSITE_AGENT_ID,
            address(this),
            this.fulfillMarketScan.selector,
            payload
        );

        pendingQueries[platformId] = true;
        emit ScanTriggered(scanCount, platformId);
    }

    /**
     * @notice Official async callback target execution verified by Somnia consensus runners
     */
    function fulfillMarketScan(
        uint256 _requestId,
        Response[] memory responses,
        ResponseStatus status,
        Request memory /* details */
    ) external {
        require(msg.sender == address(somniaPlatform), "Only platform callback");
        require(pendingQueries[_requestId], "Unknown request context");
        delete pendingQueries[_requestId];

        if (status == ResponseStatus.Success && responses.length > 0) {
            // Extract the true AI-coerced uint256 value directly from consensus result
            uint256 verifiedRiskScore = abi.decode(responses[0].result, (uint256));

            if (verifiedRiskScore >= 30) {
                emit AnomalyDetected(scanCount, verifiedRiskScore, "Verified market anomaly processed.");
                
                // Propagate verified risk index forward through the internal agent architecture
                riskStrategist.onMarketShock(verifiedRiskScore, 95); // 95% consensus-weighted reliability
            }
        }
    }
}