# 🔄 GitHub Actions Auto-Deployment Setup

## Overview

This guide will help you set up automatic deployment to Vercel whenever you create a Git release. Your app will be deployed with a consistent alias for easy access.

---

## 🎯 What It Does

When you create a GitHub release:
1. ✅ Automatically builds your app
2. ✅ Deploys to Vercel production
3. ✅ Creates a release-specific alias (e.g., `expense-manager-v1.0.0.vercel.app`)
4. ✅ Updates your main production alias (`expense-manager.vercel.app`)
5. ✅ Comments on your release with deployment URLs

---

## 📋 Prerequisites

- GitHub repository with your code
- Vercel account and project
- Vercel CLI installed locally

---

## 🔧 Setup Steps

### Step 1: Get Vercel Token

1. **Go to Vercel Dashboard**
   - Visit [vercel.com/account/tokens](https://vercel.com/account/tokens)

2. **Create New Token**
   - Click "Create"
   - Name it: `GitHub Actions Deploy`
   - Select scope: `Full Account` (or specific project)
   - Click "Create"
   - **Copy the token** (you'll only see it once!)

### Step 2: Get Vercel IDs

Run these commands in your project directory:

```bash
# Install Vercel CLI if not installed
npm install -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# This creates .vercel/project.json
# View it to get your IDs
cat .vercel/project.json
```

You'll see something like:
```json
{
  "orgId": "team_xxxxxxxxxxxx",
  "projectId": "prj_xxxxxxxxxxxx"
}
```

### Step 3: Add GitHub Secrets

1. **Go to your GitHub repository**
   - Navigate to: `Settings` → `Secrets and variables` → `Actions`

2. **Add these Repository Secrets:**

   Click "New repository secret" for each:

   **Secret 1: VERCEL_TOKEN**
   - Name: `VERCEL_TOKEN`
   - Value: (paste the token from Step 1)

   **Secret 2: VERCEL_ORG_ID**
   - Name: `VERCEL_ORG_ID`
   - Value: (paste orgId from .vercel/project.json)

   **Secret 3: VERCEL_PROJECT_ID**
   - Name: `VERCEL_PROJECT_ID`
   - Value: (paste projectId from .vercel/project.json)

### Step 4: Verify Workflow File

The workflow file has been created at:
```
.github/workflows/deploy-vercel.yml
```

Make sure it exists and push it to GitHub:
```bash
git add .github/workflows/deploy-vercel.yml
git commit -m "Add GitHub Actions workflow for Vercel deployment"
git push origin main
```

---

## 🚀 How to Use

### Create a Release

1. **Tag your code**:
   ```bash
   git tag -a v1.0.0 -m "Release version 1.0.0"
   git push origin v1.0.0
   ```

2. **Create GitHub Release**:
   - Go to your GitHub repo → `Releases` → `Create a new release`
   - Select your tag: `v1.0.0`
   - Fill in release title: `Version 1.0.0`
   - Add release notes
   - Click "Publish release"

3. **Automatic Deployment**:
   - GitHub Actions will automatically start
   - Watch progress in `Actions` tab
   - Deployment typically takes 2-3 minutes

### Your Deployment URLs

After release `v1.0.0`, you'll have:

1. **Production URL** (always up-to-date):
   ```
   https://expense-manager.vercel.app
   ```

2. **Release-specific URL** (permanent):
   ```
   https://expense-manager-v1.0.0.vercel.app
   ```

3. **Direct Deployment URL**:
   ```
   https://expense-manager-xyz123.vercel.app
   ```

---

## 🔄 Workflow Triggers

The workflow runs on:

1. **Release Published** (main trigger)
   - Creates release-specific alias
   - Updates production alias

2. **Push to main branch** (optional)
   - Deploys latest code
   - No alias assignment

3. **Manual Trigger** (workflow_dispatch)
   - Can be run manually from Actions tab

---

## 📊 Monitoring Deployments

### GitHub Actions Tab
- Go to `Actions` in your repository
- See all deployment runs
- View logs for troubleshooting

### Vercel Dashboard
- Check [vercel.com/dashboard](https://vercel.com/dashboard)
- View deployment status
- See all aliases

---

## 🎨 Customizing the Workflow

### Change Alias Pattern

Edit `.github/workflows/deploy-vercel.yml`:

```yaml
# Current pattern: expense-manager-v1.0.0.vercel.app
ALIAS_URL="expense-manager-${RELEASE_TAG}.vercel.app"

# Custom patterns:
# Pattern 1: myapp-v1.0.0.vercel.app
ALIAS_URL="myapp-${RELEASE_TAG}.vercel.app"

# Pattern 2: v1.0.0.myapp.vercel.app
ALIAS_URL="${RELEASE_TAG}.myapp.vercel.app"

# Pattern 3: myapp-production-v1.0.0.vercel.app
ALIAS_URL="myapp-production-${RELEASE_TAG}.vercel.app"
```

### Change Production Alias

```yaml
# Current: expense-manager.vercel.app
vercel alias set ${{ steps.deploy.outputs.deployment_url }} expense-manager.vercel.app

# Custom: your-custom-name.vercel.app
vercel alias set ${{ steps.deploy.outputs.deployment_url }} your-custom-name.vercel.app
```

### Add Custom Domain

In Vercel dashboard:
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update workflow to use custom domain:

```yaml
vercel alias set ${{ steps.deploy.outputs.deployment_url }} yourdomain.com
```

---

## 🐛 Troubleshooting

### Error: "No existing credentials found"
**This is the most common error!**

**Symptoms:**
```
Error: No existing credentials found. Please run `vercel login` or pass "--token"
Error: Process completed with exit code 1.
```

**Cause:** GitHub Secrets are not configured

**Solution:** See **VERCEL_DEPLOY_FIX.md** for detailed fix instructions

Quick fix:
1. Create Vercel token at [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Run `vercel link` locally and get IDs from `.vercel/project.json`
3. Add all 3 secrets to GitHub: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
4. Re-run the workflow

### Error: "Invalid token"
**Solution**: 
- Regenerate Vercel token
- Update `VERCEL_TOKEN` secret in GitHub

### Error: "Project not found"
**Solution**: 
- Verify `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID`
- Run `vercel link` again locally
- Update secrets with correct IDs

### Error: "Alias already exists"
**Solution**: 
- This is normal for production alias
- Release-specific aliases are unique per version

### Deployment succeeds but alias fails
**Solution**: 
- Check Vercel dashboard for alias conflicts
- Ensure you have permissions to set aliases
- Verify domain ownership

### Workflow doesn't trigger
**Solution**: 
- Ensure workflow file is in `.github/workflows/` directory
- Check GitHub Actions is enabled in repository settings
- Verify secrets are properly set

### Secrets verification fails
**Solution**:
- The workflow now checks for missing secrets before deploying
- Follow error messages to add missing secrets
- Ensure secret names match exactly (case-sensitive)

---

## 📋 Release Checklist

Before creating a release:

- [ ] All changes committed and pushed
- [ ] Tests passing
- [ ] Version bumped in package.json
- [ ] CHANGELOG updated
- [ ] GitHub secrets configured
- [ ] Workflow file in repository

---

## 🔐 Security Best Practices

1. **Never commit secrets to Git**
   - Use GitHub Secrets only
   - Add .env* to .gitignore

2. **Use scoped tokens**
   - Limit Vercel token to specific project if possible
   - Rotate tokens periodically

3. **Review workflow permissions**
   - Use minimal permissions needed
   - Enable "Require approval for workflows"

4. **Protect main branch**
   - Require pull request reviews
   - Enable status checks

---

## 📈 Advanced Features

### Deploy Preview on Pull Requests

Add this job to your workflow:

```yaml
deploy-preview:
  if: github.event_name == 'pull_request'
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - run: vercel deploy --token=${{ secrets.VERCEL_TOKEN }}
```

### Notify on Slack/Discord

Add notification step:

```yaml
- name: Notify Slack
  uses: slackapi/slack-github-action@v1
  with:
    payload: |
      {
        "text": "Deployed ${{ github.event.release.tag_name }} to production!"
      }
```

### Run Tests Before Deploy

Add before deploy step:

```yaml
- name: Run tests
  run: npm test

- name: Build
  run: npm run build
```

---

## 📚 Example Release Workflow

### 1. Develop Feature
```bash
git checkout -b feature/new-ui
# Make changes
git commit -m "Add new UI features"
git push origin feature/new-ui
```

### 2. Merge to Main
```bash
# Create PR and merge via GitHub
```

### 3. Create Release
```bash
# Bump version
npm version minor  # 1.0.0 → 1.1.0

# Push tag
git push origin main --tags

# Create release on GitHub
# → Auto-deploys to Vercel!
```

### 4. Access Deployment
- Production: `https://expense-manager.vercel.app`
- Release: `https://expense-manager-v1.1.0.vercel.app`

---

## 🎉 Benefits

✅ **Automatic Deployment** - No manual steps  
✅ **Consistent Aliases** - Same URL pattern  
✅ **Version History** - Each release has unique URL  
✅ **Rollback Easy** - Point alias to previous deployment  
✅ **CI/CD Integration** - Full automation  
✅ **Zero Downtime** - Vercel handles deployment  

---

## 📞 Support

- GitHub Actions Docs: [docs.github.com/actions](https://docs.github.com/actions)
- Vercel CLI Docs: [vercel.com/docs/cli](https://vercel.com/docs/cli)
- Vercel Deployment Docs: [vercel.com/docs/deployments](https://vercel.com/docs/deployments)

---

## ✅ Quick Reference

### Create Release Command Line
```bash
# Tag version
git tag -a v1.0.0 -m "Release 1.0.0"
git push origin v1.0.0

# Or use GitHub CLI
gh release create v1.0.0 --title "Version 1.0.0" --notes "Release notes here"
```

### View Deployments
```bash
# List all deployments
vercel ls

# Get deployment info
vercel inspect <deployment-url>

# List aliases
vercel alias ls
```

### Manual Deploy
```bash
# Deploy to production
vercel --prod

# Deploy with alias
vercel --prod --alias my-alias.vercel.app
```

---

**🎊 You're all set!** 

Create your first release and watch the magic happen! Your app will automatically deploy to Vercel with consistent aliases.

---

Built with ❤️ for seamless CI/CD deployment
