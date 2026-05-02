# Secure Node — NGO Fund Transparency Platform

A full-stack blockchain application that tracks every rupee of public NGO funding — end-to-end, tamper-proof, and open to all citizens. Built for accountability, powered by Ethereum smart contracts.

---

## Overview

Secure Node solves a real problem: billions of rupees donated to NGOs across India go untracked every year. Donors have no way to verify how their money was used, auditors work with editable spreadsheets, and the public has no window into fund utilisation.

This platform puts every NGO transaction on a blockchain ledger that nobody — not even the platform itself — can alter after the fact. Three roles keep each other in check: admins submit transactions, auditors review and resolve flags, and the public can verify every entry in real time.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Blockchain | Solidity 0.8.20, Hardhat 3, Ethers.js 6 |
| Smart Contracts | OpenZeppelin Contracts 5 (AccessControl, Ownable) |
| Backend | Node.js, Express 5, MongoDB (Atlas), Mongoose 9 |
| Frontend | React 19, Vite 8, Tailwind CSS 4 |
| Maps | Leaflet 1.9 + react-leaflet 5 (OpenStreetMap, no API key) |
| Auth | MetaMask wallet signatures + JWT (email demo login) |
| i18n | i18next — English and Kannada |
| Charts | Recharts |

---

## Smart Contracts

Three contracts work together on the Hardhat local network:

### `FundTransfer.sol`
- Requires **2-of-2 admin approval** before a transaction commits
- Stores receiver, amount, category, document hash, and description on-chain
- Triggers `FlagEngine` and `AuditTrail` automatically on approval

### `FlagEngine.sol`
- Runs three automatic fraud detection rules on every approved transaction:
  - **Velocity breach** — more than 3 transfers to the same receiver within 7 days
  - **Round number suspicious** — amount > ₹25,000 and divisible by ₹10,000
  - **New payee large transfer** — new receiver getting > 40% of the monthly budget
- Flags are stored on-chain and can be resolved by an auditor

### `AuditTrail.sol`
- Maintains an immutable hash chain — every block linked to the previous via SHA-256
- Auditors call `resolveFlag()` with notes, stored permanently
- `verifyChain()` returns `true` if the chain is intact, `false` if tampered

---

## Application Roles

| Role | Access | Login Method |
|---|---|---|
| **Admin** | Submit & approve transactions, manage projects, add milestone transactions | MetaMask wallet or demo email |
| **Auditor** | Review all transactions, approve/reject milestones, raise NGO inquiries, manage suspected NGOs | Email login only |
| **Donor** | View personal transaction history, add transactions by ID, trace NGO spend workflow | MetaMask wallet or demo email |
| **Public** | View all transactions, live fund flow map, this-week stats, recent activity | No login required |

---

## Pages

| Page | Route | Access |
|---|---|---|
| Landing | `/` | Public |
| Login | `/login` | Public |
| Public Dashboard | `/public-dashboard` | Public |
| NGO Fund Spend | `/ngo-spend-public` | Public |
| Public View (map + stats) | `/auditor-public` | Auditor |
| Admin Dashboard | `/admin-dashboard` | Admin |
| Auditor Dashboard | `/auditor-home` | Auditor |
| NGO Fund Spend (extended) | `/auditor-ngo` | Auditor |
| Donor History | `/donor-history` | Auditor |
| My Transactions | `/my-transactions` | Donor |
| Judges Dashboard | `/judges` | Public |

---

## Key Features

### Fraud Detection (Backend + Smart Contract)
Five rules run on every new transaction submission:
1. **Overspend** — amount > 3× average monthly budget
2. **No milestone approval** — missing approval combined with high spend or vendor risk
3. **Vendor lock-in** — same vendor used in > 80% of an NGO's transactions
4. **Round number** — amount > ₹25,000 and divisible by ₹10,000
5. **Phantom project** — overspend ≥ 5× with no milestone approval

