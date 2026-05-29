# 🗄️ Vercel Postgres Database Configuration Guide

## Step-by-Step Setup

### ✅ Step 1: Create Vercel Postgres Database

1. **Login to Vercel Dashboard**
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Sign in with your account

2. **Navigate to Storage**
   - Click on the **"Storage"** tab in the top navigation
   - Click **"Create Database"** button

3. **Select Postgres**
   - Choose **"Postgres"** from the database options
   - Click **"Continue"**

4. **Configure Database**
   - **Name**: `expense-manager-db` (or any name you prefer)
   - **Region**: Select the region closest to your users (e.g., `US East`, `Europe`, `Asia`)
   - Click **"Create"**

5. **Wait for Creation**
   - Vercel will provision your database (takes ~30 seconds)
   - Once created, you'll see the database dashboard

---

### ✅ Step 2: Connect Database to Your Project

1. **Select Your Project**
   - In Vercel Dashboard, go to **Projects**
   - Click on your **"Expense Manager"** project

2. **Go to Settings**
   - Click on **"Settings"** tab
   - Navigate to **"Storage"** section

3. **Connect Database**
   - Click **"Connect Store"**
   - Select your Postgres database (the one you just created)
   - Click **"Connect"**

4. **Automatic Configuration**
   - Vercel will automatically add these environment variables to your project:
     ```
     POSTGRES_URL
     POSTGRES_PRISMA_URL
     POSTGRES_URL_NON_POOLING
     POSTGRES_USER
     POSTGRES_HOST
     POSTGRES_PASSWORD
     POSTGRES_DATABASE
     ```
   - These variables are automatically available to your API functions

---

### ✅ Step 3: Initialize Database Schema

Now you need to create the database tables. Follow these detailed steps:

#### **Option A: Using Vercel Dashboard (Recommended)** ⭐

