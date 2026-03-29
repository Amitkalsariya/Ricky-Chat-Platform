import React, { useEffect, useState } from 'react'
import { AuthStore } from '../store/AuthStore'
import { NotificationStore } from '../store/NotificationStore'
import { Link, useLocation } from 'react-router-dom'
import { LogOut, MessageSquare, Settings, User, Bell } from 'lucide-react'
import NotificationPanel from './NotificationPanel'

const Navbar = () => {
  const { logout, authUser, socket } = AuthStore()
  const { unreadCount, getUnreadCount, subscribeToNotifications, unsubscribeFromNotifications } = NotificationStore()
  const [showNotifications, setShowNotifications] = useState(false)
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

  return (
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
                  onClick={logout}
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
  )
}

export default Navbar
