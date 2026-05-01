// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

interface IFlagEngine {
    function resolveFlag(uint256 flagId) external;
}

contract AuditTrail is AccessControl {
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");

    struct Block {
        bytes32 prevHash;
        bytes32 merkleRoot;
        uint256 timestamp;
        bytes32 blockHash;
    }

    struct Resolution {
        uint256 flagId;
        address auditor;
        string notes;
        uint256 timestamp;
    }

    Block[] public chain;
    mapping(uint256 => Resolution) public resolutions;
    
    address public fundTransferContract;
    IFlagEngine public flagEngine;

    event FlagResolved(uint256 indexed flagId, address auditor, string notes);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        // Initial genesis block
        chain.push(Block({
            prevHash: 0,
            merkleRoot: 0,
            timestamp: block.timestamp,
            blockHash: keccak256(abi.encodePacked(uint256(0), uint256(0), block.timestamp))
        }));
    }

    function setContracts(address _fundTransfer, address _flagEngine) external onlyRole(DEFAULT_ADMIN_ROLE) {
        fundTransferContract = _fundTransfer;
        flagEngine = IFlagEngine(_flagEngine);
    }

    function logTransaction(uint256 txId) external {
        require(msg.sender == fundTransferContract, "Only FundTransfer can log");
        
        Block storage lastBlock = chain[chain.length - 1];
        bytes32 prevHash = lastBlock.blockHash;
        
        // In a real system, we'd batch transactions. For this demo, 1 tx = 1 block for the audit trail.
        bytes32 merkleRoot = keccak256(abi.encodePacked(txId));
        uint256 timestamp = block.timestamp;
        bytes32 blockHash = keccak256(abi.encodePacked(prevHash, merkleRoot, timestamp));

        chain.push(Block({
            prevHash: prevHash,
            merkleRoot: merkleRoot,
            timestamp: timestamp,
            blockHash: blockHash
        }));
    }

    function resolveFlag(uint256 flagId, string memory notes) external onlyRole(AUDITOR_ROLE) {
        resolutions[flagId] = Resolution({
            flagId: flagId,
            auditor: msg.sender,
            notes: notes,
            timestamp: block.timestamp
        });
        
        flagEngine.resolveFlag(flagId);
        emit FlagResolved(flagId, msg.sender, notes);
    }

    function verifyChain() external view returns (bool) {
        for (uint256 i = 1; i < chain.length; i++) {
            bytes32 calculatedHash = keccak256(abi.encodePacked(chain[i].prevHash, chain[i].merkleRoot, chain[i].timestamp));
            if (calculatedHash != chain[i].blockHash || chain[i].prevHash != chain[i-1].blockHash) {
                return false;
            }
        }
        return true;
    }

    function getChainLength() external view returns (uint256) {
        return chain.length;
    }
}
