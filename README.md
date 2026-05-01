# ChainLedger: NGO Fund Transparency System

A full-stack blockchain solution to track public fund flow end-to-end on a tamper-proof ledger with multi-role access and automatic flagging of suspicious transactions.
 

## Tech Stack
- **Blockchain**: Solidity, Hardhat, Ethers.js
- **Backend**: Node.js, Express, MongoDB, Multer
- **Frontend**: React, Tailwind CSS, i18next (English + Kannada)
- **Auth**: MetaMask (Admin/Auditor) | Email+JWT (Public)

## Features
- **Multi-Signature Transfers**: Transactions require 2-of-2 admin approval.
- **Smart Flagging Engine**: 
  - `velocity_breach`: >3 transfers to same receiver in 7 days.
  - `round_number_suspicious`: Large round amounts (>25k and multiple of 10k).
  - `new_payee_large_transfer`: New receiver getting >40% of monthly budget.
- **Audit Trail**: Immutable hash chain with verification and auditor resolution.
- **Multi-lingual**: Full English and Kannada support.

---

## Setup Instructions

### 1. Install Dependencies
Run in root, backend, and frontend:
```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 2. Start Blockchain Node
Open a terminal in the root directory:
```bash
npx hardhat node
```
*Note: Keep this running. It will print 20 private keys. Import the first three into MetaMask.*

### 3. Deploy Contracts
In a new terminal:
```bash
npx hardhat run scripts/deploy.js --network localhost
```

### 4. Seed Demo Data
Populate the ledger and MongoDB with sample transactions:
```bash
npx hardhat run scripts/seed.js --network localhost
```

### 5. Start Backend
```bash
cd backend
npm start
```
*Make sure MongoDB is running locally.*

### 6. Start Frontend
```bash
cd frontend
npm run dev
```

### 7. MetaMask Setup
1. Add a custom network:
   - Name: `Hardhat Localhost`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - Currency: `ETH`
2. Import accounts from Hardhat:
   - **Admin 1**: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
   - **Admin 2**: `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`
   - **Auditor**: `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a`

---

## Demo Scenarios
1. **Landing**: View chain integrity status (Green badge).
2. **Public**: Browse ledger, expand rows to see hashes, toggle language to Kannada.
3. **Admin**: Log in with Admin 1, submit a new transfer. Log in with Admin 2 to approve it.
4. **Auditor**: Log in with Auditor wallet to see flagged transactions and resolve them.
