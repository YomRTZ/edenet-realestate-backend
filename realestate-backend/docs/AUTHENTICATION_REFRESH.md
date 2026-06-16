# Enhanced Authentication System with Session Refresh

## Overview

The application now implements a robust authentication system with:
- **Short-lived session tokens** (15 minutes) - Used for API requests
- **Long-lived refresh tokens** (7 days) - Used to obtain new session tokens
- **Automatic silent refresh** - Frontend automatically refreshes tokens before expiry
- **Session validation middleware** - Backend validates each request's session token
- **Graceful token expiration handling** - User is notified and redirected to login

## Architecture

### Backend Components

#### 1. **Prisma Schema Updates** (`src/prisma/schema.parts/auth.prisma`)
- Added `refreshToken` field to `UserSession` model
- Added `refreshTokenExpiresAt` field to track refresh token expiry

#### 2. **Session Validation Middleware** (`src/middleware/validateSession.middleware.js`)
Two middleware functions available:
- `validateSession` - Requires valid session token, returns 401 if missing/expired
- `optionalSession` - Allows requests without session but attaches user if valid

Usage:
```javascript
authRouter.get('/me', validateSession, authController.me);
```

#### 3. **Auth Service Enhancements** (`src/services/auth.service.js`)

New functions:
- `generateTokens()` - Creates both session and refresh tokens with expiry times
- `refreshToken(oldRefreshToken)` - Validates refresh token and issues new tokens

Token timings:
```javascript
sessionToken: 15 minutes
refreshToken: 7 days
```

#### 4. **Auth Repository Updates** (`src/repositories/auth.repository.js`)

New methods:
- `createUserSession(userId, sessionToken, expiresAt, refreshToken, refreshTokenExpiresAt)`
- `findSessionByToken(sessionToken)`
- `findSessionByRefreshToken(refreshToken)`
- `updateSessionTokens(sessionId, ...)`
- `deleteSessionById(sessionId)`

#### 5. **Auth Controller Updates** (`src/controllers/auth.controller.js`)

Updated endpoints:
- `POST /api/auth/login` - Returns both sessionToken and refreshToken in response and sets cookies
- `POST /api/auth/refresh` - Issues new tokens from valid refresh token
- `POST /api/auth/logout` - Clears both session and refresh token cookies

Token Cookie Settings:
- Both cookies are `httpOnly` (secure against XSS)
- `secure: true` in production (HTTPS only)
- `sameSite: 'none' | 'lax'` depending on environment
- Session cookie: 15 min, Refresh cookie: 7 days

#### 6. **Updated Routes** (`src/routes/auth.routes.js`)
- Changed from `authorizeSession` to `validateSession` middleware
- Added `/refresh` endpoint: `POST /api/auth/refresh`

### Frontend Components

#### 1. **Auth Service** (`src/lib/authService.js`)

Core functions:
```javascript
authService.init()                    // Initialize on app startup
authService.storeTokens(st, rt)      // Store tokens in localStorage
authService.getTokens()               // Retrieve stored tokens
authService.handleLogin(st, rt)       // Handle successful login
authService.handleLogout()            // Clear tokens on logout
authService.silentRefresh()           // Manually trigger token refresh
```

Features:
- Stores tokens in localStorage for persistence
- Parses JWT tokens to track expiration
- Schedules automatic refresh before session token expires
- Implements axios interceptor for automatic 401 handling
- Emits `auth:logout` event when tokens expire or refresh fails

#### 2. **Automatic Token Refresh Mechanism**

**Schedule-based refresh:**
- Calculates when session token expires (15 min)
- Schedules refresh 10 minutes into session (5 minutes before expiry)
- Automatically calls `/api/auth/refresh`
- Updates tokens in localStorage and cookies

**Event-based refresh (on 401):**
- Axios interceptor catches 401 responses
- Automatically attempts token refresh
- Retries original request if refresh succeeds
- Queues failed requests during refresh to prevent race conditions

**Logout event:**
- Fires `auth:logout` custom event when refresh fails
- App.jsx listens and redirects to login
- AuthContext also listens and clears auth state

#### 3. **App.jsx Integration**

```javascript
useEffect(() => {
  // Initialize auth service
  authService.init()
  
  // Listen for logout events
  window.addEventListener('auth:logout', handleLogout)
}, [])
```

Features:
- Shows "Session Expired" message when token expires
- Redirects to home after 1 second
- Prevents routes from being accessible without valid session

#### 4. **Auth API Updates** (`src/features/auth/api/auth.api.js`)

Updated to call `authService` after login/logout:
```javascript
login: async (walletAddress, signature) => {
  const { data } = await api.post('/auth/login', ...)
  authService.handleLogin(data.sessionToken, data.refreshToken)
  return data
}
```

#### 5. **AuthContext Updates** (`src/features/auth/context/AuthContext.jsx`)

Now listens for `auth:logout` events:
```javascript
useEffect(() => {
  const handleAuthLogout = () => logout()
  window.addEventListener('auth:logout', handleAuthLogout)
}, [])
```

