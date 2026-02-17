# Cross-Domain Deployment Fix for Render

## Issue
When deploying frontend and backend on separate Render services (different subdomains), browsers block third-party cookies due to security policies, causing CSRF and authentication failures.

## Quick Solutions

### Solution 1: Use Custom Domain (Recommended)
Deploy both services under the same root domain:
- Backend: `api.yourdomain.com`
- Frontend: `yourdomain.com`

Cookies will work because they share the same root domain.

### Solution 2: Enable CSRF_USE_SESSIONS
Store CSRF token in session instead of cookies.

**Add to Render backend environment:**
```
CSRF_USE_SESSIONS=True
```

Then push code changes and redeploy.

### Solution 3: Test in Different Browser
Chrome has strictest cookie policies. Try Firefox or Safari.

### Solution 4: Deploy Frontend as Django Static Files
Serve React build from Django (same domain, no cookie issues).

## Current Status
- Backend: `https://url-shortner-backend-cqgw.onrender.com`
- Frontend: `https://url-shortner-frontend-7mdt.onrender.com`
- Issue: Third-party cookie blocking

## Recommended Next Step
Add `CSRF_USE_SESSIONS=True` to backend environment variables and test.
