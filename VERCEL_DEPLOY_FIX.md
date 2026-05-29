# 🔧 Fix: Vercel GitHub Actions Deployment Error

## ❌ The Error You're Seeing

```
Error: No existing credentials found. Please run `vercel login` or pass "--token"
Learn More: https://err.sh/vercel/no-credentials-found
Error: Process completed with exit code 1.
```

## 🎯 Root Cause

The GitHub Actions workflow cannot find your Vercel authentication token because the **GitHub Secrets are not configured** in your repository.

---

## ✅ Solution: Configure GitHub Secrets

Follow these steps to fix the issue:

### Step 1: Get Your Vercel Token

1. Go to [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Click **"Create Token"**
3. Give it a name: `GitHub Actions Deploy`
4. Select scope: **Full Account**
5. Click **"Create"**
6. **⚠️ IMPORTANT:** Copy the token immediately (you'll only see it once!)

### Step 2: Get Your Vercel Project IDs

Run these commands in your project directory:

```bash
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Login to Vercel
vercel login

# Link your project (follow the prompts)
vercel link

# View your project configuration
cat .vercel/project.json
```

You should see output like this:
```json
{
  "orgId": "team_xxxxxxxxxxxx",
  "projectId": "prj_xxxxxxxxxxxx"
}
```

**Copy both IDs!**

### Step 3: Add Secrets to GitHub

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**

Add these **3 secrets**:

#### Secret 1: VERCEL_TOKEN
- **Name:** `VERCEL_TOKEN`
- **Value:** (paste the token from Step 1)

#### Secret 2: VERCEL_ORG_ID
- **Name:** `VERCEL_ORG_ID`
- **Value:** (paste the `orgId` from Step 2)

#### Secret 3: VERCEL_PROJECT_ID
- **Name:** `VERCEL_PROJECT_ID`
- **Value:** (paste the `projectId` from Step 2)

### Step 4: Verify Configuration

After adding all three secrets, your GitHub Actions secrets page should show:
- ✅ VERCEL_TOKEN
- ✅ VERCEL_ORG_ID
- ✅ VERCEL_PROJECT_ID

### Step 5: Re-run the Workflow

1. Go to the **Actions** tab in your GitHub repository
2. Find the failed workflow run
3. Click **"Re-run all jobs"**

OR push a new commit:
```bash
git add .
git commit -m "Fix: Configure Vercel deployment"
git push origin main
```

---

## 🎉 What Changed in the Workflow

The workflow has been updated with:

### 1. **Secrets Verification Step**
Now checks if all required secrets are configured before attempting deployment:
```yaml
- name: Verify Secrets
  run: |
    if [ -z "${{ secrets.VERCEL_TOKEN }}" ]; then
      echo "❌ Error: VERCEL_TOKEN secret is not set!"
      exit 1
    fi
    # ... checks for other secrets
```

### 2. **Proper Token Quoting**
Fixed token passing to prevent empty values:
```yaml
# Before: --token=${{ secrets.VERCEL_TOKEN }}
# After:  --token="${{ secrets.VERCEL_TOKEN }}"
```

This ensures the token is properly passed even if it contains special characters.

---

## 🔍 How to Verify Secrets Are Set

You can't view secret values in GitHub (for security), but you can verify they exist:

1. Go to: **Settings** → **Secrets and variables** → **Actions**
2. You should see all three secrets listed:
   - VERCEL_TOKEN
   - VERCEL_ORG_ID  
   - VERCEL_PROJECT_ID
3. Each should show "Updated X minutes/days ago"

---

## 🐛 Still Having Issues?

### Error: "Invalid token"
**Cause:** Token expired or was regenerated  
**Fix:** Create a new token and update the `VERCEL_TOKEN` secret

### Error: "Project not found"
**Cause:** Wrong `VERCEL_ORG_ID` or `VERCEL_PROJECT_ID`  
**Fix:** 
1. Run `vercel link` in your project
2. Get fresh IDs from `.vercel/project.json`
3. Update the GitHub secrets

### Error: "Permission denied"
**Cause:** Token doesn't have sufficient permissions  
**Fix:** Create a new token with "Full Account" scope

### Secrets are set but still failing
**Fix:**
1. Delete all three secrets from GitHub
2. Wait 5 minutes
3. Re-add them with fresh values
4. Re-run the workflow

---

## 📋 Quick Checklist

Before deploying, ensure:

- [ ] Vercel token created and copied
- [ ] `vercel link` run locally
- [ ] `.vercel/project.json` file exists
- [ ] All 3 secrets added to GitHub:
  - [ ] VERCEL_TOKEN
  - [ ] VERCEL_ORG_ID
  - [ ] VERCEL_PROJECT_ID
- [ ] Workflow file pushed to repository
- [ ] GitHub Actions enabled in repository settings

---

## 📚 Additional Resources

- **Full Setup Guide:** See `GITHUB_ACTIONS_SETUP.md`
- **Vercel CLI Docs:** [vercel.com/docs/cli](https://vercel.com/docs/cli)
- **GitHub Secrets Docs:** [docs.github.com/actions/security-guides/encrypted-secrets](https://docs.github.com/actions/security-guides/encrypted-secrets)
- **Vercel Token Docs:** [vercel.com/docs/rest-api#creating-an-access-token](https://vercel.com/docs/rest-api#creating-an-access-token)

---

## 🚀 After Fix - Expected Output

Once configured correctly, your workflow should show:

```
✅ All required secrets are configured
Vercel CLI 54.6.1 (Node.js 18.20.8)
🔗 Linked to your-project
📦 Building...
✅ Build completed
🚀 Deploying to production...
✅ Deployment ready at: https://your-app.vercel.app
```

---

**Need more help?** Check `GITHUB_ACTIONS_SETUP.md` for the complete setup guide!
