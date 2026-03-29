import React, { useState } from "react";
import { X, UserPlus, Loader2, Search } from "lucide-react";
import { GroupStore } from "../store/GroupStore";
import { ChatRequestStore } from "../store/ChatRequestStore";
import toast from "./CustomToast";

const AddMembersModal = ({ isOpen, onClose, group }) => {
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isAdding, setIsAdding] = useState(false);

    const { addMembers } = GroupStore();
    const { acceptedContacts } = ChatRequestStore();

    // Filter out users already in the group
    const existingMemberIds = group?.members?.map((m) => m._id) || [];
    const availableUsers = acceptedContacts.filter(
        (user) => !existingMemberIds.includes(user._id)
    );

    // Filter by search query
    const filteredUsers = availableUsers.filter((user) =>
        user.fullname.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleMember = (userId) => {
        setSelectedMembers((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (selectedMembers.length === 0) {
            toast.error("Please select at least one member");
            return;
        }

        setIsAdding(true);
        const result = await addMembers(group._id, selectedMembers);
        setIsAdding(false);

        if (result) {
            setSelectedMembers([]);
            setSearchQuery("");
            onClose();
        }
    };

    const handleClose = () => {
        setSelectedMembers([]);
        setSearchQuery("");
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-[100] sm:p-4">
            <div
                className="bg-base-100 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md max-h-[80vh] overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-base-300 bg-gradient-to-r from-secondary/10 to-primary/10">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-secondary/20 flex items-center justify-center">
                            <UserPlus className="size-5 text-secondary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">Add Members</h2>
                            <p className="text-xs text-base-content/60">to {group?.name}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="btn btn-ghost btn-sm btn-circle"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-base-300">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-base-content/50" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search users..."
                            className="input input-bordered w-full pl-10"
                        />
                    </div>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit}>
                    <div className="p-4 flex-1 overflow-y-auto min-h-0">
                        {filteredUsers.length === 0 ? (
                            <div className="text-center py-8">
                                <UserPlus className="size-12 mx-auto text-base-content/30 mb-3" />
                                <p className="text-base-content/60">
                                    {availableUsers.length === 0
                                        ? "All users are already members"
                                        : "No users found"}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {filteredUsers.map((user) => (
                                    <label
                                        key={user._id}
                                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${selectedMembers.includes(user._id)
                                            ? "bg-secondary/20 border border-secondary/30"
                                            : "hover:bg-base-200 border border-transparent"
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedMembers.includes(user._id)}
                                            onChange={() => toggleMember(user._id)}
                                            className="checkbox checkbox-secondary checkbox-sm"
                                        />
                                        <img
                                            src={user.profilePic || "/avatar.png"}
                                            alt={user.fullname}
                                            className="size-10 rounded-full object-cover ring-2 ring-base-300"
                                        />
                                        <span className="font-medium flex-1 truncate">
                                            {user.fullname}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between p-4 border-t border-base-300 bg-base-200/50">
                        <span className="text-sm text-base-content/60">
                            {selectedMembers.length} selected
                        </span>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="btn btn-ghost"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isAdding || selectedMembers.length === 0}
                                className="btn btn-secondary gap-2"
                            >
                                {isAdding ? (
                                    <>
                                        <Loader2 className="size-4 animate-spin" />
                                        Adding...
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="size-4" />
                                        Add Members
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddMembersModal;
