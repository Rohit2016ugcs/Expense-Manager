# 🎯 SUPABASE DATABASE SETUP - Fix 404 Error

## The Problem

You have **Supabase** connected to Vercel, but the database tables don't exist yet. That's why you're getting the 404 error when trying to login.

Your Supabase database ID: `jeremhmqagndbswpmgjb`

---

## ✅ QUICK FIX (3 Steps)

### Step 1: Go to Supabase Dashboard

1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Sign in with your account
3. Find your project: **supabase-rose-queen**
4. Click on it to open

---

### Step 2: Create Database Tables

1. In the left sidebar, click on **"SQL Editor"** (icon looks like `</>`)
2. Click **"+ New Query"** button (top right)
3. **Copy and paste this ENTIRE SQL script:**

**⚠️ Important:** Supabase will show a warning about Row Level Security (RLS). 

**For this app, you can SKIP RLS** because:
- Your app uses backend API routes (Vercel serverless functions)
- The frontend never directly accesses Supabase
- All database queries go through your secure backend
- Your backend uses POSTGRES_URL with full permissions

**Click "I understand" or "Continue without RLS" when prompted.**

```sql
-- Expense Manager Database Schema for Supabase
-- This creates all required tables and indexes
-- 
-- NOTE: Row Level Security (RLS) is NOT needed for this setup
-- because all database access goes through backend API routes,
-- not direct client access from the browser.

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  icon VARCHAR(50),
  color VARCHAR(50),
  type VARCHAR(20) NOT NULL CHECK(type IN ('income', 'expense')),
  budget_limit DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  description TEXT,
  date DATE NOT NULL,
  type VARCHAR(20) NOT NULL CHECK(type IN ('income', 'expense')),
  payment_method VARCHAR(50),
  tags TEXT,
  receipt_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Budgets table
CREATE TABLE IF NOT EXISTS budgets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  period VARCHAR(20) NOT NULL CHECK(period IN ('daily', 'weekly', 'monthly', 'yearly')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  alert_threshold INTEGER DEFAULT 80,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recurring expenses table
CREATE TABLE IF NOT EXISTS recurring_expenses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  description TEXT,
  frequency VARCHAR(20) NOT NULL CHECK(frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
  start_date DATE NOT NULL,
  end_date DATE,
  next_occurrence DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  type VARCHAR(20) NOT NULL CHECK(type IN ('income', 'expense')),
  payment_method VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Savings goals table
CREATE TABLE IF NOT EXISTS savings_goals (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  target_amount DECIMAL(10, 2) NOT NULL,
  current_amount DECIMAL(10, 2) DEFAULT 0,
  deadline DATE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_type ON expenses(type);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_expenses_user_id ON recurring_expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_goals_user_id ON savings_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres;
```

4. Click **"Run"** button (bottom right corner)
5. Wait for the query to complete
6. You should see: **"Success. No rows returned"** or similar message

---

### Step 3: Verify Tables Were Created

1. In the left sidebar, click on **"Table Editor"**
2. You should now see 6 tables in the dropdown:
   - ✅ users
   - ✅ categories
   - ✅ expenses
   - ✅ budgets
   - ✅ recurring_expenses
   - ✅ savings_goals

3. Click on **"users"** table
4. It should be empty (0 rows) - this is correct!

---

## 🚀 Step 4: Redeploy Your Vercel App

**IMPORTANT:** After creating tables, you must redeploy:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your **Expense Manager** project
3. Click **"Deployments"** tab
4. Find the latest deployment
5. Click the **"..."** (three dots) menu
6. Click **"Redeploy"**
7. Wait for deployment to complete (~1-2 minutes)

---

## 🧪 Step 5: Test Your Application

1. Visit your deployed app URL
2. Click **"Sign Up"** tab
3. Create a test account:
   - **Name:** Test User
   - **Email:** test@example.com
   - **Password:** test12345
4. Click **"Sign Up"**

**✅ Expected Result:**
- You should be logged in automatically
- Dashboard should load without errors
- You should see the expense manager interface

**❌ If Still Error:**
- Check Vercel function logs (see Step 6)

