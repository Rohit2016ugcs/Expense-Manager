# 🔓 Disable Vercel Deployment Protection (Fix 401 Error)

## Problem
You're getting **401 Unauthorized** when testing APIs because Vercel Deployment Protection is blocking unauthenticated requests.

---

## 🚀 Quick Fix: Disable Protection

### Step 1: Go to Vercel Dashboard
```
https://vercel.com/dashboard
```

### Step 2: Navigate to Your Project
1. Find and click on your project: **expense-manager** (or similar name)
2. You should see your recent deployments

### Step 3: Open Settings
1. Click **"Settings"** tab at the top
2. Scroll down and find **"Deployment Protection"** in the left sidebar
3. Click on **"Deployment Protection"**

### Step 4: Disable Protection
You'll see options like:
- **"Vercel Authentication"** (Currently enabled - causing 401)
- **"Password Protection"**
- **"Trusted IPs"**

**What to do:**
1. Find the section that says **"Preview Deployments"** or **"Standard Protection"**
2. Click the dropdown or toggle
3. Select **"None"** or **"Disabled"**
4. Click **"Save"**

### Step 5: Wait & Test
1. Wait **30 seconds** for changes to propagate
2. Test your curl command again:

```bash
curl -X GET 'https://expense-manager-8uqayb0gq-tesseract1729s-projects.vercel.app/api/test-connection'
```

---

## 📸 Visual Guide

Look for something like this in Vercel Settings:

```
Deployment Protection
├── Production
│   └── None (recommended for production)
└── Preview Deployments
    ├── ✓ Vercel Authentication (ENABLED) ← Change this
    ├── ○ Password Protection
    └── ○ None (Disable Protection) ← Select this
```

---

## 🎯 Alternative: Test in Browser

If you don't want to disable protection, test in your browser:

### Method 1: Open your app and use DevTools
1. Open in browser: `https://expense-manager-8uqayb0gq-tesseract1729s-projects.vercel.app`
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Paste and run:

```javascript
// Test diagnostic endpoint
fetch('/api/test-connection')
  .then(res => res.json())
  .then(data => {
    console.log('✅ Diagnostic Result:', data);
    // Copy the result and share it
  })
  .catch(err => console.error('❌ Error:', err));
```

### Method 2: Test Login
```javascript
fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'rohit.nit055@gmail.com',
    password: 'jhbjhbjkbk'
  })
})
.then(res => res.json())
.then(data => {
  console.log('✅ Login Result:', data);
})
.catch(err => console.error('❌ Error:', err));
```

---

## 🔒 Security Note

**Disabling protection means:**
- ✅ You can test APIs easily with curl
- ✅ Anyone can access your preview deployments
- ⚠️ Preview URLs are usually long and random, so still relatively secure
- ✅ Production deployments should keep protection disabled for public access

**Recommendation:**
- Disable for testing now
- Re-enable after you fix database issues
- Or keep disabled if this is a public app

---

## 📋 Quick Checklist

- [ ] Go to Vercel Dashboard
- [ ] Click your project
- [ ] Go to Settings → Deployment Protection
- [ ] Change "Preview Deployments" to "None"
- [ ] Click Save
- [ ] Wait 30 seconds
- [ ] Test curl command again
- [ ] Check if 401 error is gone

---

## ✅ After Disabling, You Can Test:

### Test 1: Diagnostic Endpoint
```bash
curl 'https://expense-manager-8uqayb0gq-tesseract1729s-projects.vercel.app/api/test-connection'
```

**Expected:** JSON response showing database status

### Test 2: Login
```bash
curl -X POST 'https://expense-manager-8uqayb0gq-tesseract1729s-projects.vercel.app/api/auth/login' \
  -H 'content-type: application/json' \
  --data-raw '{"email":"rohit.nit055@gmail.com","password":"jhbjhbjkbk"}'
```

**Expected:** Either success with token OR database 404 error (which we can then fix)

---

## 💡 Still Getting 401?

If you still get 401 after disabling:

1. **Clear browser cache and cookies**
2. **Try in incognito/private window**
3. **Check if you disabled for the right environment:**
   - Make sure you disabled for **"Preview"** deployments
   - The URL `...tesseract1729s-projects.vercel.app` is a preview deployment
4. **Wait a full minute** for Vercel's CDN to update
5. **Try a different deployment URL** (go to Deployments tab and copy a fresh one)

---

*Last Updated: May 29, 2026*
