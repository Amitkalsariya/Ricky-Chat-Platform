import React, { useState, useEffect, useRef } from 'react'
import { AuthStore } from '../store/AuthStore'
import AuthShowcase from '../components/AuthShowcase'
import { Eye, EyeOff, Lock, Mail, MessageSquare, User, ArrowRight, ShieldCheck, ShieldAlert, Sparkles, CheckCircle2, KeyRound, ChevronLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from '../components/CustomToast'
import { auth, googleProvider } from '../lib/firebase'
import { signInWithPopup } from 'firebase/auth'

const SignUpPage = () => {
  const [showpwd, setShowpwd] = useState(false)
  const [userdata, setUserdata] = useState({ fullname: '', email: '', password: '' })
  const [mounted, setMounted] = useState(false)
  const [focusedField, setFocusedField] = useState(null)
  
  // OTP States
  const [showOTP, setShowOTP] = useState(false)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const otpInputRefs = useRef([])

  const { signup, isSigningUp, googleAuth, isGoogleAuthLoding, sendSignupOTP, isSendingOTP } = AuthStore()

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50)
    return () => clearTimeout(timer)
  }, [])

  // Password strength calculator
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, text: '', color: 'bg-base-300', textColor: 'text-base-content/30' };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) score += 1;
    if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) score += 1;

    const levels = [
      { score: 0, text: 'Weak', color: 'bg-red-500', textColor: 'text-red-500', icon: <ShieldAlert className="size-3 text-red-500" /> },
      { score: 1, text: 'Fair', color: 'bg-amber-500', textColor: 'text-amber-500', icon: <ShieldAlert className="size-3 text-amber-500" /> },
      { score: 2, text: 'Good', color: 'bg-emerald-400', textColor: 'text-emerald-400', icon: <ShieldCheck className="size-3 text-emerald-400" /> },
      { score: 3, text: 'Strong', color: 'bg-emerald-500', textColor: 'text-emerald-500', icon: <ShieldCheck className="size-3 text-emerald-500" /> },
    ];
    const level = levels[Math.min(score, 3)];
    return { ...level, score };
  };

  const strength = getPasswordStrength(userdata.password);

  const validateForm = () => {
    if (!userdata.fullname.trim()) return toast.error("Full name is required");
    if (!userdata.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(userdata.email)) return toast.error("Invalid email format");
    if (!userdata.password) return toast.error("Password is required");
    if (userdata.password.length < 6) return toast.error("Password must be at least 6 characters");
    return true;
  }

  // Handle Initial Application -> Sends OTP
  const handleInitiateSignup = async (e) => {
    e.preventDefault()
    if (validateForm() !== true) return;
    
    // Check if OTP was successfully sent
    const success = await sendSignupOTP({ email: userdata.email, fullname: userdata.fullname });
    if (success) {
      setShowOTP(true);
    }
  }

  // Handle Final Application -> Submits OTP along with user data
  const handleVerifyAndSignup = async (e) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      return toast.error("Please enter all 6 digits of the OTP");
    }

    await signup({ ...userdata, otp: otpValue });
  }

  // Google Provider Authentication
  const handleGoogleAuth = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      googleAuth({ email: user.email, fullname: user.displayName, profilePic: user.photoURL }, true);
    } catch (error) {
      if (error.code !== 'auth/popup-closed-by-user') {
        toast.error("Google authentication failed");
      }
    }
  };

  // OTP Input Logic
  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    
    // Take the last char in case they paste multiple digits
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-advance
    if (value && index < 5) {
      otpInputRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1].focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').slice(0, 6).split('');
    if (pastedData.some(isNaN)) return;
    
    const newOtp = [...otp];
    pastedData.forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);
    
    // Move focus to the end
    const lastIndex = Math.min(pastedData.length, 5);
    otpInputRefs.current[lastIndex].focus();
  };

  const checks = [
    { label: 'At least 6 characters', met: userdata.password.length >= 6 },
    { label: 'Contains uppercase & number', met: /[A-Z]/.test(userdata.password) && /[0-9]/.test(userdata.password) },
    { label: 'Contains special character', met: /[^A-Za-z0-9]/.test(userdata.password) },
  ];

  return (
    <div className='min-h-screen grid lg:grid-cols-[1.1fr_1fr] bg-base-100'>
      
      {/* Left Side - Form Container */}
      <div className='flex flex-col justify-center items-center px-5 py-8 sm:p-12 relative min-h-screen lg:min-h-0 bg-base-100 overflow-hidden'>
        {/* Animated background blobs */}
        <div className={`absolute top-0 left-0 w-80 h-80 bg-secondary/5 rounded-full blur-[100px] pointer-events-none transition-all duration-[2000ms] ${mounted ? 'opacity-100' : 'opacity-0 -translate-x-20'}`} />
        <div className={`absolute bottom-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none transition-all duration-[2000ms] delay-300 ${mounted ? 'opacity-100' : 'opacity-0 translate-x-20'}`} />
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/3 rounded-full blur-[120px] pointer-events-none transition-all duration-[3000ms] ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} />
        
        {/* Dot grid pattern */}
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        <div className={`w-full max-w-[420px] relative z-10 transition-all duration-700 ease-out ${mounted ? 'opacity-100' : 'opacity-0'}`}>
          
          {/* Form View Slider */}
          <div className="relative w-full overflow-hidden">
             <div className={`flex w-full transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${showOTP ? '-translate-x-full' : 'translate-x-0'}`}>
                
                {/* ────────────────────────────────────────────── */}
                {/* 1. SIGNUP DETAILS PHASE                        */}
                {/* ────────────────────────────────────────────── */}
                <div className="w-full shrink-0 space-y-6">
                  {/* Header */}
                  <div className="text-center group mb-8">
                    <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-[0_8px_30px_rgb(0,0,0,0.12)] shadow-primary/30 mb-5 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500">
                      <MessageSquare className="w-8 h-8 text-white relative z-10" />
                      <div className="absolute inset-0 bg-white/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <Sparkles className="absolute -top-2 -right-2 size-4 text-amber-400 opacity-0 group-hover:opacity-100 transition-all group-hover:scale-110 duration-500" />
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-base-content mb-2">
                      Join <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Ricky</span> Today
                    </h1>
                    <p className="text-base-content/50 text-sm font-medium">
                      Create a free account and start chatting in seconds
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleInitiateSignup} className='space-y-4 w-full'>
                    
                    {/* Full Name */}
                    <div className="form-control">
                      <label className="label pb-1.5 pt-0">
                        <span className="label-text font-semibold text-base-content/70 text-[11px] uppercase tracking-wider">Full Name</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <User className={`size-5 transition-all duration-300 ${focusedField === 'name' ? 'text-primary scale-110' : 'text-base-content/30'}`} />
                        </div>
                        <input type="text"
                          className="input w-full pl-11 pr-4 h-12 bg-base-200/50 border border-base-300/80 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/30 focus:bg-base-100 focus:outline-none transition-all duration-300 placeholder:text-base-content/25 shadow-sm"
                          placeholder="John Doe" value={userdata.fullname}
                          onChange={(e) => setUserdata({ ...userdata, fullname: e.target.value })}
                          onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)}
                          required />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="form-control">
                      <label className="label pb-1.5 pt-0">
                        <span className="label-text font-semibold text-base-content/70 text-[11px] uppercase tracking-wider">Email Address</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Mail className={`size-5 transition-all duration-300 ${focusedField === 'email' ? 'text-primary scale-110' : 'text-base-content/30'}`} />
                        </div>
                        <input type="email"
                          className="input w-full pl-11 pr-4 h-12 bg-base-200/50 border border-base-300/80 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/30 focus:bg-base-100 focus:outline-none transition-all duration-300 placeholder:text-base-content/25 shadow-sm"
                          placeholder="name@example.com" value={userdata.email}
                          onChange={(e) => setUserdata({ ...userdata, email: e.target.value })}
                          onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
                          required />
                      </div>
                    </div>

                    <div className="form-control">
                      <label className="label pb-1.5 pt-0">
                        <span className="label-text font-semibold text-base-content/70 text-[11px] uppercase tracking-wider">Choose Password</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Lock className={`size-5 transition-all duration-300 ${focusedField === 'password' ? 'text-primary scale-110' : 'text-base-content/30'}`} />
                        </div>
                        <input type={showpwd ? "text" : "password"}
                          className="input w-full pl-11 pr-12 h-12 bg-base-200/50 border border-base-300/80 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/30 focus:bg-base-100 focus:outline-none transition-all duration-300 placeholder:text-base-content/25 shadow-sm"
                          placeholder="••••••••" value={userdata.password}
                          onChange={(e) => setUserdata({ ...userdata, password: e.target.value })}
                          onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)}
                          required />
                        <button type="button"
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-base-content/30 hover:text-primary transition-all duration-300"
                          onClick={() => setShowpwd(!showpwd)}>
                          {showpwd ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                        </button>
                      </div>

                      {/* Password Strength Indicator */}
                      <div className={`mt-3 transition-all duration-500 overflow-hidden ${userdata.password.length > 0 ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="flex gap-1.5 mb-2.5 px-0.5">
                          {[1, 2, 3, 4].map((level) => (
                            <div key={level} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ease-out ${level <= strength.score ? strength.color : 'bg-base-300/60'}`} />
                          ))}
                        </div>
                        <div className="flex items-center justify-between px-0.5 mb-2">
                          <span className="text-[10px] text-base-content/40 font-medium">Password strength</span>
                          {strength.text && (
                            <div className="flex items-center gap-1">
                              {strength.icon}
                              <span className={`text-[10px] font-bold ${strength.textColor}`}>{strength.text}</span>
                            </div>
                          )}
                        </div>
                        <div className="space-y-1 px-0.5">
                          {checks.map((check, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <CheckCircle2 className={`size-3 transition-all duration-300 ${check.met ? 'text-emerald-500 scale-100' : 'text-base-content/20 scale-90'}`} />
                              <span className={`text-[10px] transition-colors duration-300 ${check.met ? 'text-emerald-500 font-medium' : 'text-base-content/35'}`}>
                                {check.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Submit Initial Form Button */}
                    <div className="pt-1">
                      <button type="submit"
                        className="btn btn-primary w-full h-12 rounded-xl text-[15px] font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-300 gap-2 border-0 overflow-hidden relative group"
                        disabled={isSendingOTP}>
                        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                        {isSendingOTP ? (
                          <>
                            <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Sending Verification Code...</span>
                          </>
                        ) : (
                          <>
                            <span>Continue to Verification</span>
                            <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform duration-300" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>

                  {/* Social Auth */}
                  <div className="space-y-4">
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
                        <span className="size-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
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
                  <div className="text-center pt-1">
                    <p className="text-base-content/45 text-sm font-medium mb-2">Already have an account?</p>
                    <Link to="/login" className="inline-flex items-center gap-2 text-primary font-bold hover:text-primary-focus active:scale-95 transition-all px-5 py-2.5 bg-primary/8 hover:bg-primary/15 rounded-xl group">
                      Sign in to your account
                      <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>

                {/* ────────────────────────────────────────────── */}
                {/* 2. OTP VERIFICATION PHASE                      */}
                {/* ────────────────────────────────────────────── */}
                <div className="w-full shrink-0 space-y-8 px-2 flex flex-col justify-center min-h-[500px]">
                  
                  {/* Top Go Back Button */}
                  <button onClick={() => setShowOTP(false)} className="self-start btn btn-ghost btn-sm px-2 hover:bg-base-200/50 rounded-lg group text-base-content/60 hover:text-base-content transition-all mb-4 -ml-2">
                    <ChevronLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Form
                  </button>

                  <div className="text-center group">
                    <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-base-200/50 border border-base-300 shadow-xl mb-6 group-hover:scale-110 group-hover:bg-primary/5 transition-all duration-500 group-hover:border-primary/30">
                      <KeyRound className="w-10 h-10 text-primary relative z-10" />
                      <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-base-content mb-3">
                      Verify Your Email
                    </h1>
                    <p className="text-base-content/60 text-[15px] font-medium leading-relaxed max-w-[90%] mx-auto">
                      We've sent a 6-digit verification code to
                      <br/>
                      <strong className="text-base-content font-bold mt-1 inline-block bg-base-200 px-3 py-1 rounded-lg border border-base-300">{userdata.email}</strong>
                    </p>
                  </div>

                  <form onSubmit={handleVerifyAndSignup} className="space-y-8 w-full mt-4">
                    <div className="flex justify-between gap-2 sm:gap-3 max-w-[340px] mx-auto" onPaste={handleOtpPaste}>
                      {otp.map((digit, i) => (
                        <input
                          key={i}
                          ref={(el) => otpInputRefs.current[i] = el}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(i, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(i, e)}
                          className="w-11 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold bg-base-200 border-2 border-base-300/80 rounded-xl focus:border-primary focus:bg-base-100 focus:shadow-[0_0_15px_rgba(var(--p),0.2)] transition-all outline-none"
                        />
                      ))}
                    </div>

                    <div className="max-w-[340px] mx-auto space-y-4">
                      <button type="submit"
                        disabled={isSigningUp || otp.join('').length !== 6}
                        className="btn btn-primary w-full h-12 rounded-xl text-[15px] font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-300 gap-2 overflow-hidden relative group">
                        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                        {isSigningUp ? (
                          <>
                            <span className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Confirming & Creating Account...</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="size-5 group-hover:scale-110 transition-transform" />
                            <span>Verify & Create Account</span>
                          </>
                        )}
                      </button>

                      <div className="text-center mt-6">
                        <p className="text-base-content/45 text-[13px] font-medium">Didn't receive the code?</p>
                        <button 
                          type="button" 
                          onClick={handleInitiateSignup}
                          disabled={isSendingOTP}
                          className="mt-1 text-sm font-bold text-primary hover:text-primary-focus active:scale-95 transition-all hover:underline decoration-primary/30">
                          {isSendingOTP ? "Sending..." : "Resend code"}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
                
             </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Showcase */}
      <AuthShowcase
        title="Secure from the Start 🔒"
        subtitle="We prioritize your security by confirming your identity with OTP, making your chatting experience 100% safe."
      />
    </div>
  )
}

export default SignUpPage
