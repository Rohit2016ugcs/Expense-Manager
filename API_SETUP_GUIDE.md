# API Setup Guide for Vercel Deployment

## Issue: Internal Server Error on API Calls

If you're getting "Internal server error" when calling APIs, follow these steps:

## 1. Fixed vercel.json Routing ✅

The `vercel.json` now correctly routes API calls:

```json
"rewrites": [
  {
    "source": "/api/(.*)",
    "destination": "/api/$1"
  },
  {
    "source": "/(.*)",
    "destination": "/index.html"
  }
]
```

**Why this was needed:** The previous configuration was rewriting ALL routes (including `/api/*`) to `/index.html`, which prevented the serverless API functions from executing.

## 2. Database Configuration Required

Your APIs use Vercel Postgres (`@vercel/postgres`), which requires database credentials.

### Setup Vercel Postgres:

1. **Go to Your Vercel Project Dashboard**
   - Navigate to: https://vercel.com/dashboard
   - Select your project: "Expense Manager"

2. **Navigate to Storage Tab**
   - Click on "Storage" in the top menu
   - Click "Create Database"
   - Select "Postgres"

3. **Create Database**
   - Choose a name (e.g., `expense-manager-db`)
   - Select a region (choose closest to your users)
   - Click "Create"

4. **Vercel Will Auto-Configure Environment Variables**
   - `POSTGRES_URL`
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`
   - `POSTGRES_USER`
   - `POSTGRES_HOST`
   - `POSTGRES_PASSWORD`
   - `POSTGRES_DATABASE`

5. **Run Database Schema**
   - Go to your database dashboard
   - Click on "Query" or "Data"
   - Run the SQL from `api/db-setup.sql`

### Database Schema

Your database needs these tables (from `api/db-setup.sql`):

```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Expenses, Categories, Budgets, etc.
-- (See api/db-setup.sql for complete schema)
```

## 3. Alternative: Use Local SQLite

If you don't want to use Vercel Postgres, your app already supports **local SQLite** mode:

### How Local Mode Works:

1. **No API Required**
   - Data stored in browser using SQL.js
   - No server-side database needed
   - All data stays on user's device

2. **Check Your Code**
   - File: `src/utils/api-adapter.js`
   - It switches between API and local storage automatically

3. **To Force Local Mode**
   - Your app should detect if APIs fail and fallback to local mode
   - All data stored in browser's IndexedDB

## 4. Verify API Endpoints

After setting up the database, test your endpoints:

### Test Signup:
```bash
curl -X POST https://your-app.vercel.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

### Test Login:
```bash
curl -X POST https://your-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 5. Troubleshooting

### Check Vercel Logs:

1. Go to: https://vercel.com/dashboard
2. Select your project
3. Click on a deployment
4. Click "Functions" tab
5. Click on an API function (e.g., `/api/auth/login`)
6. View logs to see the actual error

### Common Issues:

**Error: "connect ECONNREFUSED"**
- Database not configured
- Solution: Set up Vercel Postgres (see step 2)

**Error: "relation 'users' does not exist"**
- Database tables not created
- Solution: Run the schema from `api/db-setup.sql`

**Error: "password authentication failed"**
- Wrong database credentials
- Solution: Check environment variables in Vercel dashboard

## 6. Deploy Changes

After configuring the database:

```bash
# Commit the vercel.json fix
git add vercel.json API_SETUP_GUIDE.md
git commit -m "fix: API routing and add database setup guide"
git push origin main
```

## Summary

✅ **vercel.json fixed** - API routes no longer redirect to index.html  
🔧 **Database needed** - Set up Vercel Postgres or use local mode  
📝 **Schema required** - Run `api/db-setup.sql` on your database  
🔍 **Check logs** - Use Vercel dashboard to debug API issues  

## Quick Check

Your app should work in two modes:

1. **Cloud Mode** (with Vercel Postgres)
   - APIs handle authentication
   - Data synced across devices
   - Requires database setup

2. **Local Mode** (fallback)
   - All data in browser
   - No database needed
   - Works offline

If APIs fail, your app should automatically fallback to local mode.
