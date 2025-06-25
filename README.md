# 🚿 ShowerLog - AI-Powered Task Breakdown App

Transform your random thoughts into actionable plans with AI-powered task breakdown. Built with Next.js, TypeScript, and Google Flan-T5-Large.

## ✨ Features

- **Lightning-fast authentication** with JWT and email verification
- **AI-powered task breakdown** using Google Flan-T5-Large model
- **Real-time thought generation** with AI suggestions
- **Persistent data storage** in Neon PostgreSQL
- **Interactive task management** with completion tracking
- **Beautiful, responsive UI** with shower theme
- **24/7 AI service** via Google Colab + ngrok

## 🚀 Quick Start Guide

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd showerlog
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```env
# Database Configuration (Neon PostgreSQL)
DATABASE_URL=postgresql://neondb_owner:your_password@your_host.neon.tech/neondb?sslmode=require
POSTGRES_URL=postgresql://neondb_owner:your_password@your_host.neon.tech/neondb?sslmode=require

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-signing-key-make-it-long-and-random-for-security-2024
JWT_EXPIRES_IN=7d

# SMTP Configuration (for email verification)
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_PORT=587
SMTP_HOST=smtp.gmail.com
SMTP_FROM=your-email@gmail.com
NEXT_PUBLIC_APP_URL=http://localhost:3000

# AI Service Configuration (from Google Colab + ngrok)
NEXT_PUBLIC_AI_API_URL=https://your-ngrok-url.ngrok-free.app
AI_API_URL=https://your-ngrok-url.ngrok-free.app
```

#### How to get each value:

**Database URLs (DATABASE_URL & POSTGRES_URL):**
- Follow the [NEON_SETUP_GUIDE.md](./NEON_SETUP_GUIDE.md) to create a Neon PostgreSQL database
- Copy the connection string from your Neon console
- Both variables should have the same value
- Format: `postgresql://username:password@host/database?sslmode=require`

**JWT Configuration:**
- `JWT_SECRET`: Generate a long, random string (keep the example or create your own)
- `JWT_EXPIRES_IN`: Token expiration time (7d = 7 days)

**SMTP Configuration (for email verification):**
- Use Gmail with App Password (recommended) or any SMTP provider
- For Gmail: Enable 2FA, then generate an App Password
- `SMTP_USER`: Your Gmail address
- `SMTP_PASS`: Your Gmail App Password (not your regular password)
- `SMTP_FROM`: Same as SMTP_USER

**App Configuration:**
- `NEXT_PUBLIC_APP_URL`: Your app URL (use `http://localhost:3000` for development)

**AI Service URLs:**
- Get these from your Google Colab notebook after setting up ngrok
- Both variables should have the same ngrok URL
- Follow [bag/FLAN_T5_NOTEBOOK_SETUP.md](./bag/FLAN_T5_NOTEBOOK_SETUP.md) for setup

#### Example .env.local file:
```env
DATABASE_URL=postgresql://neondb_owner:npg_abc123@ep-example-123.us-east-2.aws.neon.tech/neondb?sslmode=require
POSTGRES_URL=postgresql://neondb_owner:npg_abc123@ep-example-123.us-east-2.aws.neon.tech/neondb?sslmode=require

JWT_SECRET=your-super-secret-jwt-signing-key-make-it-long-and-random-for-security-2024
JWT_EXPIRES_IN=7d

SMTP_USER=yourapp@gmail.com
SMTP_PASS=abcd efgh ijkl mnop
SMTP_PORT=587
SMTP_HOST=smtp.gmail.com
SMTP_FROM=yourapp@gmail.com
NEXT_PUBLIC_APP_URL=http://localhost:3000

NEXT_PUBLIC_AI_API_URL=https://1234-56-78-901-23.ngrok-free.app
AI_API_URL=https://1234-56-78-901-23.ngrok-free.app
```

> **Important:** Never commit your `.env.local` file to git. It's already in `.gitignore`.

### 3. Database Setup

#### Option A: Use Neon PostgreSQL (Recommended)
1. Follow the detailed guide: **[NEON_SETUP_GUIDE.md](./NEON_SETUP_GUIDE.md)**
2. Run the database migration:
   ```bash
   # Create the database tables
   curl -X POST http://localhost:3000/api/migrate-db
   ```

#### Option B: Use Local PostgreSQL
1. Install PostgreSQL locally
2. Create a database
3. Update your `.env.local` with local database URL
4. Run the SQL schema from `documentation/database/complete_db.sql`

