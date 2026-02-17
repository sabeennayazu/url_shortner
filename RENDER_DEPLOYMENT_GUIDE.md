# Complete Beginner's Guide to Deploying URL Shortener on Render

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Prerequisites](#prerequisites)
3. [Part 1: Deploy Backend (Django) on Render](#part-1-deploy-backend-django-on-render)
4. [Part 2: Deploy Frontend (React) on Render](#part-2-deploy-frontend-react-on-render)
5. [Part 3: Connect Frontend and Backend](#part-3-connect-frontend-and-backend)
6. [Testing Your Deployment](#testing-your-deployment)
7. [Troubleshooting](#troubleshooting)
8. [Optional: Custom Domain Setup](#optional-custom-domain-setup)

---

## Project Overview

Your URL shortener project has two main parts:

```
url_shortner/
├── backend/          # Django API (Python)
│   ├── manage.py
│   ├── config/       # Django settings
│   ├── accounts/     # User authentication
│   ├── shortner/     # URL shortening logic
│   └── requirements.txt
│
└── frontend/         # React UI (JavaScript)
    └── shortner/
        ├── src/
        ├── public/
        └── package.json
```

**What each part does:**
- **Backend**: Handles user accounts, creates short URLs, stores data in database
- **Frontend**: The website users see and interact with

**Where we'll host them:**
- **Backend**: Render Web Service (with PostgreSQL database)
- **Frontend**: Render Static Site

---

## Prerequisites

Before starting, make sure you have:

1. ✅ **GitHub Account** - Sign up at [github.com](https://github.com)
2. ✅ **Render Account** - Sign up at [render.com](https://render.com) (free tier available)
3. ✅ **Your code pushed to GitHub** - Your `url_shortner` repository should be on GitHub

### Push Your Code to GitHub (if not done yet)

```bash
# Navigate to your project folder
cd E:\OneDrive\Desktop\url_shortner

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/url_shortner.git
git branch -M main
git push -u origin main
```

---

## Part 1: Deploy Backend (Django) on Render

### Step 1.1: Create PostgreSQL Database

Render provides free PostgreSQL databases. Let's create one first.

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** button (top right)
3. Select **"PostgreSQL"**

**Configure the database:**
- **Name**: `url-shortener-db`
- **Database**: `urlshortener` (lowercase, no spaces)
- **User**: `urlshortener_user` (or leave default)
- **Region**: Choose closest to you (e.g., Oregon, Frankfurt)
- **PostgreSQL Version**: Leave default (latest)
- **Plan**: **Free** (sufficient for testing)

4. Click **"Create Database"**

**⚠️ IMPORTANT**: After creation, you'll see database details. Copy the **"Internal Database URL"** - it looks like:
```
postgresql://urlshortener_user:password@dpg-xxxxx/urlshortener
```

**Save this URL** - you'll need it in Step 1.3!

---

### Step 1.2: Create Web Service for Backend

1. In Render Dashboard, click **"New +"** → **"Web Service"**
2. Click **"Connect a repository"** → Connect your GitHub account
3. Find and select your `url_shortner` repository
4. Click **"Connect"**

**Configure the Web Service:**

| Setting | Value |
|---------|-------|
| **Name** | `url-shortener-backend` (or any name you like) |
| **Region** | Same as your database |
| **Branch** | `main` (or your default branch) |
| **Root Directory** | Leave blank (we'll specify in commands) |
| **Runtime** | `Python 3` |
| **Build Command** | See below ⬇️ |
| **Start Command** | See below ⬇️ |

**Build Command** (copy-paste this):
```bash
pip install -r backend/requirements.txt && cd backend && python manage.py collectstatic --noinput && python manage.py migrate
```

**Start Command** (copy-paste this):
```bash
cd backend && gunicorn config.wsgi:application --bind 0.0.0.0:$PORT
```

**Instance Type**: Select **Free**

**DON'T CLICK "Create Web Service" YET!** - We need to add environment variables first.

---

### Step 1.3: Configure Environment Variables

Scroll down to **"Environment Variables"** section. Click **"Add Environment Variable"** for each of these:

#### 1. SECRET_KEY

**Key**: `SECRET_KEY`

**Value**: Generate a secure key by running this in your terminal:

```bash
python -c "import secrets; print(secrets.token_urlsafe(50))"
```

Copy the output and paste it as the value. It should look like:
```
xK9mP2nQ8rT5vW7yZ1aB3cD4eF6gH8iJ0kL2mN4oP6qR8sT0uV2wX4yZ6
```

#### 2. DEBUG

**Key**: `DEBUG`  
**Value**: `False`

#### 3. ALLOWED_HOSTS

**Key**: `ALLOWED_HOSTS`  
**Value**: `url-shortener-backend.onrender.com`

⚠️ **Replace** `url-shortener-backend` with YOUR actual service name from Step 1.2!

#### 4. DATABASE_URL

**Key**: `DATABASE_URL`  
**Value**: Paste the **Internal Database URL** you copied in Step 1.1

#### 5. SECURE_SSL_REDIRECT

**Key**: `SECURE_SSL_REDIRECT`  
**Value**: `True`

#### 6. SESSION_COOKIE_SECURE

**Key**: `SESSION_COOKIE_SECURE`  
**Value**: `True`

#### 7. CSRF_COOKIE_SECURE

**Key**: `CSRF_COOKIE_SECURE`  
**Value**: `True`

#### 8. CORS_ALLOWED_ORIGINS

**Key**: `CORS_ALLOWED_ORIGINS`  
**Value**: `http://localhost:3000`

(We'll update this later with your frontend URL)

#### 9. CSRF_TRUSTED_ORIGINS

**Key**: `CSRF_TRUSTED_ORIGINS`  
**Value**: `http://localhost:3000`

(We'll update this later with your frontend URL)

#### 10. SHORT_URL_DOMAIN

**Key**: `SHORT_URL_DOMAIN`  
**Value**: `http://localhost:3000`

(We'll update this later with your frontend URL)

---

### Step 1.4: Deploy Backend

1. After adding all environment variables, click **"Create Web Service"**
2. Render will start building and deploying your backend
3. **Wait 5-10 minutes** for the first deployment

**What's happening:**
- Installing Python packages
- Collecting static files
- Running database migrations
- Starting the server

**Check deployment status:**
- Green "Live" badge = Success! ✅
- Red "Deploy failed" = Check logs for errors ❌

**Your backend URL will be:**
```
https://url-shortener-backend.onrender.com
```

**Test it:** Visit `https://YOUR-SERVICE-NAME.onrender.com/admin` - you should see Django admin login page!

---

### Step 1.5: Create Superuser (Admin Account)

To access Django admin and manage your app:

1. In your Web Service page, click **"Shell"** tab (top menu)
2. This opens a terminal connected to your server
3. Run these commands:

```bash
cd backend
python manage.py createsuperuser
```

4. Enter:
   - **Username**: (your choice, e.g., `admin`)
   - **Email**: (your email)
   - **Password**: (choose a strong password)
   - **Password (again)**: (confirm)

5. Now visit `https://YOUR-SERVICE-NAME.onrender.com/admin` and login!

---

## Part 2: Deploy Frontend (React) on Render

### Step 2.1: Create Static Site

1. In Render Dashboard, click **"New +"** → **"Static Site"**
2. Select your `url_shortner` repository
3. Click **"Connect"**

**Configure the Static Site:**

| Setting | Value |
|---------|-------|
| **Name** | `url-shortener-frontend` (or any name) |
| **Branch** | `main` |
| **Root Directory** | `frontend/shortner` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `frontend/shortner/build` |

---

### Step 2.2: Add Frontend Environment Variable

Scroll to **"Environment Variables"** and add:

**Key**: `REACT_APP_API_BASE_URL`  
**Value**: `https://url-shortener-backend.onrender.com`

⚠️ **Replace** `url-shortener-backend` with YOUR actual backend service name!

---

### Step 2.3: Deploy Frontend

1. Click **"Create Static Site"**
2. Wait 3-5 minutes for build and deployment

**Your frontend URL will be:**
```
https://url-shortener-frontend.onrender.com
```

---

## Part 3: Connect Frontend and Backend

Now we need to tell the backend to accept requests from the frontend.

### Step 3.1: Update Backend Environment Variables

1. Go to your **Backend Web Service** in Render Dashboard
2. Click **"Environment"** tab (left sidebar)
3. Update these three variables:

**CORS_ALLOWED_ORIGINS**  
Change from: `http://localhost:3000`  
To: `https://url-shortener-frontend.onrender.com`

**CSRF_TRUSTED_ORIGINS**  
Change from: `http://localhost:3000`  
To: `https://url-shortener-frontend.onrender.com`

**SHORT_URL_DOMAIN**  
Change from: `http://localhost:3000`  
To: `https://url-shortener-frontend.onrender.com`

⚠️ **Replace** `url-shortener-frontend` with YOUR actual frontend site name!

4. Click **"Save Changes"**
5. Render will automatically redeploy your backend (wait 2-3 minutes)

---

### Step 3.2: Update ALLOWED_HOSTS (if needed)

If you want to allow both frontend and backend domains:

**ALLOWED_HOSTS**  
Change to: `url-shortener-backend.onrender.com,url-shortener-frontend.onrender.com`

---

## Testing Your Deployment

### Test 1: Backend API

Visit: `https://YOUR-BACKEND.onrender.com/admin`

✅ **Expected**: Django admin login page  
❌ **If error**: Check backend logs in Render dashboard

### Test 2: Frontend

Visit: `https://YOUR-FRONTEND.onrender.com`

✅ **Expected**: Your URL shortener login/signup page  
❌ **If error**: Check frontend logs in Render dashboard

### Test 3: Full Flow

1. Visit your frontend URL
2. Click **"Sign Up"**
3. Create a new account
4. Log in
5. Try shortening a URL
6. Check if it appears in your history
7. Try visiting the short URL - it should redirect!

### Test 4: Check CORS

Open browser DevTools (F12) → Console tab

✅ **Expected**: No CORS errors  
❌ **If CORS errors**: Double-check `CORS_ALLOWED_ORIGINS` matches your frontend URL exactly

---

## Troubleshooting

### Problem: "Application Error" on Backend

**Solution:**
1. Go to backend Web Service → **"Logs"** tab
2. Look for error messages
3. Common issues:
   - Missing environment variable → Add it in Environment tab
   - Database connection failed → Check `DATABASE_URL`
   - Module not found → Check `requirements.txt` has all packages

### Problem: Frontend shows blank page

**Solution:**
1. Check browser console (F12) for errors
2. Common issues:
   - Wrong `REACT_APP_API_BASE_URL` → Update in frontend Environment
   - CORS error → Update backend `CORS_ALLOWED_ORIGINS`

### Problem: "CSRF token missing or incorrect"

**Solution:**
1. Ensure `CSRF_TRUSTED_ORIGINS` in backend includes your frontend URL
2. Make sure frontend URL starts with `https://` (not `http://`)
3. Clear browser cookies and try again

### Problem: "502 Bad Gateway"

**Solution:**
- Your backend is starting up (Render free tier sleeps after inactivity)
- Wait 30-60 seconds and refresh
- First request after sleep takes longer

### Problem: Database connection errors

**Solution:**
1. Check `DATABASE_URL` is correct (from Step 1.1)
2. Ensure database is in same region as web service
3. Use **Internal Database URL**, not External

---

## Optional: Custom Domain Setup

### For Backend (api.yourdomain.com)

1. In backend Web Service → **"Settings"** → **"Custom Domain"**
2. Click **"Add Custom Domain"**
3. Enter: `api.yourdomain.com`
4. Render shows DNS records to add
5. Go to your domain registrar (GoDaddy, Namecheap, etc.)
6. Add CNAME record:
   ```
   Type: CNAME
   Name: api
   Value: url-shortener-backend.onrender.com
   ```
7. Wait for DNS propagation (5 minutes - 48 hours)
8. Update environment variables to use new domain

### For Frontend (yourdomain.com)

1. In frontend Static Site → **"Settings"** → **"Custom Domain"**
2. Click **"Add Custom Domain"**
3. Enter: `yourdomain.com`
4. Add DNS records shown by Render
5. Update backend `CORS_ALLOWED_ORIGINS` to `https://yourdomain.com`

---

## Understanding Django Settings for Deployment

Your `backend/config/settings.py` already has production-ready configurations:

### ALLOWED_HOSTS
```python
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')
```
**What it does**: Lists domains allowed to access your backend  
**Why needed**: Security - prevents host header attacks

### CORS Configuration
```python
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = os.getenv('CORS_ALLOWED_ORIGINS', 'http://localhost:3000').split(',')
```
**What it does**: Allows your frontend to make requests to backend  
**Why needed**: Browsers block cross-origin requests by default

### Database
```python
if os.getenv('DATABASE_URL'):
    DATABASES = {
        'default': dj_database_url.config(default=os.getenv('DATABASE_URL'))
    }
else:
    # SQLite for local development
```
**What it does**: Uses PostgreSQL in production, SQLite locally  
**Why needed**: PostgreSQL is more robust for production

### Static Files
```python
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
```
**What it does**: Serves CSS/JS files efficiently  
**Why needed**: WhiteNoise serves static files without needing a separate server

### Security Headers
```python
SECURE_SSL_REDIRECT = os.getenv('SECURE_SSL_REDIRECT', 'False') == 'True'
SESSION_COOKIE_SECURE = os.getenv('SESSION_COOKIE_SECURE', 'False') == 'True'
CSRF_COOKIE_SECURE = os.getenv('CSRF_COOKIE_SECURE', 'False') == 'True'
```
**What it does**: Enforces HTTPS, secure cookies  
**Why needed**: Protects user data and sessions

---

## Quick Reference: All Environment Variables

### Backend Environment Variables

| Variable | Example Value | Purpose |
|----------|---------------|---------|
| `SECRET_KEY` | `xK9mP2nQ...` | Django encryption key |
| `DEBUG` | `False` | Disable debug mode |
| `ALLOWED_HOSTS` | `your-backend.onrender.com` | Allowed domains |
| `DATABASE_URL` | `postgresql://...` | Database connection |
| `SECURE_SSL_REDIRECT` | `True` | Force HTTPS |
| `SESSION_COOKIE_SECURE` | `True` | Secure session cookies |
| `CSRF_COOKIE_SECURE` | `True` | Secure CSRF cookies |
| `CORS_ALLOWED_ORIGINS` | `https://your-frontend.onrender.com` | Frontend URL |
| `CSRF_TRUSTED_ORIGINS` | `https://your-frontend.onrender.com` | Frontend URL |
| `SHORT_URL_DOMAIN` | `https://your-frontend.onrender.com` | Short URL domain |

### Frontend Environment Variables

| Variable | Example Value | Purpose |
|----------|---------------|---------|
| `REACT_APP_API_BASE_URL` | `https://your-backend.onrender.com` | Backend API URL |

---

## Next Steps After Deployment

1. ✅ **Test all features** - signup, login, create URLs, view history
2. ✅ **Monitor logs** - Check for errors in Render dashboard
3. ✅ **Set up monitoring** - Render shows uptime and performance
4. ✅ **Enable database backups** - Render provides automatic backups
5. ✅ **Consider upgrading** - Free tier sleeps after 15 min inactivity

---

## Cost Breakdown (Render Free Tier)

| Service | Free Tier Limits |
|---------|------------------|
| PostgreSQL Database | 1 GB storage, 97 hours/month compute |
| Web Service (Backend) | 750 hours/month, sleeps after 15 min inactivity |
| Static Site (Frontend) | Unlimited bandwidth, always on |

**Total Cost**: **$0/month** for testing and small projects!

**Upgrade when needed:**
- More storage
- No sleep (always on)
- Custom domains
- Better performance

---

## Summary

You've successfully deployed a full-stack application! 🎉

**What you accomplished:**
1. ✅ Created PostgreSQL database on Render
2. ✅ Deployed Django backend as Web Service
3. ✅ Deployed React frontend as Static Site
4. ✅ Connected frontend and backend with CORS
5. ✅ Configured environment variables
6. ✅ Tested the complete application

**Your live URLs:**
- Frontend: `https://YOUR-FRONTEND.onrender.com`
- Backend: `https://YOUR-BACKEND.onrender.com`
- Admin: `https://YOUR-BACKEND.onrender.com/admin`

**Need help?**
- Check Render documentation: [render.com/docs](https://render.com/docs)
- Review logs in Render dashboard
- Check browser console for frontend errors
- Use Django admin to inspect database

---

**Congratulations on your first deployment! 🚀**
