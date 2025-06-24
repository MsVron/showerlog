# Neon PostgreSQL Database Setup Guide

## Overview
This guide will walk you through setting up a free PostgreSQL database with Neon for your Next.js showerthoughts application. Neon is a serverless PostgreSQL platform that's perfect for modern web applications.

## Why Neon?
- **Free tier**: Great for development and small applications
- **Serverless**: Auto-scaling and auto-sleep to save costs
- **PostgreSQL**: Full PostgreSQL compatibility
- **Instant branching**: Create database branches for testing
- **Zero downtime**: Built for cloud-native applications

## Step 1: Create a Neon Account

1. Go to [neon.tech](https://neon.tech)
2. Click "Sign Up" 
3. You can sign up with GitHub, Google, or email
4. Choose GitHub for faster setup since you're building an open-source project

## Step 2: Create Your First Project

1. After logging in, you'll see the Neon Console
2. Click "New Project" 
3. Choose these settings:
   - **Project name**: `showerthoughts-app`
   - **Database name**: `showerthoughts` 
   - **Region**: Choose the region closest to your users (US East is good for global)
   - **PostgreSQL version**: 16 (latest stable)

4. Click "Create Project"

## Step 3: Get Your Connection String

1. After project creation, you'll see your project dashboard
2. Click the "Connect" button
3. Select "Next.js" from the framework dropdown
4. Copy the connection string - it looks like:
   ```
   postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/showerthoughts?sslmode=require
   ```

## Step 4: Set Up Environment Variables

1. In your Next.js project root, create or update `.env.local`:
   ```env
   # Neon Database
   DATABASE_URL="your-neon-connection-string-here"
   
   # For Prisma (if using)
   DIRECT_URL="your-neon-connection-string-here"
   ```

2. Add `.env.local` to your `.gitignore` if not already there

## Step 5: Install Database Dependencies

Choose one of these setups:

### Option A: Neon Serverless Driver (Recommended for Edge)
```bash
npm install @neondatabase/serverless
```

### Option B: Prisma ORM (Recommended for Complex Queries)
```bash
npm install prisma @prisma/client
npm install -D @types/node
```

### Option C: Drizzle ORM (Lightweight Alternative)
```bash
npm install drizzle-orm @neondatabase/serverless
npm install -D drizzle-kit
```

## Step 6: Database Schema Design

For your showerthoughts app, you'll need these tables:

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Thoughts Table
```sql
CREATE TABLE thoughts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  subtasks JSONB DEFAULT '[]',
  is_saved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Saved Thoughts Table (for user's saved thoughts)
```sql
CREATE TABLE saved_thoughts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  thought_id UUID REFERENCES thoughts(id) ON DELETE CASCADE,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, thought_id)
);
```

## Step 7: Set Up Database Connection

### If using Neon Serverless Driver:

Create `lib/db.ts`:
```typescript
import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

export const sql = neon(process.env.DATABASE_URL);

// Test connection
export async function testConnection() {
  try {
    const result = await sql`SELECT NOW()`;
    console.log('Database connected:', result[0]);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}
```

### If using Prisma:

1. Initialize Prisma:
   ```bash
   npx prisma init
   ```

2. Update `prisma/schema.prisma`:
   ```prisma
   generator client {
     provider = "prisma-client-js"
   }

   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
     directUrl = env("DIRECT_URL")
   }

   model User {
     id        String   @id @default(cuid())
     email     String   @unique
     name      String?
     createdAt DateTime @default(now()) @map("created_at")
     updatedAt DateTime @updatedAt @map("updated_at")
     
     thoughts      Thought[]
     savedThoughts SavedThought[]

     @@map("users")
   }

   model Thought {
     id        String   @id @default(cuid())
     userId    String   @map("user_id")
     content   String
     subtasks  Json     @default("[]")
     isSaved   Boolean  @default(false) @map("is_saved")
     createdAt DateTime @default(now()) @map("created_at")
     updatedAt DateTime @updatedAt @map("updated_at")
     
     user          User           @relation(fields: [userId], references: [id], onDelete: Cascade)
     savedThoughts SavedThought[]

     @@map("thoughts")
   }

   model SavedThought {
     id        String   @id @default(cuid())
     userId    String   @map("user_id")
     thoughtId String   @map("thought_id")
     savedAt   DateTime @default(now()) @map("saved_at")
     
     user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
     thought Thought @relation(fields: [thoughtId], references: [id], onDelete: Cascade)

     @@unique([userId, thoughtId])
     @@map("saved_thoughts")
   }
   ```

3. Generate and push schema:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. Create `lib/prisma.ts`:
   ```typescript
   import { PrismaClient } from '@prisma/client'

   const globalForPrisma = globalThis as unknown as {
     prisma: PrismaClient | undefined
   }

   export const prisma = globalForPrisma.prisma ?? new PrismaClient()

   if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
   ```

## Step 8: Create Database Functions

Create `lib/database-functions.ts`:

```typescript
import { sql } from './db'; // or import { prisma } from './prisma'

