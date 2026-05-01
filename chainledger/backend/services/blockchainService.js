const { ethers } = require('ethers');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const addresses = JSON.parse(fs.readFileSync(path.join(__dirname, '../../frontend/src/contracts/addresses.json')));
const FundTransferABI = JSON.parse(fs.readFileSync(path.join(__dirname, '../../frontend/src/contracts/FundTransfer.json'))).abi;
const FlagEngineABI = JSON.parse(fs.readFileSync(path.join(__dirname, '../../frontend/src/contracts/FlagEngine.json'))).abi;
const AuditTrailABI = JSON.parse(fs.readFileSync(path.join(__dirname, '../../frontend/src/contracts/AuditTrail.json'))).abi;

const provider = new ethers.JsonRpcProvider(process.env.HARDHAT_URL || 'http://127.0.0.1:8545');
const adminWallet = new ethers.Wallet(process.env.ADMIN1_PRIVATE_KEY, provider);

const fundTransfer = new ethers.Contract(addresses.FundTransfer, FundTransferABI, adminWallet);
const flagEngine = new ethers.Contract(addresses.FlagEngine, FlagEngineABI, provider);
const auditTrail = new ethers.Contract(addresses.AuditTrail, AuditTrailABI, provider);

module.exports = {
  provider,
  adminWallet,
  fundTransfer,
  flagEngine,
  auditTrail,
  addresses
};
