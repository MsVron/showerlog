# Authentication System Setup

## Overview
This project uses a complete authentication system with email verification, password reset, and JWT-based sessions. The system is built using Next.js API routes, Nodemailer for emails, and Neon PostgreSQL for data storage.

## Environment Variables Required

Create a `.env.local` file in your project root with the following variables:

```env
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://username:password@host:port/database

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key-here
JWT_EXPIRES_IN=7d

# Email Configuration (Gmail/SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Email Setup (Gmail)

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account Settings
   - Security → 2-Step Verification
   - App passwords → Generate password
   - Use this password as `SMTP_PASS`

## Database Schema

The authentication system uses the following tables:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  email_verified BOOLEAN DEFAULT FALSE,
  email_verification_token VARCHAR(255),
  password_reset_token VARCHAR(255),
  password_reset_expires TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE thoughts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  subtasks JSONB DEFAULT '[]',
  is_saved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE saved_thoughts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  thought_id UUID REFERENCES thoughts(id) ON DELETE CASCADE,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, thought_id)
);
```

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/verify-email` - Verify email address
- `GET /api/auth/verify-email?token=xxx` - Verify email via URL
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Thoughts Management

- `GET /api/thoughts` - Get user's thoughts (paginated)
- `POST /api/thoughts` - Create new thought
- `POST /api/thoughts/[id]/save` - Save/unsave thought
- `GET /api/saved-thoughts` - Get saved thoughts (paginated)

## Security Features

1. **Password Hashing**: bcryptjs with salt rounds of 12
2. **JWT Tokens**: Secure HTTP-only cookies
3. **Email Verification**: Required before login
4. **Password Reset**: Time-limited tokens (1 hour)
5. **Route Protection**: Middleware-based authentication
6. **CSRF Protection**: SameSite cookie settings

## Protected Routes

The following routes require authentication:
- `/dashboard`
- `/saved`

Public routes (redirect to dashboard if logged in):
- `/signin`
- `/signup`
- `/verify-email`
- `/reset-password`
- `/forgot-password`

## Usage Examples

### Signup
```javascript
const response = await fetch('/api/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
    name: 'John Doe'
  })
});
```

### Signin
```javascript
const response = await fetch('/api/auth/signin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});
```

### Create Thought
```javascript
const response = await fetch('/api/thoughts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    content: 'My shower thought...',
    subtasks: ['Task 1', 'Task 2']
  })
});
```

## Dependencies Installed

```bash
npm install bcryptjs jsonwebtoken nodemailer uuid @types/bcryptjs @types/jsonwebtoken @types/nodemailer @types/uuid --legacy-peer-deps
```

## File Structure

```
lib/
  auth.ts              # Authentication utilities
  db.ts               # Database connection

app/api/auth/
  signup/route.ts     # User registration
  signin/route.ts     # User login
  logout/route.ts     # User logout
  verify-email/route.ts # Email verification
  forgot-password/route.ts # Password reset request
  reset-password/route.ts # Password reset

app/api/
  thoughts/route.ts   # Thoughts CRUD
  thoughts/[id]/save/route.ts # Save thoughts
  saved-thoughts/route.ts # Get saved thoughts

middleware.ts         # Route protection
app/verify-email/page.tsx # Email verification page
```

## Testing

1. Set up environment variables
2. Run database migrations
3. Start the development server: `npm run dev`
4. Test signup flow with real email
5. Check email for verification link
6. Test signin after verification
7. Test password reset flow

The authentication system is now fully functional with email verification using Nodemailer! 