---

## 🔍 Step 6: Verify Data in Supabase

After successful signup:

1. Go back to **Supabase Dashboard** → **Table Editor**
2. Click **"users"** table
   - Should have **1 row** (your test user)
3. Click **"categories"** table
   - Should have **16 rows** (default categories)

If you see this data, everything is working! 🎉

---

## 📋 Troubleshooting Checklist

If you're still getting errors, verify these:

- [ ] Supabase database status is "Active" (not paused)
- [ ] All 6 tables exist in Supabase Table Editor
- [ ] Environment variables are set in Vercel (they are - you showed them)
- [ ] You've redeployed Vercel after creating tables
- [ ] Browser cache is cleared (try incognito mode)

---

## 🔧 Additional Verification

### Check Supabase Connection

In Supabase SQL Editor, run this test query:

```sql
SELECT current_database(), current_user;
```

Should return your database name and user.

### Check Tables

Run this query:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Should return all 6 table names.

### Check Users Table Structure

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;
```

Should show: id, name, email, password, created_at

---

## 🎯 Common Supabase Issues

### Issue 1: "Table does not exist"
**Fix:** Re-run the SQL schema in Step 2

### Issue 2: "Permission denied"
**Fix:** Make sure you're using the correct POSTGRES_URL (not the pooling URL)

### Issue 3: "Connection timeout"
**Fix:** 
- Check Supabase project is not paused
- Check Vercel environment variables are correct
- Redeploy Vercel app

---

## 🔑 Your Environment Variables (Already Set ✅)

These are already configured in your Vercel project:

```
✅ POSTGRES_URL
✅ POSTGRES_PRISMA_URL
✅ POSTGRES_URL_NON_POOLING
✅ POSTGRES_HOST
✅ POSTGRES_DATABASE
✅ POSTGRES_USER
✅ POSTGRES_PASSWORD
✅ SUPABASE_URL
✅ SUPABASE_PUBLISHABLE_KEY
✅ SUPABASE_SECRET_KEY
✅ SUPABASE_SERVICE_ROLE_KEY
✅ SUPABASE_JWT_SECRET
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
```

**So you DON'T need to change environment variables.** Just create the tables!

---

## 💡 Why This Happens

When you connect Supabase to Vercel:
1. ✅ Connection is established automatically
2. ✅ Environment variables are added automatically
3. ❌ **But tables are NOT created automatically**

You must manually create tables using SQL Editor (that's what we did in Step 2).

---

## 🎉 Expected Final Result

After following all steps:

1. **Supabase:** 6 tables with proper schema
2. **Vercel:** Successfully deployed with no build errors
3. **App:** Sign up works, login works, dashboard loads
4. **Logs:** No 404 errors in Vercel function logs

---

## 🚨 If Nothing Works

**Nuclear Option - Start Fresh:**

1. In Supabase SQL Editor, delete all tables:
   ```sql
   DROP TABLE IF EXISTS savings_goals CASCADE;
   DROP TABLE IF EXISTS recurring_expenses CASCADE;
   DROP TABLE IF EXISTS budgets CASCADE;
   DROP TABLE IF EXISTS expenses CASCADE;
   DROP TABLE IF EXISTS categories CASCADE;
   DROP TABLE IF EXISTS users CASCADE;
   ```

2. Re-run the CREATE TABLE script from Step 2

3. Redeploy on Vercel

4. Test signup again

---

## 📞 Need More Help?

If you're still stuck:

1. **Check Vercel Function Logs:**
   - Deployments → Latest → Functions → `/api/auth/login`
   - Look for specific error messages

2. **Check Supabase Logs:**
   - Supabase Dashboard → Logs → API Logs
   - Filter by recent errors

3. **Test Locally:**
   ```bash
   cd "/Users/alpha/Desktop/Personal/Rohit/Usefull_Apps/Expense Manager"
   vercel env pull .env.local
   node verify-database.js
   ```

---

**✅ You're almost there!** Just run that SQL script in Supabase and redeploy. The 404 error will be fixed! 🚀

---

*Last Updated: May 2026*
