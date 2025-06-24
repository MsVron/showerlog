# Authentication Troubleshooting Guide

## Issues Fixed

### 1. Frontend Not Calling Real APIs
**Problem**: The signup and signin pages were using mock/simulated API calls with `setTimeout` instead of actually calling the authentication endpoints.

**Symptoms**:
- Success messages appear but user is not redirected
- No actual account creation or login occurs
- No emails are sent

**Fix**: Updated `app/signup/page.tsx` and `app/signin/page.tsx` to:
- Make real API calls to `/api/auth/signup` and `/api/auth/signin`
- Handle proper error responses
- Redirect to appropriate pages on success
- Show proper error messages

### 2. Email Configuration Issues
**Problem**: Email sending functionality needed better error handling and logging.

**Symptoms**:
- No verification emails received
- Silent failures in email sending

**Fix**: Enhanced `lib/email.ts` with:
- Better error handling and logging
- More descriptive error messages
- Console logging for debugging

## Current Configuration Requirements

### Environment Variables (.env.local)
```env
DATABASE_URL=your_neon_database_url
JWT_SECRET=your_jwt_secret_key
SMTP_USER=your_gmail_address
SMTP_PASS=your_gmail_app_password
SMTP_PORT=587
SMTP_HOST=smtp.gmail.com
SMTP_FROM=your_gmail_address
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Important Notes about Your Configuration

1. **JWT_SECRET**: Your current JWT_SECRET looks like a full JWT token. Consider using a simpler secret key like:
   ```
   JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
   ```

2. **Gmail App Password**: Make sure you're using a Gmail App Password, not your regular Gmail password.

3. **Gmail Setup**: Ensure 2-factor authentication is enabled on your Gmail account to generate app passwords.

## Authentication Flow

1. **Signup Process**:
   - User fills signup form
   - API creates user with `email_verified = false`
   - Verification email is sent
   - User clicks verification link
   - Email is verified, user can now sign in

2. **Signin Process**:
   - User fills signin form
   - API checks credentials and email verification status
   - If verified, JWT token is set as HTTP-only cookie
   - User is redirected to dashboard

## Testing Steps

1. **Test Signup**:
   - Go to `/signup`
   - Fill form and submit
   - Check browser console for any errors
   - Check email for verification link

2. **Test Email Verification**:
   - Click verification link from email
   - Should see success message
   - Try signing in

3. **Test Signin**:
   - Go to `/signin`
   - Use verified credentials
   - Should redirect to `/dashboard`

## Common Issues and Solutions

### No Email Received
1. Check spam/junk folder
2. Verify Gmail app password is correct
3. Check server console logs for email errors
4. Test with a different email address

### "Please verify your email" Error
- The user exists but hasn't clicked the verification link
- Resend verification email or manually update database

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check Neon database is accessible
- Run database test endpoint: `/api/test-db`

### JWT Token Issues
- Clear browser cookies
- Check JWT_SECRET in environment variables
- Verify token generation and verification functions

## Database Schema Requirements

Users table must have:
- `id` (primary key)
- `email` (unique)
- `password_hash`
- `name`
- `email_verified` (boolean, default false)
- `email_verification_token` (nullable)
- `created_at`
- `updated_at`

## Development Commands

```bash
npm run dev
npm run build
npm run start
```

## Security Notes

- JWT tokens are stored as HTTP-only cookies
- Passwords are hashed with bcryptjs
- Email verification is required before signin
- Verification tokens are UUID4 format
- SMTP credentials should be app passwords, not regular passwords 