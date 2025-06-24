# Quick Start: Neon Database Setup

## 1. Sign Up for Neon (2 minutes)
1. Go to [neon.tech](https://neon.tech)
2. Click "Sign Up" and use your GitHub account
3. This is free and gives you plenty for development

## 2. Create Database Project (1 minute)
1. Click "New Project" 
2. Name: `showerthoughts-app`
3. Database: `showerthoughts`
4. Region: US East (or closest to you)
5. Click "Create Project"

## 3. Get Connection String (30 seconds)
1. Click "Connect" button in your new project
2. Select "Next.js" from dropdown
3. Copy the connection string

## 4. Add to Your Project (1 minute)
Create `.env.local` in your project root:
```env
DATABASE_URL="your-connection-string-here"
```

## 5. Install Neon Driver (30 seconds)
```bash
npm install @neondatabase/serverless
```

## 6. Test Connection (2 minutes)
Create `lib/db.ts`:
```typescript
import { neon } from '@neondatabase/serverless';

export const sql = neon(process.env.DATABASE_URL!);

export async function testDB() {
  const result = await sql`SELECT NOW()`;
  return result[0];
}
```

Create `app/api/test/route.ts`:
```typescript
import { testDB } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const result = await testDB();
    return NextResponse.json({ success: true, time: result });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

## 7. Create Tables (2 minutes)
Run this SQL in the Neon console or create a migration script:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Thoughts table  
CREATE TABLE thoughts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  subtasks JSONB DEFAULT '[]',
  is_saved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Saved thoughts (many-to-many relationship)
CREATE TABLE saved_thoughts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  thought_id UUID REFERENCES thoughts(id) ON DELETE CASCADE,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, thought_id)
);
```

## 8. Test Your Setup
1. Run `npm run dev`
2. Visit `http://localhost:3000/api/test`
3. You should see a success response with timestamp

## You're Done! 🎉
Total time: ~7 minutes

Your database is now ready for:
- User authentication
- Storing thoughts and subtasks
- Saving favorite thoughts
- Ready for deployment to Vercel

Next steps:
- Set up authentication (Clerk)
- Create API routes for CRUD operations
- Build your frontend components

Need more details? Check the full `NEON_SETUP_GUIDE.md` 