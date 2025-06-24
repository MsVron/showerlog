# Authentication Debug Guide

## Issue Identified

The authentication system is working correctly on the backend, but there's a disconnect between successful login and cookie persistence. Here's what we found:

### Current Status
- ✅ Database connection working
- ✅ JWT token generation/verification working
- ✅ User authentication logic working
- ❌ Cookie not being set or persisted properly
- ❌ Middleware redirecting authenticated users back to signin

## Debug Steps

### Step 1: Verify Test User Email
The test user `test@example.com` has `email_verified: false`. To fix this:

```bash
curl -X POST http://localhost:3000/api/debug-verify
```

### Step 2: Test Authentication Flow
1. Open browser dev tools (F12)
2. Go to `http://localhost:3000/signin`
3. Sign in with:
   - Email: `test@example.com`
   - Password: `password123`
4. Check console for debug messages
5. Check Network tab for cookie headers
6. Check Application/Storage tab for cookies

### Step 3: Debug Cookie Setting
After signin, check: `http://localhost:3000/api/debug-auth`

Expected response should show:
```json
{
  "cookieExists": true,
  "tokenValid": true,
  "decodedData": { "userId": "..." }
}
```

## Potential Issues

### 1. Cookie Domain/Path Issues
The cookie might not be set correctly for localhost. Check if cookie has:
- `Domain`: localhost or 127.0.0.1
- `Path`: /
- `HttpOnly`: true
- `SameSite`: lax

### 2. Browser Cookie Blocking
Some browsers block cookies on localhost. Try:
- Different browser
- Incognito mode
- Disable ad blockers

### 3. Timing Issues
The redirect might happen before cookie is fully set. Our current solution:
- Added 100ms delay before redirect
- Added fallback redirect after 1.5s
- Added cookie verification step

### 4. HTTPS vs HTTP
In production, `secure: true` requires HTTPS. In development it should be `false`.

## Quick Fixes

### Fix 1: Verify Test User
Run this to verify the test user's email:
```bash
curl -X POST http://localhost:3000/api/debug-verify
```

### Fix 2: Alternative Cookie Setting
If the current method doesn't work, try using `res.setHeader()` instead:

```typescript
response.headers.set('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=lax`);
```

### Fix 3: Client-Side Cookie Check
Add this to the signin success handler:
```typescript
// Check if cookie was actually set
const cookies = document.cookie;
console.log('All cookies after signin:', cookies);
```

## Test Commands

1. Check users: `curl http://localhost:3000/api/debug-users`
2. Verify test user: `curl -X POST http://localhost:3000/api/debug-verify`
3. Check auth status: `curl http://localhost:3000/api/debug-auth`
4. Test auth: `curl http://localhost:3000/api/test-auth`

## Next Steps

1. Verify the test user email
2. Try signing in with `test@example.com` / `password123`
3. Check browser dev tools for debug information
4. If still not working, we may need to:
   - Use a different cookie setting method
   - Check for conflicting middleware
   - Verify the JWT secret is consistent
   - Test with a different authentication approach

## Manual Cookie Test

You can manually test cookie functionality:
1. Go to: `http://localhost:3000/api/debug-auth` (POST request)
2. This will set a test token
3. Then check: `http://localhost:3000/api/debug-auth` (GET request)
4. Should show the token is valid

If this works but signin doesn't, the issue is in the signin flow specifically. 