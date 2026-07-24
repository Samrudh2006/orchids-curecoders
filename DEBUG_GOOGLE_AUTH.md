# Google OAuth origin_mismatch Error - Debugging Guide

## Error Details
- **Status**: origin_mismatch (400)
- **Message**: "You can't sign in to this app because it doesn't comply with Google's OAuth 2.0 policy"

## Root Causes (in order of likelihood)

### 1. ⏱️ Google Settings Not Propagated Yet (MOST COMMON)
- **Symptom**: Just added the Vercel URL to Google Cloud Console
- **Fix**: Wait 5-30 minutes and try again
- **Why**: Google's cache takes time to propagate globally

### 2. 🌐 Browser Sending Wrong Origin
- **Current Setup in Google Cloud Console**:
  - ✓ http://localhost:3000
  - ✓ https://orchids-curecoders-beige.vercel.app

- **What Browser Actually Sends**:
  - Check the browser's Network tab in DevTools when trying to login
  - Look for the Google token validation request
  - Check the `origin` header being sent

### 3. 🔑 Client ID Mismatch
- **Your Current Client ID**: `744896976826-kaleqhlhvfmt9sc81ojid7o9sara7a6u.apps.googleusercontent.com`
- **Check if Frontend is Using Correct ID**:
  ```bash
  # Look in your app for where GoogleLogin uses clientId
  grep -r "clientId\|GOOGLE_CLIENT_ID" .
  ```

### 4. 🔄 Vercel Environment Variables Not Set
- **In Vercel Dashboard**, go to **Settings > Environment Variables**
- **Add these variables**:
  - `VITE_GOOGLE_CLIENT_ID` = `744896976826-kaleqhlhvfmt9sc81ojid7o9sara7a6u.apps.googleusercontent.com`
  - `SARVAM_API_KEY` = (your Sarvam API key)
  - `JWT_SECRET` = (random secure string like `openssl rand -base64 32`)

### 5. 📍 Redirect URI Issue
- Your Google Console has:
  - ✓ `https://orchids-curecoders-beige.vercel.app`
- But might need to add:
  - `https://orchids-curecoders-beige.vercel.app/`
  - `https://orchids-curecoders-beige.vercel.app/api/auth/callback`

### 6. 🔐 CORS/Security Headers
- Add to your Google Cloud Console under **Authorized redirect URIs**:
  ```
  https://orchids-curecoders-beige.vercel.app/
  ```

## Quick Test Steps

### Step 1: Open Browser DevTools
1. Go to https://orchids-curecoders-beige.vercel.app
2. Press `F12` to open Developer Tools
3. Go to **Network** tab

### Step 2: Try Google Login
1. Click "Login" button
2. Click "Sign in with Google"
3. Check Network tab for any failed requests

### Step 3: Check Request Headers
1. Look for request to `https://www.google.com/...` or similar
2. Check the `origin` header (should be `https://orchids-curecoders-beige.vercel.app`)
3. If origin doesn't match, that's the issue

## Solution Checklist

- [ ] Wait 30 minutes for Google settings to propagate
- [ ] Verify `VITE_GOOGLE_CLIENT_ID` is set in Vercel environment variables
- [ ] Check that Google Cloud Console shows your Vercel URL as authorized origin
- [ ] Try adding both with and without trailing slash to Google Console
- [ ] Ensure the OAuth2.0 Client is not restricted to localhost only
- [ ] Try in an incognito/private window (clears browser cache)
- [ ] Clear browser cache entirely
- [ ] Verify the origin being sent matches what Google expects

## If Still Not Working

1. **Create a new OAuth 2.0 Web Client** in Google Cloud Console:
   - Go to APIs & Services > Credentials
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - Choose "Web Application"
   - Add your Vercel URL as authorized origin
   - Copy the new Client ID
   - Update `VITE_GOOGLE_CLIENT_ID` environment variable with new ID

2. **Test with localhost first**:
   - `npm run dev` to start local development
   - Try Google login on `http://localhost:5173`
   - If this works, the issue is definitely origin mismatch on production URL

## Expected Behavior After Fix

1. Click "Login"
2. Click "Sign in with Google"
3. Google popup appears (doesn't show origin_mismatch error)
4. After Google consent, you see dashboard

---

**Note**: The app is correctly configured on the backend. This is purely a Google OAuth configuration issue.
