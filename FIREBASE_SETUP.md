# Firebase Authentication Setup Guide

## Overview
BookOnce uses Firebase Authentication for secure user management with multiple authentication methods.

## Firebase Project Configuration

Your Firebase project is already configured with the following credentials:

```
Project ID: book-once
Auth Domain: book-once.firebaseapp.com
API Key: AIzaSyA0jwCCRw-Sh8r6dX1ULDbQ5QhfUccmh_U
```

## Environment Variables

All Firebase credentials are already configured in `.env`:

```env
VITE_FIREBASE_API_KEY=AIzaSyA0jwCCRw-Sh8r6dX1ULDbQ5QhfUccmh_U
VITE_FIREBASE_AUTH_DOMAIN=book-once.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=book-once
VITE_FIREBASE_STORAGE_BUCKET=book-once.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=401504323538
VITE_FIREBASE_APP_ID=1:401504323538:web:c1c6e30bf1163d19116a0b
VITE_FIREBASE_MEASUREMENT_ID=G-XD47BPPMBL
```

## Authentication Methods

### 1. Email/Password Authentication ✅
- **Status**: Ready to use
- **File**: `src/auth/emailAuth.ts`
- **Features**:
  - User registration with email
  - Secure password authentication
  - Password strength validation
  - Email verification

**How to use**:
```typescript
import { signUpWithEmail, loginWithEmail } from '@/auth/emailAuth';

// Sign up
const result = await signUpWithEmail('user@example.com', 'password123');

// Login
const result = await loginWithEmail('user@example.com', 'password123');
```

### 2. Google OAuth ✅
- **Status**: Ready to use
- **File**: `src/auth/googleAuth.ts`
- **Features**:
  - One-click Google sign-in
  - Automatic profile creation
  - Secure token handling

**How to use**:
```typescript
import { loginWithGoogle } from '@/auth/googleAuth';

const result = await loginWithGoogle();
```

### 3. Phone OTP Authentication ✅
- **Status**: Ready to use
- **File**: `src/auth/phoneAuth.ts`
- **Features**:
  - SMS-based OTP verification
  - reCAPTCHA protection
  - 10-minute OTP expiry

**How to use**:
```typescript
import { sendOtp } from '@/auth/phoneAuth';

// Send OTP
const confirmationResult = await sendOtp('+1234567890');

// Verify OTP
const result = await confirmationResult.confirm('123456');
```

### 4. Email OTP Authentication ✅
- **Status**: Ready to use
- **File**: `src/services/AuthService.ts`
- **Features**:
  - 6-digit OTP codes
  - 15-minute expiry
  - Resend functionality
  - Fallback to console for testing

**How to use**:
```typescript
import { emailOtpService } from '@/services/AuthService';

// Send OTP
const result = await emailOtpService.sendOTP('user@example.com');

// Verify OTP
const result = await emailOtpService.verifyOTP('user@example.com', '123456');
```

## Login Page Features

The login page (`src/pages/Auth.tsx`) includes:

### Authentication Modes
1. **Email Login** - Traditional email/password login
2. **Phone Login** - Phone number with OTP verification
3. **Email Signup** - Create account with email
4. **Phone Signup** - Create account with phone
5. **Google Sign-In** - One-click Google authentication

### Security Features
- ✅ Password strength indicator
- ✅ Session timeout (30 minutes of inactivity)
- ✅ Secure token storage
- ✅ XSS protection
- ✅ CSRF protection
- ✅ Rate limiting ready

### UI/UX Features
- ✅ Smooth animations with Framer Motion
- ✅ Responsive design (mobile-first)
- ✅ Dark/Light theme support
- ✅ Loading states
- ✅ Error handling with toast notifications
- ✅ OTP timer with countdown
- ✅ Password visibility toggle

## Testing the Login Page

### 1. Start the Development Server
```bash
npm run dev
```

### 2. Navigate to Login
- Go to `http://localhost:5173/auth`

### 3. Test Email/Password
- Click "Sign up"
- Enter email, password, and name
- Click "Continue with Email"
- Enter the OTP (check console for demo OTP)
- Account created!

### 4. Test Phone OTP
- Click "Sign In" → "Phone"
- Enter phone number
- Click "Send OTP"
- Enter the OTP (check console for demo OTP)
- Logged in!

### 5. Test Google Sign-In
- Click "Google" button
- Follow Google authentication flow
- Automatically logged in!

## Firebase Console Access

To manage your Firebase project:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: **book-once**
3. Navigate to **Authentication** section
4. View users, enable/disable auth methods, manage settings

### Enable Authentication Methods in Firebase Console

1. **Email/Password**:
   - Go to Authentication → Sign-in method
   - Enable "Email/Password"

2. **Google**:
   - Go to Authentication → Sign-in method
   - Enable "Google"
   - Add OAuth consent screen

3. **Phone**:
   - Go to Authentication → Sign-in method
   - Enable "Phone"
   - Configure reCAPTCHA

## Email OTP Configuration

### Option 1: Gmail (Recommended - FREE)
1. Get app password from [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Step Verification
3. Go to "App passwords"
4. Select "Mail" and "Windows Computer"
5. Copy the 16-character password
6. Add to `.env`:
```env
VITE_GMAIL_EMAIL=your_email@gmail.com
VITE_GMAIL_PASSWORD=xxxx xxxx xxxx xxxx
```

### Option 2: Resend (FREE - 100 emails/day)
1. Sign up at [Resend](https://resend.com)
2. Get free API key
3. Add to `.env`:
```env
VITE_RESEND_API_KEY=re_your_api_key_here
```

## Troubleshooting

### Issue: "Firebase app not initialized"
**Solution**: Ensure `.env` variables are set and restart dev server

### Issue: "Google sign-in not working"
**Solution**: 
- Check Firebase Console → Authentication → Google is enabled
- Verify OAuth consent screen is configured

### Issue: "Phone OTP not sending"
**Solution**:
- Check Firebase Console → Authentication → Phone is enabled
- Verify reCAPTCHA is configured
- Check browser console for errors

### Issue: "Email OTP not sending"
**Solution**:
- Check `.env` has Gmail or Resend credentials
- For Gmail: verify app password is correct
- For Resend: verify API key is valid
- Check browser console for errors

## Security Best Practices

1. ✅ Never commit `.env` with real credentials
2. ✅ Use environment variables for all secrets
3. ✅ Enable Firebase Security Rules
4. ✅ Use HTTPS in production
5. ✅ Implement rate limiting
6. ✅ Monitor authentication logs
7. ✅ Use strong password requirements
8. ✅ Enable 2FA for Firebase Console

## Next Steps

1. Test all authentication methods
2. Customize login page branding
3. Set up email templates
4. Configure Firebase Security Rules
5. Implement user profile management
6. Add password reset functionality
7. Set up analytics tracking

## Support

For issues or questions:
- Check [Firebase Documentation](https://firebase.google.com/docs)
- Review [Firebase Auth API](https://firebase.google.com/docs/auth)
- Check browser console for error messages
