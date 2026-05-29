# ✅ Deployment Checklist

Use this checklist to ensure proper deployment of your cloud-enabled Expense Manager.

## Pre-Deployment

- [ ] All code committed to Git
  ```bash
  git status  # Should be clean
  ```

- [ ] Dependencies installed
  ```bash
  npm install
  ```

- [ ] Local build successful
  ```bash
  npm run build
  ```

- [ ] API adapter configured for cloud
  ```javascript
  // src/utils/api-adapter.js
  export const USE_CLOUD_BACKEND = true;
  ```

## Vercel Setup

- [ ] Vercel account created ([vercel.com](https://vercel.com))
- [ ] Repository pushed to GitHub
- [ ] Project imported to Vercel
- [ ] Build settings configured:
  - Framework: `Vite`
  - Build Command: `npm run build`
  - Output Directory: `dist`

## Database Setup

- [ ] Vercel Postgres database created
  - Name: `expense-manager-db` (or your choice)
  - Region: Selected (closest to users)

- [ ] Database connected to project
  - Storage → Connect Store → Select database

- [ ] Database schema initialized
  - Copy `api/db-setup.sql` content
  - Paste in Query editor
  - Run query successfully

- [ ] Database tables verified:
  - [ ] `users` table exists
  - [ ] `categories` table exists
  - [ ] `expenses` table exists
  - [ ] `budgets` table exists
  - [ ] `recurring_expenses` table exists
  - [ ] `savings_goals` table exists
  - [ ] Indexes created

## Deployment

- [ ] First deployment successful
- [ ] No build errors in Vercel logs
- [ ] Environment variables automatically set
- [ ] CORS headers configured (from `vercel.json`)

## Testing

### Authentication
- [ ] Can access deployed URL
- [ ] Sign up works
  - Creates user in database
  - Creates default categories
  - Returns user data
- [ ] Login works
  - Accepts valid credentials
  - Rejects invalid credentials
- [ ] Logout works

### Data Operations
- [ ] Can add expense
- [ ] Can edit expense
- [ ] Can delete expense
- [ ] Can view expenses list
- [ ] Can add category
- [ ] Can edit category
- [ ] Can add budget
- [ ] Can add recurring expense
- [ ] Can add savings goal

### Cross-Device Sync
- [ ] Desktop: Sign up and add data
- [ ] Mobile: Login with same credentials
- [ ] Mobile: Data from desktop appears
- [ ] Mobile: Add new data
- [ ] Desktop: Refresh and see mobile data
- [ ] Third device: Login and verify all data

### Statistics & Reports
- [ ] Dashboard loads correctly
- [ ] Charts render with data
- [ ] Reports generate successfully
- [ ] Statistics calculate correctly

## Security Verification

- [ ] Passwords are hashed (not visible in database)
- [ ] Users can only access their own data
- [ ] SQL injection prevented (parameterized queries)
- [ ] CORS headers properly configured
- [ ] No sensitive data in client-side code
- [ ] Environment variables not exposed

## Performance

- [ ] Initial page load < 3 seconds
- [ ] API responses < 500ms
- [ ] Database queries optimized
- [ ] Indexes working properly

## Post-Deployment

- [ ] Custom domain configured (optional)
- [ ] Analytics enabled in Vercel
- [ ] Error tracking set up
- [ ] Database backup strategy in place
- [ ] Monitoring alerts configured

## Documentation

- [ ] README updated with deployment URL
- [ ] Setup instructions clear
- [ ] API endpoints documented
- [ ] Environment variables documented
- [ ] Troubleshooting guide available

## User Communication

- [ ] Existing users notified of update
- [ ] Migration instructions provided
- [ ] New feature announcement prepared
- [ ] Support channel established

## Rollback Plan

- [ ] Previous version tag created
- [ ] Local backup of database schema
- [ ] Rollback procedure documented
- [ ] Emergency contact list ready

## Optional Enhancements

- [ ] Set up continuous deployment
- [ ] Add staging environment
- [ ] Implement database migrations
- [ ] Add monitoring/logging service
- [ ] Set up automated backups
- [ ] Add rate limiting
- [ ] Implement caching strategy

---

## Deployment Commands Reference

```bash
# Local testing
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to Vercel (via CLI)
vercel

# Deploy to production
vercel --prod

# Check deployment logs
vercel logs

# Pull environment variables locally
vercel env pull .env.local

# Run with serverless functions locally
vercel dev
```

---

## Success Criteria

✅ All checklist items completed  
✅ App accessible from deployment URL  
✅ Cross-device sync working  
✅ No errors in Vercel logs  
✅ All features functional  
✅ Data persisting correctly  
✅ Users can sign up and login  

---

## If Something Goes Wrong

1. **Check Vercel Logs**
   - Dashboard → Your Project → Deployments → Latest → Logs

2. **Verify Database Connection**
   - Dashboard → Storage → Your Database → Status

3. **Test API Endpoints**
   - Use browser DevTools → Network tab
   - Check for 200/201 status codes

4. **Clear Cache**
   - Browser cache
   - Vercel deployment cache

5. **Redeploy**
   - Make a minor change
   - Push to GitHub
   - Vercel auto-redeploys

---

**🎉 Once all items are checked, your app is production-ready!**

Remember to share the deployment URL with users and provide login instructions.

Good luck! 🚀
