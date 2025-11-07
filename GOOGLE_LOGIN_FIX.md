# 🔧 Google Login Fix & Debugging Guide

## Problem Analysis

### Error Encountered
```
Error Type: Console Error
Error Message: Google login failed
Location: hooks/use-auth.tsx:260:13
Context: at loginWithGoogle → at handleGoogleSignIn
```

## Root Causes Identified

### 1. Poor Error Handling
The original code was catching all errors and wrapping them in a generic message, losing the actual error details.

### 2. Missing Error Details
The error handler wasn't logging or displaying the specific reason for failure.

### 3. Backend Response Not Being Captured
The error details from the backend (`error.response?.data?.detail`) were not being properly propagated.

## Fixes Implemented

### 1. Enhanced Error Handling in `use-auth.tsx`

**Location**: `/hooks/use-auth.tsx` - `loginWithGoogle` function

**Changes**:
- ✅ Added detailed error logging for backend failures
- ✅ Improved error message extraction from backend
- ✅ Added Firebase-specific error code handling
- ✅ Created friendly error messages for common Firebase errors
- ✅ Preserved original error for special cases (GOOGLE_USER_NOT_REGISTERED)

**New Error Handling**:
```typescript
// Backend error handling
catch (e: any) {
  console.error('Backend login/firebase error:', e);
  
  const status = e?.response?.status;
  if (status === 404) {
    // User not in MongoDB - special handling
    const err: any = new Error('GOOGLE_USER_NOT_REGISTERED');
    err.email = firebaseUser.email;
    err.name = firebaseUser.displayName || firebaseUser.email?.split('@')[0];
    throw err;
  }
  
  // Detailed error message from backend
  const errorDetail = e?.response?.data?.detail || e.message || 'Unknown error';
  throw new Error(`Backend authentication failed: ${errorDetail}`);
}
```

**Firebase Error Codes Handled**:
- `auth/popup-closed-by-user` → "Login cancelled - popup was closed"
- `auth/popup-blocked` → "Popup was blocked by browser - please allow popups"
- `auth/cancelled-popup-request` → "Login cancelled"
- `auth/network-request-failed` → "Network error - please check your connection"
- `auth/internal-error` → "An internal error occurred - please try again"
- `auth/unauthorized-domain` → "This domain is not authorized for Google Sign-In"

### 2. Improved Error Display in `login/page.tsx`

**Location**: `/app/login/page.tsx` - `handleGoogleSignIn` function

**Changes**:
- ✅ Added console logging at key points
- ✅ Display actual error message instead of generic text
- ✅ Log full error details for debugging
- ✅ Preserve error details from backend

**New Error Display**:
```typescript
catch (err: any) {
  console.error('Google sign-in error:', err);
  
  if (err?.message === 'GOOGLE_USER_NOT_REGISTERED') {
    // Redirect to signup with prefilled info
    setError('This Google account is not registered. Please complete signup.');
    router.push(`/signup?email=${err.email}&name=${err.name}`);
  } else {
    // Show actual error message
    const errorMessage = err.message || err?.response?.data?.detail || 'Failed to sign in with Google. Please try again.';
    console.error('Full error details:', errorMessage);
    setError(errorMessage);
  }
}
```

## Testing Steps

### 1. Check Backend Status
```bash
# Verify backend is running
lsof -ti:8000
# Should return a process ID

# Check backend logs
# Look for Firebase initialization messages
```

**Expected Output**:
```
✅ Firebase Admin SDK initialized successfully
✅ Connected to MongoDB successfully
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### 2. Test Google Login Flow

**Steps**:
1. Open browser to `http://localhost:3000/login`
2. Open Developer Tools (F12)
3. Go to Console tab
4. Click "Sign in with Google" button
5. Select a Google account
6. Watch console for logs

**Expected Console Logs**:
```javascript
Starting Google Sign-In...
// Firebase popup opens
// User selects account
// Token is obtained
Backend login/firebase error: [object] // Only if error occurs
Google Sign-In successful, user: {role: "student", ...} // On success
```

### 3. Check for Specific Errors

#### Error: "Popup was blocked"
**Cause**: Browser blocked the Google login popup
**Solution**: 
- Allow popups for localhost in browser settings
- Chrome: Click popup icon in address bar → "Always allow popups"
- Firefox: Preferences → Privacy → Permissions → Block pop-up windows (add exception)

#### Error: "This domain is not authorized"
**Cause**: Domain not whitelisted in Firebase Console
**Solution**:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Authentication → Settings → Authorized domains
4. Add `localhost` (should already be there)
5. For production, add your deployment domain

#### Error: "Backend authentication failed: [detail]"
**Cause**: Backend server error or database issue
**Solution**:
1. Check backend is running: `lsof -ti:8000`
2. Check MongoDB connection in backend logs
3. Verify Firebase credentials in `.env`
4. Check network tab in DevTools for API response

#### Error: "Network error - please check your connection"
**Cause**: No internet connection or backend not accessible
**Solution**:
- Check internet connection
- Verify backend is running
- Check `NEXT_PUBLIC_API_URL` in frontend `.env`

### 4. Verify Firebase Configuration

**Frontend** (`/lib/firebase.ts`):
```typescript
// Check these environment variables are set
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
```

**Backend** (`/backend/.env`):
```bash
# Verify these are set correctly
FIREBASE_PROJECT_ID=edudash-4f7ef
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@edudash-4f7ef.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 5. Test API Endpoint Directly

Use curl to test the backend endpoint:

```bash
# First, get a Firebase ID token (from browser console after Google login)
# In browser console, after clicking "Sign in with Google":
firebase.auth().currentUser.getIdToken().then(token => console.log(token))