### Suspected NGOs Tab
- Auto-lists any NGO with at least one flagged transaction
- Auditors can manually add NGOs under investigation with a reason
- Suspicion level (LOW / MEDIUM / HIGH) calculated from flagged transaction ratio
- Persisted in localStorage, visible to all roles

### Donor Workflow
- Donors add transactions by entering a Transaction ID from their receipt
- After adding, they can view the full spend workflow of that NGO — every transaction that NGO has ever made, with their donation highlighted in the timeline

### Auditor Inquiry System
- Auditors can raise questions on any transaction directly from the dashboard
- Questions are logged with timestamp and auditor name
- Approve / Reject milestone with audit notes — stored in MongoDB

### Live Fund Flow Map
- Real Leaflet map centred on India using OpenStreetMap tiles (no API key needed)
- Animated flow lines between cities — green for clean, red for flagged
- Click any line or the Active Flows panel to highlight the route

### Bilingual UI
- Full English and Kannada support via i18next
- Toggle in the navbar — persists across navigation

---

## Project Structure

```
├── contracts/                  # Solidity smart contracts
│   ├── FundTransfer.sol
│   ├── FlagEngine.sol
│   └── AuditTrail.sol
├── scripts/                    # Hardhat deployment & seed scripts
│   ├── deploy.js
│   ├── seed.js
│   └── direct_seed.js
├── backend/
│   ├── models/                 # Mongoose schemas
│   │   ├── NgoTransaction.js   # Main transaction model (with audit fields)
│   │   ├── DisasterTransaction.js
│   │   ├── TransactionMeta.js
│   │   └── User.js
│   ├── routes/                 # Express API routes
│   │   ├── ngoTransactions.js  # CRUD + fraud detection + audit + inquiries
│   │   ├── disasterTransactions.js
│   │   ├── transactions.js     # On-chain transaction routes
│   │   ├── flags.js            # Smart contract flag resolution
│   │   ├── auth.js             # JWT + MetaMask wallet login
│   │   └── upload.js           # File upload + SHA-256 hashing
│   ├── scripts/
│   │   ├── seedAll.js          # Seeds NGO + disaster transactions
│   │   └── migrateAuditFields.js
│   ├── services/
│   │   └── blockchainService.js
│   └── server.js
├── frontend/
│   └── src/
│       ├── pages/              # All React page components
│       ├── components/         # Navbar
│       ├── context/            # AuthContext, Web3Context
│       ├── data/               # Local JSON seed data (fallback)
│       ├── i18n/               # en.js, kn.js translations
│       └── services/           # FlagService.js
└── hardhat.config.js
```

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- MetaMask browser extension (optional — demo login works without it)

### 1. Clone and Install

```bash
# Root (Hardhat + contracts)
npm install

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 2. Environment Variables

**`backend/.env`**
```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/secure_node
JWT_SECRET=your_secret_key
PORT=5000
HARDHAT_URL=http://127.0.0.1:8545
ADMIN1_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
ADMIN2_PRIVATE_KEY=0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
AUDITOR_PRIVATE_KEY=0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a
ADMIN_WALLETS=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266,0x70997970C51812dc3A010C7d01b50e0d17dc79C8
AUDITOR_WALLETS=0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
```

### 3. Start the Blockchain Node

```bash
# In the project root — keep this terminal open
npx hardhat node
```

This prints 20 test accounts with private keys. The first three are pre-configured as Admin 1, Admin 2, and Auditor.

### 4. Deploy Smart Contracts

```bash
npx hardhat run scripts/deploy.js --network localhost
```

Contract addresses are written automatically to `frontend/src/contracts/addresses.json`.

### 5. Seed the Database

```bash
cd backend
npm run seed
```

This seeds **27 NGO transactions** (20 legit, 7 flagged) and **20 disaster relief transactions** (7 legit, 13 flagged) into MongoDB.

If you've previously seeded and need to add the audit fields to existing documents:

```bash
npm run migrate
```

### 6. Start the Backend

```bash
cd backend
npm run dev      # development (nodemon)
# or
npm start        # production
```

Backend runs on `http://localhost:5000`.

