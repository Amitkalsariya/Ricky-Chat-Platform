import React, { useState } from 'react'
import { AuthStore } from '../store/AuthStore'
import AuthImagePattern from '../components/AuthImagePattern'
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare, User } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const SignUpPage = () => {

  const [showpwd, setShowpwd] = useState(false)
  const [userdata, setUserdata] = useState({
    fullname: '',
    email: '',
    password: ''
  })
  const { signup, isSigningUp } = AuthStore()

  const validateForm = () => {
    if (!userdata.fullname.trim()) return toast.error("Full name is required");
    if (!userdata.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(userdata.email)) return toast.error("Invalid email format");
    if (!userdata.password) return toast.error("Password is required");
    if (userdata.password.length < 6) return toast.error("Password must be at least 6 characters");
    return true;
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const approve = validateForm()
    if (approve === true) signup(userdata)
  }

  return (
    <div className='min-h-screen grid lg:grid-cols-2'>
      {/* Left Hand Side - Form */}
      <div className='flex flex-col justify-center items-center p-6 sm:p-12'>
        {/* Logo */}
        <div className='w-full max-w-md space-y-8'>
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div
                className="size-12 rounded-xl bg-primary/10 flex items-center justify-center 
                group-hover:bg-primary/20 transition-colors"
              >
                <MessageSquare className="size-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mt-2">Create Account</h1>
              <p className="text-base-content/60">Get started with your free account</p>
            </div>
          </div>

          {/* Form UI Design */}
          <form onSubmit={handleSubmit} className='space-y-6 w-full'>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Full Name</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="size-5 text-base-content/40" />
                </div>
                <input
                  type="text"
                  className="input input-bordered w-full pl-10"
                  placeholder="Reacher"
                  value={userdata.fullname}
                  onChange={(e) => setUserdata({ ...userdata, fullname: e.target.value })}
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="size-5 text-base-content/40" />
                </div>
                <input
                  type="email"
                  className="input input-bordered w-full pl-10"
                  placeholder="you@example.com"
                  value={userdata.email}
                  onChange={(e) => setUserdata({ ...userdata, email: e.target.value })}
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="size-5 text-base-content/40" />
                </div>
                <input
                  type={showpwd ? "text" : "password"}
                  className="input input-bordered w-full pl-10"
                  placeholder="••••••••"
                  value={userdata.password}
                  onChange={(e) => setUserdata({ ...userdata, password: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowpwd(!showpwd)}
                >
                  {showpwd ? (
                    <EyeOff className="size-5 text-base-content/40" />
                  ) : (
                    <Eye className="size-5 text-base-content/40" />
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={isSigningUp}>
              {isSigningUp ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Loading...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="text-center">
            <p className="text-base-content/60 mt-4">
              Already have an account?{" "}
              <Link to="/login" className="link link-primary">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Hand Side - Auth Pattern */}
      <AuthImagePattern
  title="Step Into a New Experience"
  subtitle="Discover, connect, and build memories with those who matter most."
/>

    </div>
  )
}

export default SignUpPage
