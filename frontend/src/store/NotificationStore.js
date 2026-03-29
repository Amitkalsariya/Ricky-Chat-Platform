import { create } from "zustand";
import toast from "../components/CustomToast";
import { aixosIns } from "../lib/axios";
import { AuthStore } from "./AuthStore";

export const NotificationStore = create((set, get) => ({
    notifications: [],
    unreadCount: 0,
    isLoading: false,

    // Get all notifications
    getNotifications: async () => {
        set({ isLoading: true });
        try {
            const res = await aixosIns.get("/notifications");
            set({ notifications: res.data });
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        } finally {
            set({ isLoading: false });
        }
    },

    // Get unread count
    getUnreadCount: async () => {
        try {
            const res = await aixosIns.get("/notifications/unread-count");
            set({ unreadCount: res.data.count });
        } catch (error) {
            console.error("Failed to fetch unread count:", error);
        }
    },

    // Mark notification as read
    markAsRead: async (notificationId) => {
        try {
            await aixosIns.put(`/notifications/${notificationId}/read`);
            set((state) => ({
                notifications: state.notifications.map((n) =>
                    n._id === notificationId ? { ...n, isRead: true } : n
                ),
                unreadCount: Math.max(0, state.unreadCount - 1),
            }));
        } catch (error) {
            toast.error("Failed to mark notification as read");
        }
    },

    // Mark all as read
    markAllAsRead: async () => {
        try {
            await aixosIns.put("/notifications/read-all");
            set((state) => ({
                notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
                unreadCount: 0,
            }));
            toast.success("All notifications marked as read");
        } catch (error) {
            toast.error("Failed to mark all notifications as read");
        }
    },

    // Delete notification
    deleteNotification: async (notificationId) => {
        try {
            await aixosIns.delete(`/notifications/${notificationId}`);
            set((state) => {
                const notification = state.notifications.find((n) => n._id === notificationId);
                return {
                    notifications: state.notifications.filter((n) => n._id !== notificationId),
                    unreadCount: notification && !notification.isRead
                        ? Math.max(0, state.unreadCount - 1)
                        : state.unreadCount,
                };
            });
        } catch (error) {
            toast.error("Failed to delete notification");
        }
    },

    // Clear all notifications
    clearAllNotifications: async () => {
        try {
            await aixosIns.delete("/notifications");
            set({ notifications: [], unreadCount: 0 });
            toast.success("All notifications cleared");
        } catch (error) {
            toast.error("Failed to clear notifications");
        }
    },

    // Add notification locally (from socket)
    addNotification: (notification) => {
        set((state) => ({
            notifications: [notification, ...state.notifications],
            unreadCount: state.unreadCount + 1,
        }));
    },

    // Subscribe to notification events
    subscribeToNotifications: () => {
        const socket = AuthStore.getState().socket;
        if (!socket?.on) return;

        socket.on("newNotification", (notification) => {
            get().addNotification(notification);

            const title = notification.title || "New Notification";
            const subtitle = notification.message || "";
            const avatar = notification.sender?.profilePic || null;
            const notificationType = notification.type || "system";

            // Use the rich notification toast
            toast.notification(title, subtitle, {
                avatar,
                notificationType,
                duration: 5000,
            });
        });
    },

    // Unsubscribe from notification events
    unsubscribeFromNotifications: () => {
        const socket = AuthStore.getState().socket;
        if (socket?.off) {
            socket.off("newNotification");
        }
    },
}));
