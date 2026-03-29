import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthStore } from "../store/AuthStore";
import { Lock, Eye, EyeOff, ShieldCheck, ShieldAlert, ArrowRight } from "lucide-react";
import toast from "../components/CustomToast";

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showpwd, setShowpwd] = useState(false);
  const { resetToken } = useParams();
  const navigate = useNavigate();
  const { resetPassword, isResetLoding } = AuthStore();

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, text: '', color: 'bg-base-300' };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) score += 1;
    if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) score += 1;

    switch (score) {
      case 0: return { score, text: 'Weak', color: 'bg-red-500', icon: <ShieldAlert className="size-3 text-red-500" /> };
      case 1: return { score, text: 'Fair', color: 'bg-amber-500', icon: <ShieldAlert className="size-3 text-amber-500" /> };
      case 2: return { score, text: 'Good', color: 'bg-emerald-400', icon: <ShieldCheck className="size-3 text-emerald-400" /> };
      case 3: 
      case 4: return { score, text: 'Strong', color: 'bg-emerald-500', icon: <ShieldCheck className="size-3 text-emerald-500" /> };
      default: return { score: 0, text: '', color: 'bg-base-300' };
    }
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }
    if (password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }
    
    const success = await resetPassword(resetToken, password);
    if (success) {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100 p-4 animate-fade-in-up">
      <div className="max-w-md w-full relative z-10">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-[60px]" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-secondary/10 rounded-full blur-[60px]" />
        
        <div className="bg-base-100 p-8 sm:p-10 rounded-3xl shadow-xl border border-base-200 relative">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Reset Password</h1>
            <p className="text-base-content/60 text-sm">Please enter your new password below.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="form-control">
              <label className="label pb-2 pt-0">
                <span className="label-text font-semibold text-base-content text-[11px] uppercase tracking-wider">New Password</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="size-5 text-base-content/40 group-focus-within:text-primary transition-colors duration-300" />
                </div>
                <input
                  type={showpwd ? "text" : "password"}
                  className="input w-full pl-11 pr-12 h-12 bg-base-200/50 border border-base-300 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 focus:bg-base-100 transition-all duration-300"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-base-content/40 hover:text-primary transition-colors"
                  onClick={() => setShowpwd(!showpwd)}
                >
                  {showpwd ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
              
              <div className={`mt-3 transition-all duration-300 overflow-hidden ${password.length > 0 ? 'max-h-8 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="flex gap-1.5 mb-1.5 px-0.5">
                  {[1, 2, 3, 4].map((level) => (
                    <div 
                      key={level} 
                      className={`h-1 flex-1 rounded-full transition-all duration-500 ease-out
                        ${level <= strength.score ? strength.color : 'bg-base-300'}`} 
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="form-control">
              <label className="label pb-2 pt-0">
                <span className="label-text font-semibold text-base-content text-[11px] uppercase tracking-wider">Confirm Password</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="size-5 text-base-content/40 group-focus-within:text-primary transition-colors duration-300" />
                </div>
                <input
                  type={showpwd ? "text" : "password"}
                  className="input w-full pl-11 pr-4 h-12 bg-base-200/50 border border-base-300 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 focus:bg-base-100 transition-all duration-300"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full h-12 rounded-xl text-[15px] font-bold shadow-lg shadow-primary/30 mt-4"
              disabled={isResetLoding}
            >
              {isResetLoding ? (
                <span className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Reset Password</span>
                  <ArrowRight className="size-4 ml-2" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
