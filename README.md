# Edenet — Blockchain Real Estate Registry

A full-stack, hybrid Web2 + Web3 property registration and trading platform.
Properties are minted as NFTs on-chain. All metadata and files are hashed,
stored in PostgreSQL, and verified against the blockchain at any time by anyone.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [How the Blockchain Integration Works](#2-how-the-blockchain-integration-works)
3. [System Architecture](#3-system-architecture)
4. [Backend — Clean MVC Structure](#4-backend--clean-mvc-structure)
5. [Frontend Structure](#5-frontend-structure)
6. [User Roles & Flows](#6-user-roles--flows)
7. [Key Workflows Step by Step](#7-key-workflows-step-by-step)
8. [Tamper-Proof Verification](#8-tamper-proof-verification)
9. [Rental System](#9-rental-system)
10. [Tech Stack](#10-tech-stack)
11. [Environment Variables](#11-environment-variables)
12. [Getting Started](#12-getting-started)

---

## 1. Project Overview

Edenet is a **government land registry system** built on blockchain. It solves
the core problem of traditional land registries: documents can be forged,
ownership records can be tampered with, and there is no transparent public
audit trail.

The system works by combining two layers:

- **Web2 layer (PostgreSQL + Express)** — stores the full property data, files,
  user accounts, KYC documents, and rental agreements. This layer is fast,
  searchable, and holds the raw file bytes for verification.

- **Web3 layer (Ethereum smart contract)** — stores only cryptographic hashes
  of property metadata and files. This makes the record immutable and publicly
  auditable without exposing private data on-chain.

When the two layers agree — the hash recomputed from the database matches the
hash stored on the blockchain — the property record is **tamper-proof**.

---

## 2. How the Blockchain Integration Works

### What goes on-chain vs off-chain

| Data | Where stored | Why |
|---|---|---|
| Property metadata (name, location, price…) | PostgreSQL | Fast queries, searchable, editable before approval |
| Property images and documents (raw bytes) | PostgreSQL (bytea) | Files are too large for on-chain storage |
| SHA-256 hash of each file | PostgreSQL + Blockchain | DB holds it for re-verification; chain commits it permanently |
| Merkle root of all image hashes | PostgreSQL + Blockchain | One hash commits to all images |
| Merkle root of all document hashes | PostgreSQL + Blockchain | One hash commits to all documents |
| Metadata JSON hash | PostgreSQL + Blockchain | Commits to all property fields at once |
| NFT ownership (who owns the property) | Blockchain only | Ownership is authoritative on-chain |
| Sale events | Blockchain events → PostgreSQL | Backend listens and syncs `ownerWallet` in DB |

### The hashing pipeline

Every time a property is submitted or updated, this pipeline runs:

```
Individual files
      │
      ▼
SHA-256(each file buffer)  →  stored in documents.sha256Hash
      │
      ▼
computeRootHash(imageHashes[])   →  imagesRootHash   (Merkle tree)
computeRootHash(documentHashes[]) →  documentsRootHash (Merkle tree)
      │
      ▼
hashMetadata({ name, location, price, ..., imagesRootHash, documentsRootHash, version })
      │
      ▼
metadataHash  →  stored in DB + committed on-chain via smart contract
```

The `computeRootHash` function builds a **binary Merkle tree**. Pairs of hashes
are concatenated and re-hashed level by level until a single root remains.
This means one root hash commits to every file, and changing any single file
changes the root.

The `hashMetadata` function sorts all JSON keys alphabetically before hashing,
so key order never affects the result. The same property always produces the
same hash.

### Smart contract role

The smart contract (`RealEstate.sol`) does not store any text or files.
It only stores:

- `bytes32 metadataHash` — the hash of all property fields combined
- `bytes32 imagesRootHash` — Merkle root of all image hashes
- `bytes32 documentsRootHash` — Merkle root of all document hashes
- `address owner` — who currently owns the property NFT
- Version history — every approved update creates a new version entry on-chain

The government wallet signs every approval transaction. Citizens cannot
write directly to the contract — they submit requests through the backend,
which the government reviews and then calls the contract.

### Ownership sync

When a property is sold on the marketplace, the smart contract emits a
`PropertySold` event. The backend listens for this event at startup and
automatically updates `ownerWallet` in PostgreSQL so the database stays
in sync with on-chain ownership.

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js 16)                    │
│                                                                  │
│  Browser / MetaMask                                              │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────────────┐ │
│  │  Redux Store │  │  Web3Context  │  │   Next.js App Router │ │
│  │  auth slice  │  │  ethers v6    │  │   /app pages         │ │
│  │  wallet slice│  │  BrowserProv. │  │   /components        │ │
│  │  kyc slice   │  │  Contract ABI │  │   /hooks             │ │
│  └──────┬───────┘  └───────┬───────┘  └──────────────────────┘ │
│         │                  │                                     │
│         │  REST API calls  │  Direct contract calls             │
└─────────┼──────────────────┼─────────────────────────────────────┘
          │                  │
          ▼                  ▼
┌─────────────────┐   ┌──────────────────────────────┐
│  BACKEND        │   │  BLOCKCHAIN (EVM)             │
│  Express + MVC  │   │                               │
│                 │   │  RealEstate.sol (NFT)         │
│  routes/        │   │  ┌────────────────────────┐  │
│  controllers/   │   │  │ - mintProperty()       │  │
│  services/      │   │  │ - approveRequest()     │  │
│  middleware/    │◄──┼──│ - approveUpdateRequest │  │
│  utils/         │   │  │ - properties[tokenId]  │  │
│  config/        │   │  │ - getMetadataVersions()│  │
│       │         │   │  │ - listForRent()        │  │
│       │         │   │  │ - rentProperty()       │  │
│       ▼         │   │  │ - PropertySold event   │  │
│  PostgreSQL     │   │  └────────────────────────┘  │
│  (Prisma ORM)   │   │                               │
│                 │   │  Marketplace.sol              │
│  Users, KYC     │   │  ┌────────────────────────┐  │
│  Properties     │   │  │ - listProperty()       │  │
│  Documents      │   │  │ - buyProperty()        │  │
│  Requests       │   │  │ - PropertySold event   │  │
│  Rentals        │   │  └────────────────────────┘  │
│  Notifications  │   │                               │
└─────────────────┘   └──────────────────────────────┘
```

The backend is the **only** party that calls the contract with write
permissions (using the government private key). The frontend calls the
contract directly only for citizen actions like buying, renting, and
submitting on-chain requests.

---

## 4. Backend — Clean MVC Structure

The backend follows a strict layered architecture. Each layer has one
responsibility and never reaches into the layer above it.

```
backend/
├── index.js                   ← boot: load env, connect DB, start server
├── src/
│   ├── app.js                 ← Express factory: CORS, routes, error handler
│   ├── config/
│   │   ├── db.js              ← singleton PrismaClient (import this everywhere)
│   │   └── env.js             ← validates required env vars at startup
│   ├── utils/
│   │   ├── hash.js            ← hashBuffer, hashMetadata, computeRootHash, toBytes32
│   │   ├── hash.test.js       ← 18 plain Node.js tests (npm run test:hash)
│   │   ├── email.js           ← nodemailer: OTP, KYC approval, KYC rejection
│   │   ├── contract.js        ← ethers v5 singletons + all on-chain call helpers
│   │   └── notifications.js   ← notifyUser, notifyAdmin, notifyUserByWallet
│   ├── middleware/
│   │   ├── auth.js            ← verifies JWT → attaches req.user
│   │   ├── requireAdmin.js    ← auth + GOV_WALLET check
│   │   ├── requireKyc.js      ← req.user.status === 'ACTIVE'
│   │   ├── upload.js          ← multer memory storage (property + KYC variants)
│   │   └── errorHandler.js    ← global Express error handler
│   ├── services/              ← ALL business logic and DB queries live here
│   │   ├── authService.js
│   │   ├── kycService.js
│   │   ├── propertyService.js
│   │   ├── adminService.js
│   │   ├── rentalService.js
│   │   ├── notificationService.js
│   │   └── verifyService.js
│   ├── controllers/           ← thin HTTP layer: reads req, calls service, sends res
│   │   ├── authController.js
│   │   ├── kycController.js
│   │   ├── propertyController.js
│   │   ├── adminController.js
│   │   ├── rentalController.js
│   │   ├── notificationController.js
│   │   └── verifyController.js
│   └── routes/                ← maps URLs to middleware + controller only
│       ├── auth.js
│       ├── kyc.js
│       ├── properties.js
│       ├── admin.js
│       ├── rentals.js
│       ├── notifications.js
│       └── verify.js
└── prisma/
    ├── schema.prisma          ← database models
    └── migrations/            ← migration history
```

### Layer responsibilities

**Routes** — know only about URLs and which middleware + controller to call.
No logic, no database access.

**Controllers** — know only about `req` and `res`. Extract inputs from the
request, call a service function, then call `res.json()` or `next(err)`.
Nothing else.

**Services** — contain all business logic. Validate inputs, call the database
via Prisma, call utils (hashing, email, contract), and return plain JavaScript
objects. No `req`, no `res`. Errors are thrown as plain `Error` objects with
a `.status` property so the error handler can set the right HTTP status code.

**Utils** — pure helpers. `hash.js` does cryptography. `contract.js` manages
ethers.js connections. `email.js` sends emails. `notifications.js` writes
notification rows. None of them know about Express.

**Config** — infrastructure setup only. `db.js` exports the single shared
Prisma instance. `env.js` crashes the process early if any required variable
is missing.

### Database schema (Prisma models)

| Model | Purpose |
|---|---|
| `User` | Account with email/password or Google OAuth, status, wallet |
| `OtpCode` | 6-digit email verification codes (hashed, expiring) |
| `KycDocument` | ID front/back + selfie uploaded during KYC (raw bytes) |
| `Property` | One row per property — all searchable fields mirrored from chain |
| `Document` | Raw file bytes for property images and deeds, never deleted |
| `MetadataVersion` | Every approved change creates a new immutable version row |
| `Request` | Citizen-submitted mint or update requests awaiting government review |
| `RentalAgreement` | Active and historical rental contracts |
| `RentPayment` | Individual rent payment records linked to a rental agreement |
| `Notification` | In-app notifications for citizens and admins |

### API routes

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/google
POST   /api/auth/verify-otp
POST   /api/auth/resend-otp
POST   /api/auth/connect-wallet
POST   /api/auth/disconnect-wallet
GET    /api/auth/me

POST   /api/kyc/upload
GET    /api/kyc/status

GET    /api/properties
GET    /api/properties/:id
GET    /api/properties/:id/images
GET    /api/properties/:id/documents
POST   /api/properties/request/prepare     ← step 1: hash files, return hashes
POST   /api/properties/request/confirm     ← step 2: after MetaMask confirms
POST   /api/properties/:id/update-request

GET    /api/admin/requests
POST   /api/admin/approve/:requestId
POST   /api/admin/decline/:requestId
GET    /api/admin/users
GET    /api/admin/kyc/pending
GET    /api/admin/kyc/:userId/documents/:docId
POST   /api/admin/kyc/:userId/approve
POST   /api/admin/kyc/:userId/reject
GET    /api/admin/analytics

GET    /api/verify/:tokenId                ← public, no auth

GET    /api/notifications
POST   /api/notifications/:id/read
POST   /api/notifications/read-all
DELETE /api/notifications/:id

POST   /api/rentals/list/:propertyId
POST   /api/rentals/unlist/:propertyId
POST   /api/rentals/rent/:propertyId
POST   /api/rentals/pay/:propertyId
POST   /api/rentals/terminate/:propertyId
POST   /api/rentals/finalize/:propertyId
GET    /api/rentals/:propertyId
GET    /api/rentals/history/:propertyId
GET    /api/rentals/tenant/:wallet
GET    /api/rentals/landlord/:wallet

GET    /api/health
```

---

## 5. Frontend Structure

```
frontend/
├── app/                       ← Next.js App Router pages
│   ├── page.tsx               ← landing page
│   ├── auth/login/            ← email/password + Google login
│   ├── auth/register/         ← registration + OTP verification
│   ├── properties/            ← public property browse + detail
│   ├── buy/                   ← marketplace buy page
│   ├── rent/                  ← rental browse page
│   ├── market/                ← full marketplace
│   └── dashboard/             ← role-gated dashboard
│       ├── my-properties/     ← citizen: owned properties
│       ├── my-requests/       ← citizen: submitted requests
│       ├── my-rental/         ← tenant: active rental
│       ├── property-approvals/← government: review requests
│       ├── verifications/     ← government: KYC review
│       ├── users/             ← government: all users
│       ├── listings/          ← manage marketplace listings
│       ├── notifications/     ← in-app notifications
│       ├── reports/           ← analytics charts
│       └── settings/          ← profile and preferences
├── components/                ← reusable UI components
│   ├── dashboard/             ← dashboard shell, sidebar, stats, tables
│   ├── admin/                 ← request review cards and modals
│   ├── verify/                ← tamper-proof audit UI
│   ├── web3/                  ← wallet connect, gov-only gate
│   ├── submit/                ← property registration form
│   └── ui/                    ← Button, Card, Modal, Badge, Toast…
├── contexts/
│   └── Web3Context.tsx        ← ethers BrowserProvider + signer state
├── store/                     ← Redux Toolkit global state
│   └── slices/
│       ├── authSlice.ts       ← JWT token, user object, login/logout
│       ├── walletSlice.ts     ← MetaMask address, chainId, balance
│       ├── kycSlice.ts        ← KYC status and document state
│       ├── propertySlice.ts   ← property listings cache
│       ├── notificationSlice.ts
│       └── uiSlice.ts         ← theme, sidebar open state
├── hooks/                     ← data-fetching hooks (wrap API calls)
│   ├── useProperties.ts
│   ├── usePropertyDetail.ts
│   ├── useSubmitProperty.ts
│   ├── usePropertyVerify.ts
│   ├── useAdminPanel.ts
│   └── useMyProperties.ts
├── lib/
│   ├── api/                   ← typed API client functions (axios)
│   │   ├── client.ts          ← axios instance with JWT interceptor
│   │   ├── auth.ts
│   │   ├── properties.ts
│   │   ├── admin.ts
│   │   └── notification.ts
│   ├── web3/                  ← contract helpers and wallet flows
│   │   ├── contract.ts        ← getContract(signer)
│   │   ├── registry-contract.ts ← loadRegistryProperties, fetchMetadataVersions
│   │   ├── admin-on-chain.ts  ← approveUpdateOnChain, assignAdminOnChain
│   │   └── config.ts          ← CONTRACT_ADDRESS, RPC_URL, GOV_WALLET
│   └── validation/            ← Zod schemas for all forms
└── types/                     ← TypeScript interfaces
```

---

## 6. User Roles & Flows

There are three roles in the system. Role is determined automatically — not
stored in the database as a field — based on the user's wallet address.

### Citizen
Any registered user who has passed KYC and connected a non-government wallet.

**Can:**
- Submit a property mint request (with images and documents)
- Submit metadata update requests for properties they own
- Buy and sell properties on the marketplace
- List their property for rent and manage rental agreements
- View their owned properties, submitted requests, and rental history

### Government (Admin)
The user whose wallet address matches `GOV_WALLET` in the environment.
There is exactly one government account.

**Can:**
- Review and approve or decline citizen mint requests (triggers on-chain mint)
- Review and approve or decline metadata update requests (triggers on-chain update)
- Review KYC document submissions and approve or reject user accounts
- View all users and their KYC status
- View analytics: property counts, user counts, submission trends

### Tenant
Any citizen who has rented a property. This is not a separate account —
it's a state that any citizen enters when they rent a property.

**Can:**
- Pay monthly rent (on-chain)
- View active rental agreement and payment history
- Terminate the rental (on-chain, within allowed window)

---

## 7. Key Workflows Step by Step

### Registering an Account

```
1. User enters email + password on /auth/register
2. Backend: hashes password (bcrypt), creates User with status=PENDING_EMAIL
3. Backend: generates 6-digit OTP, hashes it, sends email via Gmail SMTP
4. User enters OTP on /auth/verify-otp
5. Backend: verifies OTP hash, updates User status=PENDING_KYC
6. Frontend: redirects to KYC upload page
7. User connects MetaMask wallet + uploads ID front, ID back, selfie
8. Backend: verifies wallet signature (proves ownership), saves KycDocument rows
9. Backend: updates User status=PENDING_APPROVAL, links walletAddress
10. Government reviews documents in /dashboard/verifications
11. Government approves → User status=ACTIVE, approval email sent
```

### Submitting a Property (Two-Step Mint)

The mint flow is split into two steps to ensure files are hashed before
the blockchain transaction, and the database is only written after the
transaction confirms.

```
Step 1 — /api/properties/request/prepare  (before MetaMask)
  1. Citizen fills property form and selects images + documents
  2. Frontend sends FormData to backend
  3. Backend: hashes each file (SHA-256), computes Merkle roots
  4. Backend: builds metadata JSON, computes metadata hash
  5. Backend: stores files + hashes in memory cache (10 min TTL) with a tempId
  6. Returns { tempId, hashes: { metadataHash, imagesRootHash, documentsRootHash } }

Step 2 — Citizen calls contract directly from frontend
  7. Frontend uses the returned hashes to call the smart contract
  8. MetaMask prompts the citizen to sign and pay gas
  9. Contract records the request on-chain with the hashes
  10. Frontend receives the txHash

Step 3 — /api/properties/request/confirm  (after MetaMask)
  11. Frontend sends { tempId, txHash } to backend
  12. Backend: retrieves files from memory cache, deletes the cache entry
  13. Backend: creates Property row in PostgreSQL (status=PENDING)
  14. Backend: saves all Document rows with raw file bytes + sha256Hash
  15. Backend: creates Request row (type=MINT, status=PENDING)
  16. Backend: sends admin notification
```

### Government Approves a Mint Request

```
1. Government opens /dashboard/property-approvals
2. Clicks "Approve" on a pending request
3. Frontend calls POST /api/admin/approve/:requestId with onChainRequestId
4. Backend (adminService):
   a. Fetches Request from DB
   b. Calls mintPropertyOnChain(onChainRequestId) — government signs tx
   c. Waits for transaction receipt
   d. Reads mintedTokenId from RequestApproved event in receipt
   e. In a single DB transaction:
      - Request status → APPROVED
      - Property tokenId → mintedTokenId, status → MINTED
      - MetadataVersion row created (version 1)
5. Backend sends in-app notification to citizen
6. Property is now visible in the public registry
```

### Updating Property Metadata

```
1. Owner submits update form with new data + optional new files
2. POST /api/properties/:id/update-request
3. Backend: hashes new files, computes new roots and metadataHash
4. Backend: creates Request row (type=UPDATE)
5. Government reviews and approves → calls approveUpdateRequest on-chain
6. Backend: creates MetadataVersion row with new snapshot (version N+1)
7. Property fields in DB are updated from the approved snapshot
```

---

## 8. Tamper-Proof Verification

The `/api/verify/:tokenId` endpoint is **public and requires no login**.
Anyone — a lawyer, a buyer, a journalist — can call it to audit any property.

The verification process:

```
1. Fetch property + all files from PostgreSQL
2. Re-hash every file from its raw bytes (sha256(fileData))
3. Compare each recomputed hash to the stored sha256Hash
   → filesIntegrity[]: { fileName, storedHash, recomputedHash, match }
4. Recompute Merkle root from the recomputed file hashes
5. Compare recomputed roots to stored imagesRootHash / documentsRootHash
6. Recompute metadataHash from the saved metadataSnapshot
7. Fetch the current hash from the blockchain: getLatestHashes(tokenId)
8. Compare recomputed metadataHash to the on-chain hash

Final verdict: tamperProof = true only when ALL of these are true:
  ✓ Every file's recomputed hash matches its stored hash
  ✓ Recomputed image Merkle root matches stored imagesRootHash
  ✓ Recomputed document Merkle root matches stored documentsRootHash
  ✓ Recomputed metadataHash matches the on-chain hash
```

If even one byte of any file is changed in the database after approval,
the verification will fail and `tamperProof` will be `false`.

The response also includes the full on-chain version history, so you can
see every approved change over time.

---

## 9. Rental System

The rental system is a hybrid of on-chain and off-chain state. The contract
enforces the agreement terms; the backend records the history.

```
Landlord lists property for rent
  → frontend calls contract.listForRent(propertyId, monthlyRent, duration)
  → frontend calls POST /api/rentals/list/:propertyId (DB record)

Tenant rents a property
  → frontend calls contract.rentProperty(propertyId) payable (sends first month + faith deposit)
  → contract emits PropertyRented event
  → frontend calls POST /api/rentals/rent/:propertyId (creates RentalAgreement in DB)

Tenant pays monthly rent
  → frontend calls contract.payRent(propertyId) payable
  → frontend calls POST /api/rentals/pay/:propertyId (creates RentPayment in DB)

Termination
  → either party calls contract.terminateRental...()
  → frontend calls POST /api/rentals/terminate/:propertyId
  → RentalAgreement status → ENDED or DEFAULTED

Expired rental
  → anyone calls contract.finalizeExpiredRental(propertyId) after end date
  → frontend calls POST /api/rentals/finalize/:propertyId
```

The faith deposit is held by the contract and returned or penalised
according to the termination reason.

---

## 10. Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js + Express | 4.x | HTTP server |
| Prisma | 5.x | ORM + migrations |
| PostgreSQL | 14+ | Primary database |
| ethers.js | 5.x | Blockchain interactions (government signer) |
| bcrypt | 6.x | Password and OTP hashing |
| jsonwebtoken | 9.x | JWT auth tokens (7-day expiry) |
| multer | 1.x | File uploads (memory storage) |
| nodemailer | 9.x | Email via Gmail SMTP |
| google-auth-library | 10.x | Google OAuth ID token verification |
| express-rate-limit | 8.x | Rate limiting on auth endpoints |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16.x | React framework (App Router) |
| TypeScript | 5.x | Type safety |
| Redux Toolkit | 2.x | Global state (auth, wallet, KYC) |
| ethers.js | 6.x | Wallet connection + contract calls |
| Tailwind CSS | 4.x | Styling |
| Radix UI | latest | Accessible headless components |
| Framer Motion | 12.x | Animations |
| React Hook Form + Zod | latest | Form validation |
| Axios | 1.x | API client with JWT interceptor |
| Recharts | 3.x | Analytics charts |

### Blockchain
| Technology | Purpose |
|---|---|
| Solidity | Smart contract language |
| Hardhat | Local development node |
| EVM-compatible chain | Deployment target |
| MetaMask | User wallet (browser extension) |

---

## 11. Environment Variables

### Backend (`backend/.env`)

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/realestate"

# JWT
JWT_SECRET="a-long-random-secret-string"

# Blockchain
RPC_URL="http://127.0.0.1:8545"
GOV_WALLET="0xGovernmentWalletAddress"
GOV_PRIVATE_KEY="0xGovernmentPrivateKey"
PROPERTY_NFT_ADDRESS="0xPropertyNFTContractAddress"
MARKETPLACE_ADDRESS="0xMarketplaceContractAddress"

# Email
GMAIL_USER="your@gmail.com"
GMAIL_APP_PASSWORD="your-app-password"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-oauth-client-id"

# Server
PORT=5000
FRONTEND_URL="http://localhost:3000"
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL="http://localhost:5000"
NEXT_PUBLIC_CONTRACT_ADDRESS="0xPropertyNFTContractAddress"
NEXT_PUBLIC_RPC_URL="http://127.0.0.1:8545"
NEXT_PUBLIC_CHAIN_ID="31337"
NEXT_PUBLIC_GOV_WALLET="0xGovernmentWalletAddress"
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your-google-oauth-client-id"
```

---

## 12. Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- A running Hardhat (or compatible) local blockchain node
- MetaMask browser extension
- Gmail account with an App Password enabled

### 1. Clone and install

```bash
git clone https://github.com/your-org/edenet-realestate-blockchain
cd edenet-realestate-blockchain

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure environment

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your values

# Frontend
cp frontend/.env.example frontend/.env.local
# Edit frontend/.env.local with your values
```

### 3. Set up the database

```bash
cd backend
npx prisma migrate dev   # runs all migrations
npx prisma generate      # generates the Prisma client
```

### 4. Deploy the smart contract

```bash
# Start local Hardhat node
npx hardhat node

# In another terminal, deploy the contract
npx hardhat run scripts/deploy.js --network localhost

# Copy the deployed contract address to:
# backend/.env   → PROPERTY_NFT_ADDRESS
# frontend/.env.local → NEXT_PUBLIC_CONTRACT_ADDRESS
```

### 5. Start the servers

```bash
# Backend (in backend/)
npm run dev        # starts with nodemon on port 5000

# Frontend (in frontend/)
npm run dev        # starts Next.js on port 3000
```

### 6. Verify everything works

```bash
# Run hash utility tests
cd backend
npm run test:hash   # should show: 18 passed, 0 failed

# Check server health
curl http://localhost:5000/api/health
```

Open `http://localhost:3000` in your browser, register an account, and
connect MetaMask to `localhost:8545` (Hardhat network, chain ID 31337).

---

## Notes on Security

- The government private key (`GOV_PRIVATE_KEY`) must never be committed to
  git or exposed to the frontend. It lives only in `backend/.env`.
- JWT tokens expire after 7 days. Fresh user data is fetched from the database
  on every authenticated request so status changes take effect immediately.
- File uploads are validated by MIME type. Files are held in memory (never
  written to disk) and processed immediately.
- All auth endpoints have rate limiting (5 requests per 15 minutes) to prevent
  brute-force attacks.
- OTP codes are hashed with bcrypt before being stored and expire after 10 minutes.
- Wallet signature verification is required for both KYC document submission
  and wallet connection to prove the user controls the wallet.
