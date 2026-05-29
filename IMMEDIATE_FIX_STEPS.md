# 🚨 IMMEDIATE FIX for HTTP 404 Database Error

## The Problem
```
NeonDbError: Server error (HTTP status 404): Not Found
```

**This means:** Your database connection is trying to reach an endpoint that doesn't exist.

---

## ✅ STEP-BY-STEP FIX (Do These In Order)

### Step 1: Verify Database Exists in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Storage"** in the top menu
3. **Check if you see a database listed** (e.g., `expense-manager-db`)

**❌ If NO database exists:**
   - Click **"Create Database"**
   - Select **"Postgres"** (powered by Neon)
   - Name it: `expense-manager-db`
   - Choose a region close to you
   - Click **"Create"**
   - **IMPORTANT:** After creation, click **"Connect Project"** and select your expense manager project
   - Go to Step 2

**✅ If database EXISTS:**
   - Click on the database name
   - Check the status indicator at the top
   - If it says **"Sleeping"** or **"Paused"**, click **"Resume"** or **"Wake Up"**
   - Wait 30 seconds for it to activate
   - Go to Step 2

---

### Step 2: Verify Project is Connected to Database

1. In Vercel Dashboard, go to your **Project** (expense-manager or similar)
2. Click **"Settings"** → **"Environment Variables"**
3. **Look for these variables:**
   - `POSTGRES_URL`
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`

**❌ If these variables DON'T exist:**
   - Go back to **Storage** → Your Database
   - Click **"Connect Project"**
   - Select your expense manager project
   - Check all environments (Production, Preview, Development)
   - Click **"Connect"**
   - This will automatically add the environment variables
   - Go to Step 3

**✅ If variables exist:**
   - Click to reveal `POSTGRES_URL`
   - Copy it (you'll need it for Step 3)
   - It should look like: `postgres://user:pass@ep-xxx-xxx.us-east-2.aws.neon.tech/database?sslmode=require`
   - If it looks correct, go to Step 3

---

### Step 3: Create Database Tables

The 404 error often means tables don't exist. Here's how to create them:

#### **Option A: Using Vercel Dashboard (RECOMMENDED)**

1. Go to **Storage** → Your Database
2. Click the **"Query"** tab (or "Data" → "Query")
3. **Copy and paste the ENTIRE SQL script below and click "Run":**

```sql
-- Create all tables at once
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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

CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_type ON expenses(type);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_expenses_user_id ON recurring_expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_goals_user_id ON savings_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
```

4. After running, go to the **"Data"** or **"Tables"** tab
5. **Verify you see 6 tables:**
   - ✅ users
   - ✅ categories
   - ✅ expenses
   - ✅ budgets
   - ✅ recurring_expenses
   - ✅ savings_goals

#### **Option B: Using Command Line (If you have psql)**

```bash
# In your terminal, navigate to project
cd "/Users/alpha/Desktop/Personal/Rohit/Usefull_Apps/Expense Manager"

# Use the POSTGRES_URL you copied from Vercel
psql "YOUR_POSTGRES_URL_HERE" < api/db-setup.sql
```

---

### Step 4: Test Database Connection

Run this test query in the Vercel Query tab:

```sql
SELECT current_database(), current_user, version();
```

**Expected result:** Should show your database name, username, and PostgreSQL version.

**If this fails:** Your connection string is wrong or database is not accessible.

---

### Step 5: Verify Tables Were Created

Run this in the Query tab:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**Expected result:** You should see 6 tables listed:
- budgets
- categories
- expenses
- recurring_expenses
- savings_goals
- users

**If tables are missing:** Re-run Step 3.

---

### Step 6: Redeploy Your Application

**IMPORTANT:** After creating tables, you MUST redeploy:

1. Go to Vercel Dashboard → Your Project → **"Deployments"**
2. Find the latest deployment
3. Click the **"..."** menu → **"Redeploy"**
4. Wait for deployment to complete (usually 1-2 minutes)

---

### Step 7: Test Login

1. Go to your deployed app URL
2. Try to create a new account:
   - Name: Test User
   - Email: test@example.com
   - Password: test12345
3. Click "Sign Up"

**✅ Success:** You should be logged in and see the dashboard.

**❌ Still Error:** Go to Step 8.

---

### Step 8: Check Vercel Function Logs

1. In Vercel Dashboard → Your Project → **"Deployments"**
2. Click on the latest deployment
3. Click **"Functions"** tab
4. Look for `/api/auth/login` or `/api/auth/signup`
5. Check the logs for detailed error messages

**Common issues:**
- "relation 'users' does not exist" → Tables not created (go back to Step 3)
- "ENOTFOUND" → Database connection string is wrong
- "SSL error" → Add `?sslmode=require` to connection string

---

## 🔍 Additional Troubleshooting

### Check Connection String Format

Your `POSTGRES_URL` should look like this:
```
postgres://username:password@ep-xxx-xxx-xxx.region.aws.neon.tech/database?sslmode=require
```

**Common mistakes:**
- ❌ Missing `?sslmode=require` at the end
- ❌ Using localhost or 127.0.0.1
- ❌ Using pooling URL for non-pooling connections

### Force Environment Variable Refresh

Sometimes Vercel caches old values:

1. Settings → Environment Variables
2. Find `POSTGRES_URL`
3. Click "Edit"
4. Don't change anything, just click "Save"
5. Redeploy

### Clear Build Cache

1. Deployments → Latest
2. "..." menu → "Redeploy"
3. Check ✅ **"Use existing Build Cache"** to **uncheck** it
4. Click "Redeploy"

---

## 🚨 Nuclear Option: Start Fresh

If nothing works, delete and recreate:

1. **Delete Database:**
   - Storage → Your Database → Settings → Delete Database
   
2. **Create New Database:**
   - Storage → Create Database → Postgres
   - Name: `expense-manager-db-v2`
   
3. **Connect to Project:**
   - Connect Project → Select your project
   
4. **Run SQL Schema:**
   - Go to Query tab
   - Run the SQL from Step 3
   
5. **Redeploy:**
   - Deployments → Redeploy

---

## 📋 Quick Checklist

- [ ] Database exists in Vercel Storage
- [ ] Database status is "Active" (not paused)
- [ ] Database is connected to project
- [ ] Environment variables exist (POSTGRES_URL, etc.)
- [ ] All 6 tables created in database
- [ ] Can run `SELECT * FROM users;` without error
- [ ] Application has been redeployed after setup
- [ ] No errors in Function logs

---

## ✅ Expected Final State

After fixing:
- ✅ Sign up works without errors
- ✅ Login works without errors
- ✅ You can see the dashboard
- ✅ Function logs show successful queries
- ✅ Database has 1 user and 16 categories after signup

---

## 💡 Why This Happens

The **HTTP 404** error from Neon database specifically means:
1. **Database endpoint doesn't exist** - Wrong URL in POSTGRES_URL
2. **Tables don't exist** - Database exists but is empty (most common)
3. **Database is sleeping** - Neon free tier pauses after inactivity
4. **Wrong database name** - Connection string points to non-existent database

**The fix is almost always: Create the tables (Step 3) + Redeploy (Step 6)**

---

**Need More Help?** 
- Check the Vercel Function logs for exact error messages
- Ensure you're using the latest deployment
- Make sure database isn't on free tier sleep mode

---

*Last Updated: May 2026*
