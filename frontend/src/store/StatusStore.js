import { create } from "zustand";
import toast from "../components/CustomToast";
import { aixosIns } from "../lib/axios";
import { AuthStore } from "./AuthStore";

export const StatusStore = create((set, get) => ({
    myStatus: null,
    otherStatuses: [],
    isStatusLoading: false,
    isCreatingStatus: false,
    selectedStatus: null,
    selectedStatusIndex: 0,
    isViewerModalOpen: false,
    statusViewers: [],

    // Create a new status
    createStatus: async (statusData) => {
        set({ isCreatingStatus: true });
        try {
            const res = await aixosIns.post("/status", statusData);

            // Add to my status
            set((state) => {
                const currentMyStatus = state.myStatus || {
                    user: AuthStore.getState().authUser,
                    statuses: [],
                    isOwn: true
                };
                return {
                    myStatus: {
                        ...currentMyStatus,
                        statuses: [...currentMyStatus.statuses, res.data]
                    }
                };
            });

            toast.success("Status posted!");
            return res.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to post status");
            return null;
        } finally {
            set({ isCreatingStatus: false });
        }
    },

    // Get all statuses
    getAllStatuses: async () => {
        set({ isStatusLoading: true });
        try {
            const res = await aixosIns.get("/status");
            set({
                myStatus: res.data.myStatus,
                otherStatuses: res.data.otherStatuses
            });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to load statuses");
        } finally {
            set({ isStatusLoading: false });
        }
    },

    // View a status
    viewStatus: async (statusId) => {
        try {
            await aixosIns.post(`/status/${statusId}/view`);

            // Update local state to reflect view
            set((state) => ({
                otherStatuses: state.otherStatuses.map(userStatus => ({
                    ...userStatus,
                    statuses: userStatus.statuses.map(s =>
                        s._id === statusId ? { ...s, hasViewed: true } : s
                    ),
                    hasUnviewed: userStatus.statuses.some(s =>
                        s._id !== statusId && !s.hasViewed
                    )
                }))
            }));
        } catch (error) {
            console.log("Error viewing status:", error);
        }
    },

    // Delete a status
    deleteStatus: async (statusId) => {
        try {
            await aixosIns.delete(`/status/${statusId}`);

            set((state) => {
                if (state.myStatus) {
                    const updatedStatuses = state.myStatus.statuses.filter(
                        s => s._id !== statusId
                    );
                    return {
                        myStatus: updatedStatuses.length > 0
                            ? { ...state.myStatus, statuses: updatedStatuses }
                            : null
                    };
                }
                return state;
            });

            toast.success("Status deleted");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete status");
        }
    },

    // Get status viewers
    getStatusViewers: async (statusId) => {
        try {
            const res = await aixosIns.get(`/status/${statusId}/viewers`);
            set({ statusViewers: res.data });
        } catch (error) {
            console.log("Error getting viewers:", error);
        }
    },

    // Reply to status
    replyToStatus: async (statusId, text) => {
        try {
            await aixosIns.post(`/status/${statusId}/reply`, { text });
            toast.success("Reply sent!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send reply");
        }
    },

    // Set selected status for viewing
    setSelectedStatus: (userStatus, index = 0) => {
        set({ selectedStatus: userStatus, selectedStatusIndex: index });
    },

    clearSelectedStatus: () => {
        set({ selectedStatus: null, selectedStatusIndex: 0 });
    },

    nextStatus: () => {
        const { selectedStatus, selectedStatusIndex } = get();
        if (selectedStatus && selectedStatusIndex < selectedStatus.statuses.length - 1) {
            set({ selectedStatusIndex: selectedStatusIndex + 1 });
        }
    },

    prevStatus: () => {
        const { selectedStatusIndex } = get();
        if (selectedStatusIndex > 0) {
            set({ selectedStatusIndex: selectedStatusIndex - 1 });
        }
    },

    toggleViewerModal: () => {
        set((state) => ({ isViewerModalOpen: !state.isViewerModalOpen }));
    },

    // Subscribe to status events
    subscribeToStatusEvents: () => {
        const socket = AuthStore.getState().socket;
        if (!socket?.on) return;

        socket.on("newStatus", (status) => {
            set((state) => {
                const userId = status.userId._id;
                const existingIndex = state.otherStatuses.findIndex(
                    s => s.user._id === userId
                );

                if (existingIndex > -1) {
                    const updated = [...state.otherStatuses];
                    updated[existingIndex] = {
                        ...updated[existingIndex],
                        statuses: [...updated[existingIndex].statuses, { ...status, hasViewed: false }],
                        hasUnviewed: true
                    };
                    return { otherStatuses: updated };
                } else {
                    return {
                        otherStatuses: [{
                            user: status.userId,
                            statuses: [{ ...status, hasViewed: false }],
                            hasUnviewed: true,
                            isOwn: false
                        }, ...state.otherStatuses]
                    };
                }
            });
        });

        socket.on("statusViewed", ({ statusId, viewer }) => {
            set((state) => {
                if (state.myStatus) {
                    return {
                        myStatus: {
                            ...state.myStatus,
                            statuses: state.myStatus.statuses.map(s =>
                                s._id === statusId
                                    ? { ...s, viewers: [...(s.viewers || []), { userId: viewer, viewedAt: new Date() }] }
                                    : s
                            )
                        }
                    };
                }
                return state;
            });
        });
    },

    unsubscribeFromStatusEvents: () => {
        const socket = AuthStore.getState().socket;
        if (socket?.off) {
            socket.off("newStatus");
            socket.off("statusViewed");
        }
    }
}));
