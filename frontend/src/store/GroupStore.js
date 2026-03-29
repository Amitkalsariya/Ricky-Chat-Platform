import { create } from "zustand";
import toast from "../components/CustomToast";
import { aixosIns } from "../lib/axios";
import { AuthStore } from "./AuthStore";

export const GroupStore = create((set, get) => ({
    groups: [],
    selectedGroup: null,
    groupMessages: [],
    isGroupsLoading: false,
    isGroupMessagesLoading: false,
    isCreatingGroup: false,
    typingUsers: {},

    // Get all groups for the user
    getGroups: async () => {
        set({ isGroupsLoading: true });
        try {
            const res = await aixosIns.get("/groups");
            set({ groups: res.data });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch groups");
        } finally {
            set({ isGroupsLoading: false });
        }
    },

    // Create a new group
    createGroup: async (groupData) => {
        set({ isCreatingGroup: true });
        try {
            const res = await aixosIns.post("/groups/create", groupData);
            set((state) => ({ groups: [res.data, ...state.groups] }));
            toast.success("Group created successfully!");
            return res.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create group");
            return null;
        } finally {
            set({ isCreatingGroup: false });
        }
    },

    // Update group details
    updateGroup: async (groupId, updateData) => {
        try {
            const res = await aixosIns.put(`/groups/${groupId}`, updateData);
            set((state) => ({
                groups: state.groups.map((g) => (g._id === groupId ? res.data : g)),
                selectedGroup: state.selectedGroup?._id === groupId ? res.data : state.selectedGroup,
            }));
            toast.success("Group updated successfully!");
            return res.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update group");
            return null;
        }
    },

    // Delete a group
    deleteGroup: async (groupId) => {
        try {
            await aixosIns.delete(`/groups/${groupId}`);
            set((state) => ({
                groups: state.groups.filter((g) => g._id !== groupId),
                selectedGroup: state.selectedGroup?._id === groupId ? null : state.selectedGroup,
            }));
            toast.success("Group deleted successfully!");
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete group");
            return false;
        }
    },

    // Add members to a group
    addMembers: async (groupId, members) => {
        try {
            const res = await aixosIns.post(`/groups/${groupId}/members`, { members });
            set((state) => ({
                groups: state.groups.map((g) => (g._id === groupId ? res.data : g)),
                selectedGroup: state.selectedGroup?._id === groupId ? res.data : state.selectedGroup,
            }));
            toast.success("Members added successfully!");
            return res.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add members");
            return null;
        }
    },

    // Remove a member from group
    removeMember: async (groupId, memberId) => {
        try {
            const res = await aixosIns.delete(`/groups/${groupId}/members/${memberId}`);
            set((state) => ({
                groups: state.groups.map((g) => (g._id === groupId ? res.data : g)),
                selectedGroup: state.selectedGroup?._id === groupId ? res.data : state.selectedGroup,
            }));
            toast.success("Member removed successfully!");
            return res.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to remove member");
            return null;
        }
    },

    // Leave a group
    leaveGroup: async (groupId) => {
        try {
            await aixosIns.post(`/groups/${groupId}/leave`);
            set((state) => ({
                groups: state.groups.filter((g) => g._id !== groupId),
                selectedGroup: state.selectedGroup?._id === groupId ? null : state.selectedGroup,
            }));
            toast.success("Left group successfully!");
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to leave group");
            return false;
        }
    },

    // Get group messages
    getGroupMessages: async (groupId) => {
        set({ isGroupMessagesLoading: true });
        try {
            const res = await aixosIns.get(`/groups/${groupId}/messages`);
            set({ groupMessages: res.data });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch messages");
        } finally {
            set({ isGroupMessagesLoading: false });
        }
    },

    // Send group message
    sendGroupMessage: async (groupId, messageData) => {
        try {
            const res = await aixosIns.post(`/groups/${groupId}/messages`, messageData);
            set((state) => ({
                groupMessages: [...state.groupMessages, res.data],
            }));
            return res.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send message");
            return null;
        }
    },

    // Set selected group
    setSelectedGroup: (group) => {
        const socket = AuthStore.getState().socket;
        const { selectedGroup } = get();

        // Leave previous group room
        if (selectedGroup && socket?.emit) {
            socket.emit("leaveGroup", selectedGroup._id);
        }

        // Join new group room
        if (group && socket?.emit) {
            socket.emit("joinGroup", group._id);
        }

        set({ selectedGroup: group, groupMessages: [], typingUsers: {} });
    },

    // Subscribe to group socket events
    subscribeToGroupMessages: () => {
        const { selectedGroup } = get();
        if (!selectedGroup) return;

        const socket = AuthStore.getState().socket;
        if (!socket?.on) return;

        socket.on("newGroupMessage", ({ groupId, message }) => {
            if (groupId === selectedGroup._id) {
                set((state) => ({
                    groupMessages: [...state.groupMessages, message],
                }));
            }
        });

        socket.on("groupUserTyping", ({ groupId, senderId }) => {
            if (groupId === selectedGroup._id) {
                set((state) => ({
                    typingUsers: { ...state.typingUsers, [senderId]: true },
                }));
            }
        });

        socket.on("groupUserStoppedTyping", ({ groupId, senderId }) => {
            if (groupId === selectedGroup._id) {
                set((state) => {
                    const newTypingUsers = { ...state.typingUsers };
                    delete newTypingUsers[senderId];
                    return { typingUsers: newTypingUsers };
                });
            }
        });
    },

    // Unsubscribe from group socket events
    unsubscribeFromGroupMessages: () => {
        const socket = AuthStore.getState().socket;
        if (socket?.off) {
            socket.off("newGroupMessage");
            socket.off("groupUserTyping");
            socket.off("groupUserStoppedTyping");
        }
    },

    // Emit typing event
    emitGroupTyping: (groupId) => {
        const socket = AuthStore.getState().socket;
        if (socket?.emit) {
            socket.emit("groupTyping", { groupId });
        }
    },

    // Emit stop typing event
    emitGroupStopTyping: (groupId) => {
        const socket = AuthStore.getState().socket;
        if (socket?.emit) {
            socket.emit("groupStopTyping", { groupId });
        }
    },

    // Listen for global group events (for sidebar updates)
    subscribeToGroupEvents: () => {
        const socket = AuthStore.getState().socket;
        if (!socket?.on) return;

        socket.on("groupCreated", (group) => {
            set((state) => {
                const exists = state.groups.some((g) => g._id === group._id);
                if (!exists) {
                    return { groups: [group, ...state.groups] };
                }
                return state;
            });
        });

        socket.on("groupUpdated", (updatedGroup) => {
            set((state) => ({
                groups: state.groups.map((g) => (g._id === updatedGroup._id ? updatedGroup : g)),
                selectedGroup: state.selectedGroup?._id === updatedGroup._id ? updatedGroup : state.selectedGroup,
            }));
        });

        socket.on("groupDeleted", (groupId) => {
            set((state) => ({
                groups: state.groups.filter((g) => g._id !== groupId),
                selectedGroup: state.selectedGroup?._id === groupId ? null : state.selectedGroup,
            }));
        });

        socket.on("addedToGroup", (group) => {
            set((state) => {
                const exists = state.groups.some((g) => g._id === group._id);
                if (!exists) {
                    return { groups: [group, ...state.groups] };
                }
                return state;
            });
        });

        socket.on("removedFromGroup", (groupId) => {
            set((state) => ({
                groups: state.groups.filter((g) => g._id !== groupId),
                selectedGroup: state.selectedGroup?._id === groupId ? null : state.selectedGroup,
            }));
        });
    },

    // Unsubscribe from global group events
    unsubscribeFromGroupEvents: () => {
        const socket = AuthStore.getState().socket;
        if (socket?.off) {
            socket.off("groupCreated");
            socket.off("groupUpdated");
            socket.off("groupDeleted");
            socket.off("addedToGroup");
            socket.off("removedFromGroup");
        }
    },
}));
