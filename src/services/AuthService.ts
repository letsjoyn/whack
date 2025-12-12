/**
 * Authentication Service
 * Handles email, phone, and Google authentication
 * Uses FREE services: Resend for email, Ethereal for testing
 */

// Email OTP Service - Using Resend (Free tier: 100 emails/day)
export const emailOtpService = {
  // Store OTPs in memory (in production, use backend)
  otpStore: new Map<string, { code: string; expiresAt: number }>(),

  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  },

  async sendOTP(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const otp = this.generateOTP();
      const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

      this.otpStore.set(email, { code: otp, expiresAt });

      // Try Gmail first (if configured)
      const gmailEmail = import.meta.env.VITE_GMAIL_EMAIL;
      const gmailPassword = import.meta.env.VITE_GMAIL_PASSWORD;

      if (gmailEmail && gmailPassword) {
        try {
          // Send via backend API (you'll need to set this up)
          // For now, we'll use a simple fetch to a backend endpoint
          const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              to: email,
              subject: 'Your BookOnce OTP Code',
              otp: otp,
              gmailEmail,
              gmailPassword,
            }),
          });

          if (response.ok) {
            console.log(`✅ Email OTP sent to ${email} via Gmail`);
            return {
              success: true,
              message: `OTP sent to ${email}. Check your inbox!`,
            };
          }
        } catch (gmailError) {
          console.warn('Gmail send error, trying Resend:', gmailError);
        }
      }

      // Try Resend API (if configured)
      const resendApiKey = import.meta.env.VITE_RESEND_API_KEY;
      
      if (resendApiKey && resendApiKey !== 're_your_api_key_here') {
        try {
          const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${resendApiKey}`,
            },
            body: JSON.stringify({
              from: 'BookOnce <onboarding@resend.dev>',
              to: email,
              subject: 'Your BookOnce OTP Code',
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #6366f1;">BookOnce Email Verification</h2>
                  <p>Your OTP code is:</p>
                  <h1 style="color: #6366f1; letter-spacing: 5px; font-size: 32px;">${otp}</h1>
                  <p style="color: #666;">This code expires in 15 minutes.</p>
                  <p style="color: #999; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
                </div>
              `,
            }),
          });

          if (response.ok) {
            console.log(`✅ Email OTP sent to ${email} via Resend`);
            return {
              success: true,
              message: `OTP sent to ${email}. Check your inbox!`,
            };
          }
        } catch (resendError) {
          console.warn('Resend API error, falling back to console:', resendError);
        }
      }

      // Fallback: Show in console for testing
      console.log(`📧 Email OTP for ${email}: ${otp}`);
      console.log(`⏱️ Expires in 15 minutes`);
      
      if (typeof window !== 'undefined') {
        (window as any).__DEMO_EMAIL_OTP__ = otp;
      }

      return {
        success: true,
        message: `OTP sent to ${email}. Check console for demo OTP.`,
      };
    } catch (error) {
      console.error('Error sending OTP:', error);
      return {
        success: false,
        message: 'Failed to send OTP',
      };
    }
  },

  async verifyOTP(email: string, otp: string): Promise<{ success: boolean; message: string }> {
    try {
      const stored = this.otpStore.get(email);

      if (!stored) {
        return { success: false, message: 'OTP not found. Request a new one.' };
      }

      if (Date.now() > stored.expiresAt) {
        this.otpStore.delete(email);
        return { success: false, message: 'OTP expired. Request a new one.' };
      }

      if (stored.code !== otp) {
        return { success: false, message: 'Invalid OTP. Please try again.' };
      }

      this.otpStore.delete(email);
      return { success: true, message: 'Email verified successfully!' };
    } catch (error) {
      return { success: false, message: 'Verification failed' };
    }
  },
};

