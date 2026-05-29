# 🔧 Fix: Database 404 Error

## The Problem
```
NeonDbError: Server error (HTTP status 404): Not Found
```

This error means the connection is working, but the database endpoint returns 404. This happens when:
1. ❌ Database tables don't exist (most common)
2. ❌ Database is paused or sleeping
3. ❌ Wrong database endpoint in connection string

---

## ✅ Solution: Verify and Fix Database

### Step 1: Check Database Status

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on **"Storage"** in the top navigation
3. Find your database (e.g., `expense-manager-db`)
4. Check the status indicator:
   - ✅ **Active** (green) = Good
   - ⚠️ **Paused** (yellow) = Wake it up
   - ❌ **Error** (red) = Problem

**If Paused:**
- Click on the database
- Look for "Resume" or "Wake Up" button
- Click it and wait ~30 seconds

---

### Step 2: Verify Tables Exist

1. In Vercel Dashboard → **Storage** → Your Database
2. Click on **"Data"** or **"Tables"** tab
3. Check if these 6 tables exist:
   - ✅ users
   - ✅ categories
   - ✅ expenses
   - ✅ budgets
   - ✅ recurring_expenses
   - ✅ savings_goals

**If Tables Are Missing** → The 404 error is because tables don't exist!

---

### Step 3: Create Tables (If Missing)

If tables don't exist, you need to run the database schema:

#### **Option A: Using Vercel Dashboard Query Tab**

1. Go to your database → **"Query"** tab
2. Run each SQL statement **ONE AT A TIME** (copy-paste each block and click "Run"):

**Table 1 - Users:**
```sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Table 2 - Categories:**
```sql
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
```

**Table 3 - Expenses:**
```sql
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
```

**Table 4 - Budgets:**
```sql
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
```

**Table 5 - Recurring Expenses:**
```sql
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
```

**Table 6 - Savings Goals:**
```sql
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
```

**Indexes (Run all together):**
```sql
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_type ON expenses(type);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_expenses_user_id ON recurring_expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_goals_user_id ON savings_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
```

After running all 7 blocks, you should see 6 tables in the "Data" tab.

#### **Option B: Using Command Line (Faster)**

If you have `psql` installed:

```bash
# Navigate to project
cd /Users/alpha/Desktop/Personal/Rohit/Usefull_Apps/Expense\ Manager

# Get connection string from Vercel Dashboard → Storage → Database → .env.local tab
# Copy the POSTGRES_URL value

# Run schema
psql "YOUR_POSTGRES_URL_HERE" < api/db-setup.sql
```

---

### Step 4: Verify Tables Were Created

1. Go back to database **"Data"** tab
2. Refresh the page
3. You should now see all 6 tables listed
4. Click on "users" table - it should be empty (0 rows)

---

### Step 5: Redeploy (If Needed)

If you made changes to database:
1. Go to Vercel Dashboard → Your Project → **Deployments**
2. Click **"..."** on latest deployment → **"Redeploy"**
3. Wait for deployment to complete

---

### Step 6: Test Signup Again

1. Visit your deployed app
2. Try to sign up:
   - Name: `Test User`
   - Email: `test@example.com`
   - Password: `test123`
3. If successful → ✅ **Fixed!**

---

## 🔍 Additional Troubleshooting

### Check Connection String

1. Go to Settings → Environment Variables
2. Find `POSTGRES_URL`
3. Click to reveal the value
4. It should look like: `postgres://username:password@hostname.neon.tech/database`
5. Make sure it's not empty or malformed

### Check Database Region

Sometimes 404 happens if there's a region mismatch:

1. Go to Storage → Your Database → Settings
2. Note the region (e.g., `us-east-1`)
3. Go to your Project → Settings → General
4. Check if deployment region matches

### Test Connection Manually

Run this test query in the Query tab:
```sql
SELECT current_database(), current_user;
```

If this works, your connection is fine - the issue is just missing tables.

---

## 🎯 Quick Checklist

- [ ] Database status is "Active" (not paused)
- [ ] All 6 tables exist in database
- [ ] Can run `SELECT * FROM users;` without errors
- [ ] Environment variables include POSTGRES_URL
- [ ] Connection string is valid and not empty
- [ ] Project has been redeployed
- [ ] Sign up functionality now works

---

## ✅ Expected Result

After fixing, when you sign up:
1. User is created in `users` table
2. 16 default categories are created in `categories` table
3. You get redirected to dashboard
4. No errors in Vercel logs

You can verify by checking:
- Database → Data → users table (should have 1 row)
- Database → Data → categories table (should have 16 rows for that user)

---

## 🚨 If Still Not Working

1. **Delete and Recreate Database:**
   - Sometimes a corrupted database needs to be recreated
   - Go to Storage → Database → Settings → Delete Database
   - Create a new one
   - Run the schema again
   - Reconnect to project
   - Redeploy

2. **Check Vercel Logs:**
   - Dashboard → Deployments → Latest → Functions → /api/auth/signup
   - Look for more detailed error messages

3. **Test Locally:**
   ```bash
   vercel link
   vercel env pull .env.local
   vercel dev
   ```
   Then test signup on localhost:3000

---

**💡 Pro Tip**: The most common cause of 404 is missing tables. Always verify tables exist first!

---

*Last Updated: May 2026*
