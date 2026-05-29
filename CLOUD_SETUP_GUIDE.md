# 🚀 Cloud Backend Setup Guide

## Overview
This guide will help you set up the cloud backend for your Expense Manager app, enabling **cross-device data synchronization**. Users will be able to access their data from any device after logging in.

## Architecture
- **Frontend**: React (Vite)
- **Backend**: Vercel Serverless Functions
- **Database**: Vercel Postgres (managed PostgreSQL)
- **Authentication**: Bcrypt password hashing
- **Deployment**: Vercel

---

## 📋 Prerequisites

1. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
2. **GitHub Account** - For deploying from GitHub
3. **Node.js** installed locally (v16 or higher)

---

## 🔧 Step-by-Step Setup

### Step 1: Install Dependencies

```bash
npm install
```

This will install the required packages including:
- `@vercel/postgres` - Vercel Postgres SDK
- `bcryptjs` - Password hashing

### Step 2: Create Vercel Postgres Database

1. **Go to Vercel Dashboard**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click on the "Storage" tab

2. **Create Database**
   - Click "Create Database"
   - Select "Postgres"
   - Choose your database name (e.g., `expense-manager-db`)
   - Select your preferred region (choose closest to your users)
   - Click "Create"

3. **Note Database Credentials**
   - Vercel will automatically create environment variables
   - These will be available in your project after linking

### Step 3: Initialize Database Schema

1. **Connect to your database** via Vercel Dashboard:
   - Go to Storage → Your Database → Query
   
2. **Run the SQL schema**:
   - Copy the contents of `api/db-setup.sql`
   - Paste into the query editor
   - Click "Run Query"

This will create all necessary tables:
- `users`
- `categories`
- `expenses`
- `budgets`
- `recurring_expenses`
- `savings_goals`

### Step 4: Push to GitHub

```bash
git add .
git commit -m "Add cloud backend with Vercel Postgres"
git push origin main
```

### Step 5: Deploy to Vercel

1. **Go to Vercel Dashboard**
   - Click "Add New Project"
   - Import your GitHub repository

2. **Configure Project**
   - Framework Preset: `Vite`
   - Root Directory: `./` (leave as is)
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Connect Database**
   - In project settings, go to "Storage"
   - Click "Connect Store"
   - Select your Postgres database
   - This automatically adds environment variables

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete

### Step 6: Verify Deployment

1. **Visit your deployed site**
   - Vercel will provide a URL (e.g., `your-app.vercel.app`)

2. **Test the app**:
   - Sign up with a new account
   - Add some expenses
   - Log out
   - Log in from a different device or browser
   - Verify your data is accessible

---

## 🔄 Switching Between Local and Cloud Storage

The app includes a toggle to switch between local (localStorage) and cloud storage.

**Edit `src/utils/api-adapter.js`:**

```javascript
// Use cloud backend
export const USE_CLOUD_BACKEND = true;  // ✅ Cloud (cross-device sync)

// Use local storage
export const USE_CLOUD_BACKEND = false; // ❌ Local (device-specific)
```

**Current Setting:** Cloud backend is **ENABLED** by default.

---

## 🌐 API Endpoints

Your app now has the following REST API endpoints:

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user

### Expenses
- `GET /api/expenses?userId={id}` - Get all expenses
- `POST /api/expenses?userId={id}` - Create expense
- `PUT /api/expenses?userId={id}` - Update expense
- `DELETE /api/expenses?userId={id}&id={expenseId}` - Delete expense

### Categories
- `GET /api/categories?userId={id}` - Get all categories
- `POST /api/categories?userId={id}` - Create category
- `PUT /api/categories?userId={id}` - Update category
- `DELETE /api/categories?userId={id}&id={categoryId}` - Delete category

### Budgets
- `GET /api/budgets?userId={id}` - Get all budgets
- `POST /api/budgets?userId={id}` - Create budget
- `DELETE /api/budgets?userId={id}&id={budgetId}` - Delete budget

### Recurring Expenses
- `GET /api/recurring?userId={id}` - Get recurring expenses
- `POST /api/recurring?userId={id}` - Create recurring expense
- `PUT /api/recurring?userId={id}` - Update recurring expense
- `DELETE /api/recurring?userId={id}&id={recurringId}` - Delete recurring expense

