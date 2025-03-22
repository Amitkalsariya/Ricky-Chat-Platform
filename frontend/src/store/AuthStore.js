import { create } from "zustand";
import { aixosIns } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
const STRONG_URL =
  import.meta.env.MODE === "development" ? "http://localhost:3000" : "/";
export const AuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: [],

  checkAuth: async () => {
    try {
      const res = await aixosIns.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },
  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await aixosIns.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("🎉 Account created successfully!");
    } catch (error) {
      toast.error(error.reponse.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },
  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await aixosIns.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },
  logout: async () => {
    try {
      await aixosIns.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out! See you again soon!");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.reponse.data.message);
    }
  },
  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await aixosIns.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile Picture Uploaded Successfully");
    } catch (error) {
      toast.error(error.reponse.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(STRONG_URL, {
      query: {
        userId: authUser._id,
      },
    });
    socket.connect();

    set({ socket: socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));
