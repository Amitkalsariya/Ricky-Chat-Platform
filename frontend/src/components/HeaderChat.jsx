import { X, ArrowLeft, Phone, Video, MoreVertical, ShieldBan, ShieldCheck, UserMinus } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { ChatStore } from "../store/ChatStore";
import { ChatRequestStore } from "../store/ChatRequestStore";
import { CallStore } from "../store/CallStore";
import { AuthStore } from "../store/AuthStore";

const HeaderChat = () => {
  const { selectedUser, setSelectedUser, isTyping } = ChatStore();
  const { blockUser, unblockUser, removeFriend } = ChatRequestStore();
  const { startCall } = CallStore();
  const { onlineUsers, authUser } = AuthStore();
  const isOnline = onlineUsers.includes(selectedUser._id);

  const [showMenu, setShowMenu] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const menuRef = useRef(null);

  // Check if user is blocked
  useEffect(() => {
    const checkBlocked = () => {
      const blocked = authUser?.blockedUsers || [];
      setIsBlocked(blocked.includes(selectedUser._id));
    };
    checkBlocked();
  }, [authUser, selectedUser._id]);

  // Close menu on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    if (showMenu) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showMenu]);

  const handleBlock = async () => {
    if (isBlocked) {
      await unblockUser(selectedUser._id);
      setIsBlocked(false);
    } else {
      await blockUser(selectedUser._id);
      setIsBlocked(true);
    }
    setShowMenu(false);
  };

  const handleRemoveFriend = async () => {
    await removeFriend(selectedUser._id);
    setSelectedUser(null);
    setShowMenu(false);
  };

  return (
    <div className="px-3 sm:px-4 py-2 sm:py-3 bg-base-100/95 backdrop-blur-xl flex-shrink-0 relative z-20 shadow-[0_4px_30px_rgba(0,0,0,0.03)] border-b border-base-content/5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
          {/* Back button on mobile */}
          <button
            onClick={() => setSelectedUser(null)}
            className="md:hidden p-1.5 -ml-1 rounded-xl hover:bg-base-200 transition-colors flex-shrink-0"
            aria-label="Back to conversations"
          >
            <ArrowLeft className="size-5 text-base-content/70" />
          </button>

          {/* Avatar with online status ring */}
          <div className="relative flex-shrink-0">
            <div className={`size-9 sm:size-10 rounded-full overflow-hidden ring-2 transition-all duration-300 ${
              isOnline ? 'ring-emerald-400/50' : 'ring-base-300'
            }`}>
              <img 
                src={selectedUser.profilePic || "/avatar.png"} 
                alt={selectedUser.fullname}
                className="w-full h-full object-cover"
              />
            </div>
            {isOnline && (
              <span className="absolute bottom-0 right-0 size-3 bg-emerald-400 rounded-full border-2 border-base-100" />
            )}
          </div>

          {/* User info */}
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm sm:text-[15px] text-base-content truncate leading-tight">
              {selectedUser.fullname}
            </h3>
            <p className="text-xs text-base-content/50 mt-0.5">
              {isBlocked ? (
                <span className="text-rose-400 font-medium flex items-center gap-1">
                  <ShieldBan className="size-3" />
                  Blocked
                </span>
              ) : isTyping ? (
                <span className="text-primary font-medium flex items-center gap-1.5">
                  typing
                  <span className="flex gap-[3px]">
                    <span className="size-[4px] bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="size-[4px] bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="size-[4px] bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </span>
                </span>
              ) : isOnline ? (
                <span className="text-emerald-500 font-medium">Online</span>
              ) : (
                "Offline"
              )}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-0.5">
          {!isBlocked && (
            <>
              <button
                onClick={() => startCall(selectedUser, "audio")}
                disabled={!isOnline}
                className="hidden sm:flex p-2 rounded-xl hover:bg-base-200/80 transition-colors group disabled:opacity-30 disabled:cursor-not-allowed"
                title={isOnline ? "Voice call" : "User is offline"}
              >
                <Phone className="size-[18px] text-base-content/50 group-hover:text-primary transition-colors" />
              </button>
              <button
                onClick={() => startCall(selectedUser, "video")}
                disabled={!isOnline}
                className="hidden sm:flex p-2 rounded-xl hover:bg-base-200/80 transition-colors group disabled:opacity-30 disabled:cursor-not-allowed"
                title={isOnline ? "Video call" : "User is offline"}
              >
                <Video className="size-[18px] text-base-content/50 group-hover:text-primary transition-colors" />
              </button>
            </>
          )}

          {/* More menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-xl hover:bg-base-200/80 transition-colors group"
            >
              <MoreVertical className="size-[18px] text-base-content/50 group-hover:text-base-content transition-colors" />
            </button>

            {showMenu && (
              <>
                {/* Backdrop to close menu */}
                <div className="fixed inset-0 z-[99]" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-full mt-1 bg-base-100 border border-base-300 rounded-xl shadow-2xl overflow-hidden min-w-[200px] z-[100] animate-in fade-in zoom-in-95 duration-150">
                  {/* Mobile call buttons */}
                  {!isBlocked && (
                    <>
                      <button
                        onClick={() => { startCall(selectedUser, "audio"); setShowMenu(false); }}
                        disabled={!isOnline}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-base-200 transition-colors sm:hidden disabled:opacity-30 whitespace-nowrap"
                      >
                        <Phone className="size-4 text-primary flex-shrink-0" />
                        Voice Call
                      </button>
                      <button
                        onClick={() => { startCall(selectedUser, "video"); setShowMenu(false); }}
                        disabled={!isOnline}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-base-200 transition-colors sm:hidden disabled:opacity-30 border-b border-base-200 whitespace-nowrap"
                      >
                        <Video className="size-4 text-primary flex-shrink-0" />
                        Video Call
                      </button>
                    </>
                  )}
                  <button
                    onClick={handleBlock}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors whitespace-nowrap ${
                      isBlocked
                        ? 'text-emerald-500 hover:bg-emerald-500/10'
                        : 'text-rose-500 hover:bg-rose-500/10'
                    }`}
                  >
                    {isBlocked ? (
                      <>
                        <ShieldCheck className="size-4 flex-shrink-0" />
                        Unblock User
                      </>
                    ) : (
                      <>
                        <ShieldBan className="size-4 flex-shrink-0" />
                        Block User
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleRemoveFriend}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-rose-500 hover:bg-rose-500/10 transition-colors border-t border-base-200 whitespace-nowrap"
                  >
                    <UserMinus className="size-4 flex-shrink-0" />
                    Remove Friend
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Close button - only visible on md+ (desktop) */}
          <button 
            onClick={() => setSelectedUser(null)} 
            className="hidden md:flex p-2 rounded-xl hover:bg-rose-500/10 transition-colors group"
          >
            <X className="size-[18px] text-base-content/50 group-hover:text-rose-500 transition-colors" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeaderChat;
