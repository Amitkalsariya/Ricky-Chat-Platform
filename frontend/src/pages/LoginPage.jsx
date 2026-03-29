import React, { useState, useEffect } from "react";
import { AuthStore } from "../store/AuthStore";
import AuthShowcase from "../components/AuthShowcase";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, MessageSquare, ArrowRight, Sparkles } from "lucide-react";
import { auth, googleProvider } from "../lib/firebase";
import { signInWithPopup } from "firebase/auth";
import toast from "../components/CustomToast";

const LoginPage = () => {
  const [showpwd, setShowpwd] = useState(false);
  const [userdata, setUserdata] = useState({ email: "", password: "" });
  const [forgotEmail, setForgotEmail] = useState("");
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const { login, isLoggingIn, googleAuth, isGoogleAuthLoding, forgotPassword, isForgotLoding } = AuthStore();

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    login(userdata);
  };

  const handleGoogleAuth = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      googleAuth({ email: user.email, fullname: user.displayName, profilePic: user.photoURL }, false);
    } catch (error) {
      if (error.code !== 'auth/popup-closed-by-user') {
        toast.error("Google authentication failed");
      }
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) return toast.error("Please enter your email");
    const success = await forgotPassword(forgotEmail);
    if (success) {
      setIsForgotModalOpen(false);
      setForgotEmail("");
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-[1fr_1.1fr] bg-base-100">
      {/* Left Side - Auth Showcase */}
      <AuthShowcase
        title="Welcome Back!"
        subtitle="Reconnect with friends, pick up where you left off, and never miss a moment."
      />

      {/* Right Side - Login Form */}
      <div className="flex flex-col justify-center items-center px-5 py-8 sm:p-12 relative min-h-screen lg:min-h-0 bg-base-100 overflow-hidden">
        {/* Animated background blobs */}
        <div className={`absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none transition-all duration-[2000ms] ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'}`} />
        <div className={`absolute bottom-0 left-0 w-80 h-80 bg-secondary/5 rounded-full blur-[100px] pointer-events-none transition-all duration-[2000ms] delay-300 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20'}`} />
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/3 rounded-full blur-[120px] pointer-events-none transition-all duration-[3000ms] ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} />

        {/* Dot grid pattern */}
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        <div className={`w-full max-w-[420px] space-y-7 relative z-10 transition-all duration-700 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          
          {/* Logo & Header */}
          <div className={`text-center group transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-[0_8px_30px_rgb(0,0,0,0.12)] shadow-primary/30 mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
              <MessageSquare className="w-8 h-8 text-white relative z-10" />
              <div className="absolute inset-0 bg-white/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              {/* Sparkle effects */}
              <Sparkles className="absolute -top-2 -right-2 size-4 text-amber-400 opacity-0 group-hover:opacity-100 transition-all group-hover:scale-110 duration-500" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-base-content mb-2">
              Sign in to <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Ricky</span>
            </h1>
            <p className="text-base-content/50 text-sm font-medium">
              Enter your credentials to access your account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div className={`form-control transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              <label className="label pb-1.5 pt-0">
                <span className="label-text font-semibold text-base-content/70 text-xs uppercase tracking-wider">Email Address</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className={`size-5 transition-all duration-300 ${focusedField === 'email' ? 'text-primary scale-110' : 'text-base-content/30'}`} />
                </div>
                <input
                  type="email"
                  className="input w-full pl-11 pr-4 h-12 bg-base-200/50 border border-base-300/80 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/30 focus:bg-base-100 focus:outline-none transition-all duration-300 placeholder:text-base-content/25 shadow-sm"
                  placeholder="name@example.com"
                  value={userdata.email}
                  onChange={(e) => setUserdata({ ...userdata, email: e.target.value })}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className={`form-control transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              <label className="label pb-1.5 pt-0">
                <span className="label-text font-semibold text-base-content/70 text-xs uppercase tracking-wider">Password</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className={`size-5 transition-all duration-300 ${focusedField === 'password' ? 'text-primary scale-110' : 'text-base-content/30'}`} />
                </div>
                <input
                  type={showpwd ? "text" : "password"}
                  className="input w-full pl-11 pr-12 h-12 bg-base-200/50 border border-base-300/80 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/30 focus:bg-base-100 focus:outline-none transition-all duration-300 placeholder:text-base-content/25 shadow-sm"
                  placeholder="••••••••"
                  value={userdata.password}
                  onChange={(e) => setUserdata({ ...userdata, password: e.target.value })}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  required
                />
                <button type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-base-content/30 hover:text-primary transition-all duration-300"
                  onClick={() => setShowpwd(!showpwd)}>
                  {showpwd ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>

              <div className="flex justify-end mt-2">
                <button type="button" onClick={() => setIsForgotModalOpen(true)}
                  className="text-[11px] font-semibold text-base-content/50 hover:text-primary transition-all hover:underline decoration-primary/30">
                  Forgot your password?
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className={`transition-all duration-700 delay-[400ms] ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              <button
                type="submit"
                className="btn btn-primary w-full h-12 rounded-xl text-[15px] font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-300 gap-2 border-0 overflow-hidden relative group"
                disabled={isLoggingIn}
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                {isLoggingIn ? (
                  <>
                    <span className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Social Auth Divider */}
          <div className={`space-y-4 transition-all duration-700 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-base-300/60" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-base-100 px-3 text-base-content/40 font-medium tracking-wider">Or continue with</span>
              </div>
            </div>

            <button type="button" onClick={handleGoogleAuth} disabled={isGoogleAuthLoding}
              className="flex items-center justify-center border border-base-300/60 bg-transparent hover:bg-base-200/50 hover:border-base-300 text-base-content font-medium h-12 rounded-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 w-full gap-3 shadow-sm">
              {isGoogleAuthLoding ? (
                <span className="size-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="size-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Continue with Google
                </>
              )}
            </button>
          </div>

          {/* Footer */}
          <div className={`text-center pt-2 transition-all duration-700 delay-[600ms] ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <p className="text-base-content/45 text-sm font-medium mb-2">Don't have an account?</p>
            <Link to="/signup" className="inline-flex items-center gap-2 text-primary font-bold hover:text-primary-focus active:scale-95 transition-all px-5 py-2.5 bg-primary/8 hover:bg-primary/15 rounded-xl group">
              Create an account
              <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setIsForgotModalOpen(false); }}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in-up" />
          
          {/* Modal */}
          <div className="relative bg-base-100 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl border border-base-200/50 animate-fade-in-up">
            {/* Decorative gradient */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent rounded-t-3xl" />
            
            <h2 className="text-2xl font-bold mb-2">Reset Password 🔐</h2>
            <p className="text-base-content/50 text-sm mb-6">
              Enter your email and we'll send you a secure link to reset your password.
            </p>
            
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="form-control">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="size-5 text-base-content/30 group-focus-within:text-primary transition-colors" />
                  </div>
                  <input type="email"
                    className="input w-full pl-11 pr-4 h-12 bg-base-200/50 border border-base-300 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 focus:bg-base-100 transition-all"
                    placeholder="name@example.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    autoFocus
                    required
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsForgotModalOpen(false)}
                  className="btn btn-ghost flex-1 rounded-xl h-11" disabled={isForgotLoding}>
                  Cancel
                </button>
                <button type="submit"
                  className="btn btn-primary flex-1 rounded-xl h-11 shadow-lg shadow-primary/20 gap-2"
                  disabled={isForgotLoding}>
                  {isForgotLoding ? (
                    <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : "Send Reset Link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
