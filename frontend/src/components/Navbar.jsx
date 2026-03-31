import React, { useEffect, useState } from 'react'
import { AuthStore } from '../store/AuthStore'
import { NotificationStore } from '../store/NotificationStore'
import { Link, useLocation } from 'react-router-dom'
import { LogOut, MessageSquare, Settings, User, Bell, AlertTriangle, X } from 'lucide-react'
import NotificationPanel from './NotificationPanel'

const Navbar = () => {
  const { logout, authUser, socket } = AuthStore()
  const { unreadCount, getUnreadCount, subscribeToNotifications, unsubscribeFromNotifications } = NotificationStore()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const location = useLocation()

  useEffect(() => {
    if (authUser && socket?.on) {
      getUnreadCount()
      subscribeToNotifications()
      return () => unsubscribeFromNotifications()
    }
  }, [authUser, socket, getUnreadCount, subscribeToNotifications, unsubscribeFromNotifications])

  // Don't show navbar on landing page when not authenticated
  if (!authUser && (location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/')) {
    return null;
  }

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false)
    logout()
  }

  return (
    <>
      <header className='fixed w-full top-0 z-40 border-b border-base-200/80 bg-base-100/80 backdrop-blur-xl backdrop-saturate-150'>
        <div className='container mx-auto px-3 sm:px-6 h-16'>
          <div className='flex items-center justify-between h-full'>
            {/* Left Section - Ricky Branding */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="relative">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md shadow-primary/20 group-hover:shadow-primary/40 transition-all group-hover:scale-105">
                    <MessageSquare className="w-4.5 h-4.5 text-white" />
                  </div>
                </div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Ricky
                </h1>
              </Link>
            </div>

            {/* Right Section - Notifications, Settings, Profile, Logout */}
            <div className='flex items-center gap-1 sm:gap-1.5'>
              {authUser && (
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2.5 rounded-xl hover:bg-base-200/80 transition-all duration-200 group"
                    aria-label="Notifications"
                  >
                    <Bell className="w-[18px] h-[18px] text-base-content/60 group-hover:text-base-content transition-colors" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] bg-gradient-to-r from-rose-500 to-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold shadow-lg shadow-rose-500/30 px-1">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  <NotificationPanel
                    isOpen={showNotifications}
                    onClose={() => setShowNotifications(false)}
                  />
                </div>
              )}

              <Link
                to="/settings"
                className={`p-2.5 rounded-xl transition-all duration-200 group ${
                  location.pathname === '/settings' ? 'bg-primary/10 text-primary' : 'hover:bg-base-200/80'
                }`}
                aria-label="Settings"
              >
                <Settings className={`w-[18px] h-[18px] transition-colors ${
                  location.pathname === '/settings' ? 'text-primary' : 'text-base-content/60 group-hover:text-base-content'
                }`} />
              </Link>

              {authUser && (
                <>
                  <Link
                    to="/profile"
                    className={`flex items-center gap-2 px-2.5 py-2 rounded-xl transition-all duration-200 group ${
                      location.pathname === '/profile' ? 'bg-primary/10' : 'hover:bg-base-200/80'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg overflow-hidden ring-2 ring-base-300 group-hover:ring-primary/30 transition-all">
                      <img
                        src={authUser.profilePic || '/avatar.png'}
                        alt={authUser.fullname}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="hidden md:inline text-sm font-medium text-base-content/70 group-hover:text-base-content transition-colors">
                      {authUser.fullname?.split(' ')[0]}
                    </span>
                  </Link>

                  <div className="w-px h-6 bg-base-300 mx-1 hidden sm:block" />

                  <button
                    className="p-2.5 rounded-xl hover:bg-rose-500/10 transition-all duration-200 group"
                    onClick={() => setShowLogoutModal(true)}
                    aria-label="Logout"
                  >
                    <LogOut className="w-[18px] h-[18px] text-base-content/60 group-hover:text-rose-500 transition-colors" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ═══ Logout Confirmation Modal ═══ */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={() => setShowLogoutModal(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-[fadeIn_200ms_ease-out]" />

          {/* Modal Card */}
          <div
            className="relative bg-base-100 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-base-200/60 animate-[slideUp_300ms_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top accent stripe */}
            <div className="h-1 bg-gradient-to-r from-rose-500 via-red-500 to-orange-400" />

            {/* Content */}
            <div className="p-6 text-center">
              {/* Icon */}
              <div className="mx-auto w-14 h-14 rounded-full bg-rose-500/10 flex items-center justify-center mb-4">
                <LogOut className="w-7 h-7 text-rose-500" />
              </div>

              <h3 className="text-xl font-bold text-base-content mb-1.5">
                Log out of Ricky?
              </h3>
              <p className="text-base-content/50 text-sm leading-relaxed mb-6">
                You'll need to sign in again to access your messages and conversations.
              </p>

              {/* User info card */}
              {authUser && (
                <div className="flex items-center gap-3 bg-base-200/50 rounded-xl p-3 mb-6 border border-base-300/60">
                  <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-base-300 flex-shrink-0">
                    <img
                      src={authUser.profilePic || '/avatar.png'}
                      alt={authUser.fullname}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-sm font-semibold text-base-content truncate">{authUser.fullname}</p>
                    <p className="text-xs text-base-content/40 truncate">{authUser.email}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="btn flex-1 h-11 rounded-xl bg-base-200 hover:bg-base-300 border-0 font-semibold text-base-content/70 hover:text-base-content transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogoutConfirm}
                  className="btn flex-1 h-11 rounded-xl bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white border-0 font-semibold shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  )
}

export default Navbar

