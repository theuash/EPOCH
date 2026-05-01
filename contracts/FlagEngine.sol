// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract FlagEngine is Ownable {
    struct Flag {
        uint256 flagId;
        uint256 txId;
        string ruleTriggered;
        uint256 timestamp;
        bool resolvedByAuditor;
    }

    uint256 public nextFlagId;
    mapping(uint256 => Flag) public flags;
    
    // Tracking for rules
    mapping(address => uint256[]) public receiverTransferTimestamps;
    mapping(address => bool) public hasReceivedBefore;
    
    // Month tracking for Rule 3: monthId (year*12 + month) => totalDisbursement
    mapping(uint256 => uint256) public monthlyTotal;

    address public fundTransferContract;

    event FlagRaised(uint256 indexed flagId, uint256 indexed txId, string ruleTriggered);
    event Flagged(uint256 indexed txId, string reason, uint256 spend, uint256 budgetLimit);

    constructor() Ownable(msg.sender) {}

    function setFundTransferContract(address _addr) external onlyOwner {
        fundTransferContract = _addr;
    }

    function runFlagChecks(uint256 txId, address receiver, uint256 amount, uint256 timestamp) external {
        require(msg.sender == fundTransferContract, "Only FundTransfer can trigger");

        // Rule 1: Velocity
        uint256[] storage timestamps = receiverTransferTimestamps[receiver];
        timestamps.push(timestamp);
        uint256 countIn7Days = 0;
        for (uint256 i = timestamps.length; i > 0; i--) {
            if (timestamps[i-1] >= timestamp - 7 days) {
                countIn7Days++;
            } else {
                break;
            }
        }
        if (countIn7Days > 3) {
            _raiseFlag(txId, "velocity_breach", timestamp);
        }

        // Rule 2: Round Number
        if (amount > 25000 && (amount % 10000 == 0)) {
            _raiseFlag(txId, "round_number_suspicious", timestamp);
        }

        // Rule 3: New Payee Large Transfer
        uint256 monthId = timestamp / 30 days; // Simple month approx for demo
        uint256 currentMonthTotal = monthlyTotal[monthId];
        
        if (!hasReceivedBefore[receiver]) {
            if (currentMonthTotal > 0 && amount > (currentMonthTotal * 40 / 100)) {
                _raiseFlag(txId, "new_payee_large_transfer", timestamp);
            }
        }
        
        // Update state after check
        hasReceivedBefore[receiver] = true;
        monthlyTotal[monthId] += amount;
    }

    // Case 1: Overspend Check - spend exceeds budget * 3
    function checkOverspend(uint256 txId, uint256 spend, uint256 budget) external {
        require(spend <= budget * 3, "Flag: Overspend");
        emit Flagged(txId, "overspend_breach", spend, budget * 3);
    }

    function _raiseFlag(uint256 txId, string memory rule, uint256 timestamp) internal {
        uint256 flagId = nextFlagId++;
        flags[flagId] = Flag({
            flagId: flagId,
            txId: txId,
            ruleTriggered: rule,
            timestamp: timestamp,
            resolvedByAuditor: false
        });
        emit FlagRaised(flagId, txId, rule);
    }

    function resolveFlag(uint256 flagId) external {
        // This will be called by AuditTrail or another authorized contract
        flags[flagId].resolvedByAuditor = true;
    }
}