##### **3.1 Navigate to Database**
1. Go to [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Click on **"Storage"** in the top navigation bar
3. You should see your database listed (e.g., `expense-manager-db`)
4. Click on the database name to open its dashboard

##### **3.2 Open Query Tab**
1. In the database dashboard, look for tabs near the top
2. Click on the **"Query"** tab (or sometimes called **".query"** or **"Data"**)
3. You'll see a SQL editor with a text area

##### **3.3 Run SQL Statements One at a Time**

⚠️ **IMPORTANT**: Vercel Postgres Query interface doesn't support multiple statements at once. You need to run each CREATE TABLE statement separately.

**Method 1: Run Each Statement Individually (Recommended for Vercel Dashboard)**

Copy and run each SQL block below **ONE AT A TIME** in the Vercel Query editor:

---

**STEP 1 - Create Users Table:**
```
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
Click "Run" → Wait for success ✅

---

**STEP 2 - Create Categories Table:**
```
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
Click "Run" → Wait for success ✅

---

**STEP 3 - Create Expenses Table:**
```
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
Click "Run" → Wait for success ✅

---

**STEP 4 - Create Budgets Table:**
```
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
Click "Run" → Wait for success ✅

---

**STEP 5 - Create Recurring Expenses Table:**
```
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
Click "Run" → Wait for success ✅

---

**STEP 6 - Create Savings Goals Table:**
```
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
Click "Run" → Wait for success ✅

---

**STEP 7 - Create Indexes (Run All Together):**
```
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_type ON expenses(type);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_expenses_user_id ON recurring_expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_goals_user_id ON savings_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
```
Click "Run" → Wait for success ✅

---

##### **3.4 What You'll See After Each Query**
After running each statement, you should see:
- ✅ **Success message** like "Query executed successfully"
- ✅ **Green checkmark** or similar indicator
- ✅ **No error messages** in red

If you get an error on any step, see the **Troubleshooting** section below.

##### **3.6 Verify Tables Were Created**
1. Look for a **"Tables"** or **"Browse"** section in your database dashboard
2. You should see **6 tables** listed:
   - ✅ `users` (stores user accounts)
   - ✅ `categories` (expense/income categories)
   - ✅ `expenses` (all transactions)
   - ✅ `budgets` (spending limits)
   - ✅ `recurring_expenses` (subscriptions, bills)
   - ✅ `savings_goals` (financial targets)

3. Click on any table name to see its structure (columns, types, constraints)

##### **3.7 Test with a Query (Optional)**
To verify everything works, run this test query:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see all 6 tables listed.

---

#### **Option B: Using Command Line (psql)** 🖥️

If you prefer command line:

##### **3.1 Get Connection String**
1. In Vercel Dashboard → Storage → Your Database
2. Look for **"Connection String"** or **".env.local"** tab
3. Copy the `POSTGRES_URL` value (starts with `postgres://` or `postgresql://`)

##### **3.2 Connect and Run Schema**
```bash
# Navigate to your project directory
cd /Users/alpha/Desktop/Personal/Rohit/Usefull_Apps/Expense\ Manager

# Run the schema (replace with your connection string)
psql "postgresql://username:password@hostname/database?sslmode=require" < api/db-setup.sql
```

You should see output like:
```
CREATE TABLE
CREATE TABLE
CREATE TABLE
...
CREATE INDEX
```

##### **3.3 Verify Connection**
```bash
# List all tables
psql "your-connection-string" -c "\dt"
```

---

#### **Option C: Using Vercel CLI** 🔧

##### **3.1 Install and Setup**
```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Link to your project
cd /Users/alpha/Desktop/Personal/Rohit/Usefull_Apps/Expense\ Manager
vercel link
```

##### **3.2 Pull Environment Variables**
```bash
# Download database credentials
vercel env pull .env.local
```

This creates a `.env.local` file with your database connection string.

##### **3.3 Run Schema with psql**
```bash
# Extract POSTGRES_URL from .env.local
source .env.local

# Run the schema
psql "$POSTGRES_URL" < api/db-setup.sql
```

---

#### **🎯 Quick Verification Checklist**

After running the schema, verify:
- [ ] No error messages during execution
- [ ] 6 tables visible in Vercel database dashboard
- [ ] Each table shows correct column names
- [ ] Can run `SELECT * FROM users;` without errors (should return empty result)
- [ ] Foreign key relationships are working (check table constraints)

**Everything looks good?** → Proceed to **Step 4: Redeploy Your Application** ✅

**Got errors?** → Check **Troubleshooting** section below 👇

---

### ✅ Step 4: Redeploy Your Application

After connecting the database, you need to redeploy:

1. **Trigger Redeploy**
   - Go to your project in Vercel Dashboard
   - Click **"Deployments"** tab
   - Click the **"..."** menu on the latest deployment
   - Click **"Redeploy"**

   OR push a new commit:
   ```bash
   git add .
   git commit -m "Connected Vercel Postgres database"
   git push origin main
   ```

2. **Wait for Deployment**
   - Vercel will automatically build and deploy
   - Usually takes 1-2 minutes

---

### ✅ Step 5: Test Your Database Connection

1. **Visit Your Deployed App**
   - Open your app URL: `https://your-app.vercel.app`

2. **Test Sign Up**
   - Click **"Sign Up"** or **"Create Account"**
   - Fill in:
     - Name: `Test User`
     - Email: `test@example.com`
     - Password: `password123`
   - Click **"Sign Up"**

3. **Verify Success**
   - If successful, you'll be logged in and redirected to Dashboard
   - If you see "User created successfully" → ✅ Database is working!

4. **Test Data Sync**
   - Add a few expenses
   - Log out
   - Log in from a different device/browser
   - Your data should appear → ✅ Cloud sync working!

---

## 🔧 Local Development with Vercel Postgres

To test your API locally with the cloud database:

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Link Your Project
```bash
cd /Users/alpha/Desktop/Personal/Rohit/Usefull_Apps/Expense\ Manager
vercel link
```

Select your project when prompted.

### 3. Pull Environment Variables
```bash
vercel env pull .env.local
```

This downloads all your database credentials to `.env.local` file.

### 4. Run Local Development Server
```bash
vercel dev
```

Your app will run on `http://localhost:3000` with full access to the cloud database.

---

## 📊 Database Schema Overview

Your database has 6 main tables:

```
users (id, name, email, password, created_at)
  ↓
  ├── categories (user-specific expense/income categories)
  ├── expenses (all transactions)
  ├── budgets (monthly/weekly spending limits)
  ├── recurring_expenses (subscriptions, bills)
  └── savings_goals (financial targets)
```

All tables use `user_id` to isolate data per user (multi-tenant architecture).

---

## 🐛 Troubleshooting

### Issue: "Internal server error" when signing up

**Cause**: Database not initialized or not connected

**Solution**:
1. Go to Vercel Dashboard → Storage
2. Verify database exists and is "Active"
3. Go to Project Settings → Storage
4. Verify database is connected
5. Re-run the schema from `api/db-setup.sql`

### Issue: "relation 'users' does not exist"

**Cause**: Database tables not created

**Solution**:
1. Go to your database in Vercel Dashboard
2. Click "Query" tab
3. Run the contents of `api/db-setup.sql`
4. Verify all 6 tables are created

### Issue: Can't connect locally with `vercel dev`

**Cause**: Environment variables not pulled

**Solution**:
```bash
# Make sure you're in the project directory
cd /Users/alpha/Desktop/Personal/Rohit/Usefull_Apps/Expense\ Manager

# Pull latest environment variables
vercel env pull .env.local --force

# Try again
vercel dev
```

### Issue: Different data on different devices

**Cause**: Using local storage instead of cloud

**Solution**:
1. Check `src/utils/api-adapter.js`
2. Ensure `USE_CLOUD_BACKEND = true`
3. Redeploy the app
4. Clear browser cache

---

## 📈 Database Management

### View Data
- **Vercel Dashboard** → Storage → Your Database → **"Data"** tab
- See all tables and their records

### Run Queries
- **Vercel Dashboard** → Storage → Your Database → **"Query"** tab
- Execute custom SQL queries

### Monitor Performance
- **Vercel Dashboard** → Storage → Your Database → **"Insights"** tab
- View query performance, storage usage, and connection stats

### Backup Data
Vercel automatically backs up your database. To manually export:
1. Go to database dashboard
2. Click **"..."** menu
3. Select **"Export"**
4. Download SQL dump

---

## 🔐 Security Best Practices

✅ **Passwords**: Hashed using bcryptjs (10 salt rounds)  
✅ **SQL Injection**: All queries use parameterized statements  
✅ **Data Isolation**: All queries filtered by `user_id`  
✅ **HTTPS**: All connections encrypted  
✅ **Environment Variables**: Credentials never exposed in code  

---

## 💰 Pricing & Limits

**Vercel Postgres Free Tier:**
- ✅ 256 MB storage
- ✅ 60 hours compute time/month
- ✅ Automatic backups
- ✅ Connection pooling
- ✅ SSL connections

This is enough for:
- ~1,000 users
- ~50,000 expenses
- ~10,000 API calls/month

**Need More?** Upgrade to Vercel Pro ($20/month) for:
- 5 GB storage
- Unlimited compute time
- Enhanced backups

---

## ✅ Checklist

After completing setup, verify:

- [ ] Database created in Vercel Dashboard
- [ ] Database connected to your project
- [ ] Schema from `api/db-setup.sql` executed successfully
- [ ] All 6 tables visible in database
- [ ] App redeployed after database connection
- [ ] Sign up functionality working
- [ ] Login functionality working
- [ ] Expenses can be added and viewed
- [ ] Data syncs across devices
- [ ] Local development works with `vercel dev`

---

## 🎯 Quick Commands Reference

```bash
# Create new Vercel project
vercel

# Link existing project
vercel link

# Pull environment variables
vercel env pull .env.local

# Run local development with cloud database
vercel dev

# Deploy to production
vercel --prod

# View logs
vercel logs

# Open project dashboard
vercel dashboard
```

---

## 📚 Additional Resources

- [Vercel Postgres Documentation](https://vercel.com/docs/storage/vercel-postgres)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
- [PostgreSQL Tutorial](https://www.postgresql.org/docs/)

---

## 🆘 Need Help?

1. **Check Vercel Logs**
   - Dashboard → Project → Deployments → Click deployment → Functions tab

2. **View Database Logs**
   - Dashboard → Storage → Database → Logs tab

3. **Test API Directly**
   ```bash
   # Test signup endpoint
   curl -X POST https://your-app.vercel.app/api/auth/signup \
     -H "Content-Type: application/json" \
     -d '{"name":"Test","email":"test@test.com","password":"pass123"}'
   ```

4. **Browser Console**
   - Open DevTools (F12)
   - Check Console for error messages
   - Check Network tab for API responses

---

**🎉 You're Done!** Your Expense Manager now has a fully functional cloud database with cross-device synchronization!

---

*Last Updated: May 2026*
