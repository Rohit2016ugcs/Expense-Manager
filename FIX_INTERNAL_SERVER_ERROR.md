# Fix Internal Server Error (HTTP 404 - Database Not Found)

## ❌ Current Problem

You're getting: `NeonDbError: Server error (HTTP status 404): Not Found`

This means your **database endpoint doesn't exist or the connection URL is incorrect**.

---

## 🔍 Root Cause

The 404 error from NeonDbError means:
1. **Database not created**: Vercel Postgres database hasn't been set up
2. **Wrong URL**: POSTGRES_URL environment variable is incorrect or missing
3. **Database deleted**: The database was removed but environment variables still exist
4. **Region mismatch**: Database is in a different region than expected

---

## ✅ Step-by-Step Fix

### Step 1: Verify Vercel Postgres Database Exists

1. Go to your Vercel Dashboard: https://vercel.com/dashboard
2. Select your project: "Expense Manager"
3. Click on **"Storage"** tab
4. Check if you have a **Postgres database** listed

**If NO database exists:**
- Click **"Create Database"**
- Select **"Postgres"**
- Choose a name (e.g., "expense-manager-db")
- Select region (choose closest to your users)
- Click **"Create"**

**If database exists:**
- Click on the database name
- Go to **".env.local"** tab
- Copy all environment variables

---

### Step 2: Check Environment Variables in Vercel

1. In your Vercel project, go to **Settings** → **Environment Variables**
2. Verify these variables exist:
   ```
   POSTGRES_URL
   POSTGRES_PRISMA_URL
   POSTGRES_URL_NON_POOLING
   POSTGRES_USER
   POSTGRES_HOST
   POSTGRES_PASSWORD
   POSTGRES_DATABASE
   ```

3. **If missing or incorrect:**
   - Go to **Storage** tab → Your Postgres database
   - Click **"...more"** → **"Copy Variables"**
   - Go back to **Settings** → **Environment Variables**
   - Delete old variables (if any)
   - Add new variables for all environments:
     - ✅ Production
     - ✅ Preview
     - ✅ Development

---

### Step 3: Initialize Database Tables

After fixing the connection, you need to create the database tables:

1. In Vercel Dashboard → Storage → Your Postgres database
2. Click on **"Query"** or **"Data"** tab
3. Copy and paste the SQL from `api/db-setup.sql`
4. Execute the SQL to create all tables

**Or use Vercel CLI:**
```bash
# Install Vercel CLI if not installed
npm i -g vercel

# Login to Vercel
vercel login

# Link project
vercel link

# Pull environment variables
vercel env pull .env.local

# Run setup script (create one if needed)
vercel env pull .env.local && node setup-database.js
```

---

### Step 4: Redeploy Your Application

After updating environment variables:

```bash
# Trigger a new deployment
git commit --allow-empty -m "Redeploy with fixed database connection"
git push origin main
```

Or in Vercel Dashboard:
1. Go to **Deployments** tab
2. Click **"..."** on latest deployment
3. Click **"Redeploy"**
4. ✅ Check "Use existing Build Cache"

---

### Step 5: Test the Connection

After deployment, test the database connection:

1. Visit: `https://your-app.vercel.app/api/test-connection`
2. You should see:
   ```json
   {
     "checks": [
       {"test": "Environment Variable Check", "status": "PASS"},
       {"test": "Database Connection", "status": "PASS"},
       {"test": "Tables Exist", "status": "PASS"},
       {"test": "Query Users Table", "status": "PASS"}
     ],
     "summary": {
       "passed": 4,
       "total": 4,
       "success": true
     }
   }
   ```

3. If any test fails, check the error details in the response

---

## 🚨 Common Issues & Solutions

### Issue 1: "Database connection string not found"
**Solution:** Environment variables not properly set in Vercel
```bash
vercel env pull .env.local
vercel deploy --prod
```

### Issue 2: "Tables don't exist"
**Solution:** Run the SQL schema in your database
1. Go to Vercel Dashboard → Storage → Database → Query
2. Paste and run `api/db-setup.sql`

### Issue 3: "Region mismatch" or "Connection timeout"
**Solution:** Database and function in different regions
1. Check database region in Storage tab
2. Ensure functions are in same/nearby region
3. May need to recreate database in correct region

### Issue 4: "Cannot connect to database"
**Solution:** Database might be paused or deleted
1. Check if database is active in Storage tab
2. Try deleting and recreating the database
3. Update environment variables again

---

## 🔧 Quick Verification Script

Create a file `verify-connection.js` in project root:

```javascript
import { sql } from '@vercel/postgres';

async function verify() {
  try {
    console.log('Testing connection...');
    
    // Test 1: Check env variable
    if (!process.env.POSTGRES_URL) {
      console.error('❌ POSTGRES_URL not found');
      process.exit(1);
    }
    console.log('✅ POSTGRES_URL found');
    
    // Test 2: Try to connect
    const result = await sql`SELECT current_database(), version()`;
    console.log('✅ Database connection successful');
    console.log('Database:', result.rows[0].current_database);
    
    // Test 3: Check tables
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('✅ Tables found:', tables.rows.length);
    tables.rows.forEach(row => console.log('  -', row.table_name));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Error code:', error.code);
    process.exit(1);
  }
}

verify();
```

Run locally:
```bash
vercel env pull .env.local
node verify-connection.js
```

---

## 📋 Checklist

Before deploying, ensure:

- [ ] Vercel Postgres database is created
- [ ] All environment variables are set in Vercel (Production, Preview, Development)
- [ ] Database tables are created (run `api/db-setup.sql`)
- [ ] Test endpoint works: `/api/test-connection`
- [ ] Application is redeployed after changes
- [ ] No cache issues (try hard refresh: Ctrl+Shift+R)

---

## 🆘 Still Having Issues?

### Check Vercel Logs
1. Go to Vercel Dashboard → Your Project
2. Click **Deployments** → Latest deployment
3. Click **"Functions"** tab
4. Click on failing function (e.g., `/api/auth/login`)
5. Check the logs for detailed error messages

### Enable Debug Mode
Add to your API files temporarily:
```javascript
console.log('ENV Check:', {
  hasPostgresUrl: !!process.env.POSTGRES_URL,
  urlPrefix: process.env.POSTGRES_URL?.substring(0, 30)
});
```

### Contact Support
If none of the above works:
1. Check Vercel Status: https://www.vercel-status.com/
2. Vercel Support: https://vercel.com/support
3. Neon Status (backend): https://status.neon.tech/

---

## 🎯 Expected Result

After following these steps:
- ✅ All API endpoints return 200 (success) instead of 500 (error)
- ✅ Login and signup work correctly
- ✅ You can add/view expenses, categories, etc.
- ✅ No more `NeonDbError: Server error (HTTP status 404)`

---

## 📝 Next Steps After Fix

1. Test all functionality:
   - Signup new user
   - Login
   - Add expense
   - View dashboard
   
2. Set up monitoring:
   - Enable Vercel Analytics
   - Monitor function logs
   - Set up error tracking (e.g., Sentry)

3. Backup strategy:
   - Regular database backups
   - Export data periodically
   - Document recovery procedures
