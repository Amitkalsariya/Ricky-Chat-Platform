import { create } from "zustand";
import toast from "../components/CustomToast";
import { aixosIns } from "../lib/axios";
import { AuthStore } from "./AuthStore";

export const ChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isTyping: false,
  typingTimeout: null,
  starredMessages: [],
  isStarredLoading: false,
  searchResults: [],
  isSearching: false,
  replyingTo: null,
  mediaGallery: null,
  isGalleryLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await aixosIns.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await aixosIns.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages, replyingTo } = get();
    try {
      const dataToSend = {
        ...messageData,
        replyTo: replyingTo?._id
      };
      const res = await aixosIns.post(
        `/messages/send/${selectedUser._id}`,
        dataToSend
      );
      set({
        messages: [...messages, res.data],
        replyingTo: null
      });
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
      return null;
    }
  },

  // Add reaction to message
  addReaction: async (messageId, emoji) => {
    try {
      const res = await aixosIns.post(`/messages/${messageId}/react`, { emoji });
      set((state) => ({
        messages: state.messages.map(m =>
          m._id === messageId ? res.data : m
        )
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add reaction");
    }
  },

  // Delete message
  deleteMessage: async (messageId, deleteForEveryone = false) => {
    try {
      await aixosIns.delete(`/messages/${messageId}`, {
        data: { deleteForEveryone }
      });

      if (deleteForEveryone) {
        set((state) => ({
          messages: state.messages.map(m =>
            m._id === messageId
              ? { ...m, isDeleted: true, text: null, image: null, voiceNote: null }
              : m
          )
        }));
      } else {
        set((state) => ({
          messages: state.messages.filter(m => m._id !== messageId)
        }));
      }

      toast.success(deleteForEveryone ? "Message deleted for everyone" : "Message deleted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete message");
    }
  },

  // Star/Unstar message
  toggleStar: async (messageId) => {
    try {
      const res = await aixosIns.post(`/messages/${messageId}/star`);
      set((state) => ({
        messages: state.messages.map(m => {
          if (m._id === messageId) {
            const userId = AuthStore.getState().authUser._id;
            const starredBy = m.starredBy || [];
            const isStarred = starredBy.includes(userId);
            return {
              ...m,
              starredBy: isStarred
                ? starredBy.filter(id => id !== userId)
                : [...starredBy, userId]
            };
          }
          return m;
        })
      }));
      toast.success(res.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to star message");
    }
  },

  // Get starred messages
  getStarredMessages: async () => {
    set({ isStarredLoading: true });
    try {
      const res = await aixosIns.get("/messages/starred");
      set({ starredMessages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load starred messages");
    } finally {
      set({ isStarredLoading: false });
    }
  },

  // Forward message
  forwardMessage: async (messageId, receiverIds) => {
    try {
      await aixosIns.post(`/messages/${messageId}/forward`, { receiverIds });
      toast.success(`Message forwarded to ${receiverIds.length} chat(s)`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to forward message");
    }
  },

  // Search messages
  searchMessages: async (query, userId = null) => {
    set({ isSearching: true });
    try {
      const params = { query };
      if (userId) params.userId = userId;
      const res = await aixosIns.get("/messages/search", { params });
      set({ searchResults: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Search failed");
    } finally {
      set({ isSearching: false });
    }
  },

  clearSearch: () => set({ searchResults: [], isSearching: false }),

  // Get media gallery
  getMediaGallery: async (userId) => {
    set({ isGalleryLoading: true });
    try {
      const res = await aixosIns.get(`/messages/gallery/${userId}`);
      set({ mediaGallery: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load media");
    } finally {
      set({ isGalleryLoading: false });
    }
  },

  // Set message to reply to
  setReplyingTo: (message) => set({ replyingTo: message }),
  clearReplyingTo: () => set({ replyingTo: null }),

  // Mark message as read
  markAsRead: async (messageId) => {
    try {
      await aixosIns.post(`/messages/${messageId}/read`);
    } catch (error) {
      console.log("Failed to mark as read:", error);
    }
  },

  // Mark all messages as read
  markAllAsRead: async (userId) => {
    try {
      await aixosIns.post(`/messages/read-all/${userId}`);
    } catch (error) {
      console.log("Failed to mark all as read:", error);
    }
  },

  AllowToMessage: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = AuthStore.getState().socket;
    if (!socket?.on) return;

    // Listen for new messages
    socket.on("newMessage", (newMessage) => {
      if (newMessage.senderId !== selectedUser._id) return;
      set({
        messages: [...get().messages, newMessage],
      });
    });

    // Listen for typing indicator
    socket.on("userTyping", ({ senderId }) => {
      const currentSelectedUser = get().selectedUser;
      if (senderId === currentSelectedUser?._id) {
        set({ isTyping: true });
      }
    });

    // Listen for stop typing
    socket.on("userStoppedTyping", ({ senderId }) => {
      const currentSelectedUser = get().selectedUser;
      if (senderId === currentSelectedUser?._id) {
        set({ isTyping: false });
      }
    });

    // Listen for reaction updates
    socket.on("messageReactionUpdated", ({ messageId, reactions }) => {
      set((state) => ({
        messages: state.messages.map(m =>
          m._id === messageId ? { ...m, reactions } : m
        )
      }));
    });

    // Listen for message deletion
    socket.on("messageDeleted", ({ messageId, deleteForEveryone }) => {
      if (deleteForEveryone) {
        set((state) => ({
          messages: state.messages.map(m =>
            m._id === messageId
              ? { ...m, isDeleted: true, text: null, image: null, voiceNote: null }
              : m
          )
        }));
      }
    });

    // Listen for read receipts
    socket.on("messageRead", ({ messageId }) => {
      set((state) => ({
        messages: state.messages.map(m =>
          m._id === messageId ? { ...m, isRead: true, readAt: new Date() } : m
        )
      }));
    });

    socket.on("allMessagesRead", ({ by }) => {
      if (by === selectedUser._id) {
        set((state) => ({
          messages: state.messages.map(m => ({ ...m, isRead: true }))
        }));
      }
    });
  },

  DisalllowFromMessage: () => {
    const socket = AuthStore.getState().socket;
    if (socket?.off) {
      socket.off("newMessage");
      socket.off("userTyping");
      socket.off("userStoppedTyping");
      socket.off("messageReactionUpdated");
      socket.off("messageDeleted");
      socket.off("messageRead");
      socket.off("allMessagesRead");
    }
    set({ isTyping: false });
  },

  // Emit typing event
  emitTyping: () => {
    const { selectedUser, typingTimeout } = get();
    if (!selectedUser) return;

    const socket = AuthStore.getState().socket;
    if (!socket?.emit) return;

    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    socket.emit("typing", { receiverId: selectedUser._id });

    const timeout = setTimeout(() => {
      get().emitStopTyping();
    }, 2000);

    set({ typingTimeout: timeout });
  },

  // Emit stop typing event
  emitStopTyping: () => {
    const { selectedUser, typingTimeout } = get();
    if (!selectedUser) return;

    const socket = AuthStore.getState().socket;
    if (socket?.emit) {
      socket.emit("stopTyping", { receiverId: selectedUser._id });
    }

    if (typingTimeout) {
      clearTimeout(typingTimeout);
      set({ typingTimeout: null });
    }
  },

  setSelectedUser: (selectedUser) => {
    set({ selectedUser, isTyping: false, replyingTo: null });
  },
}));
