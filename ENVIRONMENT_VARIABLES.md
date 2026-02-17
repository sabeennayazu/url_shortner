# Environment Variables Documentation

## Backend Environment Variables (Django)

Manage these in **Render Dashboard → Web Service → Environment**

### Required Variables

#### `SECRET_KEY` (CRITICAL)
- **What**: Random string for Django security
- **How to generate**: 
  ```bash
  python -c "import secrets; print(secrets.token_urlsafe(50))"
  ```
- **Example**: `k_@#$%^&*()_+{}|:"<>?-jdhsadjkdsjkadsj123`
- **Rotation**: Change if compromised, all sessions will be invalidated

#### `DEBUG`
- **What**: Flask debug mode
- **Production value**: `False`
- **Development value**: `True`
- **Default**: `False`

#### `ALLOWED_HOSTS`
- **What**: Domains that can access the API
- **Format**: Comma-separated list
- **Example**: `api.yourdomain.com,yourdomain.com,yourdomain-api.onrender.com`
- **Includes**: Your custom domain + Render's default domain

#### `SECURE_SSL_REDIRECT`
- **What**: Redirect HTTP → HTTPS
- **Production value**: `True`
- **Development value**: `False`
- **Default**: `False`

#### `SESSION_COOKIE_SECURE`
- **What**: Session cookiescriptes sent only over HTTPS
- **Production value**: `True`
- **Development value**: `False`
- **Default**: `False`

#### `CSRF_COOKIE_SECURE`
- **What**: CSRF token sent only over HTTPS
- **Production value**: `True`
- **Development value**: `False`
- **Default**: `False`

#### `CORS_ALLOWED_ORIGINS`
- **What**: Frontend domains allowed to make API calls
- **Format**: Comma-separated list of full URLs with protocol
- **Example**: `https://yourdomain.com,https://www.yourdomain.com,https://yourdomain.vercel.app`
- **⚠️ Important**: Must include protocol (https://) and exact domain

#### `CSRF_TRUSTED_ORIGINS`
- **What**: Frontend domains trusted for CSRF tokens
- **Format**: Same as CORS_ALLOWED_ORIGINS
- **Example**: `https://yourdomain.com,https://www.yourdomain.com,https://yourdomain.vercel.app`
- **Purpose**: Prevents CSRF attacks from other sites

#### `SHORT_URL_DOMAIN`
- **What**: Domain used when displaying shortened URLs to users
- **Example**: `https://yourdomain.com`
- **Format**: Full URL with protocol
- **Used in**: Response JSON when creating short URLs

#### `DATABASE_URL`
- **What**: PostgreSQL connection string
- **Example**: `postgres://user:password@hostname:port/dbname`
- **From**: Render PostgreSQL instance
- **Never share**: This contains your database password!

### Optional Variables

#### `EMAIL_BACKEND`
- **What**: Email service for password resets
- **Default**: `django.core.mail.backends.console.EmailBackend` (prints to console)
- **Production**: Use `django.core.mail.backends.smtp.EmailBackend`

#### `EMAIL_HOST`
- **Example**: `smtp.gmail.com`

#### `EMAIL_PORT`
- **Example**: `587`

#### `EMAIL_USE_TLS`
- **Value**: `True`

#### `EMAIL_HOST_USER`
- **What**: Email account for sending emails
- **Example**: `noreply@yourdomain.com`

#### `EMAIL_HOST_PASSWORD`
- **What**: Email account password or app-specific password
- **Never commit**: Only set in environment variables

---

## Frontend Environment Variables (React)

Manage these in **Vercel Dashboard → Project Settings → Environment Variables**

### Required Variables

#### `REACT_APP_API_BASE_URL`
- **What**: Backend API URL
- **Development**: `http://localhost:8000`
- **Production**: `https://api.yourdomain.com` or `https://yourdomain.com`
- **Format**: Full URL with protocol, no trailing slash
- **⚠️ Important**: Must match allowed domain in backend CORS config

### Optional Variables

#### `REACT_APP_ENV`
- **What**: Environment name for debugging
- **Values**: `development`, `staging`, `production`
- **Default**: Inferred from Node environment

---

## Example Configurations

### Development (Local)

**Backend `.env`:**
```
SECRET_KEY=my-dev-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
SECURE_SSL_REDIRECT=False
SESSION_COOKIE_SECURE=False
CSRF_COOKIE_SECURE=False
CORS_ALLOWED_ORIGINS=http://localhost:3000
CSRF_TRUSTED_ORIGINS=http://localhost:3000
SHORT_URL_DOMAIN=http://localhost:8000
```

**Frontend `.env.local`:**
```
REACT_APP_API_BASE_URL=http://localhost:8000
REACT_APP_ENV=development
```

### Staging (Pre-production)

**Backend (Render):**
```
SECRET_KEY=generate-new-staging-key
DEBUG=False
ALLOWED_HOSTS=staging-api.yourdomain.com,yourdomain-staging.onrender.com
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
CORS_ALLOWED_ORIGINS=https://staging.yourdomain.com,https://yourdomain-staging.vercel.app
CSRF_TRUSTED_ORIGINS=https://staging.yourdomain.com,https://yourdomain-staging.vercel.app
SHORT_URL_DOMAIN=https://staging.yourdomain.com
```

**Frontend (Vercel):**
```
REACT_APP_API_BASE_URL=https://staging-api.yourdomain.com
REACT_APP_ENV=staging
```

### Production

**Backend (Render):**
```
SECRET_KEY=generate-new-production-key
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com,api.yourdomain.com
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
CSRF_TRUSTED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
SHORT_URL_DOMAIN=https://yourdomain.com
DATABASE_URL=postgres://...
```

**Frontend (Vercel):**
```
REACT_APP_API_BASE_URL=https://yourdomain.com
REACT_APP_ENV=production
```

---

## Security Best Practices

1. **Never commit `.env` files**
   - Add to `.gitignore`
   - Share via secure channels only

2. **Rotate `SECRET_KEY` periodically**
   - All user sessions will be invalidated
   - Do this during maintenance windows

3. **Use strong database passwords**
   - Let Render generate them
   - Store in Render's secrets manager, not plain text

4. **Update environment variables when changing domains**
   - ALLOWED_HOSTS
   - CORS_ALLOWED_ORIGINS
   - CSRF_TRUSTED_ORIGINS

5. **Monitor access logs for unauthorized requests**
   - Check Render logs for CSRF/CORS errors
   - These indicate potential attacks

6. **Test configuration before deploying**
   - Use staging environment first
   - Verify all variables are set correctly

---

## Troubleshooting

### "CORS policy: origin not allowed"
- Check `CORS_ALLOWED_ORIGINS` includes exact frontend URL with protocol
- Verify frontend is using correct API URL

### "Forbidden (403): CSRF token missing"
- Check `CSRF_TRUSTED_ORIGINS` includes frontend domain
- Verify `X-CSRFToken` header sent in requests
- Ensure cookies are being sent with requests

### "Invalid HTTP_HOST header"
- Check `ALLOWED_HOSTS` includes the domain making the request
- Verify custom domain DNS configuration

### "SyntaxError: Unexpected end of JSON input"
- Frontend trying to reach wrong API URL
- Verify `REACT_APP_API_BASE_URL` is correct

### Session not persisting
- Check `SESSION_COOKIE_SECURE` matches protocol (HTTPS/HTTP)
- Ensure cookies are sent with `credentials: 'include'`
- Verify `SameSite=Lax` configured

---
