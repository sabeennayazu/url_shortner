# Production Deployment Guide

## Overview
This guide walks you through deploying the URL Shortener application to production:
- **Backend**: Django + Gunicorn on Render
- **Frontend**: React on Vercel
- **Authentication**: Session-based across HTTPS domains

---

## Prerequisites
- GitHub repository with both frontend and backend
- Render account (https://render.com)
- Vercel account (https://vercel.com)
- Custom domain (optional but recommended)

---

## Part 1: Backend Deployment (Render)

### Step 1: Create a PostgreSQL Database on Render

1. Go to https://dashboard.render.com
2. Click "New +" → "PostgreSQL"
3. Configure:
   - **Name**: `url-shortener-db`
   - **Database**: `urlshortener`
   - **User**: Keep auto-generated or set custom
   - **Region**: Same as your web service (recommended)
4. Note the **internal database URL** (you'll need this)

### Step 2: Create a Web Service on Render

1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `url-shortener-api`
   - **Environment**: `Python 3`
   - **Build Command**: 
     ```bash
     pip install -r backend/requirements.txt && cd backend && python manage.py collect static --noinput && python manage.py migrate
     ```
   - **Start Command**: 
     ```bash
     cd backend && gunicorn config.wsgi:application --bind 0.0.0.0:$PORT
     ```
   - **Region**: Choose your preferred region
   - **Plan**: Start with Starter plan

4. In the **Environment** tab, set these variables:
   ```
   SECRET_KEY=<generate-a-secure-key-with-python-secrets>
   DEBUG=False
   ALLOWED_HOSTS=url-shortener-api.onrender.com,yourdomain.com,www.yourdomain.com
   SECURE_SSL_REDIRECT=True
   SESSION_COOKIE_SECURE=True
   CSRF_COOKIE_SECURE=True
   CORS_ALLOWED_ORIGINS=https://yourdomain.vercel.app,https://yourdomain.com,https://www.yourdomain.com
   CSRF_TRUSTED_ORIGINS=https://yourdomain.vercel.app,https://yourdomain.com,https://www.yourdomain.com
   SHORT_URL_DOMAIN=https://yourdomain.com
   DATABASE_URL=<paste-the-internal-database-url-from-step-1>
   ```

5. Click **Create Web Service** and wait for deployment

### Step 3: Generate a Secure SECRET_KEY

In your terminal, run:
```bash
python -c "import secrets; print(secrets.token_urlsafe(50))"
```
Copy the output and use it as your SECRET_KEY environment variable.

---

## Part 2: Frontend Deployment (Vercel)

### Step 1: Configure Environment Variables

1. Go to https://vercel.com and sign in
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure:
   - **Project Name**: `url-shortener` (or your preference)
   - **Framework**: `Create React App`

5. In **Environment Variables**, add:
   ```
   REACT_APP_API_BASE_URL=https://url-shortener-api.onrender.com
   ```

### Step 2: Configure Build Settings

- **Root Directory**: Leave blank or set to `./frontend/shortner`
- **Build Command**: `npm run build`
- **Output Directory**: `build`
- **Install Command**: `npm install`

### Step 3: Deploy

Click **Deploy** and wait for Vercel to build and deploy your frontend.

---

## Part 3: Custom Domain Setup (Optional)

### For Render Backend:

1. In Render dashboard, go to your Web Service
2. Click **Settings** → **Custom Domain**
3. Add your domain (e.g., `api.yourdomain.com`)
4. Update your DNS records with the CNAME provided

### For Vercel Frontend:

1. In Vercel dashboard, go to your Project
2. Click **Settings** → **Domains**
3. Add your domain (e.g., `yourdomain.com`)
4. Update your DNS records with the CNAME provided

---

## Part 4: Update Environment Variables

After deployment, update these in each platform:

### Render (Backend):
```
ALLOWED_HOSTS=api.yourdomain.com,yourdomain.com,www.yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com,https://yourdomain.vercel.app
CSRF_TRUSTED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com,https://yourdomain.vercel.app
SHORT_URL_DOMAIN=https://yourdomain.com
```

### Vercel (Frontend):
```
REACT_APP_API_BASE_URL=https://api.yourdomain.com
```

---

## Part 5: Database Migrations

### One-time Setup:

1. SSH into Render or use Render's shell:
   ```bash
   python manage.py migrate
   python manage.py createsuperuser
   ```

2. Create a superuser for admin access:
   - Visit: `https://api.yourdomain.com/admin`

---

## Part 6: Security Checklist

- ✅ DEBUG=False in production
- ✅ SECRET_KEY is securely generated and environment-based
- ✅ ALLOWED_HOSTS configured with your domains
- ✅ HTTPS enabled (Render and Vercel provide free SSL)
- ✅ CORS properly configured for cross-domain requests
- ✅ SESSION_COOKIE_SECURE=True (HTTPS only)
- ✅ CSRF_COOKIE_SECURE=True (HTTPS only)
- ✅ Database URL uses environment variables
- ✅ `.env` files are in `.gitignore` and not committed

---

## Part 7: Verification Steps

### Backend API Health:
```bash
curl -X GET https://api.yourdomain.com/api/urls/ \
  -H "Authorization: Bearer your-token" \
  -H "X-CSRFToken: your-csrf-token"
```

### Frontend:
1. Visit `https://yourdomain.com`
2. Sign up / Log in
3. Create a short URL
4. Verify the short URL is created and stored
5. Check "My History" shows only your URLs
6. Test the redirect works

### Cross-Domain Authentication:
1. Open DevTools → Application → Cookies
2. Verify `sessionid` cookie:
   - Domain: `.yourdomain.com` (includes subdomains)
   - Secure: ✅ (HTTPS only)
   - HttpOnly: ✅
   - SameSite: Lax

---

## Part 8: Troubleshooting

### CORS Errors:
- Check `CORS_ALLOWED_ORIGINS` includes exact frontend domain with protocol
- Verify `CSRF_TRUSTED_ORIGINS` matches

### 401 Unauthorized:
- Ensure `credentials: 'include'` is set in fetch calls
- Check if session cookie is being sent with requests

### 403 Forbidden:
- CSRF token missing or invalid
- Verify `X-CSRFToken` header is being sent
- Check `CSRF_COOKIE_HTTPONLY=False` (allows JS to read token)

### Static Files Not Loading:
- Run `python manage.py collectstatic` on Render
- Verify `STATIC_ROOT` and `STATIC_URL` are correctly configured

---

## Part 9: Local Development

To test locally with production settings:

### Backend (.env):
```bash
SECRET_KEY=your-local-secret-key
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1
SECURE_SSL_REDIRECT=False
SESSION_COOKIE_SECURE=False
CSRF_COOKIE_SECURE=False
CORS_ALLOWED_ORIGINS=http://localhost:3000
CSRF_TRUSTED_ORIGINS=http://localhost:3000
SHORT_URL_DOMAIN=http://localhost:8000
```

### Frontend (.env.local):
```bash
REACT_APP_API_BASE_URL=http://localhost:8000
```

Then run:
```bash
# Terminal 1: Backend
cd backend
python manage.py runserver

# Terminal 2: Frontend
cd frontend/shortner
npm start
```

---

## Part 10: Monitoring & Maintenance

### Logs:
- **Render**: Dashboard → Logs (view errors and warnings)
- **Vercel**: Dashboard → Deployments → View logs

### Database Backups:
- Render provides automated daily backups (free plan)
- Download backups from Render dashboard under PostgreSQL settings

### Updates:
- Monitor Django security releases: https://www.djangoproject.com
- Update `requirements.txt` and redeploy to Render

---

## Environment Variables Summary

### Backend Required:
- `SECRET_KEY` - Generate with Python secrets
- `DEBUG` - Set to False
- `ALLOWED_HOSTS` - Your domain(s)
- `SECURE_SSL_REDIRECT` - True for production
- `SESSION_COOKIE_SECURE` - True for production
- `CSRF_COOKIE_SECURE` - True for production
- `CORS_ALLOWED_ORIGINS` - Frontend domain(s)
- `CSRF_TRUSTED_ORIGINS` - Frontend domain(s)
- `SHORT_URL_DOMAIN` - Your short URL domain
- `DATABASE_URL` - PostgreSQL connection string

### Frontend Required:
- `REACT_APP_API_BASE_URL` - Backend API URL

---

## Package Versions (requirements.txt)

```
Django==5.2.6
django-cors-headers==4.4.3
python-dotenv==1.0.0
gunicorn==23.0.0
whitenoise==6.8.2
psycopg2-binary==2.9.12
```

---

## Next Steps After Deployment

1. Set up email for password resets (update `EMAIL_*` env vars)
2. Configure logging and error tracking (e.g., Sentry)
3. Set up automated backups
4. Monitor performance with Django Debug Toolbar (dev only)
5. Consider adding rate limiting to API endpoints

---