Ensures context state syncs with auth service state.

## Authentication Flow

### Login Flow
1. User connects MetaMask wallet
2. Frontend requests nonce: `POST /api/auth/nonce`
3. User signs message with nonce
4. Frontend sends signature: `POST /api/auth/login`
5. Backend verifies signature and creates session
6. Backend returns both sessionToken (15m) and refreshToken (7d)
7. Frontend stores tokens via `authService.handleLogin()`
8. Frontend schedules automatic refresh at 5-minute mark

### Session During Use
1. All API requests include sessionToken in httpOnly cookie
2. Backend validates token via `validateSession` middleware
3. If valid, request proceeds; if expired, returns 401
4. Frontend axios interceptor catches 401 and calls `/api/auth/refresh`
5. Refresh succeeds → new tokens obtained → original request retried
6. Refresh fails → tokens cleared → user redirected to login

### Automatic Refresh Flow
1. After login, auth service calculates refresh time (5 min before expiry)
2. At scheduled time, calls `/api/auth/refresh` with refresh token
3. Backend validates refresh token and returns new tokens
4. Frontend updates stored tokens and reschedules next refresh
5. User continues using app without interruption

### Logout Flow
1. User clicks logout button
2. Frontend calls `POST /api/auth/logout`
3. Backend clears session from database
4. Backend clears both token cookies
5. Frontend calls `authService.handleLogout()`
6. Frontend clears tokens from localStorage
7. User is redirected to home page

## Usage Examples

### Accessing Protected Routes

```javascript
// In component
import { useAuth } from '../features/auth/context/AuthContext'

function MyComponent() {
  const { isAuthenticated, account } = useAuth()
  
  if (!isAuthenticated) {
    return <div>Please login first</div>
  }
  
  return <div>Authenticated as {account}</div>
}
```

### Making API Calls

```javascript
// API calls automatically include sessionToken cookie
// Axios interceptor handles 401 responses

const response = await api.get('/api/protected-route')
// If session expired:
// 1. Interceptor detects 401
// 2. Calls refresh endpoint
// 3. Retries original request with new token
// 4. Returns response if successful
```

### Manual Token Refresh

```javascript
import { authService } from './lib/authService'

// If needed for any reason
const success = await authService.silentRefresh()
if (!success) {
  // Tokens expired, redirect to login
}
```

### Listening for Logout Events

```javascript
// App.jsx already does this, but for reference:
window.addEventListener('auth:logout', (event) => {
  console.log('User logged out:', event.detail.reason)
  // Reason: 'refresh_token_expired' or 'refresh_failed'
})
```

## Database Migration

A new migration was created:
```
src/prisma/migrations/20260614082819_add_refresh_tokens/migration.sql
```

This adds:
- `refresh_token` column to `user_sessions` table
- `refresh_token_expires_at` column to `user_sessions` table
- Unique constraint on `refresh_token`

## Security Considerations

1. **httpOnly Cookies** - Tokens stored in httpOnly cookies prevent XSS attacks
2. **CSRF Protection** - Use sameSite='Strict' or 'Lax' and CSRF tokens if needed
3. **Token Rotation** - Each refresh generates new refresh token (if implemented)
4. **Short Session TTL** - 15-minute session token limits damage from token theft
5. **Refresh Token Storage** - 7-day refresh token allows sessions to last a week
6. **Database Revocation** - Tokens stored in DB allow instant revocation if needed
7. **Secure Transport** - Use HTTPS in production (secure: true)

## Testing

### Test Login
```bash
curl -X POST http://localhost:5000/api/auth/nonce \
  -H "Content-Type: application/json" \
  -d '{"walletAddress":"0x..."}'

# Then sign the nonce and login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"walletAddress":"0x...","signature":"0x..."}'
```

### Test Token Refresh
```bash
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Cookie: refreshToken=..."
```

### Test Protected Route
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Cookie: sessionToken=..."
```

## Troubleshooting

### Issue: "Session token expired" but user should still be logged in
**Solution:** Check that backend is receiving refresh token cookie. Verify cookie settings in login response.

### Issue: Tokens not persisting across page refreshes
**Solution:** Verify localStorage is enabled. Check browser security settings.

### Issue: Silent refresh doesn't trigger
**Solution:** Check browser console for auth service initialization logs. Verify `/api/auth/refresh` endpoint is accessible.

### Issue: User logged out unexpectedly
**Solution:** Check if refresh token expired (7 days) or refresh endpoint returned error. Check auth:logout event in console.

## Future Enhancements

1. **Token Rotation** - Issue new refresh token on each refresh (more secure)
2. **Device Tracking** - Track device fingerprints to detect suspicious activity
3. **Rate Limiting** - Limit refresh attempts to prevent abuse
4. **Multi-Factor Auth** - Add 2FA for additional security
5. **Session Management UI** - Allow users to see active sessions and revoke them
6. **Audit Logging** - Log all auth events for compliance
