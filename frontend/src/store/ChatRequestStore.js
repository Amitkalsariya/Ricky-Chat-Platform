import { create } from "zustand";
import toast from "../components/CustomToast";
import { aixosIns } from "../lib/axios";
import { AuthStore } from "./AuthStore";

export const ChatRequestStore = create((set, get) => ({
  incomingRequests: [],
  outgoingRequests: [],
  acceptedContacts: [],
  searchResults: [],
  isLoading: false,
  isSearching: false,
  isSending: false,

  // ── GET ACCEPTED CONTACTS (friends) ──
  getAcceptedContacts: async () => {
    set({ isLoading: true });
    try {
      const res = await aixosIns.get("/chat-requests/accepted");
      set({ acceptedContacts: res.data });
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  // ── GET INCOMING REQUESTS ──
  getIncomingRequests: async () => {
    try {
      const res = await aixosIns.get("/chat-requests/incoming");
      set({ incomingRequests: res.data });
    } catch (error) {
      console.error("Failed to fetch incoming requests:", error);
    }
  },

  // ── GET OUTGOING REQUESTS ──
  getOutgoingRequests: async () => {
    try {
      const res = await aixosIns.get("/chat-requests/outgoing");
      set({ outgoingRequests: res.data });
    } catch (error) {
      console.error("Failed to fetch outgoing requests:", error);
    }
  },

  // ── SEND CHAT REQUEST ──
  sendRequest: async (receiverId) => {
    set({ isSending: true });
    try {
      const res = await aixosIns.post("/chat-requests/send", { receiverId });
      if (res.data.autoAccepted) {
        toast.success("You're now connected! Start chatting.");
        get().getAcceptedContacts();
      } else {
        toast.success("Chat request sent!");
        get().getOutgoingRequests();
      }
      // Update search results status
      set((state) => ({
        searchResults: state.searchResults.map((u) =>
          u._id === receiverId
            ? { ...u, requestStatus: res.data.autoAccepted ? "accepted" : "pending", isSender: true }
            : u
        ),
      }));
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send request");
      return false;
    } finally {
      set({ isSending: false });
    }
  },

  // ── ACCEPT REQUEST ──
  acceptRequest: async (requestId) => {
    try {
      await aixosIns.put(`/chat-requests/${requestId}/accept`);
      toast.success("Request accepted! You can now chat.");
      // Move from incoming to contacts
      set((state) => ({
        incomingRequests: state.incomingRequests.filter((r) => r._id !== requestId),
      }));
      get().getAcceptedContacts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to accept request");
    }
  },

  // ── REJECT REQUEST ──
  rejectRequest: async (requestId) => {
    try {
      await aixosIns.put(`/chat-requests/${requestId}/reject`);
      toast.info("Request declined");
      set((state) => ({
        incomingRequests: state.incomingRequests.filter((r) => r._id !== requestId),
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject request");
    }
  },

  // ── CANCEL OUTGOING REQUEST ──
  cancelRequest: async (requestId) => {
    try {
      await aixosIns.delete(`/chat-requests/${requestId}/cancel`);
      toast.info("Request cancelled");
      set((state) => ({
        outgoingRequests: state.outgoingRequests.filter((r) => r._id !== requestId),
        searchResults: state.searchResults.map((u) =>
          u.requestId === requestId ? { ...u, requestStatus: "none", requestId: null } : u
        ),
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel request");
    }
  },

  // ── REMOVE FRIEND ──
  removeFriend: async (userId) => {
    try {
      await aixosIns.delete(`/chat-requests/remove/${userId}`);
      toast.info("Friend removed");
      set((state) => ({
        acceptedContacts: state.acceptedContacts.filter((c) => c._id !== userId),
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove friend");
    }
  },

  // ── SEARCH USERS ──
  searchUsers: async (query) => {
    if (!query || query.trim().length < 1) {
      set({ searchResults: [] });
      return;
    }
    set({ isSearching: true });
    try {
      const res = await aixosIns.get("/chat-requests/search-users", {
        params: { query },
      });
      set({ searchResults: res.data });
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      set({ isSearching: false });
    }
  },

  clearSearch: () => set({ searchResults: [], isSearching: false }),

  // ── BLOCK USER ──
  blockUser: async (userId) => {
    try {
      await aixosIns.post(`/auth/block/${userId}`);
      toast.success("User blocked");
      // Remove from contacts if exists
      set((state) => ({
        acceptedContacts: state.acceptedContacts.filter((c) => c._id !== userId),
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to block user");
    }
  },

  // ── UNBLOCK USER ──
  unblockUser: async (userId) => {
    try {
      await aixosIns.post(`/auth/unblock/${userId}`);
      toast.success("User unblocked");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to unblock user");
    }
  },

  // ── GET BLOCKED USERS ──
  getBlockedUsers: async () => {
    try {
      const res = await aixosIns.get("/auth/blocked-users");
      return res.data;
    } catch (error) {
      console.error("Failed to fetch blocked users:", error);
      return [];
    }
  },

  // ── SOCKET SUBSCRIPTIONS ──
  subscribeToChatRequestEvents: () => {
    const socket = AuthStore.getState().socket;
    if (!socket?.on) return;

    socket.on("chatRequestReceived", ({ request, sender }) => {
      set((state) => ({
        incomingRequests: [{ ...request, senderId: sender }, ...state.incomingRequests],
      }));
      toast(`${sender.fullname} sent you a chat request`, {
        type: "info",
        duration: 5000,
      });
    });

    socket.on("chatRequestAccepted", ({ requestId, userId }) => {
      set((state) => ({
        outgoingRequests: state.outgoingRequests.filter((r) => r._id !== requestId),
      }));
      get().getAcceptedContacts();
    });

    socket.on("chatRequestRejected", ({ requestId }) => {
      set((state) => ({
        outgoingRequests: state.outgoingRequests.filter((r) => r._id !== requestId),
      }));
    });

    socket.on("friendRemoved", ({ userId }) => {
      set((state) => ({
        acceptedContacts: state.acceptedContacts.filter((c) => c._id !== userId),
      }));
    });
  },

  unsubscribeFromChatRequestEvents: () => {
    const socket = AuthStore.getState().socket;
    if (socket?.off) {
      socket.off("chatRequestReceived");
      socket.off("chatRequestAccepted");
      socket.off("chatRequestRejected");
      socket.off("friendRemoved");
    }
  },
}));
