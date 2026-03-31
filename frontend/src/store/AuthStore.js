import { create } from "zustand";
import { aixosIns } from "../lib/axios";
import toast from "../components/CustomToast";
import { io } from "socket.io-client";
const STRONG_URL =
  import.meta.env.MODE === "development" ? `http://${window.location.hostname}:3000` : "/";
export const AuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  isSendingOTP: false,
  isGoogleAuthLoding: false,
  isForgotLoding: false,
  isResetLoding: false,
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
  sendSignupOTP: async (data) => {
    set({ isSendingOTP: true });
    try {
      const res = await aixosIns.post("/auth/send-otp", data);
      toast.success(res.data.message || "OTP sent to your email!");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
      return false;
    } finally {
      set({ isSendingOTP: false });
    }
  },
  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await aixosIns.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("🎉 Account created successfully!");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error signing up");
      return false;
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
      toast.error(error.response?.data?.message || "Error logging out");
    }
  },
  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await aixosIns.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile Updated Successfully ✨");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating profile");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  // New Auth Methods
  googleAuth: async (data) => {
    set({ isGoogleAuthLoding: true });
    try {
      const res = await aixosIns.post("/auth/google", data);
      set({ authUser: res.data });
      if (res.data.isNewUser) {
        toast.success("Account has been created with Google");
      } else {
        toast.success(`Authenticated as ${res.data.email}`);
      }
      get().connectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Google authentication failed");
    } finally {
      set({ isGoogleAuthLoding: false });
    }
  },

  forgotPassword: async (email) => {
    set({ isForgotLoding: true });
    try {
      const res = await aixosIns.post("/auth/forgot-password", { email });
      toast.success(res.data.message || "Reset link sent to your email!");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send reset email");
      return false;
    } finally {
      set({ isForgotLoding: false });
    }
  },

  resetPassword: async (token, password) => {
    set({ isResetLoding: true });
    try {
      const res = await aixosIns.put(`/auth/reset-password/${token}`, { password });
      toast.success("Password reset successful!");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Password reset failed");
      return false;
    } finally {
      set({ isResetLoding: false });
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
