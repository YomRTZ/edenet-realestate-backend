# Edenet — Real Estate Blockchain Backend

A hybrid Web2 + Web3 property registry backend. Properties are minted as NFTs
on a local Hardhat node. All metadata and files are hashed and stored in
PostgreSQL, and verified against the blockchain at any time by anyone.

---

## Table of Contents

1. [Overview](#1-overview)
2. [How the Blockchain Integration Works](#2-how-the-blockchain-integration-works)
3. [Project Structure](#3-project-structure)
4. [Architecture — Layer Responsibilities](#4-architecture--layer-responsibilities)
5. [Database Schema](#5-database-schema)
6. [API Reference](#6-api-reference)
7. [User Roles](#7-user-roles)
8. [Key Workflows](#8-key-workflows)
9. [Tamper-Proof Verification](#9-tamper-proof-verification)
10. [Rental System](#10-rental-system)
11. [Smart Contract](#11-smart-contract)
12. [Tech Stack](#12-tech-stack)
13. [Environment Variables](#13-environment-variables)
14. [Getting Started](#14-getting-started)
15. [Security Notes](#15-security-notes)

---

## 1. Overview

Edenet solves the core problem of traditional land registries: records can be
forged, ownership can be tampered with, and there is no transparent audit trail.

It works by combining two layers:

- **Web2 layer (PostgreSQL + Express)** — stores full property data, raw files,
  user accounts, KYC documents, and rental agreements. Fast, searchable, holds
  the raw bytes needed for re-verification.

- **Web3 layer (Ethereum smart contract)** — stores only cryptographic hashes
  of property metadata and files. This makes the record immutable and publicly
  auditable without exposing private data on-chain.

When the hash recomputed from the database matches the hash stored on the
blockchain, the property record is **tamper-proof**.

The backend is the **only** party that writes to the contract using the
government private key. Citizens interact with the contract directly from
their wallet only for actions like buying, renting, and submitting on-chain
requests.

---

## 2. How the Blockchain Integration Works

### What lives where

| Data | Location | Reason |
|---|---|---|
| Property metadata fields | PostgreSQL | Fast queries, searchable |
| Raw file bytes (images, deeds) | PostgreSQL (`bytea`) | Too large for on-chain |
| SHA-256 hash of each file | PostgreSQL + blockchain | DB holds it for re-verification; chain commits it permanently |
| Merkle root of image hashes | PostgreSQL + blockchain | One hash commits to all images |
| Merkle root of document hashes | PostgreSQL + blockchain | One hash commits to all documents |
| Metadata JSON hash | PostgreSQL + blockchain | Commits to all property fields at once |
| NFT ownership | Blockchain only | Ownership is authoritative on-chain |
| Sale price + buyer/seller history | Blockchain only (`ownershipHistory`) | Immutable ownership trail |
| Sale events | Blockchain → PostgreSQL | Backend listens to `PropertySold` and syncs `ownerWallet` |
| Rental agreement terms | Blockchain (enforced) + PostgreSQL (recorded) | Contract holds faith deposit; DB stores history |

### The hashing pipeline

```
Individual files
      │
      ▼
SHA-256(file buffer)  →  stored in documents.sha256Hash
      │
      ▼
computeRootHash(imageHashes[])    →  imagesRootHash   (binary Merkle tree)
computeRootHash(documentHashes[]) →  documentsRootHash
      │
      ▼
hashMetadata({ name, location, price, ..., imagesRootHash, documentsRootHash, version })
      │
      ▼
metadataHash  →  stored in DB + committed on-chain as bytes32
```

`computeRootHash` builds a binary Merkle tree — pairs of hashes are
concatenated and re-hashed level by level until one root remains. Changing
any single file changes the root.

`hashMetadata` sorts all JSON keys alphabetically before hashing so key order
never affects the result. The same property always produces the same hash.

### Who calls the contract and when

The backend and the citizen wallet call the contract for different things:

| Action | Who calls | Why |
|---|---|---|
| `approveRequest` | Backend (gov key) | Only the government can mint |
| `declineRequest` | Backend (gov key) | Only the government can decline |
| `approveUpdateRequest` | Backend (gov key) | Only the government can approve updates |
| `declineUpdateRequest` | Backend (gov key) | Only the government can decline updates |
| `addAdmin` | Backend (gov key) | Role management |
| `setCommission` | Backend (gov key) | Commission rate management |
| `setPlatformRestricted` | Backend (gov key) | Toggle transfer lock |
| `submitRequest` | Citizen wallet (MetaMask) | Citizen submits mint request on-chain |
| `submitUpdateRequest` | Citizen wallet (MetaMask) | Citizen submits update on-chain |
| `listProperty` | Citizen wallet (MetaMask) | List property for sale |
| `unlistProperty` | Citizen wallet (MetaMask) | Remove from sale |
| `buyProperty` | Citizen wallet (MetaMask) | Buy with ETH — contract handles payment split |
| `listForRent` | Citizen wallet (MetaMask) | List property for rent |
| `unlistFromRent` | Citizen wallet (MetaMask) | Remove from rent listing |
| `rentProperty` | Citizen wallet (MetaMask) | Rent — sends first month + faith deposit |
| `payRent` | Citizen wallet (MetaMask) | Monthly rent payment |
| `terminateRentalAsTenant` | Citizen wallet (MetaMask) | Tenant exits the rental |
| `terminateRentalAsLandlord` | Citizen wallet (MetaMask) | Landlord evicts defaulting tenant |
| `terminateRentalAsLandlordNoFault` | Citizen wallet (MetaMask) | Landlord ends early, pays compensation |
| `finalizeExpiredRental` | Anyone | Called after contract end date |

> **Backend-only citizen calls**: The sale and rental write functions are called
> directly by the citizen wallet from the frontend — the backend is not involved
> in signing them. The backend only records the result in PostgreSQL after the
> transaction confirms.

### Smart contract role

`RealEstate.sol` stores no text or files — only:

- `bytes32 metadataHash` — hash of all property fields combined
- `bytes32 imagesRootHash` — Merkle root of all image hashes
- `bytes32 documentsRootHash` — Merkle root of all document hashes
- `address owner` — current NFT owner
- `OwnershipRecord[]` — every transfer: from, to, price, timestamp
- Version history — every approved update creates a new on-chain hash snapshot

### Contract constants that drive business logic

| Constant | Value | Effect |
|---|---|---|
| `commissionPercent` | 2% (configurable up to 10%) | Deducted from every sale, sent to government wallet |
| `GRACE_PERIOD` | 7 days | Tenant has 7 days late before penalty applies |
| `LATE_PENALTY_BPS` | 500 (5%) | Late rent surcharge after grace period |
| `TERMINATION_WINDOW_BPS` | 1000 (10%) | Last 10% of rental duration — tenant can exit cleanly |
| `PERIOD` | 30 days | One rental cycle |
| `platformRestricted` | true by default | NFT transfers only allowed via `buyProperty()` |

### Event listener

At startup, the backend registers one on-chain event listener:

```
PropertySold(propertyId, from, to, price)
  → prisma.property.update({ ownerWallet: to })
```

This keeps `ownerWallet` in PostgreSQL in sync whenever a sale happens on-chain,
even if the API server was temporarily offline (it catches up on next restart
from the node's event history).

The `MetadataUpdated` event is emitted on-chain when an update is approved, but
the backend does not need to listen for it — the DB is already updated
synchronously in the same `adminService.approveRequest` call that triggers the
on-chain transaction.

---

## 3. Project Structure

```
backend/
├── index.js                        ← entry point: load env, connect DB, start server
├── hardhat.config.js               ← Hardhat: compiler settings, localhost network
├── .env.example                    ← template for required environment variables
│
├── contracts/
│   └── RealEstate.sol              ← ERC-721 + AccessControl property NFT contract
│
├── scripts/
│   ├── deploy.mjs                  ← deploy contract + auto-sync ABI to frontend
│   ├── ContractOwnerTransfer.mjs   ← grant ADMIN_ROLE to your MetaMask wallet
│   └── fund.mjs                    ← send ETH from Hardhat account[0] to any address
│
├── prisma/
│   ├── schema.prisma               ← all database models and relations
│   └── migrations/                 ← migration history (auto-generated)
│
└── src/
    ├── app.js                      ← Express factory: CORS, routes, error handler
    │
    ├── config/
    │   ├── db.js                   ← singleton PrismaClient
    │   └── env.js                  ← validates required env vars at startup
    │
    ├── utils/
    │   ├── hash.js                 ← hashBuffer, hashMetadata, computeRootHash, toBytes32
    │   ├── hash.test.js            ← plain Node.js tests (npm run test:hash)
    │   ├── jwt.js                  ← generateToken — single source of truth for JWT signing
    │   ├── email.js                ← nodemailer: OTP, KYC approval, KYC rejection emails
    │   ├── contract.js             ← ethers v6 singletons + all on-chain call helpers
    │   └── notifications.js        ← notifyUser, notifyAdmin, notifyUserByWallet
    │
    ├── middleware/
    │   ├── auth.js                 ← verify JWT → attach req.user (1 DB lookup)
    │   ├── requireAdmin.js         ← check req.user.walletAddress === GOV_WALLET
    │   ├── requireKyc.js           ← check req.user.status === 'ACTIVE'
    │   ├── validate.js             ← zod schema validation factory (body/query/params)
    │   ├── upload.js               ← multer memory storage (property + KYC variants)
    │   └── errorHandler.js         ← global Express error handler
    │
    ├── validation/                 ← zod schemas — one file per domain
    │   ├── authSchemas.js          ← register, login, googleAuth, verifyOtp, connectWallet
    │   ├── propertySchemas.js      ← confirmRequest, listProperties query, propertyDetails
    │   ├── adminSchemas.js         ← approveRequest, declineRequest, rejectKyc, listRequests query
    │   └── rentalSchemas.js        ← listForRent, createRental, payRent, terminate, finalize
    │
    ├── routes/                     ← URL → middleware + controller only, no logic
    │   ├── auth.js
    │   ├── kyc.js
    │   ├── properties.js
    │   ├── admin.js
    │   ├── rentals.js
    │   ├── notifications.js
    │   └── verify.js
    │
    ├── controllers/                ← thin HTTP layer: read req, call service, send res
    │   ├── authController.js
    │   ├── kycController.js
    │   ├── propertyController.js
    │   ├── adminController.js
    │   ├── rentalController.js
    │   ├── notificationController.js
    │   └── verifyController.js
    │
    └── services/                   ← ALL business logic and DB queries live here
        ├── authService.js
        ├── kycService.js
        ├── propertyService.js
        ├── adminService.js
        ├── rentalService.js
        ├── notificationService.js
        └── verifyService.js
```

---

## 4. Architecture — Layer Responsibilities

The backend follows a strict 5-layer MVC architecture. Each layer has one
responsibility and never reaches into the layer above it.

```
Request
  │
  ▼
Routes          — map URLs to middleware chains and controller functions only
  │
  ▼
Middleware       — auth (JWT verify + DB lookup), requireAdmin, requireKyc, validate (zod), upload
  │
  ▼
Controllers     — extract from req, call one service function, send res.json()
  │
  ▼
Services        — business rules, ownership checks, DB queries, blockchain calls
  │
  ▼
Utils / Config  — hash, jwt, email, contract, notifications, db, env
```

**Middleware** — `auth` verifies the JWT and fetches the user (one DB lookup).
`requireAdmin` checks `req.user.walletAddress` in memory (zero DB queries).
`requireKyc` checks `req.user.status` in memory. `validate(schema)` runs a zod
schema against `req.body`, `req.query`, or `req.params` — on failure it returns
`{ error, errors[] }` immediately before the controller is ever called. `upload`
handles multipart file parsing into memory buffers.

**Routes** know only about URLs and which middleware + controller to call.
Zero logic, zero database access.

**Validation schemas** (`src/validation/`) define the exact shape of every
request using zod. The `validate` middleware factory enforces them at the
boundary — bad requests never reach the service layer. Input coercion (string
`"3"` → number `3`) also happens here so services always receive clean types.

**Controllers** know only about `req` and `res`. They extract inputs, call
exactly one service function, then call `res.json()` or `next(err)`. Nothing
else. Unused `req` parameters are named `_req`.

**Services** contain all business logic — ownership checks, status transitions,
uniqueness constraints. They call Prisma and utils. No `req`, no `res`. Errors
are thrown with a `.status` property so the global error handler sets the right
HTTP code. Field-presence checks are not repeated here — zod handles those.

**Utils** are pure helpers. `hash.js` does cryptography. `contract.js` manages
the ethers.js provider and signer. `jwt.js` is the single place that signs
tokens. `email.js` sends mail. `notifications.js` writes Notification rows.
None of them know about Express.

**Config** — `db.js` exports the single shared PrismaClient. `env.js` exits
the process immediately if any required variable is missing.

### Middleware composition

Admin routes stack `auth` and `requireAdmin` as separate middleware:

```js
const adminGuard = [auth, requireAdmin];
router.post('/approve/:id', ...adminGuard, adminController.approveRequest);
```

`auth` runs first (one DB lookup → sets `req.user`).
`requireAdmin` is a pure in-memory wallet address check — zero DB queries.

---

## 5. Database Schema

| Model | Purpose |
|---|---|
| `User` | Account with email/password or Google OAuth, status lifecycle, wallet address |
| `OtpCode` | 6-digit email verification codes (bcrypt-hashed, 10 min expiry) |
| `KycDocument` | ID front, ID back, selfie — raw bytes stored in PostgreSQL |
| `Property` | One row per property — all searchable fields mirrored from the chain |
| `Document` | Raw file bytes for property images and deeds — never deleted (full audit trail) |
| `MetadataVersion` | Every approved change creates a new immutable version row |
| `Request` | Citizen-submitted mint or update requests awaiting government review |
| `RentalAgreement` | Active and historical rental contracts with all terms |
| `RentPayment` | Individual rent payment records linked to a rental agreement |
| `Notification` | In-app notifications for citizens (`userId`) and admins (`forAdmin=true`) |

### User status lifecycle

```
PENDING_EMAIL → PENDING_KYC → PENDING_APPROVAL → ACTIVE
                                               ↘ REJECTED
```

---

## 6. API Reference

All endpoints return JSON. Authenticated endpoints require:
`Authorization: Bearer <jwt>`

### Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Register with email + password |
| POST | `/api/auth/google` | — | Authenticate with Google ID token |
| POST | `/api/auth/verify-otp` | — | Verify 6-digit email OTP |
| POST | `/api/auth/resend-otp` | — | Resend OTP code |
| POST | `/api/auth/login` | — | Login with email + password |
| POST | `/api/auth/connect-wallet` | JWT | Link a MetaMask wallet (requires signature) |
| POST | `/api/auth/disconnect-wallet` | JWT | Unlink wallet from account |
| GET | `/api/auth/me` | JWT | Get current user profile |

### KYC

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/kyc/upload` | JWT | Upload ID front, ID back, selfie + wallet signature |
| GET | `/api/kyc/status` | JWT | Get KYC status and submitted documents |

### Properties

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/properties` | — | List all minted properties (filterable) |
| GET | `/api/properties/:id` | — | Get property detail with version history |
| GET | `/api/properties/:id/images` | — | Get property images as base64 |
| GET | `/api/properties/:id/documents` | — | Get property documents as base64 |
| POST | `/api/properties/request/prepare` | JWT + KYC | Step 1: hash files, return hashes for on-chain tx |
| POST | `/api/properties/request/confirm` | JWT + KYC | Step 2: persist after MetaMask confirms |
| POST | `/api/properties/:id/update-request` | JWT + KYC | Submit metadata update request |

### Admin

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/requests` | Admin | List requests (filter by status, type) |
| POST | `/api/admin/approve/:requestId` | Admin | Approve mint or update request (triggers on-chain tx) |
| POST | `/api/admin/decline/:requestId` | Admin | Decline request with reason |
| GET | `/api/admin/users` | Admin | List all users with KYC status |
| GET | `/api/admin/kyc/pending` | Admin | List users pending KYC approval |
| GET | `/api/admin/kyc/:userId/documents/:docId` | Admin | Stream a KYC document image |
| POST | `/api/admin/kyc/:userId/approve` | Admin | Approve KYC → user becomes ACTIVE |
| POST | `/api/admin/kyc/:userId/reject` | Admin | Reject KYC with reason |
| GET | `/api/admin/analytics` | Admin | Property, user, and submission trend stats |

### Verify (public)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/verify/:tokenId` | — | Full tamper-proof audit of a property |

### Notifications

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/notifications` | JWT | Get notifications + unread count |
| POST | `/api/notifications/:id/read` | JWT | Mark one notification as read |
| POST | `/api/notifications/read-all` | JWT | Mark all as read |
| DELETE | `/api/notifications/:id` | JWT | Delete a notification |

### Rentals

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/rentals/list/:propertyId` | JWT + KYC | Record property listed for rent (after on-chain tx) |
| POST | `/api/rentals/unlist/:propertyId` | JWT + KYC | Record property unlisted from rent |
| POST | `/api/rentals/rent/:propertyId` | JWT + KYC | Record new rental agreement (after on-chain tx) |
| POST | `/api/rentals/pay/:propertyId` | JWT + KYC | Record rent payment (after on-chain tx) |
| POST | `/api/rentals/terminate/:propertyId` | JWT + KYC | Record rental termination |
| POST | `/api/rentals/finalize/:propertyId` | JWT + KYC | Record expired rental finalization |
| GET | `/api/rentals/:propertyId` | — | Get active rental agreement |
| GET | `/api/rentals/history/:propertyId` | — | Get full rental history for a property |
| GET | `/api/rentals/tenant/:wallet` | — | Get all rentals by tenant wallet |
| GET | `/api/rentals/landlord/:wallet` | — | Get all rentals by landlord wallet |

### Health

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | — | Server health check |

---

## 7. User Roles

Roles are derived at runtime from `req.user.walletAddress` — not stored as
a database field.

| Role | How determined | Capabilities |
|---|---|---|
| **Citizen** | Any ACTIVE user with a non-government wallet | Submit/update properties, buy/sell, list/rent |
| **Government** | Wallet matches `GOV_WALLET` env var | Approve/decline requests, review KYC, view analytics |
| **Tenant** | Any citizen with an active `RentalAgreement` | Pay rent, terminate rental |

There is exactly one Government account — the wallet that deployed the contract
or was granted `ADMIN_ROLE` via `ContractOwnerTransfer.mjs`.

---

## 8. Key Workflows

### Account registration

```
1.  POST /api/auth/register        → User created (status: PENDING_EMAIL)
2.  6-digit OTP sent to email
3.  POST /api/auth/verify-otp      → User status: PENDING_KYC
4.  POST /api/kyc/upload           → KYC docs saved, wallet linked, status: PENDING_APPROVAL
5.  Government reviews in admin panel
6.  POST /api/admin/kyc/:id/approve → User status: ACTIVE, approval email sent
```

### Two-step property mint

The flow is split to ensure hashing happens before the blockchain transaction,
and the database is only written after the transaction confirms.

```
Step 1 — POST /api/properties/request/prepare
  • Backend hashes each file (SHA-256), computes Merkle roots
  • Builds metadata JSON, computes metadataHash
  • Stores files in memory cache (10 min TTL) under a tempId
  • Returns { tempId, hashes: { metadataHash, imagesRootHash, documentsRootHash } }

Step 2 — Citizen calls contract directly from their wallet
  • Frontend passes the hashes to contract.submitRequest(details)
  • MetaMask prompts for gas payment
  • Contract records the request on-chain with the three hashes
  • Frontend gets back the txHash

Step 3 — POST /api/properties/request/confirm
  • Frontend sends { tempId, txHash }
  • Backend retrieves files from cache, clears cache entry
  • Creates Property row (status: PENDING), saves all Document rows
  • Creates Request row (type: MINT, status: PENDING)
  • Sends admin notification
```

### Government approves a mint

```
1. POST /api/admin/approve/:requestId  (body: { onChainRequestId })
2. Backend calls mintPropertyOnChain(onChainRequestId) — gov wallet signs tx
3. Reads mintedTokenId from RequestApproved event in receipt
4. Single DB transaction:
   - Request → APPROVED
   - Property → tokenId set, status: MINTED
   - MetadataVersion v1 created
5. In-app notification sent to citizen
```

### Government approves a metadata update

```
1. POST /api/admin/approve/:requestId
2. Backend finds pending on-chain update index via getUpdateRequests()
3. Calls approveUpdateRequest(propertyId, index) — gov wallet signs tx
4. Single DB transaction:
   - Request → APPROVED
   - Property fields updated from metadataSnapshot
   - MetadataVersion vN+1 created
5. In-app notification sent to citizen
```

---

## 9. Tamper-Proof Verification

`GET /api/verify/:tokenId` is **public — no authentication required**.

```
1. Fetch property + all files from PostgreSQL
2. Re-hash every file from raw bytes: SHA-256(fileData)
3. Compare each to the stored sha256Hash
4. Recompute Merkle roots from the re-hashed files
5. Compare to stored imagesRootHash / documentsRootHash
6. Recompute metadataHash from the saved metadataSnapshot
7. Fetch the current hash from the blockchain: getLatestHashes(tokenId)
8. Compare recomputed metadataHash to the on-chain hash

tamperProof = true  only when ALL checks pass:
  ✓ Every file's recomputed hash matches its stored hash
  ✓ Recomputed image Merkle root matches stored imagesRootHash
  ✓ Recomputed document Merkle root matches stored documentsRootHash
  ✓ Recomputed metadataHash matches the on-chain hash
```

If even one byte of any file is modified in the database after approval,
`tamperProof` will be `false`. The response also includes the full on-chain
version history showing every approved change over time.

---

## 10. Rental System

Rental state is split: the contract enforces terms and holds the faith deposit;
the backend records the history.

```
Landlord lists for rent
  → calls contract.listForRent(propertyId, monthlyRent, duration)  [on-chain]
  → POST /api/rentals/list/:propertyId                             [DB record]

Tenant rents
  → calls contract.rentProperty(propertyId) payable                [on-chain]
    (sends first month rent + faith deposit to contract)
  → POST /api/rentals/rent/:propertyId                             [DB record]

Tenant pays rent
  → calls contract.payRent(propertyId) payable                     [on-chain]
    (5% late penalty applies after 7-day grace period)
  → POST /api/rentals/pay/:propertyId                              [DB record]

Termination — three paths:

  A. Tenant exits cleanly (in last 10% of rental term)
     → contract.terminateRentalAsTenant()  → faith deposit returned
     → POST /api/rentals/terminate/:propertyId

  B. Tenant exits early (outside termination window)
     → contract.terminateRentalAsTenant()  → faith deposit kept by landlord
     → POST /api/rentals/terminate/:propertyId

  C. Landlord evicts defaulting tenant (15+ days overdue)
     → contract.terminateRentalAsLandlord()  → faith deposit kept by landlord
     → POST /api/rentals/terminate/:propertyId

  D. Landlord ends early, no fault (pays compensation)
     → contract.terminateRentalAsLandlordNoFault()
       (returns faith deposit + 10% of remaining rent to tenant)
     → POST /api/rentals/terminate/:propertyId

Expired rental (after end date)
  → anyone calls contract.finalizeExpiredRental(propertyId)        [on-chain]
    (faith deposit returned to tenant)
  → POST /api/rentals/finalize/:propertyId                         [DB record]
```

The faith deposit is held by the contract and returned or penalised based on
the termination reason (clean exit, early exit, or landlord default).

---

## 11. Smart Contract

**File:** `contracts/RealEstate.sol`

**Inherits:** `ERC721`, `AccessControl` (OpenZeppelin v5)

### Key features

- `ADMIN_ROLE` — granted to the government wallet; required for approving requests
- `DEFAULT_ADMIN_ROLE` — can grant/revoke roles, set commission, toggle platform restriction
- `platformRestricted` — when `true` (default), NFT transfers can only go through
  `buyProperty()`, preventing circumvention of the 2% commission
- `commissionPercent` — configurable up to 10% via `setCommission()`, paid to
  `governmentWallet` on every sale
- Full rental lifecycle on-chain with faith deposit held in escrow
- All metadata stored as `bytes32` hashes — no strings, no IPFS

### Contract function groups

**Admin (backend signs with `GOV_PRIVATE_KEY`):**
- `approveRequest(requestId)` — mints the NFT, stores hash snapshot as version 1
- `declineRequest(requestId, reason)` — rejects pending mint
- `approveUpdateRequest(propertyId, index)` — applies new hashes, creates version N
- `declineUpdateRequest(propertyId, index, reason)` — rejects pending update
- `addAdmin(account)` — grants `ADMIN_ROLE` to another wallet
- `setCommission(percent)` — update commission rate (max 10%)
- `setPlatformRestricted(bool)` — enable/disable direct NFT transfer lock

**Citizen (called directly from MetaMask via frontend):**
- `submitRequest(details)` — submit mint request on-chain with hash triple
- `submitUpdateRequest(propertyId, hash, hash, hash)` — submit update on-chain
- `listProperty(propertyId, priceInEther)` — list for sale
- `unlistProperty(propertyId)` — remove from sale
- `buyProperty(propertyId)` payable — purchase; contract splits payment automatically
- `listForRent(propertyId, monthlyRentInEther, durationMonths)` — list for rent
- `unlistFromRent(propertyId)` — remove from rent listing
- `rentProperty(propertyId)` payable — rent; sends first month + faith deposit
- `payRent(propertyId)` payable — monthly payment with late penalty after 7 days
- `terminateRentalAsTenant(propertyId)` — clean exit (deposit returned if in last 10% of term)
- `terminateRentalAsLandlord(propertyId)` — evict defaulting tenant (15+ days overdue)
- `terminateRentalAsLandlordNoFault(propertyId)` — landlord ends early, pays compensation
- `finalizeExpiredRental(propertyId)` — close out after end date (anyone can call)

**View (read-only, no gas):**
- `getLatestHashes(propertyId)` — current metadataHash, imagesRootHash, documentsRootHash
- `getMetadataVersions(propertyId)` — full on-chain version history
- `getOwnershipHistory(propertyId)` — every past owner with price and timestamp
- `getUpdateRequests(propertyId)` — all update requests with status
- `getRentalAgreement(propertyId)` — current or last rental agreement
- `getRentalHistory(propertyId)` — all past rental agreements
- `getRentalListing(propertyId)` — active rent listing details
- `getRentDue(propertyId)` — current amount owed including any late penalty
- `isInDefaultPeriod(propertyId)` — true if tenant is 15+ days overdue
- `isInTerminationWindow(propertyId)` — true if in last 10% of rental duration
- `isRented(propertyId)` — boolean rental state
- `getTotalProperties()`, `getTotalRequests()` — counters
- `isAdmin(account)` — role check

### Scripts

| Script | Purpose |
|---|---|
| `npm run compile` | Compile `RealEstate.sol` → `artifacts/` |
| `npm run node:local` | Start local Hardhat node on port 8545 |
| `node scripts/deploy.mjs` | Deploy contract + sync ABI to frontend |
| `node scripts/ContractOwnerTransfer.mjs` | Grant ADMIN_ROLE to your MetaMask wallet |
| `node scripts/fund.mjs` | Send 100 ETH from account[0] to any address |

---

## 12. Tech Stack

| Package | Version | Purpose |
|---|---|---|
| Node.js + Express | 4.x | HTTP server |
| Prisma | 5.x | ORM + migrations |
| PostgreSQL | 14+ | Primary database |
| ethers.js | **6.x** | Blockchain interactions (government signer) |
| Hardhat | 2.x | Local EVM node + contract compiler |
| @openzeppelin/contracts | 5.x | ERC-721 + AccessControl base contracts |
| bcrypt | 6.x | Password and OTP hashing |
| jsonwebtoken | 9.x | JWT auth tokens (7-day expiry) |
| multer | 1.x | File uploads (memory storage only — no disk writes) |
| nodemailer | 9.x | Email via Gmail SMTP |
| google-auth-library | 10.x | Google OAuth ID token verification |
| express-rate-limit | 8.x | Rate limiting on auth endpoints |
| zod | 3.x | Schema-based request validation and input coercion |
| dotenv | 16.x | Environment variable loading |

---

## 13. Environment Variables

Copy `.env.example` to `.env` and fill in your values.

```env
# ── Database ──────────────────────────────────────────────────────────────────
DATABASE_URL="postgresql://user:password@localhost:5432/realestate"

# ── JWT ───────────────────────────────────────────────────────────────────────
JWT_SECRET="a-long-random-secret-minimum-32-chars"

# ── Blockchain (local Hardhat + MetaMask) ─────────────────────────────────────
# Points to your running local Hardhat node
RPC_URL="http://127.0.0.1:8545"

# The account that deployed the contract (or was granted ADMIN_ROLE)
# For local dev: copy the address printed by `npx hardhat node` for account[0]
GOV_WALLET="0xYourGovernmentWalletAddress"

# Private key of GOV_WALLET — used by the backend to sign on-chain admin txs
# For local dev: copy the private key of account[0] from `npx hardhat node`
# NEVER commit this to git
GOV_PRIVATE_KEY="0xYourGovernmentPrivateKey"

# Deployed contract address — printed by node scripts/deploy.mjs
PROPERTY_NFT_ADDRESS="0xYourDeployedContractAddress"

# ── Email ─────────────────────────────────────────────────────────────────────
GMAIL_USER="your@gmail.com"
GMAIL_APP_PASSWORD="your-16-char-app-password"

# ── Google OAuth ──────────────────────────────────────────────────────────────
GOOGLE_CLIENT_ID="your-google-oauth-client-id"

# ── Server ────────────────────────────────────────────────────────────────────
PORT=5000
FRONTEND_URL="http://localhost:3000"
```

---

## 14. Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- MetaMask browser extension

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env — leave PROPERTY_NFT_ADDRESS blank for now
```

### 3. Set up the database

```bash
npx prisma migrate dev    # runs all migrations and creates the schema
npx prisma generate       # generates the Prisma client
```

### 4. Compile the contract

```bash
npm run compile
# Output: artifacts/contracts/RealEstate.sol/RealEstate.json
```

### 5. Start the local Hardhat node

Run this in a separate terminal and keep it running:

```bash
npm run node:local
# Prints 20 accounts with addresses and private keys
# Copy account[0] address  → GOV_WALLET in .env
# Copy account[0] private key → GOV_PRIVATE_KEY in .env
```

### 6. Deploy the contract

```bash
node scripts/deploy.mjs
# Prints: ✅ RealEstate deployed to: 0x...
# Copy that address → PROPERTY_NFT_ADDRESS in .env
```

### 7. (Optional) Grant ADMIN_ROLE to your MetaMask wallet

By default the deployer account (account[0]) has the ADMIN_ROLE. If you want
your MetaMask wallet to be the admin instead:

```bash
# Edit ContractOwnerTransfer.mjs:
# Set yourAddress = your MetaMask wallet address
# Set CONTRACT_ADDRESS = the address from step 6
node scripts/ContractOwnerTransfer.mjs
```

### 8. Start the backend server

```bash
npm run dev
# Server running on http://localhost:5000
```

### 9. Verify everything works

```bash
# Hash utility tests
npm run test:hash       # should print: 18 passed, 0 failed

# Health check
curl http://localhost:5000/api/health
# { "status": "ok", "timestamp": "..." }
```

---

## 15. Security Notes

- **`GOV_PRIVATE_KEY` must never be committed to git.** Add `.env` to
  `.gitignore` and verify it is not tracked.
- **JWT tokens** expire after 7 days. User status is fetched from the database
  on every authenticated request, so KYC approvals and rejections take effect
  immediately without requiring re-login.
- **File uploads** are validated by MIME type and held in memory only — files
  are never written to disk. Maximum 10 MB per file, 20 files per request.
- **Auth endpoints** are rate-limited to 5 requests per 15 minutes to prevent
  brute-force attacks on login and OTP.
- **OTP codes** are bcrypt-hashed before storage and expire after 10 minutes.
- **Wallet ownership** is verified by signature check on both wallet connection
  (`/auth/connect-wallet`) and KYC upload (`/kyc/upload`).
- **Admin routes** require both a valid JWT (`auth`) and the government wallet
  address (`requireAdmin`). `auth` runs one DB query to fetch the user;
  `requireAdmin` is a pure in-memory check — no second DB lookup.
- **Input validation** is enforced by zod schemas before any controller or
  service is reached. A bad request returns a structured error immediately:
  ```json
  {
    "error": "Validation failed",
    "errors": [
      { "field": "email", "message": "Invalid email address" },
      { "field": "password", "message": "Password must be at least 8 characters" }
    ]
  }
  ```