### Savings Goals
- `GET /api/savings?userId={id}` - Get savings goals
- `POST /api/savings?userId={id}` - Create savings goal
- `PUT /api/savings?userId={id}` - Update savings goal
- `DELETE /api/savings?userId={id}&id={goalId}` - Delete savings goal

### Statistics
- `GET /api/statistics?userId={id}&startDate={date}&endDate={date}&type=summary` - Get summary stats
- `GET /api/statistics?userId={id}&startDate={date}&endDate={date}&type=category` - Get category stats
- `GET /api/statistics?userId={id}&startDate={date}&endDate={date}&type=daily` - Get daily stats

---

## 🧪 Local Development

To develop and test locally:

1. **Install Vercel CLI**:
```bash
npm install -g vercel
```

2. **Link to your project**:
```bash
vercel link
```

3. **Pull environment variables**:
```bash
vercel env pull .env.local
```

4. **Run development server**:
```bash
vercel dev
```

This starts a local development server with serverless functions at `http://localhost:3000`.

---

## 🔒 Security Features

✅ **Password Hashing**: Uses bcrypt with salt rounds
✅ **SQL Injection Prevention**: Parameterized queries
✅ **CORS Headers**: Configured for cross-origin requests
✅ **User Data Isolation**: All queries filtered by userId
✅ **Foreign Key Constraints**: Database-level data integrity

---

## 📊 Database Schema

```
users (id, name, email, password, created_at)
  ↓
categories (id, user_id, name, icon, color, type, budget_limit)
  ↓
expenses (id, user_id, category_id, amount, date, type, ...)
budgets (id, user_id, category_id, amount, period, ...)
recurring_expenses (id, user_id, category_id, amount, frequency, ...)
savings_goals (id, user_id, name, target_amount, current_amount, ...)
```

All tables have `user_id` foreign keys ensuring data isolation.

---

## 🐛 Troubleshooting

### Issue: API calls failing
**Solution**: 
- Check if database is properly connected in Vercel dashboard
- Verify environment variables are set
- Check browser console for error messages

### Issue: "User already exists" but can't login
**Solution**:
- Data might be in local storage from old setup
- Clear browser localStorage
- Try signing up with a different email

### Issue: Different data on different devices
**Solution**:
- Verify `USE_CLOUD_BACKEND` is set to `true` in `src/utils/api-adapter.js`
- Redeploy the app
- Clear cache and reload

### Issue: Database connection error
**Solution**:
- Ensure Postgres database is running in Vercel
- Check Storage tab in Vercel dashboard
- Reconnect the database if needed

---

## 📈 Scaling Considerations

The current setup supports:
- ✅ Unlimited users
- ✅ Cross-device synchronization
- ✅ Real-time data updates
- ✅ Automatic backups (Vercel Postgres)
- ✅ Global CDN distribution

**Free Tier Limits** (Vercel):
- Postgres: 256 MB storage, 60 hours compute time/month
- Serverless Functions: 100 GB-Hours/month
- Bandwidth: 100 GB/month

For higher usage, upgrade to Vercel Pro plan.

---

## 🎯 Next Steps

After setup is complete:

1. ✅ **Test cross-device sync**: Login from different devices
2. ✅ **Share with users**: Distribute your app URL
3. ✅ **Monitor usage**: Check Vercel analytics
4. ✅ **Backup data**: Export database regularly (Vercel provides backups)
5. ✅ **Add features**: Customize as needed

---

## 🆘 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Review browser console errors
3. Verify database connection
4. Test API endpoints directly

---

## 📝 Migration from Local Storage

If users have existing data in localStorage:

1. **Export data** from Settings → Export Data (before update)
2. **Deploy cloud backend**
3. **Sign up** with new account
4. **Import data** from Settings → Import Data (after signup)

Note: User credentials cannot be migrated automatically due to different hashing methods.

---

**🎉 Congratulations!** Your Expense Manager now supports cross-device data synchronization!

Users can now:
- ✅ Sign up once
- ✅ Access their data from any device
- ✅ Share credentials with trusted users
- ✅ Have their data backed up in the cloud

---

Built with ❤️ using Vercel + Postgres + React