// Phone OTP Service
export const phoneOtpService = {
  otpStore: new Map<string, { code: string; expiresAt: number }>(),

  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  },

  async sendOTP(phoneNumber: string): Promise<{ success: boolean; message: string }> {
    try {
      const otp = this.generateOTP();
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

      this.otpStore.set(phoneNumber, { code: otp, expiresAt });

      // In production, send via SMS service (Twilio, AWS SNS, etc.)
      console.log(`📱 Phone OTP for ${phoneNumber}: ${otp}`);
      console.log(`⏱️ Expires in 10 minutes`);

      // For demo: show OTP in console
      if (typeof window !== 'undefined') {
        (window as any).__DEMO_PHONE_OTP__ = otp;
      }

      return {
        success: true,
        message: `OTP sent to ${phoneNumber}. Check console for demo OTP.`,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to send OTP',
      };
    }
  },

  async verifyOTP(phoneNumber: string, otp: string): Promise<{ success: boolean; message: string }> {
    try {
      const stored = this.otpStore.get(phoneNumber);

      if (!stored) {
        return { success: false, message: 'OTP not found. Request a new one.' };
      }

      if (Date.now() > stored.expiresAt) {
        this.otpStore.delete(phoneNumber);
        return { success: false, message: 'OTP expired. Request a new one.' };
      }

      if (stored.code !== otp) {
        return { success: false, message: 'Invalid OTP. Please try again.' };
      }

      this.otpStore.delete(phoneNumber);
      return { success: true, message: 'Phone verified successfully!' };
    } catch (error) {
      return { success: false, message: 'Verification failed' };
    }
  },
};

// Google OAuth Service
export const googleAuthService = {
  // Initialize Google OAuth
  async initializeGoogle(): Promise<void> {
    // Load Google Sign-In library
    if (typeof window !== 'undefined' && !(window as any).google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  },

  // Handle Google Sign-In
  async handleGoogleSignIn(
    credentialResponse: any
  ): Promise<{ success: boolean; user?: any; message: string }> {
    try {
      // Decode JWT token (in production, verify on backend)
      const token = credentialResponse.credential;
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      const userData = JSON.parse(jsonPayload);

      console.log('🔐 Google Sign-In successful:', userData);

      return {
        success: true,
        user: {
          email: userData.email,
          firstName: userData.given_name,
          lastName: userData.family_name,
          picture: userData.picture,
          googleId: userData.sub,
        },
        message: 'Google sign-in successful!',
      };
    } catch (error) {
      console.error('Google sign-in error:', error);
      return {
        success: false,
        message: 'Google sign-in failed. Please try again.',
      };
    }
  },

  // Render Google Sign-In button
  renderButton(containerId: string): void {
    if (typeof window !== 'undefined' && (window as any).google) {
      (window as any).google.accounts.id.renderButton(
        document.getElementById(containerId),
        {
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
        }
      );
    }
  },
};

// Email/Password Service
export const emailPasswordService = {
  // Store users in memory (in production, use database)
  users: new Map<string, { password: string; firstName: string; lastName: string; verified: boolean }>(),

  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      if (this.users.has(email)) {
        return { success: false, message: 'Email already registered' };
      }

      // Hash password (in production, use bcrypt on backend)
      const hashedPassword = btoa(password); // Simple encoding for demo

      this.users.set(email, {
        password: hashedPassword,
        firstName,
        lastName,
        verified: false,
      });

      console.log(`✅ User registered: ${email}`);

      return { success: true, message: 'Registration successful!' };
    } catch (error) {
      return { success: false, message: 'Registration failed' };
    }
  },

  async login(email: string, password: string): Promise<{ success: boolean; user?: any; message: string }> {
    try {
      const user = this.users.get(email);

      if (!user) {
        return { success: false, message: 'Email not found' };
      }

      const hashedPassword = btoa(password);
      if (user.password !== hashedPassword) {
        return { success: false, message: 'Invalid password' };
      }

      console.log(`✅ User logged in: ${email}`);

      return {
        success: true,
        user: {
          email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        message: 'Login successful!',
      };
    } catch (error) {
      return { success: false, message: 'Login failed' };
    }
  },

  async verifyEmail(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const user = this.users.get(email);

      if (!user) {
        return { success: false, message: 'User not found' };
      }

      user.verified = true;
      console.log(`✅ Email verified: ${email}`);

      return { success: true, message: 'Email verified!' };
    } catch (error) {
      return { success: false, message: 'Verification failed' };
    }
  },
};
