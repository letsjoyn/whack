import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, CheckCircle2, Phone } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { emailOtpService, phoneOtpService, googleAuthService, emailPasswordService } from "@/services/AuthService";

type AuthMode = "login" | "login-phone" | "signup" | "phone" | "email-otp" | "phone-otp" | "login-phone-otp";

const Auth = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("login");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPhoneOtp, setLoginPhoneOtp] = useState("");

  // Signup form state
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // Phone auth state
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");

  // Email OTP state
  const [emailOtp, setEmailOtp] = useState("");
  const [emailForOtp, setEmailForOtp] = useState("");

  // Password strength
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(signupPassword);
  const passwordStrengthText = ["Weak", "Fair", "Good", "Strong", "Very Strong"][passwordStrength];
  const passwordStrengthColor = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500", "bg-emerald-500"][passwordStrength];

  // OTP timer effect
  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpTimer]);

  // Handle email login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      await login(loginEmail, loginPassword);
      toast.success("Login successful!");
      navigate("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle phone login
  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginPhone) {
      toast.error("Please enter a phone number");
      return;
    }

    setIsLoading(true);
    try {
      const otpResult = await phoneOtpService.sendOTP(loginPhone);
      if (otpResult.success) {
        setOtpTimer(600); // 10 minutes
        toast.success(otpResult.message);
        setMode("login-phone-otp");
      } else {
        toast.error(otpResult.message);
      }
    } catch (error) {
      toast.error("Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle email signup
  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupEmail || !signupPassword || !firstName || !lastName) {
      toast.error("Please fill in all fields");
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (passwordStrength < 2) {
      toast.error("Password is too weak");
      return;
    }

    setIsLoading(true);
    try {
      // Register user
      const registerResult = await emailPasswordService.register(
        signupEmail,
        signupPassword,
        firstName,
        lastName
      );

      if (!registerResult.success) {
        toast.error(registerResult.message);
        setIsLoading(false);
        return;
      }

      // Send OTP
      const otpResult = await emailOtpService.sendOTP(signupEmail);
      if (otpResult.success) {
        setEmailForOtp(signupEmail);
        setOtpTimer(900); // 15 minutes
        toast.success(otpResult.message);
        setMode("email-otp");
      } else {
        toast.error(otpResult.message);
      }
    } catch (error) {
      toast.error("Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle email OTP verification
  const handleEmailOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOtp || emailOtp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);
    try {
      // Verify OTP
      const verifyResult = await emailOtpService.verifyOTP(signupEmail, emailOtp);
      
      if (!verifyResult.success) {
        toast.error(verifyResult.message);
        setIsLoading(false);
        return;
      }

      // Mark email as verified
      await emailPasswordService.verifyEmail(signupEmail);

      // Login user
      await register(signupEmail, signupPassword, firstName, lastName);
      toast.success("Account created successfully!");
      navigate("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle phone signup
  const handlePhoneSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) {
      toast.error("Please enter a phone number");
      return;
    }

    setIsLoading(true);
    try {
      const otpResult = await phoneOtpService.sendOTP(phoneNumber);
      if (otpResult.success) {
        setOtpTimer(600); // 10 minutes
        toast.success(otpResult.message);
        setMode("phone-otp");
      } else {
        toast.error(otpResult.message);
      }
    } catch (error) {
      toast.error("Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle phone OTP verification
  const handlePhoneOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneOtp || phoneOtp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);
    try {
      // Verify OTP
      const verifyResult = await phoneOtpService.verifyOTP(phoneNumber, phoneOtp);
      
      if (!verifyResult.success) {
        toast.error(verifyResult.message);
        setIsLoading(false);
        return;
      }

      // Create account with phone
      const email = `phone_${phoneNumber.replace(/\D/g, "")}@bookonce.local`;
      await register(email, "PhoneAuth123!", "Phone", "User");
      toast.success("Account created successfully!");
      navigate("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle phone OTP login verification
  const handlePhoneLoginOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginPhoneOtp || loginPhoneOtp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);
    try {
      // Verify OTP
      const verifyResult = await phoneOtpService.verifyOTP(loginPhone, loginPhoneOtp);
      
      if (!verifyResult.success) {
        toast.error(verifyResult.message);
        setIsLoading(false);
        return;
      }

      // Login with phone
      const email = `phone_${loginPhone.replace(/\D/g, "")}@bookonce.local`;
      await login(email, "PhoneAuth123!");
      toast.success("Login successful!");
      navigate("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google login
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await login("user@gmail.com", "GoogleAuth123!");
      toast.success("Google login successful!");
      navigate("/");
    } catch (error) {
      toast.error("Google login failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = () => {
    setOtpTimer(300);
    toast.success("OTP resent!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
          animate={{ y: [0, 100, 0], x: [0, 50, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl"
          animate={{ y: [0, -100, 0], x: [0, -50, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-80 h-80 bg-primary/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Main content - Full width horizontal layout */}
      <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Features/Info */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="hidden lg:block space-y-8"
          >
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
                Your Journey Starts Here
              </h1>
              <p className="text-xl text-muted-foreground">
                Book your perfect travel experience with BookOnce. From flights to hotels, we've got everything you need.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4">
              {[
                { icon: "🗺️", title: "Door-to-Door Planning", desc: "Complete journey from home to destination" },
                { icon: "🤖", title: "AI-Powered", desc: "Smart recommendations tailored to you" },
                { icon: "🛡️", title: "Safe & Secure", desc: "Real-time safety updates and support" },
                { icon: "💰", title: "Best Prices", desc: "Compare and book at the lowest rates" },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="flex gap-4 items-start"
                >
                  <div className="text-3xl">{feature.icon}</div>
                  <div>
                    <h3 className="font-semibold text-foreground">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-8">
              {[
                { number: "50K+", label: "Destinations" },
                { number: "2M+", label: "Happy Travelers" },
                { number: "4.9★", label: "Rating" },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl font-bold text-primary">{stat.number}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right side - Auth Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full"
          >
            {/* Logo and branding */}
            <div className="text-center lg:text-left mb-8">
              <motion.div
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent mb-4 shadow-lg"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-2xl font-bold text-primary-foreground">BO</span>
              </motion.div>
              <motion.h2 
                className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                BookOnce
              </motion.h2>
              <motion.p 
                className="text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Your complete travel companion
              </motion.p>
            </div>

            {/* Card */}
            <div className="bg-background/70 backdrop-blur-2xl border border-primary/20 rounded-3xl shadow-2xl p-8 space-y-6 hover:border-primary/40 transition-colors">
          {/* Login Mode */}
          {mode === "login" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Welcome Back</h2>
                <p className="text-sm text-muted-foreground mt-2">Sign in to continue your journey</p>
              </div>

              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                  <Label htmlFor="login-email" className="text-foreground font-semibold">Email Address</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    disabled={isLoading}
                    className="mt-2 h-11 bg-secondary/50 border-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <Label htmlFor="login-password" className="text-foreground font-semibold">Password</Label>
                  <div className="relative mt-2">
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      disabled={isLoading}
                      className="h-11 bg-secondary/50 border-primary/20 focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full h-11 text-base font-semibold bg-gradient-accent hover:shadow-glow" disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Sign In
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-background/80 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 font-semibold"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="h-11 font-semibold"
                  onClick={() => setMode("login-phone")}
                  disabled={isLoading}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Phone
                </Button>
              </div>

              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="text-primary hover:underline font-semibold"
                >
                  Sign up
                </button>
              </p>
            </motion.div>
          )}

          {/* Login with Phone Mode */}
          {mode === "login-phone" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Sign In with Phone</h2>
                <p className="text-sm text-muted-foreground mt-2">Enter your phone number to continue</p>
              </div>

              <form onSubmit={handlePhoneLogin} className="space-y-4">
                <div>
                  <Label htmlFor="login-phone" className="text-foreground font-semibold">Phone Number</Label>
                  <Input
                    id="login-phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                    disabled={isLoading}
                    className="mt-2 h-11 bg-secondary/50 border-primary/20 focus:border-primary"
                  />
                </div>

                <Button type="submit" className="w-full h-11 text-base font-semibold bg-gradient-accent hover:shadow-glow" disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Send OTP
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11 font-semibold"
                  onClick={() => setMode("login")}
                  disabled={isLoading}
                >
                  Back to Email
                </Button>
              </form>
            </motion.div>
          )}

          {/* Login Phone OTP Verification */}
          {mode === "login-phone-otp" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
                <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Verify Phone</h2>
                <p className="text-sm text-muted-foreground">
                  We've sent a 6-digit code to <strong>{loginPhone}</strong>
                </p>
              </div>

              <form onSubmit={handlePhoneLoginOtpVerify} className="space-y-4">
                <div>
                  <Label htmlFor="login-phone-otp" className="text-foreground font-semibold">Verification Code</Label>
                  <Input
                    id="login-phone-otp"
                    type="text"
                    placeholder="000000"
                    value={loginPhoneOtp}
                    onChange={(e) => setLoginPhoneOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    disabled={isLoading}
                    maxLength={6}
                    className="mt-2 h-11 text-center text-2xl tracking-widest font-mono bg-secondary/50 border-primary/20 focus:border-primary"
                  />
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Code expires in {Math.floor(otpTimer / 60)}:{String(otpTimer % 60).padStart(2, "0")}
                  </p>
                </div>

                <Button type="submit" className="w-full h-11 text-base font-semibold bg-gradient-accent hover:shadow-glow" disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Verify & Sign In
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11 font-semibold"
                  onClick={handleResendOtp}
                  disabled={otpTimer > 0 || isLoading}
                >
                  {otpTimer > 0 ? `Resend in ${otpTimer}s` : "Resend Code"}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  <button
                    type="button"
                    onClick={() => setMode("login-phone")}
                    className="text-primary hover:underline font-semibold"
                  >
                    Change phone number
                  </button>
                </p>
              </form>
            </motion.div>
          )}

          {/* Signup Mode */}
          {mode === "signup" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-foreground">Create Account</h2>
                <p className="text-sm text-muted-foreground mt-1">Join BookOnce today</p>
              </div>

              <form onSubmit={handleEmailSignup} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first-name" className="text-foreground">First Name</Label>
                    <Input
                      id="first-name"
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={isLoading}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="last-name" className="text-foreground">Last Name</Label>
                    <Input
                      id="last-name"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={isLoading}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="signup-email" className="text-foreground">Email Address</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    disabled={isLoading}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="signup-password" className="text-foreground">Password</Label>
                  <div className="relative mt-2">
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {signupPassword && (
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className={`h-full ${passwordStrengthColor} transition-all`}
                            style={{ width: `${(passwordStrength / 4) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">{passwordStrengthText}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="confirm-password" className="text-foreground">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    className="mt-2"
                  />
                </div>

                <Button type="submit" className="w-full h-11 text-base" disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Continue with Email
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-background/80 text-muted-foreground">Or sign up with</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full h-11"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full h-11"
                onClick={() => setMode("phone")}
                disabled={isLoading}
              >
                <Phone className="w-4 h-4 mr-2" />
                Phone Number
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-primary hover:underline font-semibold"
                >
                  Sign in
                </button>
              </p>
            </motion.div>
          )}

          {/* Phone Signup Mode */}
          {mode === "phone" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-foreground">Sign Up with Phone</h2>
                <p className="text-sm text-muted-foreground mt-1">Enter your phone number</p>
              </div>

              <form onSubmit={handlePhoneSignup} className="space-y-4">
                <div>
                  <Label htmlFor="phone" className="text-foreground">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={isLoading}
                    className="mt-2"
                  />
                </div>

                <Button type="submit" className="w-full h-11 text-base" disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Send OTP
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11"
                  onClick={() => setMode("signup")}
                  disabled={isLoading}
                >
                  Back to Email
                </Button>
              </form>
            </motion.div>
          )}

          {/* Email OTP Verification */}
          {mode === "email-otp" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
                <h2 className="text-2xl font-bold text-foreground">Verify Email</h2>
                <p className="text-sm text-muted-foreground">
                  We've sent a 6-digit code to <strong>{emailForOtp}</strong>
                </p>
              </div>

              <form onSubmit={handleEmailOtpVerify} className="space-y-4">
                <div>
                  <Label htmlFor="email-otp" className="text-foreground">Verification Code</Label>
                  <Input
                    id="email-otp"
                    type="text"
                    placeholder="000000"
                    value={emailOtp}
                    onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    disabled={isLoading}
                    maxLength={6}
                    className="mt-2 text-center text-2xl tracking-widest font-mono"
                  />
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Code expires in {Math.floor(otpTimer / 60)}:{String(otpTimer % 60).padStart(2, "0")}
                  </p>
                </div>

                <Button type="submit" className="w-full h-11 text-base" disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Verify Email
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11"
                  onClick={handleResendOtp}
                  disabled={otpTimer > 0 || isLoading}
                >
                  {otpTimer > 0 ? `Resend in ${otpTimer}s` : "Resend Code"}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  <button
                    type="button"
                    onClick={() => setMode("signup")}
                    className="text-primary hover:underline font-semibold"
                  >
                    Change email
                  </button>
                </p>
              </form>
            </motion.div>
          )}

          {/* Phone OTP Verification */}
          {mode === "phone-otp" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
                <h2 className="text-2xl font-bold text-foreground">Verify Phone</h2>
                <p className="text-sm text-muted-foreground">
                  We've sent a 6-digit code to <strong>{phoneNumber}</strong>
                </p>
              </div>

              <form onSubmit={handlePhoneOtpVerify} className="space-y-4">
                <div>
                  <Label htmlFor="phone-otp" className="text-foreground">Verification Code</Label>
                  <Input
                    id="phone-otp"
                    type="text"
                    placeholder="000000"
                    value={phoneOtp}
                    onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    disabled={isLoading}
                    maxLength={6}
                    className="mt-2 text-center text-2xl tracking-widest font-mono"
                  />
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Code expires in {Math.floor(otpTimer / 60)}:{String(otpTimer % 60).padStart(2, "0")}
                  </p>
                </div>

                <Button type="submit" className="w-full h-11 text-base" disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Verify Phone
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11"
                  onClick={handleResendOtp}
                  disabled={otpTimer > 0 || isLoading}
                >
                  {otpTimer > 0 ? `Resend in ${otpTimer}s` : "Resend Code"}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  <button
                    type="button"
                    onClick={() => setMode("phone")}
                    className="text-primary hover:underline font-semibold"
                  >
                    Change phone number
                  </button>
                </p>
              </form>
            </motion.div>
          )}

            {/* Footer */}
            <motion.p 
              className="text-center text-xs text-muted-foreground mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              By continuing, you agree to our{" "}
              <button className="text-primary hover:underline font-semibold">Terms of Service</button>
              {" "}and{" "}
              <button className="text-primary hover:underline font-semibold">Privacy Policy</button>
            </motion.p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