# Then test the backend
curl -X POST http://localhost:8000/api/auth/login/firebase \
  -H "Content-Type: application/json" \
  -d '{"firebase_token": "YOUR_TOKEN_HERE"}'
```

**Expected Response** (success):
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "user": {
    "id": "...",
    "email": "user@gmail.com",
    "display_name": "User Name",
    "role": "student",
    ...
  }
}
```

**Expected Response** (error):
```json
{
  "detail": "Firebase authentication failed: [specific error]"
}
```

## Common Issues & Solutions

### Issue 1: "Firebase authentication failed: Token verification failed"

**Possible Causes**:
1. Invalid Firebase credentials in backend `.env`
2. Clock skew between client and server
3. Expired or invalid token

**Solutions**:
1. Verify Firebase service account credentials
2. Check system clock is synchronized
3. Ensure token is fresh (< 1 hour old)

### Issue 2: MongoDB Connection Error

**Symptoms**:
- Backend logs show `❌ MongoDB connection failed`
- Google login fails with database error

**Solutions**:
```bash
# Check MongoDB connection string
grep MONGODB_URL /Users/nihithreddy/Downloads/Hactober-main/backend/.env

# Test MongoDB connection
# For MongoDB Atlas, whitelist your IP address in Atlas console
```

### Issue 3: CORS Error

**Symptoms**:
- Browser console shows CORS error
- Network tab shows preflight request failed

**Solutions**:
```bash
# In backend/.env, ensure frontend URL is in CORS_ORIGINS
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Restart backend after changing .env
```

### Issue 4: "User account is inactive"

**Cause**: User exists in MongoDB but `is_active` field is `false`

**Solutions**:
```javascript
// Check in MongoDB
db.users.findOne({ email: "user@gmail.com" })

// Update user to active
db.users.updateOne(
  { email: "user@gmail.com" },
  { $set: { is_active: true } }
)
```

## Debugging Checklist

When Google login fails, check in this order:

### Frontend
- [ ] Browser console shows detailed error message
- [ ] Firebase config is correct in `/lib/firebase.ts`
- [ ] Popup is not blocked by browser
- [ ] Network tab shows API request to `/api/auth/login/firebase`
- [ ] Request payload contains `firebase_token`

### Backend
- [ ] Backend is running on port 8000
- [ ] Firebase Admin SDK initialized successfully
- [ ] MongoDB connected successfully
- [ ] CORS origins include `http://localhost:3000`
- [ ] `.env` file has all Firebase credentials

### Firebase Console
- [ ] Project is active
- [ ] Authentication is enabled
- [ ] Google sign-in method is enabled
- [ ] Authorized domains include `localhost`

### Network
- [ ] Internet connection is working
- [ ] No firewall blocking port 8000
- [ ] API URL is correct (`http://localhost:8000/api`)

## Verification After Fix

### Test Scenarios

#### Scenario 1: New Google User (Auto-Provision)
1. Use a Google account that's never logged in before
2. Click "Sign in with Google"
3. Select Google account
4. **Expected**: User is automatically created in MongoDB with role "student"
5. **Expected**: Redirected to student dashboard

#### Scenario 2: Existing Google User
1. Use a Google account that's logged in before
2. Click "Sign in with Google"
3. Select Google account
4. **Expected**: User is found in MongoDB
5. **Expected**: Redirected to appropriate dashboard (student/teacher)

#### Scenario 3: Network Error
1. Stop backend server
2. Click "Sign in with Google"
3. **Expected**: Error message shows "Backend authentication failed: [connection error]"
4. **Expected**: User sees helpful error message

#### Scenario 4: Popup Blocked
1. Block popups in browser
2. Click "Sign in with Google"
3. **Expected**: Error message shows "Popup was blocked by browser - please allow popups"
4. **Expected**: User knows what to do

## Success Criteria

✅ Google login works without errors
✅ Error messages are clear and actionable
✅ Console logs show detailed debugging info
✅ New users are auto-provisioned
✅ Existing users can log in
✅ Proper redirection based on role
✅ Tokens are stored correctly

## Files Modified

1. `/hooks/use-auth.tsx`
   - Enhanced `loginWithGoogle` function
   - Added detailed error handling
   - Added Firebase error code mapping
   - Improved error logging

2. `/app/login/page.tsx`
   - Improved `handleGoogleSignIn` function
   - Added console logging
   - Display actual error messages
   - Better error context

## Backend Status

✅ `/api/auth/login/firebase` endpoint exists
✅ Auto-provisions new users
✅ Returns proper JWT tokens
✅ Handles Firebase token verification
✅ Sets custom claims for roles

## Next Steps

1. **Test the fix**:
   - Try logging in with Google
   - Check console for detailed error messages
   - Verify error message is displayed in UI

2. **If still failing**:
   - Check backend logs for Firebase initialization errors
   - Verify MongoDB connection
   - Test API endpoint directly with curl
   - Check Firebase Console for authorized domains

3. **Production Setup**:
   - Add production domain to Firebase authorized domains
   - Update CORS_ORIGINS in backend
   - Ensure proper error monitoring
   - Add analytics for login success/failure

---

**Status**: ✅ Error handling improved, debugging enabled
**Next**: Test Google login and observe detailed error messages
**Documentation**: Error messages now show root cause for easier debugging
