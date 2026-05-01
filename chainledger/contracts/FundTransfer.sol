// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

interface IFlagEngine {
    function runFlagChecks(uint256 txId, address receiver, uint256 amount, uint256 timestamp) external;
}

interface IAuditTrail {
    function logTransaction(uint256 txId) external;
}

contract FundTransfer is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    enum Category { Salary, Infrastructure, Medical, Education, Other }

    struct Transaction {
        uint256 txId;
        address sender;
        string receiverName;
        address receiverAddress;
        uint256 amountInRupees;
        Category category;
        uint256 timestamp;
        string documentHash;
        string description;
        bool isApproved;
        uint256 approvalCount;
    }

    uint256 public nextTxId;
    mapping(uint256 => Transaction) public transactions;
    mapping(uint256 => mapping(address => bool)) public hasApproved;

    IFlagEngine public flagEngine;
    IAuditTrail public auditTrail;

    event TransferLogged(
        uint256 indexed txId,
        address sender,
        address receiver,
        uint256 amount,
        Category category,
        uint256 timestamp,
        string documentHash
    );
    event TransactionSubmitted(uint256 indexed txId, address submittedBy);
    event TransactionApproved(uint256 indexed txId, address approvedBy);

    constructor(address _flagEngine, address _auditTrail) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        flagEngine = IFlagEngine(_flagEngine);
        auditTrail = IAuditTrail(_auditTrail);
    }

    function submitTransaction(
        string memory _receiverName,
        address _receiverAddress,
        uint256 _amountInRupees,
        Category _category,
        string memory _documentHash,
        string memory _description
    ) external onlyRole(ADMIN_ROLE) {
        uint256 txId = nextTxId++;
        transactions[txId] = Transaction({
            txId: txId,
            sender: msg.sender,
            receiverName: _receiverName,
            receiverAddress: _receiverAddress,
            amountInRupees: _amountInRupees,
            category: _category,
            timestamp: block.timestamp,
            documentHash: _documentHash,
            description: _description,
            isApproved: false,
            approvalCount: 1
        });

        hasApproved[txId][msg.sender] = true;
        emit TransactionSubmitted(txId, msg.sender);
    }

    function approveTransaction(uint256 txId) external onlyRole(ADMIN_ROLE) {
        require(!transactions[txId].isApproved, "Already approved");
        require(!hasApproved[txId][msg.sender], "Already approved by this admin");

        hasApproved[txId][msg.sender] = true;
        transactions[txId].approvalCount++;

        emit TransactionApproved(txId, msg.sender);

        if (transactions[txId].approvalCount >= 2) {
            transactions[txId].isApproved = true;
            
            // Trigger Flag Engine
            flagEngine.runFlagChecks(
                txId, 
                transactions[txId].receiverAddress, 
                transactions[txId].amountInRupees, 
                transactions[txId].timestamp
            );

            // Trigger Audit Trail
            auditTrail.logTransaction(txId);

            emit TransferLogged(
                txId,
                transactions[txId].sender,
                transactions[txId].receiverAddress,
                transactions[txId].amountInRupees,
                transactions[txId].category,
                transactions[txId].timestamp,
                transactions[txId].documentHash
            );
        }
    }

    function getTransaction(uint256 txId) external view returns (Transaction memory) {
        return transactions[txId];
    }
}
