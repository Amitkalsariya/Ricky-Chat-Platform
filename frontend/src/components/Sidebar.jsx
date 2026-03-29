import React, { useEffect, useState, useRef } from "react";
import { ChatStore } from "../store/ChatStore";
import { GroupStore } from "../store/GroupStore";
import { StatusStore } from "../store/StatusStore";
import { ChatRequestStore } from "../store/ChatRequestStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import {
  User, Users, Plus, MessageSquare, Search, Star, Image,
  UserPlus, Check, X, Clock, Send, UserCheck, ChevronLeft,
  Shield, Loader2, Inbox, SearchX
} from "lucide-react";
import { AuthStore } from "../store/AuthStore";
import CreateGroupModal from "./CreateGroupModal";
import { StatusList, CreateStatusModal, StatusViewer } from "./StatusComponents";
import MessageSearch from "./MessageSearch";
import StarredMessages from "./StarredMessages";
import MediaGallery from "./MediaGallery";
import { AvatarWithStatus, UserStatusText } from "./OnlineStatus";

const Sidebar = () => {
  const { selectedUser, setSelectedUser, isUsersLoading } = ChatStore();
  const {
    groups, getGroups, selectedGroup, setSelectedGroup,
    isGroupsLoading, subscribeToGroupEvents, unsubscribeFromGroupEvents,
  } = GroupStore();
  const {
    subscribeToStatusEvents, unsubscribeFromStatusEvents,
    setSelectedStatus, selectedStatus, clearSelectedStatus,
  } = StatusStore();
  const {
    acceptedContacts, getAcceptedContacts, incomingRequests, outgoingRequests,
    getIncomingRequests, getOutgoingRequests, acceptRequest, rejectRequest,
    cancelRequest, sendRequest, searchUsers, searchResults, isSearching,
    clearSearch, isLoading, isSending,
    subscribeToChatRequestEvents, unsubscribeFromChatRequestEvents,
  } = ChatRequestStore();
  const { onlineUsers, socket } = AuthStore();

  const [activeTab, setActiveTab] = useState("chats");
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showCreateStatus, setShowCreateStatus] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showStarred, setShowStarred] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryUserId, setGalleryUserId] = useState(null);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [requestSubTab, setRequestSubTab] = useState("incoming");
  const searchInputRef = useRef(null);
  const searchDebounceRef = useRef(null);

  useEffect(() => {
    getAcceptedContacts();
    getGroups();
    getIncomingRequests();
    getOutgoingRequests();
  }, [getAcceptedContacts, getGroups, getIncomingRequests, getOutgoingRequests]);

  useEffect(() => {
    if (socket?.on) {
      subscribeToGroupEvents();
      subscribeToStatusEvents();
      subscribeToChatRequestEvents();
      return () => {
        unsubscribeFromGroupEvents();
        unsubscribeFromStatusEvents();
        unsubscribeFromChatRequestEvents();
      };
    }
  }, [socket]);

  // Debounced search
  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    if (searchQuery.trim()) {
      searchDebounceRef.current = setTimeout(() => {
        searchUsers(searchQuery);
      }, 400);
    } else {
      clearSearch();
    }
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [searchQuery]);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setSelectedGroup(null);
  };

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
    setSelectedUser(null);
  };

  const handleStatusClick = (userStatus) => {
    setSelectedStatus(userStatus);
  };

  if (isLoading && acceptedContacts.length === 0 && isGroupsLoading) return <SidebarSkeleton />;

  // ── USER SEARCH OVERLAY ──
  if (showUserSearch) {
    return (
      <>
        <aside className="h-full w-full md:w-20 lg:w-72 border-r border-base-300 flex flex-col bg-base-100 transition-all duration-200">
          {/* Search Header */}
          <div className="flex items-center gap-2 p-3 border-b border-base-300 flex-shrink-0">
            <button
              onClick={() => { setShowUserSearch(false); setSearchQuery(""); clearSearch(); }}
              className="p-2 rounded-xl hover:bg-base-200 transition-colors"
            >
              <ChevronLeft className="size-5 text-base-content/60" />
            </button>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-base-content/40" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users by name or email..."
                className="input input-sm w-full pl-10 bg-base-200/80 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 h-10 text-sm"
                autoFocus
              />
            </div>
          </div>

          {/* Search Results */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {isSearching ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="size-6 text-primary animate-spin" />
                <p className="text-sm text-base-content/50">Searching...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="py-2">
                {searchResults.map((user) => (
                  <div key={user._id} className="px-3 py-2.5 hover:bg-base-200/60 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="relative flex-shrink-0">
                        <div className="size-11 rounded-full overflow-hidden ring-2 ring-base-300">
                          <img
                            src={user.profilePic || "/avatar.png"}
                            alt={user.fullname}
                            className="size-full object-cover"
                          />
                        </div>
                        {onlineUsers.includes(user._id) && (
                          <div className="absolute bottom-0 right-0 size-3 bg-emerald-500 rounded-full ring-2 ring-base-100" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{user.fullname}</p>
                        <p className="text-xs text-base-content/50 truncate">{user.about || user.email}</p>
                      </div>
                      {/* Action Button */}
                      <div className="flex-shrink-0">
                        {user.requestStatus === "accepted" ? (
                          <span className="flex items-center gap-1 text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-full">
                            <UserCheck className="size-3.5" /> Friends
                          </span>
                        ) : user.requestStatus === "pending" && user.isSender ? (
                          <span className="flex items-center gap-1 text-xs font-semibold text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-full">
                            <Clock className="size-3.5" /> Pending
                          </span>
                        ) : user.requestStatus === "pending" && !user.isSender ? (
                          <div className="flex gap-1">
                            <button
                              onClick={() => acceptRequest(user.requestId)}
                              className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25 transition-colors"
                              title="Accept"
                            >
                              <Check className="size-4" />
                            </button>
                            <button
                              onClick={() => rejectRequest(user.requestId)}
                              className="p-1.5 rounded-lg bg-rose-500/15 text-rose-500 hover:bg-rose-500/25 transition-colors"
                              title="Reject"
                            >
                              <X className="size-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => sendRequest(user._id)}
                            disabled={isSending}
                            className="flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
                          >
                            {isSending ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                              <UserPlus className="size-3.5" />
                            )}
                            Add
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchQuery.trim() ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <SearchX className="size-12 text-base-content/20 mb-4" />
                <p className="text-base-content/60 font-semibold text-sm">No users found</p>
                <p className="text-base-content/40 text-xs mt-1">Try a different name or email</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <Search className="size-12 text-base-content/15 mb-4" />
                <p className="text-base-content/50 font-medium text-sm">Find people to chat with</p>
                <p className="text-base-content/35 text-xs mt-1">Search by name or email address</p>
              </div>
            )}
          </div>
        </aside>
      </>
    );
  }

  // ── MAIN SIDEBAR ──
  return (
    <>
      <aside className="h-full w-full md:w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200 bg-base-100">
        {/* Quick Actions Bar */}
        <div className="flex justify-between md:justify-center lg:justify-between gap-1 p-2.5 border-b border-base-300 flex-shrink-0">
          <span className="text-sm font-bold md:hidden lg:flex flex items-center gap-2 text-base-content/80 pl-1">
            <MessageSquare className="size-4 text-primary" />
            Ricky Chat
          </span>
          <div className="flex gap-0.5">
            <button
              onClick={() => {
                setShowUserSearch(true);
                setTimeout(() => searchInputRef.current?.focus(), 100);
              }}
              className="p-2 rounded-lg hover:bg-base-200 transition-colors"
              title="Find people"
            >
              <UserPlus className="size-4 text-base-content/60" />
            </button>
            <button
              onClick={() => setShowSearch(true)}
              className="p-2 rounded-lg hover:bg-base-200 transition-colors"
              title="Search messages"
            >
              <Search className="size-4 text-base-content/60" />
            </button>
            <button
              onClick={() => setShowStarred(true)}
              className="p-2 rounded-lg hover:bg-base-200 transition-colors"
              title="Starred messages"
            >
              <Star className="size-4 text-base-content/60" />
            </button>
          </div>
        </div>

        {/* Status Section */}
        <StatusList
          onStatusClick={handleStatusClick}
          onCreateClick={() => setShowCreateStatus(true)}
        />

        {/* 3-Tab Switcher */}
        <div className="border-b border-base-300 w-full p-2 lg:p-2.5 flex-shrink-0">
          <div className="flex gap-0.5 bg-base-200/80 rounded-xl p-1">
            <button
              onClick={() => setActiveTab("chats")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeTab === "chats"
                  ? "bg-primary text-primary-content shadow-md"
                  : "hover:bg-base-300 text-base-content/60"
              }`}
            >
              <MessageSquare className="size-3.5" />
              <span className="md:hidden lg:inline">Chats</span>
            </button>
            <button
              onClick={() => setActiveTab("groups")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeTab === "groups"
                  ? "bg-primary text-primary-content shadow-md"
                  : "hover:bg-base-300 text-base-content/60"
              }`}
            >
              <Users className="size-3.5" />
              <span className="md:hidden lg:inline">Groups</span>
            </button>
            <button
              onClick={() => setActiveTab("requests")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all duration-200 relative ${
                activeTab === "requests"
                  ? "bg-primary text-primary-content shadow-md"
                  : "hover:bg-base-300 text-base-content/60"
              }`}
            >
              <Inbox className="size-3.5" />
              <span className="md:hidden lg:inline">Requests</span>
              {incomingRequests.length > 0 && (
                <span className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] text-[10px] rounded-full flex items-center justify-center font-bold px-1 ${
                  activeTab === "requests"
                    ? "bg-white text-primary"
                    : "bg-gradient-to-r from-rose-500 to-red-500 text-white shadow-lg shadow-rose-500/30"
                }`}>
                  {incomingRequests.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ────── CHATS TAB ────── */}
        {activeTab === "chats" && (
          <>
            <div className="border-b border-base-300 w-full px-3 py-2.5 lg:px-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm md:hidden lg:block text-base-content/80">
                    Direct Messages
                  </span>
                  <span className="text-xs text-base-content/40 bg-base-200 px-2 py-0.5 rounded-full md:hidden lg:inline-flex">
                    {acceptedContacts.length}
                  </span>
                </div>
              </div>
            </div>

            <div className="overflow-y-auto w-full py-1 flex-1 min-h-0">
              {acceptedContacts.length > 0 ? (
                acceptedContacts.map((user) => (
                  <button
                    key={user._id}
                    onClick={() => handleUserSelect(user)}
                    className={`w-full p-3 flex items-center gap-3 hover:bg-base-200/60 transition-all duration-150 ${
                      selectedUser?._id === user._id
                        ? "bg-primary/8 border-r-2 border-primary"
                        : ""
                    }`}
                  >
                    <AvatarWithStatus user={user} size="sm" />
                    <div className="md:hidden lg:block text-left min-w-0 flex-1">
                      <div className="font-semibold text-sm truncate">{user.fullname}</div>
                      <div className="text-xs">
                        <UserStatusText
                          userId={user._id}
                          isOnline={onlineUsers.includes(user._id)}
                          lastSeen={user.lastSeen}
                        />
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                  <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <UserPlus className="size-8 text-primary/50" />
                  </div>
                  <p className="text-base-content/70 font-semibold text-sm mb-1">No chats yet</p>
                  <p className="text-base-content/40 text-xs mb-4 leading-relaxed md:hidden lg:block">
                    Find people and send chat requests to start conversations
                  </p>
                  <button
                    onClick={() => setShowUserSearch(true)}
                    className="btn btn-primary btn-sm gap-2 rounded-xl md:btn-circle lg:btn-wide"
                  >
                    <UserPlus className="size-4" />
                    <span className="md:hidden lg:inline">Find People</span>
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* ────── GROUPS TAB ────── */}
        {activeTab === "groups" && (
          <>
            <div className="border-b border-base-300 w-full px-3 py-2.5 lg:px-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm md:hidden lg:block text-base-content/80">Group Chats</span>
                  <span className="text-xs text-base-content/40 bg-base-200 px-2 py-0.5 rounded-full md:hidden lg:inline-flex">
                    {groups.length}
                  </span>
                </div>
                <button
                  onClick={() => setShowCreateGroup(true)}
                  className="p-1.5 rounded-lg hover:bg-secondary/15 transition-colors"
                  title="Create new group"
                >
                  <Plus className="size-4 text-secondary" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto w-full py-1 flex-1 min-h-0">
              {groups.map((group) => (
                <button
                  key={group._id}
                  onClick={() => handleGroupSelect(group)}
                  className={`w-full p-3 flex items-center gap-3 hover:bg-base-200/60 transition-all duration-150 ${
                    selectedGroup?._id === group._id
                      ? "bg-secondary/8 border-r-2 border-secondary"
                      : ""
                  }`}
                >
                  <div className="relative mx-auto md:mx-auto lg:mx-0 flex-shrink-0">
                    <div className="size-11 rounded-full bg-gradient-to-br from-secondary/30 to-primary/30 flex items-center justify-center overflow-hidden">
                      {group.groupPic ? (
                        <img src={group.groupPic} alt={group.name} className="size-full object-cover" />
                      ) : (
                        <Users className="size-5 text-secondary" />
                      )}
                    </div>
                  </div>
                  <div className="md:hidden lg:block text-left min-w-0 flex-1">
                    <div className="font-semibold text-sm truncate">{group.name}</div>
                    <div className="text-xs text-base-content/40 truncate">
                      {group.members?.length} members
                    </div>
                  </div>
                </button>
              ))}

              {groups.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                  <div className="size-16 rounded-2xl bg-secondary/10 flex items-center justify-center mb-4">
                    <Users className="size-8 text-secondary/50" />
                  </div>
                  <p className="text-base-content/70 font-semibold text-sm mb-1">No groups yet</p>
                  <p className="text-base-content/40 text-xs mb-4 md:hidden lg:block">
                    Create a group to chat with multiple people
                  </p>
                  <button
                    onClick={() => setShowCreateGroup(true)}
                    className="btn btn-secondary btn-sm gap-2 rounded-xl"
                  >
                    <Plus className="size-4" />
                    <span className="md:hidden lg:inline">Create Group</span>
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* ────── REQUESTS TAB ────── */}
        {activeTab === "requests" && (
          <>
            {/* Sub-tabs */}
            <div className="px-3 py-2.5 flex-shrink-0 border-b border-base-300">
              <div className="flex gap-1 bg-base-200/60 rounded-xl p-0.5">
                <button
                  onClick={() => setRequestSubTab("incoming")}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    requestSubTab === "incoming"
                      ? "bg-base-100 shadow-sm text-base-content"
                      : "text-base-content/50 hover:text-base-content/70"
                  }`}
                >
                  Incoming {incomingRequests.length > 0 && `(${incomingRequests.length})`}
                </button>
                <button
                  onClick={() => setRequestSubTab("outgoing")}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    requestSubTab === "outgoing"
                      ? "bg-base-100 shadow-sm text-base-content"
                      : "text-base-content/50 hover:text-base-content/70"
                  }`}
                >
                  Sent {outgoingRequests.length > 0 && `(${outgoingRequests.length})`}
                </button>
              </div>
            </div>

            <div className="overflow-y-auto w-full py-1 flex-1 min-h-0">
              {/* INCOMING */}
              {requestSubTab === "incoming" && (
                <>
                  {incomingRequests.length > 0 ? (
                    incomingRequests.map((req) => {
                      const sender = req.senderId;
                      return (
                        <div key={req._id} className="px-3 py-3 hover:bg-base-200/40 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="size-11 rounded-full overflow-hidden ring-2 ring-base-300 flex-shrink-0">
                              <img
                                src={sender?.profilePic || "/avatar.png"}
                                alt={sender?.fullname}
                                className="size-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0 md:hidden lg:block">
                              <p className="font-semibold text-sm truncate">{sender?.fullname}</p>
                              <p className="text-xs text-base-content/45 truncate">{sender?.about || "Wants to chat"}</p>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-2.5 md:flex-col lg:flex-row">
                            <button
                              onClick={() => acceptRequest(req._id)}
                              className="flex-1 btn btn-sm bg-emerald-500 hover:bg-emerald-600 text-white border-0 rounded-xl gap-1.5 font-semibold text-xs h-9"
                            >
                              <Check className="size-3.5" />
                              <span className="md:hidden lg:inline">Accept</span>
                            </button>
                            <button
                              onClick={() => rejectRequest(req._id)}
                              className="flex-1 btn btn-sm bg-base-200 hover:bg-base-300 text-base-content/70 border-0 rounded-xl gap-1.5 font-semibold text-xs h-9"
                            >
                              <X className="size-3.5" />
                              <span className="md:hidden lg:inline">Decline</span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                      <div className="size-14 rounded-2xl bg-base-200/60 flex items-center justify-center mb-4">
                        <Inbox className="size-7 text-base-content/25" />
                      </div>
                      <p className="text-base-content/60 font-semibold text-sm">No pending requests</p>
                      <p className="text-base-content/35 text-xs mt-1 md:hidden lg:block">
                        When someone sends you a request, it'll appear here
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* OUTGOING */}
              {requestSubTab === "outgoing" && (
                <>
                  {outgoingRequests.length > 0 ? (
                    outgoingRequests.map((req) => {
                      const receiver = req.receiverId;
                      return (
                        <div key={req._id} className="px-3 py-3 hover:bg-base-200/40 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="size-11 rounded-full overflow-hidden ring-2 ring-base-300 flex-shrink-0">
                              <img
                                src={receiver?.profilePic || "/avatar.png"}
                                alt={receiver?.fullname}
                                className="size-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0 md:hidden lg:block">
                              <p className="font-semibold text-sm truncate">{receiver?.fullname}</p>
                              <p className="text-xs text-amber-500/70 flex items-center gap-1">
                                <Clock className="size-3" /> Pending
                              </p>
                            </div>
                            <button
                              onClick={() => cancelRequest(req._id)}
                              className="btn btn-sm btn-ghost text-base-content/50 hover:text-rose-500 rounded-xl text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                      <div className="size-14 rounded-2xl bg-base-200/60 flex items-center justify-center mb-4">
                        <Send className="size-7 text-base-content/25" />
                      </div>
                      <p className="text-base-content/60 font-semibold text-sm">No sent requests</p>
                      <p className="text-base-content/35 text-xs mt-1 md:hidden lg:block">
                        Find people and send them chat requests
                      </p>
                      <button
                        onClick={() => setShowUserSearch(true)}
                        className="btn btn-primary btn-sm gap-1.5 mt-3 rounded-xl text-xs"
                      >
                        <UserPlus className="size-3.5" /> Find People
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </aside>

      {/* Modals */}
      <CreateGroupModal isOpen={showCreateGroup} onClose={() => setShowCreateGroup(false)} />
      <CreateStatusModal isOpen={showCreateStatus} onClose={() => setShowCreateStatus(false)} />
      <StatusViewer isOpen={!!selectedStatus} onClose={clearSelectedStatus} />
      <MessageSearch isOpen={showSearch} onClose={() => setShowSearch(false)} />
      <StarredMessages isOpen={showStarred} onClose={() => setShowStarred(false)} />
      <MediaGallery
        isOpen={showGallery}
        onClose={() => { setShowGallery(false); setGalleryUserId(null); }}
        userId={galleryUserId}
      />
    </>
  );
};

export default Sidebar;
