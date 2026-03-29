import React, { useEffect, useState } from 'react'
import { useThemeStore } from '../store/UseThemeStore';
import { ChatRequestStore } from '../store/ChatRequestStore';
import { THEMES } from '../constants';
import { Send, Palette, Eye, Check, ShieldBan, ShieldCheck, Loader2 } from "lucide-react";

const OUTPUTMESSAGES = [
  { id: 1, content: "Hey! How are you doing? 😊", isSent: false },
  { id: 2, content: "I'm great! Just checking out the new theme", isSent: true },
  { id: 3, content: "It looks amazing! Love the colors", isSent: false },
  { id: 4, content: "Right? So many options to choose from!", isSent: true }
];

const SettingsPage = () => {
  const { theme, setTheme } = useThemeStore()
  const { getBlockedUsers, unblockUser } = ChatRequestStore()
  const [blockedUsers, setBlockedUsers] = useState([])
  const [isLoadingBlocked, setIsLoadingBlocked] = useState(false)

  useEffect(() => {
    loadBlockedUsers();
  }, []);

  const loadBlockedUsers = async () => {
    setIsLoadingBlocked(true);
    const users = await getBlockedUsers();
    setBlockedUsers(users || []);
    setIsLoadingBlocked(false);
  };

  const handleUnblock = async (userId) => {
    await unblockUser(userId);
    setBlockedUsers((prev) => prev.filter((u) => u._id !== userId));
  };

  return (
    <div className='min-h-screen bg-base-200/30 pt-16 sm:pt-20 pb-8'>
      <div className='container mx-auto px-3 sm:px-4 max-w-5xl'>
        <div className='space-y-8'>
          {/* Page Header */}
          <div className="pt-4 sm:pt-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-base-content">Settings</h1>
                <p className="text-sm text-base-content/50">Customize your chat experience</p>
              </div>
            </div>
          </div>

          {/* Theme Section */}
          <div className="bg-base-100 rounded-2xl p-6 shadow-lg shadow-base-content/3 border border-base-200">
            <div className="flex items-center gap-2 mb-6">
              <Palette className="size-5 text-primary" />
              <h2 className="text-lg font-bold text-base-content">Theme</h2>
              <span className="text-sm text-base-content/40 ml-1">({THEMES.length} themes)</span>
            </div>

            <div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5'>
              {THEMES.map((t) => (
                <button
                  key={t}
                  className={`
                    group flex flex-col items-center gap-2 p-2.5 rounded-xl transition-all duration-200
                    ${theme === t
                      ? "bg-primary/10 ring-2 ring-primary shadow-md shadow-primary/10"
                      : "hover:bg-base-200/80 hover:shadow-sm"
                    }
                  `}
                  onClick={() => setTheme(t)}
                >
                  <div className="relative h-10 w-full rounded-lg overflow-hidden shadow-inner" data-theme={t}>
                    <div className="absolute inset-0 grid grid-cols-4 gap-px p-1.5">
                      <div className="rounded-sm bg-primary"></div>
                      <div className="rounded-sm bg-secondary"></div>
                      <div className="rounded-sm bg-accent"></div>
                      <div className="rounded-sm bg-neutral"></div>
                    </div>
                    {theme === t && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <Check className="size-4 text-primary-content" />
                      </div>
                    )}
                  </div>
                  <span className={`text-[11px] font-medium truncate w-full text-center ${
                    theme === t ? 'text-primary' : 'text-base-content/60'
                  }`}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Preview Section */}
          <div className="bg-base-100 rounded-2xl p-6 shadow-lg shadow-base-content/3 border border-base-200">
            <div className="flex items-center gap-2 mb-6">
              <Eye className="size-5 text-secondary" />
              <h2 className="text-lg font-bold text-base-content">Preview</h2>
            </div>

            <div className="rounded-2xl border border-base-300 overflow-hidden bg-base-200/50 shadow-inner">
              <div className="p-4 sm:p-6">
                <div className="max-w-lg mx-auto">
                  {/* Mock Chat UI */}
                  <div className="bg-base-100 rounded-2xl shadow-xl overflow-hidden border border-base-200">
                    {/* Chat Header */}
                    <div className="px-5 py-3.5 border-b border-base-200 bg-base-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold shadow-md shadow-primary/20">
                          R
                        </div>
                        <div>
                          <h3 className="font-bold text-sm">Ricky Chat</h3>
                          <p className="text-xs text-emerald-500 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Online
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="p-4 space-y-3 min-h-[200px] max-h-[240px] overflow-y-auto bg-base-100">
                      {OUTPUTMESSAGES.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.isSent ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`
                              max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm
                              ${message.isSent
                                ? "bg-primary text-primary-content rounded-br-md"
                                : "bg-base-200 rounded-bl-md"
                              }
                            `}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p
                              className={`
                                text-[10px] mt-1.5 text-right
                                ${message.isSent ? "text-primary-content/60" : "text-base-content/40"}
                              `}
                            >
                              12:00 PM
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Chat Input */}
                    <div className="p-4 border-t border-base-200 bg-base-100">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          className="input input-bordered flex-1 text-sm h-11 rounded-xl bg-base-200/50"
                          placeholder="Type a message..."
                          value="This is a preview ✨"
                          readOnly
                        />
                        <button className="btn btn-primary h-11 min-h-0 rounded-xl px-4 shadow-md shadow-primary/20">
                          <Send size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Blocked Users Section */}
          <div className="bg-base-100 rounded-2xl p-6 shadow-lg shadow-base-content/3 border border-base-200">
            <div className="flex items-center gap-2 mb-6">
              <ShieldBan className="size-5 text-rose-500" />
              <h2 className="text-lg font-bold text-base-content">Blocked Users</h2>
              {blockedUsers.length > 0 && (
                <span className="text-sm text-base-content/40 ml-1">({blockedUsers.length})</span>
              )}
            </div>

            {isLoadingBlocked ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="size-6 animate-spin text-primary" />
              </div>
            ) : blockedUsers.length === 0 ? (
              <div className="text-center py-8">
                <div className="size-16 rounded-2xl bg-base-200/60 flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="size-7 text-emerald-500/50" />
                </div>
                <p className="text-base-content/60 font-semibold text-sm">No blocked users</p>
                <p className="text-xs text-base-content/35 mt-1">You haven't blocked anyone</p>
              </div>
            ) : (
              <div className="space-y-2">
                {blockedUsers.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-base-200/40 hover:bg-base-200/60 transition-colors"
                  >
                    <img
                      src={user.profilePic || "/avatar.png"}
                      alt={user.fullname}
                      className="size-10 rounded-full object-cover ring-2 ring-base-300"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{user.fullname}</p>
                      <p className="text-xs text-base-content/40 truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => handleUnblock(user._id)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-full transition-colors"
                    >
                      <ShieldCheck className="size-3.5" />
                      Unblock
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage