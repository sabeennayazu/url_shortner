# Quick Start Deployment Guide

## 🚀 Deploy in 3 Steps

### 1️⃣ Backend (Render)

**Create PostgreSQL Database:**
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New +** → **PostgreSQL**
3. Name: `url-shortener-db`
4. Copy the **Internal Database URL**

**Create Web Service:**
1. Click **New +** → **Web Service**
2. Connect your GitHub repo
3. Configure:
   - **Build Command**: `pip install -r backend/requirements.txt && cd backend && python manage.py collectstatic --noinput && python manage.py migrate`
   - **Start Command**: `cd backend && gunicorn config.wsgi:application --bind 0.0.0.0:$PORT`

4. **Environment Variables** (click "Add Environment Variable"):
   ```
   SECRET_KEY=<generate-with-python-secrets>
   DEBUG=False
   ALLOWED_HOSTS=your-app.onrender.com
   DATABASE_URL=<paste-internal-db-url>
   SECURE_SSL_REDIRECT=True
   SESSION_COOKIE_SECURE=True
   CSRF_COOKIE_SECURE=True
   CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
   CSRF_TRUSTED_ORIGINS=https://your-frontend.vercel.app
   SHORT_URL_DOMAIN=https://your-frontend.vercel.app
   ```

5. Click **Create Web Service**

**Generate SECRET_KEY:**
```bash
python -c "import secrets; print(secrets.token_urlsafe(50))"
```

---

### 2️⃣ Frontend (Vercel)

1. Go to [Vercel](https://vercel.com)
2. Click **Add New...** → **Project**
3. Import your GitHub repo
4. Configure:
   - **Root Directory**: `frontend/shortner`
   - **Framework Preset**: Create React App
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

5. **Environment Variables**:
   ```
   REACT_APP_API_BASE_URL=https://your-backend.onrender.com
   ```

6. Click **Deploy**

---

### 3️⃣ Update CORS Settings

After both are deployed:

1. Go back to **Render** → Your Web Service → **Environment**
2. Update these variables with your actual Vercel URL:
   ```
   CORS_ALLOWED_ORIGINS=https://your-app.vercel.app
   CSRF_TRUSTED_ORIGINS=https://your-app.vercel.app
   ```
3. Save and wait for auto-redeploy

---

## ✅ Test Your Deployment

1. Visit your Vercel URL
2. Sign up for a new account
3. Create a shortened URL
4. Verify it appears in History
5. Test the short URL redirect
6. Download QR code

---

## 🐛 Common Issues

### CORS Errors
- Ensure `CORS_ALLOWED_ORIGINS` in Render matches your Vercel URL **exactly** (including `https://`)
- No trailing slashes in URLs

### 401 Unauthorized
- Check that `REACT_APP_API_BASE_URL` in Vercel points to your Render backend
- Verify cookies are being sent (check DevTools → Network → Headers)

### 403 Forbidden
- CSRF token issue - verify `CSRF_TRUSTED_ORIGINS` includes your frontend domain

### Static Files Not Loading
- Run `python manage.py collectstatic` in Render shell
- Check WhiteNoise is in `MIDDLEWARE` (already configured)

---

## 📚 Full Documentation

For detailed instructions, see:
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Complete deployment walkthrough
- [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md) - Security and testing checklist
- [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) - All environment variables explained

---

## 🔧 Local Development

**Backend:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

**Frontend:**
```bash
cd frontend/shortner
npm install
npm start
```

Make sure `.env.local` has:
```
REACT_APP_API_BASE_URL=http://localhost:8000
```

---

## 🎯 Next Steps

1. **Custom Domain**: Add your domain in Render/Vercel settings
2. **Email**: Configure email settings for password reset
3. **Monitoring**: Set up error tracking (Sentry)
4. **Backups**: Enable automated database backups in Render

---

**Need help?** Check the full [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for troubleshooting and advanced configuration.
