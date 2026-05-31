# 🔧 Fix Supabase 404 Error - Immediate Action

## 🎯 Problem Identified
```json
{
  "test": "Database Connection",
  "status": "FAIL", 
  "error": "Server error (HTTP status 404): Not Found"
}
```

Your `POSTGRES_URL` exists but points to a **non-existent or inaccessible endpoint**.

The URL format `postgres://postgres.jeremhmqag...` suggests **Supabase**, and 404 means the database can't be reached.

---

## 🚀 IMMEDIATE FIX - 3 Steps

### Step 1: Check Supabase Project Status

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Look for your project (likely named `supabase-rose-queen` or similar)
3. **Check the status indicator:**
   - 🟢 **Active** - Good, proceed to Step 2
   - 🟡 **Paused** - Click "Restore" or "Resume"
   - ⏸️ **Sleeping** - Click "Wake up" 
   - ❌ **Not Found** - Project deleted, need to create new one (see Step 3)

**If Paused/Sleeping:**
- Click the button to restore/wake it
- Wait 1-2 minutes for it to activate
- Skip to Step 2

---

### Step 2: Get the CORRECT Connection String

The 404 error often happens because you're using the **pooling URL** instead of the **direct connection URL**.

#### In Supabase Dashboard:

1. Click on your project
2. Go to **Settings** (gear icon in sidebar)
3. Click **Database**
4. Scroll to **Connection string** section
5. **IMPORTANT:** Switch the dropdown to **"URI"** (NOT "Transaction" or "Session")
6. Copy the connection string shown
7. It should look like:
   ```
   postgresql://postgres.[YOUR-PROJECT-ID]:[YOUR-PASSWORD]@db.jeremhmqagndbswpmgjb.supabase.co:5432/postgres
   ```
8. **Replace `[YOUR-PASSWORD]`** with your actual database password

#### Key Difference:
❌ **Wrong (causes 404):**
```
postgresql://postgres:pass@pooler.jeremhmqagndbswpmgjb.supabase.co:6543/postgres
```
Notice: `pooler.xxx:6543` ← This causes 404

✅ **Correct:**
```
postgresql://postgres:pass@db.jeremhmqagndbswpmgjb.supabase.co:5432/postgres
```
Notice: `db.xxx:5432` ← This works

---

### Step 3: Update Vercel Environment Variable

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on **"expense-manager"** project
3. Go to **Settings** → **Environment Variables**
4. Find `POSTGRES_URL`
5. Click **"Edit"** (pencil icon)
6. **Replace the value** with the connection string from Step 2
7. Make sure to update for **ALL environments:**
   - ✅ Production
   - ✅ Preview
   - ✅ Development
8. Click **"Save"**

---

### Step 4: Redeploy

After updating the environment variable:

1. In Vercel, go to **"Deployments"** tab
2. Find the latest deployment
3. Click the **"..."** menu on the right
4. Click **"Redeploy"**
5. Wait 1-2 minutes for deployment to complete

---

### Step 5: Test Again

After redeployment, open your app in browser, press F12, and run:

```javascript
fetch('/api/test-connection')
  .then(res => res.json())
  .then(data => console.log(JSON.stringify(data, null, 2)));
```

**Expected Result:**
```json
{
  "checks": [
    {"test": "Environment Variable Check", "status": "PASS"},
    {"test": "Database Connection", "status": "PASS"}, ← Should now PASS
    {"test": "Tables Exist", "status": "PASS" or "FAIL"}
  ]
}
```

---

## 🔍 Alternative: Check Supabase Connection Info

If you can't find the connection string:

1. In Supabase Dashboard → Your Project
2. Click **"Connect"** button (usually at top right)
3. Select **"ORMs"** or **"Postgres"**
4. Choose **"URI"** format
5. Copy the connection string
6. **Important:** Make sure it says `db.xxx:5432` NOT `pooler.xxx:6543`

---

## 📋 Quick Checklist

- [ ] Supabase project is ACTIVE (not paused/sleeping)
- [ ] Got connection string from Settings → Database → Connection String
- [ ] Connection string uses **"URI"** mode (NOT Transaction/Session)
- [ ] Connection string contains `db.xxx:5432` (NOT `pooler.xxx:6543`)
- [ ] Replaced `[YOUR-PASSWORD]` with actual password
- [ ] Updated `POSTGRES_URL` in Vercel for ALL environments
- [ ] Redeployed the application
- [ ] Waited 2 minutes for deployment to complete
- [ ] Tested `/api/test-connection` again

---

## 🎯 What If It Still Fails?

### If still getting 404:

**Option A: Database Password Issue**
```
Reset your Supabase database password:
1. Supabase → Settings → Database
2. Scroll to "Database password"
3. Click "Generate new password"
4. Copy the new password
5. Update connection string with new password
6. Update POSTGRES_URL in Vercel
7. Redeploy
```

**Option B: Create New Database**
```
If the Supabase project is deleted or corrupted:
1. Create new Supabase project
2. Copy the new connection string (URI mode)
3. Update POSTGRES_URL in Vercel
4. Run SQL schema (see IMMEDIATE_FIX_STEPS.md - Step 3)
5. Redeploy
```

---

## 💡 Understanding the Error

**HTTP 404 from database means:**
- The database **endpoint doesn't exist**
- You're trying to connect to `db.jeremhmqag...` but it's not found
- Common causes:
  1. Project paused/deleted
  2. Using pooling URL instead of direct URL
  3. Wrong project ID in URL
  4. Database password changed

**This is NOT about tables** - it's about the database server itself being unreachable.

---

## ✅ Expected After Fix

Once fixed, Test 1 should show:
```json
{
  "checks": [
    {"test": "Environment Variable Check", "status": "PASS"},
    {"test": "Database Connection", "status": "PASS"}, ← Fixed!
    {"test": "Tables Exist", "status": "FAIL"} ← Next issue to fix
  ]
}
```

Then you'll need to create tables (see IMMEDIATE_FIX_STEPS.md).

---

**Next:** After database connection works, you'll need to create the tables. But first, fix this 404 error using the steps above!

---

*Last Updated: May 29, 2026*