### 4. AI Service Setup

#### Set up Google Colab Notebook
1. Go to [Google Colab](https://colab.research.google.com/)
2. Create a new notebook
3. Follow the detailed setup guide: **[bag/FLAN_T5_NOTEBOOK_SETUP.md](./bag/FLAN_T5_NOTEBOOK_SETUP.md)**
4. Copy the notebook code from **[bag/shower_thoughts_ai_flan_t5.ipynb](./bag/shower_thoughts_ai_flan_t5.ipynb)**
5. Run the notebook and get your ngrok URL
6. Update your `.env.local` with the ngrok URL

### 5. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
showerlog/
├── app/                          # Next.js app directory
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── thoughts/             # Thoughts CRUD operations
│   │   ├── saved-thoughts/       # Saved thoughts management
│   │   └── migrate-db/           # Database migration
│   ├── dashboard/                # Main dashboard page
│   ├── saved/                    # Saved thoughts page
│   └── ...                       # Other pages
├── components/                   # Reusable UI components
├── lib/                          # Utility libraries
│   ├── ai-service.ts            # AI API integration
│   ├── auth-utils.ts            # Authentication utilities
│   ├── db.ts                    # Database connection
│   └── ...
├── documentation/               # Database documentation
│   └── database/
│       └── complete_db.sql      # Database schema
├── bag/                         # Archived documentation & notebooks
│   ├── README.md                # Archive documentation
│   ├── FLAN_T5_NOTEBOOK_SETUP.md # AI setup guide
│   ├── shower_thoughts_ai_flan_t5.ipynb # Colab notebook
│   └── ...                      # Other archived docs
├── NEON_SETUP_GUIDE.md         # Database setup guide
├── .env.local                   # Environment variables (create this)
└── README.md                    # This file
```

## 🔧 Key Files to Configure

### Essential Setup Files:
1. **`.env.local`** - Environment variables (create from template above)
2. **`NEON_SETUP_GUIDE.md`** - Database setup instructions
3. **`bag/FLAN_T5_NOTEBOOK_SETUP.md`** - AI service setup guide
4. **`bag/shower_thoughts_ai_flan_t5.ipynb`** - Google Colab notebook
5. **`documentation/database/complete_db.sql`** - Database schema

### Important API Routes:
- **`/api/migrate-db`** - Database migration endpoint
- **`/api/auth/*`** - Authentication endpoints
- **`/api/thoughts`** - Thoughts management
- **`/api/saved-thoughts`** - Saved thoughts management

## 🌟 How It Works

1. **Sign up/Login** - Secure authentication with email verification
2. **Enter a thought** - Type any random idea or shower thought
3. **AI breakdown** - Flan-T5-Large analyzes and creates actionable subtasks
4. **Task management** - Check off completed tasks, see progress
5. **Save collections** - Store your favorite thoughts and plans
6. **Get inspiration** - AI generates random thoughts to spark creativity

## 🔍 Troubleshooting

### Common Issues:

**AI Service Offline:**
- Check if your Google Colab notebook is running
- Verify ngrok URL in `.env.local`
- Ensure ngrok auth token is set correctly

**Database Connection Issues:**
- Verify Neon PostgreSQL credentials
- Check if database tables exist (run migration)
- Ensure SSL mode is enabled

**Authentication Problems:**
- Check JWT_SECRET is set and consistent
- Verify SMTP credentials for email verification
- Ensure NEXT_PUBLIC_APP_URL matches your domain

### Additional Help:
Check the `bag/` folder for detailed troubleshooting guides and archived documentation.

## 🚀 Deployment

### Deploy to Vercel:
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy with one click

### Deploy AI Service:
1. Keep Google Colab notebook running 24/7
2. Use Google Colab Pro for better reliability
3. Monitor the ngrok URL and update if it changes

## 📚 Documentation

- **[NEON_SETUP_GUIDE.md](./NEON_SETUP_GUIDE.md)** - Complete database setup
- **[bag/FLAN_T5_NOTEBOOK_SETUP.md](./bag/FLAN_T5_NOTEBOOK_SETUP.md)** - AI service setup
- **[bag/README.md](./bag/README.md)** - Archived documentation index
- **[documentation/database/](./documentation/database/)** - Database schemas

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - feel free to use this project for your own purposes!

---

**Made with ☕ and 🚿 thoughts** 