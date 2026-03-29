import React, { useState } from 'react'
import { AuthStore } from '../store/AuthStore'
import { Camera, Mail, User, Calendar, Shield, Edit3, MessageSquare, Heart, Sparkles, AlertCircle, Save, X } from 'lucide-react'
import toast from '../components/CustomToast'

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = AuthStore()
  const [selectedImg, setSelectedImg] = useState(null)
  
  // Edit mode states
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    fullname: authUser?.fullname || '',
    about: authUser?.about || ''
  })

  // Start editing handler
  const handleEditInit = () => {
    setIsEditing(true)
    setEditForm({
      fullname: authUser?.fullname || '',
      about: authUser?.about || ''
    })
  }

  // Cancel editing handler
  const handleCancel = () => {
    setIsEditing(false)
    setEditForm({
      fullname: authUser?.fullname || '',
      about: authUser?.about || ''
    })
  }

  // Save changes handler
  const handleSave = async () => {
    if (!editForm.fullname.trim()) {
      return toast.error("Full name cannot be empty")
    }
    
    // Check if changes were actually made before calling API
    if (editForm.fullname === authUser?.fullname && editForm.about === authUser?.about) {
      setIsEditing(false)
      return; 
    }

    await updateProfile({
      fullname: editForm.fullname.trim(),
      about: editForm.about.trim()
    })
    
    setIsEditing(false)
  }

  // Handling Image upload (kept independent from the text edit context)
  const handleImageUpdate = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = async () => {
      const base64Image = reader.result
      setSelectedImg(base64Image)
      await updateProfile({ profilePic: base64Image })
    }
  }

  return (
    <div className="min-h-screen pt-16 sm:pt-20 pb-8 bg-base-200/30">
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-8 animate-fade-in-up">
        {/* Profile Header Card */}
        <div className="relative bg-base-100 rounded-3xl overflow-hidden shadow-xl shadow-base-content/5 border border-base-200">
          
          {/* Cover gradient with pattern & Floating decorative elements */}
          <div className="h-36 sm:h-44 bg-gradient-to-br from-primary via-primary/80 to-secondary relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)]" />
            <div className="absolute inset-0 opacity-[0.05]"
              style={{
                backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }} />
            
            <div className="absolute top-6 right-8 w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center animate-float shadow-lg shadow-black/5">
              <MessageSquare className="size-5 text-white/90" />
            </div>
            <div className="absolute bottom-10 left-8 w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center animate-float animation-delay-2000 shadow-lg shadow-black/5">
              <Heart className="size-4 text-white/90" />
            </div>
            {/* Fade to bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-base-100 to-transparent" />
          </div>

          {/* Action buttons (Edit Profile top-right float) */}
          {!isEditing && (
             <button 
                onClick={handleEditInit}
                className="absolute top-4 right-4 z-20 btn btn-sm bg-base-100/30 backdrop-blur-md border border-white/20 text-white hover:bg-white hover:text-primary hover:scale-105 transition-all outline-none rounded-xl gap-1.5 shadow-lg shadow-black/10"
             >
                <Edit3 className="size-3.5" />
                <span className="hidden sm:inline font-semibold tracking-wide">Edit Profile</span>
             </button>
          )}

          {/* Avatar & Top Info */}
          <div className="flex flex-col items-center -mt-16 sm:-mt-22 relative z-10 px-6 pb-8">
            <div className="relative group">
              {/* Glow ring */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-primary via-secondary to-accent rounded-full blur-md opacity-50 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500" />
              <div className="relative w-28 h-28 sm:w-34 sm:h-34 rounded-full ring-4 ring-base-100 shadow-2xl overflow-hidden bg-base-200">
                <img
                  src={selectedImg || authUser?.profilePic || '/avatar.png'}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <label
                htmlFor="avatar-upload"
                className={`
                  absolute bottom-1 right-1 w-10 h-10 sm:w-11 sm:h-11 rounded-full
                  bg-gradient-to-br from-primary to-secondary
                  flex items-center justify-center cursor-pointer
                  shadow-xl shadow-primary/30 border-2 border-base-100
                  hover:scale-110 active:scale-95 transition-all duration-300
                  ${isUpdatingProfile ? 'animate-pulse pointer-events-none' : ''}
                `}
                title="Change Avatar"
              >
                <Camera className="size-4 sm:size-5 text-white" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpdate}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>

            {/* Profile Content Toggle: View vs Edit */}
            {isEditing ? (
              <div className="w-full max-w-sm mt-6 space-y-4 animate-fade-in-up">
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text font-bold text-xs uppercase tracking-wider text-base-content/60">Display Name</span>
                  </label>
                  <input 
                    type="text" 
                    value={editForm.fullname}
                    onChange={(e) => setEditForm({...editForm, fullname: e.target.value})}
                    placeholder="Enter your full name"
                    className="input input-bordered border-base-300 bg-base-200/50 hover:bg-base-200 focus:bg-base-100 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all rounded-xl"
                  />
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-2xl sm:text-3xl font-extrabold mt-5 text-base-content tracking-tight">{authUser?.fullname}</h2>
                <p className="text-base-content/50 mt-1 text-sm">{authUser?.email}</p>

                {/* Status badge */}
                <div className="mt-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/15">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-semibold text-emerald-500 tracking-wide">Online</span>
                </div>
              </>
            )}

            {isUpdatingProfile && (
              <div className="mt-5 flex items-center gap-2 text-sm text-primary bg-primary/5 px-4 py-2 rounded-xl animate-pulse">
                <span className="inline-block w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                Updating profile...
              </div>
            )}
          </div>
        </div>

        {/* Global Save/Cancel action bar for Edit Mode */}
        {isEditing && (
            <div className="mt-5 bg-primary/5 rounded-2xl p-4 border border-primary/20 flex items-center justify-between shadow-lg shadow-primary/5 animate-fade-in-up">
              <div className="flex items-center gap-2">
                <AlertCircle className="size-4 text-primary" />
                <span className="text-sm font-medium text-primary">You are currently editing your profile</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleCancel} className="btn btn-sm btn-ghost hover:bg-base-300/50 rounded-lg text-base-content/70">
                  <X className="size-4" /> Cancel
                </button>
                <button onClick={handleSave} className="btn btn-sm btn-primary rounded-lg shadow-md shadow-primary/20 hover:scale-105 transition-transform">
                  <Save className="size-4" /> Save
                </button>
              </div>
            </div>
        )}

        {/* About Section */}
        <div className={`mt-5 bg-base-100 rounded-2xl p-5 sm:p-6 shadow-lg shadow-base-content/3 border border-base-200 transition-all duration-300 ${isEditing ? 'ring-2 ring-primary/20' : ''}`}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shadow-inner">
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <h3 className="text-base font-bold text-base-content">About</h3>
          </div>
          
          {isEditing ? (
             <div className="form-control">
                <textarea 
                  value={editForm.about}
                  onChange={(e) => setEditForm({...editForm, about: e.target.value})}
                  className="textarea textarea-bordered border-base-300 bg-base-200/50 hover:bg-base-200 focus:bg-base-100 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all rounded-xl min-h-[100px] resize-none leading-relaxed"
                  placeholder="Tell us a little about yourself..."
                />
             </div>
          ) : (
            <p className="text-base-content/70 text-[15px] leading-relaxed bg-base-200/40 rounded-xl p-4 border border-base-200/50">
              {authUser?.about || "Hey there! I am using Ricky Chat"}
            </p>
          )}
        </div>

        {/* Profile Information Cards */}
        <div className="mt-5 space-y-4">
          {/* Account Overview */}
          <div className="bg-base-100 rounded-2xl p-5 sm:p-6 shadow-lg shadow-base-content/3 border border-base-200">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center shadow-inner">
                <Shield className="w-4 h-4 text-secondary" />
              </div>
              <h3 className="text-base font-bold text-base-content">Account Overview</h3>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Member Since Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-base-200/50 to-base-200 border border-base-300/50 hover:border-base-300 transition-colors group">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-base-100 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <Calendar className="w-5 h-5 text-base-content/50 group-hover:text-primary transition-colors" />
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-base-content/40 uppercase tracking-wider mb-0.5">Member Since</p>
                  <p className="text-sm font-semibold text-base-content">
                    {authUser?.createdAt ? new Date(authUser.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    }) : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Verified Status Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-base-200/50 to-base-200 border border-base-300/50 hover:border-emerald-500/20 transition-colors group">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <Shield className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest">Verified</span>
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-base-content/40 uppercase tracking-wider mb-0.5">Account Status</p>
                  <p className="text-sm font-semibold text-base-content">Active Account</p>
                </div>
              </div>
              
              {/* Email Address Box */}
              <div className="sm:col-span-2 p-4 rounded-2xl bg-gradient-to-br from-base-200/50 to-base-200 border border-base-300/50 hover:border-base-300 transition-colors group flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-base-100 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform shrink-0">
                    <Mail className="w-5 h-5 text-base-content/50 group-hover:text-secondary transition-colors" />
                 </div>
                 <div className="min-w-0">
                    <p className="text-[11px] font-bold text-base-content/40 uppercase tracking-wider mb-0.5">Registered Email</p>
                    <p className="text-sm font-semibold text-base-content truncate">{authUser?.email}</p>
                 </div>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