### 7. Start the Frontend

```bash
cd frontend
npm run dev
```

Frontend runs on `http://localhost:5174`. The Vite dev server proxies all `/api` requests to the backend automatically.

---

## Demo Login Credentials

No MetaMask required — use these email credentials on the login page:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@example.com` | any |
| Auditor | `auditor@example.com` | any |
| Donor | `donor@example.com` | any |

For MetaMask wallet login (Admin / Donor only):

| Role | Private Key |
|---|---|
| Admin 1 | `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80` |
| Admin 2 | `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d` |
| Auditor | `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a` |

MetaMask network settings:
- **RPC URL**: `http://127.0.0.1:8545`
- **Chain ID**: `31337`
- **Currency**: ETH

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/ngo-transactions` | All NGO transactions (with audit fields) |
| `GET` | `/api/ngo-transactions/legit` | Non-flagged transactions only |
| `POST` | `/api/ngo-transactions` | Create new milestone transaction (runs fraud detection) |
| `PATCH` | `/api/ngo-transactions/:txId/audit` | Approve or reject a milestone (auditor) |
| `POST` | `/api/ngo-transactions/:txId/inquire` | Raise a question on a transaction (auditor) |
| `GET` | `/api/disaster-transactions` | All disaster relief transactions |
| `GET` | `/api/disaster-transactions/flagged` | Flagged disaster transactions |
| `GET` | `/api/transactions` | On-chain transactions (via smart contract) |
| `POST` | `/api/transactions` | Submit transaction to blockchain (admin) |
| `GET` | `/api/flags` | Unresolved smart contract flags (auditor) |
| `POST` | `/api/flags/:id/resolve` | Resolve a flag via AuditTrail.sol (auditor) |
| `POST` | `/api/auth/login` | Email + password login |
| `POST` | `/api/auth/wallet-login` | MetaMask signature login |
| `POST` | `/api/upload` | Upload receipt file, returns SHA-256 hash |
| `GET` | `/api/chain/verify` | Chain integrity check |

---

## Demo Walkthrough

1. **Public** — Open `/ngo-spend-public` without logging in. Browse legit and flagged transactions. Switch to the Suspected NGOs tab.

2. **Admin** — Log in as `admin@example.com`. Go to Admin Dashboard → Projects tab → click "Add Milestone Transaction" on any project. Fill in vendor, amount, and description. Submit — the fraud detection engine runs immediately and shows the verdict.

3. **Auditor** — Log in as `auditor@example.com`. Go to Auditor Dashboard. Review pending transactions, approve or reject milestones, raise questions on suspicious entries. Go to NGO Spend → Suspected NGOs tab to add an NGO under investigation.

4. **Donor** — Log in as `donor@example.com`. Go to My Transactions. Click "Add Transaction" and enter a TX ID (e.g. `TX-001`). After adding, click "View NGO Workflow" on any row to trace the full spend history of that NGO.

5. **Public View** — Visit `/public-dashboard` for the live ledger explorer, or `/auditor-public` (as auditor) for the interactive fund flow map of India.

---

## Fraud Detection Rules Reference

| Rule | Condition | Flag Reason |
|---|---|---|
| Overspend | `amount > 3× avgMonthlyBudget` | `Spend Nx avg monthly budget (threshold: 3x)` |
| No milestone | `milestoneApproved = false` AND (overspend ≥ 1.5× OR vendor > 50% OR amount > ₹10,000) | `No milestone approval on record` |
| Vendor lock-in | `vendorRepeatPct > 80%` | `Vendor repeat rate N% exceeds 80% threshold` |
| Round number | `amount > ₹25,000` AND `amount % 10,000 = 0` | `Suspicious round-number transfer` |
| Phantom project | `overspendRatio ≥ 5` AND `milestoneApproved = false` | `Phantom project suspected` |

---

## License

MIT