// User functions
export async function createUser(email: string, name?: string) {
  try {
    const result = await sql`
      INSERT INTO users (email, name)
      VALUES (${email}, ${name})
      RETURNING *
    `;
    return result[0];
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function getUserByEmail(email: string) {
  try {
    const result = await sql`
      SELECT * FROM users WHERE email = ${email}
    `;
    return result[0] || null;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
}

// Thought functions
export async function createThought(userId: string, content: string, subtasks: any[] = []) {
  try {
    const result = await sql`
      INSERT INTO thoughts (user_id, content, subtasks)
      VALUES (${userId}, ${content}, ${JSON.stringify(subtasks)})
      RETURNING *
    `;
    return result[0];
  } catch (error) {
    console.error('Error creating thought:', error);
    throw error;
  }
}

export async function getUserThoughts(userId: string) {
  try {
    const result = await sql`
      SELECT * FROM thoughts 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;
    return result;
  } catch (error) {
    console.error('Error getting thoughts:', error);
    throw error;
  }
}

export async function saveThought(userId: string, thoughtId: string) {
  try {
    const result = await sql`
      INSERT INTO saved_thoughts (user_id, thought_id)
      VALUES (${userId}, ${thoughtId})
      ON CONFLICT (user_id, thought_id) DO NOTHING
      RETURNING *
    `;
    return result[0];
  } catch (error) {
    console.error('Error saving thought:', error);
    throw error;
  }
}

export async function getSavedThoughts(userId: string) {
  try {
    const result = await sql`
      SELECT t.*, st.saved_at 
      FROM thoughts t
      JOIN saved_thoughts st ON t.id = st.thought_id
      WHERE st.user_id = ${userId}
      ORDER BY st.saved_at DESC
    `;
    return result;
  } catch (error) {
    console.error('Error getting saved thoughts:', error);
    throw error;
  }
}
```

## Step 9: Test Your Database Connection

Create a test API route at `app/api/test-db/route.ts`:

```typescript
import { testConnection } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const isConnected = await testConnection();
    
    if (isConnected) {
      return NextResponse.json({ 
        message: 'Database connected successfully!',
        status: 'success'
      });
    } else {
      return NextResponse.json({ 
        message: 'Database connection failed',
        status: 'error'
      }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ 
      message: 'Database connection error',
      error: error.message,
      status: 'error'
    }, { status: 500 });
  }
}
```

Run your app and visit `http://localhost:3000/api/test-db` to test the connection.

## Step 10: Run Database Migration

After confirming your database connection works, run the migration to create all necessary tables:

### Option A: Using curl (Recommended)
```bash
# Start your Next.js app first
npm run dev

# Then in another terminal, run the migration
curl -X POST http://localhost:3000/api/migrate-db
```

### Option B: Using your browser
1. Start your app: `npm run dev`
2. Visit: `http://localhost:3000/api/migrate-db` (this will run a GET request, but the endpoint supports POST)

### Option C: Manual SQL execution
If the migration endpoint doesn't work, you can manually run the SQL from `documentation/database/complete_db.sql`:

1. Open Neon Console → SQL Editor
2. Copy and paste the contents of `documentation/database/complete_db.sql`
3. Execute the SQL

### Verify Migration Success
After running the migration, check that these tables were created:
- `users` - User accounts and authentication
- `thoughts` - User thoughts and AI-generated subtasks  
- `saved_thoughts` - Many-to-many relationship for saved thoughts

You can verify in the Neon Console → Tables section.

## Step 11: Neon Console Features

In your Neon console, you can:

1. **Monitor Usage**: See compute hours, storage, and data transfer
2. **View Tables**: Browse your data directly in the console
3. **SQL Editor**: Run queries directly
4. **Branching**: Create database branches for development
5. **Backups**: Automatic point-in-time recovery

## Step 12: Deployment Considerations

### For Vercel Deployment:
1. Add your `DATABASE_URL` to Vercel environment variables
2. Neon works perfectly with Vercel's serverless functions
3. Consider using Neon's Vercel integration for easier setup

### Connection Pooling:
Neon handles connection pooling automatically, but for high-traffic apps, consider:
```typescript
// Add connection pooling parameters to your connection string
const connectionString = `${process.env.DATABASE_URL}?sslmode=require&pgbouncer=true`;
```

## Security Best Practices

1. **Environment Variables**: Never commit `.env.local` to git
2. **SSL Mode**: Always use `sslmode=require` in production
3. **IP Allowlist**: Configure IP restrictions in Neon console if needed
4. **Least Privilege**: Create separate database users with minimal permissions

## Next Steps

1. Set up your authentication system (Clerk/Auth.js)
2. Create your API routes for CRUD operations
3. Implement the AI model integration for task breakdown
4. Test your database operations thoroughly

## Troubleshooting

### Common Issues:

1. **Connection Timeout**: 
   - Check your internet connection
   - Verify the connection string is correct

2. **SSL Errors**:
   - Ensure `sslmode=require` is in your connection string

3. **Database Not Found**:
   - Verify the database name in your connection string
   - Check if the database was created in Neon console

4. **Permission Errors**:
   - Ensure your user has the correct permissions
   - Check if you're using the right connection string

### Getting Help:
- Neon Discord: [discord.gg/neon](https://discord.gg/neon)
- Neon Docs: [neon.tech/docs](https://neon.tech/docs)
- GitHub Issues: For app-specific problems

## Cost Management

### Free Tier Limits:
- **Compute**: 191.9 hours/month (plenty for development)
- **Storage**: 512 MB
- **Projects**: 10
- **Branches**: Unlimited

### Monitoring Usage:
1. Check the Neon console regularly
2. Set up alerts if approaching limits
3. Consider upgrading to paid plans for production

Your Neon database is now ready for your showerthoughts application! The serverless nature means it will scale automatically and only charge you for what you use. 