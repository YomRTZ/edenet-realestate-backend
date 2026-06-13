# Authentication & Session Flow — Realstate Backend

This document summarizes how authentication is implemented in this project, the key endpoints, database models, security considerations, and suggested next steps.

**Summary**
- **Auth method**: Signature-based login using an Ethereum wallet (user signs a server-provided nonce with their private key, verified via `ethers`).
- **Nonce issuance**: `POST /api/auth/nonce` — Client provides `{ walletAddress }`. Server stores a 5-minute `WalletNonce` row and returns the nonce. A `User` record is created if needed.
- **Signature verification / Login**: `POST /api/auth/login` — Client submits `{ signature, walletAddress }`. Server finds an unexpired unused nonce, verifies the signature against the expected message `Sign to authorize access:\nNonce: ${nonce}` using `ethers.verifyMessage`. If valid, the nonce is marked used and a JWT session token is created and stored.
- **Session token**: A JWT is signed with `process.env.JWT_SECRET` with `expiresIn: '2h'`. The token is stored in DB `UserSession` with an `expiresAt` 2 hours in the future and is sent to the client as an `HttpOnly` cookie named `sessionToken`.
- **Session revocation / Logout**: `POST /api/auth/logout` — server deletes `UserSession` rows for the cookie token and clears the cookie. DB-backed sessions allow instant revocation.

**How `authorizeSession` works**
- Located at `src/middleware/authSession.middleware.js`.
- Reads `sessionToken` from `req.cookies`.
- Calls `jwt.verify(token, process.env.JWT_SECRET)` to verify the signature.
- Queries `UserSession` by `sessionToken` and `include: { user: true }`.
- If session missing or expired (`expiresAt < new Date()`), returns 401.
- Otherwise sets `req.user = activeSession.user` and calls `next()`.

**Relevant Database Models (Prisma)**
- `User` — stores `id`, `walletAddress`, `role` (Government | Citizen), `isOwner`, `isTenant`.
- `WalletNonce` — stores `walletAddress`, `nonce`, `expiresAt`, `usedAt`.
- `UserSession` — stores `sessionToken` (unique), `userId`, `expiresAt`, enabling server-side session tracking and revocation.

**Endpoints & Protections**
- Public endpoints:
  - `POST /api/auth/nonce` — request a nonce for a wallet address (no auth).
  - `POST /api/auth/login` — verify signature and create session (no auth).
  - `POST /api/auth/logout` — deletes DB session(s) for the cookie token and clears the cookie.
- Protected endpoints (examples):
  - `POST /api/citizen/update-status` — uses `authorizeSession` middleware.
  - Search for uses of `authorizeSession` in `src/` to find all protected routes.

**Security Properties & Notes**
- Pros:
  - No passwords — authentication is based on wallet signature ownership.
  - DB-backed sessions enable instant revocation and server-side expiry checks.
  - Cookie is `HttpOnly` and `sameSite: 'strict'` (reduces XSS/CSRF risk).
- Considerations:
  - Keep `JWT_SECRET` strong and protected; if leaked, tokens can be forged.
  - The middleware verifies JWT signature and uses DB expiry as authoritative — ensure JWT expiration and DB `expiresAt` remain in sync.
  - No explicit rate-limiting for nonce issuance / login attempts is visible — consider adding rate limits to prevent abuse.
  - If cross-site requests are required, supplement `sameSite: 'strict'` with CSRF protection measures.
  - There is no refresh-token flow; users re-authenticate after expiry (by design may be acceptable).

**Files Inspected**
- `src/routes/auth.routes.js` — nonce, login, logout handlers, and `citizen/update-status`.
- `src/middleware/authSession.middleware.js` — session validation middleware.
- `src/prisma/schema.generated.prisma` and `src/prisma/schema.parts/auth.prisma` — Prisma models for `User`, `WalletNonce`, `UserSession`.
- `realstate-frontend/src/pages/CitizenGovernmentPortal.jsx` — frontend sequence: request nonce -> sign message -> send signature to `/api/auth/login` -> server sets cookie and returns user info.

**Suggested Improvements (optional)**
- Add rate-limiting to `/api/auth/nonce` and `/api/auth/login` (e.g., using `express-rate-limit`) to mitigate abuse.
- Consider logging suspicious signature attempts and enforcing challenge-use limits per wallet per time window.
- Consider validating JWT payload claims (e.g., `exp`) during middleware verification to provide defense-in-depth.
- If the app requires cross-site requests, add CSRF tokens or other CSRF protections.

**Next Steps / Offers**
- I can list all routes that use `authorizeSession` and add them to this doc.
- I can implement suggested improvements (rate limit middleware, extra checks) and open a PR.

---
Generated on: 2026-06-13
