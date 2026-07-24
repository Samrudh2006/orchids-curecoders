# Vercel Deployment Guide - Google OAuth Fix

## Problem
Getting `origin_mismatch` error even with Vercel URL configured in Google Cloud Console.

## Root Cause
The `VITE_GOOGLE_CLIENT_ID` environment variable must be available during the **build process**, not just at runtime. Vercel doesn't automatically make all environment variables available to Vite during build.

## Solution

### Step 1: Add to Vercel Environment Variables
1. Go to **Vercel Dashboard > Settings > Environment Variables**
2. Add the following variables:

```
VITE_GOOGLE_CLIENT_ID = 744896976826-kaleqhlhvfmt9sc81ojid7o9sara7a6u.apps.googleusercontent.com
SARVAM_API_KEY = your_sarvam_api_key
JWT_SECRET = your_jwt_secret
```

**IMPORTANT**: The `VITE_` prefix is crucial! Without it, Vite won't expose the variable to the frontend.

### Step 2: Create `.env.production` in Project Root
This ensures the build picks up the environment variables:

```bash
# .env.production
VITE_GOOGLE_CLIENT_ID=744896976826-kaleqhlhvfmt9sc81ojid7o9sara7a6u.apps.googleusercontent.com
SARVAM_API_KEY=${SARVAM_API_KEY}
JWT_SECRET=${JWT_SECRET}
```

### Step 3: Update Vercel Build Command
In `vercel.json`, the buildCommand should be:

```json
"buildCommand": "npm run build"
```

Make sure `vite build` in the npm build script is configured to use these env vars.

### Step 4: Trigger Redeploy
After setting environment variables:
1. Go to **Vercel Dashboard > Deployments**
2. Click the three dots on the latest deployment
3. Select **Redeploy**
4. Make sure to choose **Production** environment

---

## Alternative: Use Conditional Import

If the above doesn't work, modify `index.tsx` to detect the environment dynamically:

```typescript
// Dynamic client ID detection
let googleClientId = '744896976826-kaleqhlhvfmt9sc81ojid7o9sara7a6u.apps.googleusercontent.com';

// In production on Vercel, try to get from window object
if (typeof window !== 'undefined') {
  const url = window.location.hostname;
  if (url.includes('vercel.app')) {
    // Try to get from env var or make API call to get it
    googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || googleClientId;
  }
}
```

---

## Testing the Fix

### Local Test
```bash
# Set the env var locally
export VITE_GOOGLE_CLIENT_ID="744896976826-kaleqhlhvfmt9sc81ojid7o9sara7a6u.apps.googleusercontent.com"
npm run build
npm run preview
# Visit http://localhost:4173 and test Google login
```

### Production Test
1. Wait 5-10 minutes after redeploy for Vercel to propagate the changes
2. Visit your Vercel URL: `https://orchids-curecoders-beige.vercel.app`
3. Click "Login"
4. Click "Sign in with Google"
5. Should see Google popup without `origin_mismatch` error

---

## Google Cloud Console Verification

Ensure these are all set in [Google Cloud Console](https://console.cloud.google.com/):

### Authorized JavaScript Origins
- ✓ `http://localhost:3000`
- ✓ `http://localhost:5173`
- ✓ `https://orchids-curecoders-beige.vercel.app`

### Authorized Redirect URIs
- ✓ `https://orchids-curecoders-beige.vercel.app/`
- ✓ `https://orchids-curecoders-beige.vercel.app/api/auth/google`
- ✓ `http://localhost:3000/`

---

## Troubleshooting

### Still Getting origin_mismatch?
1. **Check if env var is being used**: In browser DevTools > Network tab, look for Google OAuth requests
2. **Verify the actual client ID being sent**: Add temporary console.log in `index.tsx`
3. **Wait longer**: Google's cache can take up to an hour to propagate
4. **Create new OAuth credential**: Sometimes easier to start fresh with a new client ID

### Error: "Unauthorized redirect URI"
- Add the exact URI shown in the error to Google Cloud Console
- Make sure no trailing spaces
- Wait 5 minutes for Google to sync

### Build not picking up env vars
- Make sure `.env.production` file exists
- Verify `VITE_` prefix on all frontend env vars
- Run `npm run build` locally first to test

---

## Files Modified

1. ✅ `index.tsx` - Improved environment variable handling
2. ✅ `vercel.json` - Fixed API routing and added env vars
3. ✅ `services/apiConfig.ts` - Smart API URL resolution
4. ✅ `components/LoginModal.tsx` - Better error handling

All other configuration is ready and working!
