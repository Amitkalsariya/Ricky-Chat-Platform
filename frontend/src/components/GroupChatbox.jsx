import React, { useEffect, useRef, useState } from "react";
import { GroupStore } from "../store/GroupStore";
import { AuthStore } from "../store/AuthStore";
import { ChatRequestStore } from "../store/ChatRequestStore";
import { formatedMessageTime } from "../lib/utils";
import { X, Download, Users, Settings, UserMinus, LogOut, Trash2, UserPlus, Camera, Edit2, Loader2, ArrowLeft } from "lucide-react";
import GroupInputMessage from "./GroupInputMessage";
import GroupMessageSkeleton from "./skeletons/GroupMessageSkeleton";
import ConfirmModal from "./ConfirmModal";
import AddMembersModal from "./AddMembersModal";
import toast from "./CustomToast";

const GroupChatbox = () => {
    const {
        selectedGroup,
        groupMessages,
        getGroupMessages,
        isGroupMessagesLoading,
        subscribeToGroupMessages,
        unsubscribeFromGroupMessages,
        typingUsers,
        setSelectedGroup,
        leaveGroup,
        deleteGroup,
        removeMember,
        updateGroup,
    } = GroupStore();

    const { authUser } = AuthStore();
    const { acceptedContacts } = ChatRequestStore();
    const messageEndRef = useRef(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState("");
    const [showGroupInfo, setShowGroupInfo] = useState(false);
    const [showAddMembers, setShowAddMembers] = useState(false);
    const [isUpdatingPic, setIsUpdatingPic] = useState(false);
    const groupPicInputRef = React.useRef(null);

    // Confirm modal states
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: () => { },
        type: "danger",
    });

    useEffect(() => {
        if (selectedGroup?._id) {
            getGroupMessages(selectedGroup._id);
            subscribeToGroupMessages();
        }
        return () => unsubscribeFromGroupMessages();
    }, [selectedGroup?._id, getGroupMessages, subscribeToGroupMessages, unsubscribeFromGroupMessages]);

    useEffect(() => {
        if (messageEndRef.current && groupMessages) {
            messageEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [groupMessages]);

    const openImageModal = (imageUrl) => {
        setSelectedImage(imageUrl);
        setIsModalOpen(true);
    };

    const closeImageModal = () => {
        setIsModalOpen(false);
        setSelectedImage("");
    };

    const handleDownloadImage = async () => {
        try {
            const response = await fetch(selectedImage);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = selectedImage.split("/").pop();
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading image:", error);
        }
    };

    const handleLeaveGroup = () => {
        setConfirmModal({
            isOpen: true,
            title: "Leave Group",
            message: `Are you sure you want to leave "${selectedGroup?.name}"? You will no longer receive messages from this group.`,
            type: "warning",
            onConfirm: async () => {
                await leaveGroup(selectedGroup._id);
                setShowGroupInfo(false);
            },
        });
    };

    const handleDeleteGroup = () => {
        setConfirmModal({
            isOpen: true,
            title: "Delete Group",
            message: `Are you sure you want to delete "${selectedGroup?.name}"? This action cannot be undone and all messages will be permanently lost.`,
            type: "danger",
            onConfirm: async () => {
                await deleteGroup(selectedGroup._id);
                setShowGroupInfo(false);
            },
        });
    };

    const handleRemoveMember = (member) => {
        setConfirmModal({
            isOpen: true,
            title: "Remove Member",
            message: `Are you sure you want to remove "${member.fullname}" from this group?`,
            type: "danger",
            onConfirm: async () => {
                await removeMember(selectedGroup._id, member._id);
            },
        });
    };

    const closeConfirmModal = () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
    };

    const handleGroupPicChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            return;
        }

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image size should be less than 5MB");
            return;
        }

        setIsUpdatingPic(true);

        const reader = new FileReader();
        reader.onloadend = async () => {
            const result = await updateGroup(selectedGroup._id, { groupPic: reader.result });
            setIsUpdatingPic(false);
            if (result) {
                // Toast is already shown by updateGroup
            }
        };
        reader.onerror = () => {
            toast.error("Failed to read image file");
            setIsUpdatingPic(false);
        };
        reader.readAsDataURL(file);

        // Reset input
        e.target.value = "";
    };

    const isAdmin = selectedGroup?.admin?._id === authUser?._id;

    // Get typing users' names
    const typingUsersList = Object.keys(typingUsers).map((userId) => {
        const user = selectedGroup?.members?.find((m) => m._id === userId);
        return user?.fullname?.split(" ")[0] || "Someone";
    });

    if (isGroupMessagesLoading) {
        return (
            <div className="flex-1 flex flex-col overflow-hidden h-full">
                <GroupHeader
                    group={selectedGroup}
                    onClose={() => setSelectedGroup(null)}
                    onInfoClick={() => setShowGroupInfo(true)}
                />
                <GroupMessageSkeleton />
                <GroupInputMessage />
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col overflow-hidden h-full">
            {/* Header */}
            <GroupHeader
                group={selectedGroup}
                onClose={() => setSelectedGroup(null)}
                onInfoClick={() => setShowGroupInfo(true)}
            />

            {/* Messages */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 sm:p-4 space-y-1">
                {groupMessages.length === 0 ? (
                    <div className="flex items-center justify-center h-full px-4 text-center">
                        <div className="text-center">
                            <Users className="size-12 sm:size-16 mx-auto text-base-content/30 mb-4" />
                            <p className="text-base sm:text-lg text-base-content/60 font-semibold">
                                No messages yet
                            </p>
                            <p className="text-xs sm:text-sm text-base-content/40">
                                Send a message to start the conversation!
                            </p>
                        </div>
                    </div>
                ) : (
                    groupMessages.map((message, index) => {
                        const isOwn = message.senderId._id === authUser._id;

                        // Check if avatar should be shown (WhatsApp-style grouping)
                        const shouldShowAvatar = () => {
                            if (index === 0) return true;
                            const prevMessage = groupMessages[index - 1];
                            if (prevMessage.senderId._id !== message.senderId._id) return true;
                            // Show avatar if more than 5 minutes gap
                            const currentTime = new Date(message.createdAt);
                            const prevTime = new Date(prevMessage.createdAt);
                            const timeDiff = (currentTime - prevTime) / 1000 / 60;
                            return timeDiff > 5;
                        };

                        // Check if timestamp should be shown
                        const shouldShowTimestamp = () => {
                            if (index === groupMessages.length - 1) return true;
                            const nextMessage = groupMessages[index + 1];
                            if (nextMessage.senderId._id !== message.senderId._id) return true;
                            const currentTime = new Date(message.createdAt);
                            const nextTime = new Date(nextMessage.createdAt);
                            const timeDiff = (nextTime - currentTime) / 1000 / 60;
                            return timeDiff > 5;
                        };

                        const showAvatar = shouldShowAvatar();
                        const showTimestamp = shouldShowTimestamp();

                        return (
                            <div
                                key={message._id}
                                className={`flex items-end gap-2 group ${showAvatar ? 'mt-3' : 'mt-0.5'} ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                                ref={index === groupMessages.length - 1 ? messageEndRef : null}
                            >

                                {/* Avatar - unified for both sent and received */}
                                <div className="flex-shrink-0 w-8 sm:w-10">
                                    {showAvatar ? (
                                        <img
                                            src={isOwn ? (authUser.profilePic || "/avatar.png") : (message.senderId.profilePic || "/avatar.png")}
                                            alt="Profile"
                                            className="size-8 sm:size-10 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="size-8 sm:size-10"></div>
                                    )}
                                </div>

                                {/* Message Content */}
                                <div className={`flex flex-col max-w-[70%] sm:max-w-[60%] ${isOwn ? 'items-end' : 'items-start'}`}>
                                    {/* Sender name - only show for first message in group (for received messages) */}
                                    {!isOwn && showAvatar && (
                                        <span className="text-xs font-medium text-primary mb-0.5">
                                            {message.senderId.fullname}
                                        </span>
                                    )}

                                    {/* Image Message */}
                                    {message.image && (
                                        <div className={`rounded-2xl overflow-hidden mb-1 ${isOwn ? 'rounded-br-sm' : 'rounded-bl-sm'
                                            }`}>
                                            <img
                                                src={message.image}
                                                alt="Attachment"
                                                className="max-w-[180px] sm:max-w-[250px] w-full object-contain cursor-pointer hover:opacity-90 transition-opacity"
                                                onClick={() => openImageModal(message.image)}
                                            />
                                        </div>
                                    )}

                                    {/* Text Message */}
                                    {message.text && (
                                        <div className={`px-3 py-2 rounded-2xl text-sm sm:text-base break-words ${isOwn
                                            ? `bg-primary text-primary-content ${showAvatar ? 'rounded-br-sm' : ''}`
                                            : `bg-base-200 text-base-content ${showAvatar ? 'rounded-bl-sm' : ''}`
                                            }`}>
                                            {message.text}
                                        </div>
                                    )}

                                    {/* Timestamp - only show for last message in group */}
                                    {showTimestamp && (
                                        <span className={`text-[10px] text-base-content/40 mt-0.5`}>
                                            {formatedMessageTime(message.createdAt)}
                                        </span>
                                    )}
                                </div>
                            </div>

                        );
                    })
                )}

                {/* Typing Indicator */}
                {typingUsersList.length > 0 && (
                    <div className="flex justify-start mt-2">
                        <div className="w-8 sm:w-10 flex-shrink-0 mr-2">
                            <div className="size-8 sm:size-10 rounded-full bg-base-200 flex items-center justify-center">
                                <Users className="size-4 text-base-content/50" />
                            </div>
                        </div>
                        <div className="bg-base-200 rounded-2xl rounded-bl-md px-4 py-3">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-base-content/60">
                                    {typingUsersList.join(", ")} {typingUsersList.length === 1 ? "is" : "are"} typing
                                </span>
                                <span className="flex gap-1">
                                    <span className="size-1.5 bg-base-content/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                                    <span className="size-1.5 bg-base-content/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                                    <span className="size-1.5 bg-base-content/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>


            {/* Input */}
            <GroupInputMessage />

            {/* Fullscreen Image Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4">
                    <div className="relative max-w-full max-h-full">
                        <img
                            src={selectedImage}
                            alt="Fullscreen"
                            className="max-w-full max-h-[90vh] object-contain rounded-md"
                        />
                        <button
                            onClick={closeImageModal}
                            className="absolute top-2 right-2 sm:top-4 sm:right-4 text-white bg-gray-800/70 p-2 rounded-full cursor-pointer hover:bg-gray-600 transition"
                        >
                            <X className="size-5 sm:size-6" />
                        </button>
                        <button
                            onClick={handleDownloadImage}
                            className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-full cursor-pointer flex items-center gap-2"
                        >
                            <Download className="size-4 sm:size-5" />
                            <span className="hidden sm:inline">Download</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Group Info Sidebar */}
            {showGroupInfo && (
                <div className="fixed inset-0 bg-black/50 z-50 flex justify-end" onClick={() => setShowGroupInfo(false)}>
                    <div
                        className="w-full sm:w-80 md:max-w-sm bg-base-100 h-full overflow-y-auto animate-slide-in-right"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-3 sm:p-4 border-b border-base-300 flex items-center justify-between sticky top-0 bg-base-100 z-10">
                            <h3 className="font-bold text-base sm:text-lg">Group Info</h3>
                            <button onClick={() => setShowGroupInfo(false)} className="btn btn-ghost btn-sm btn-circle">
                                <X className="size-5" />
                            </button>
                        </div>

                        <div className="p-4 text-center border-b border-base-300">
                            {/* Group Picture with Edit Option for Admin */}
                            <div className="relative inline-block group">
                                <div
                                    className={`size-20 sm:size-24 mx-auto rounded-full bg-base-300 flex items-center justify-center overflow-hidden mb-4 ${isAdmin ? 'cursor-pointer ring-2 ring-transparent hover:ring-primary/50 transition-all duration-300' : ''}`}
                                    onClick={() => isAdmin && !isUpdatingPic && groupPicInputRef.current?.click()}
                                >
                                    {isUpdatingPic ? (
                                        <div className="w-full h-full flex items-center justify-center bg-base-300">
                                            <Loader2 className="size-8 animate-spin text-primary" />
                                        </div>
                                    ) : selectedGroup?.groupPic ? (
                                        <img src={selectedGroup.groupPic} alt={selectedGroup.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <Users className="size-10 sm:size-12 text-base-content/50" />
                                    )}

                                    {/* Edit Overlay for Admin */}
                                    {isAdmin && !isUpdatingPic && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full">
                                            <Camera className="size-6 sm:size-8 text-white" />
                                        </div>
                                    )}
                                </div>

                                {/* Hidden File Input */}
                                <input
                                    type="file"
                                    ref={groupPicInputRef}
                                    onChange={handleGroupPicChange}
                                    accept="image/*"
                                    className="hidden"
                                />

                                {/* Edit Badge for Admin */}
                                {isAdmin && (
                                    <div
                                        className="absolute bottom-4 right-1/2 translate-x-[calc(50%+2rem)] sm:translate-x-[calc(50%+2.5rem)] bg-primary text-primary-content rounded-full p-1.5 cursor-pointer hover:bg-primary-focus transition-colors shadow-lg"
                                        onClick={() => !isUpdatingPic && groupPicInputRef.current?.click()}
                                    >
                                        <Edit2 className="size-3 sm:size-3.5" />
                                    </div>
                                )}
                            </div>

                            <h2 className="text-lg sm:text-xl font-bold">{selectedGroup?.name}</h2>
                            {selectedGroup?.description && (
                                <p className="text-sm text-base-content/60 mt-2">{selectedGroup.description}</p>
                            )}
                            <p className="text-xs sm:text-sm text-base-content/50 mt-2">
                                {selectedGroup?.members?.length} members
                            </p>
                        </div>

                        {/* Add Members Button (Admin Only) */}
                        {isAdmin && (
                            <div className="p-4 border-b border-base-300">
                                <button
                                    onClick={() => setShowAddMembers(true)}
                                    className="btn btn-secondary btn-sm w-full gap-2"
                                >
                                    <UserPlus className="size-4" />
                                    Add Members
                                </button>
                            </div>
                        )}

                        <div className="p-4">
                            <h4 className="font-semibold mb-3 text-sm sm:text-base">Members</h4>
                            <div className="space-y-2">
                                {selectedGroup?.members?.map((member) => (
                                    <div key={member._id} className="flex items-center gap-2 sm:gap-3 p-2 rounded-lg hover:bg-base-200 transition-colors">
                                        <img
                                            src={member.profilePic || "/avatar.png"}
                                            alt={member.fullname}
                                            className="size-9 sm:size-10 rounded-full object-cover"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm sm:text-base truncate">{member.fullname}</p>
                                            {member._id === selectedGroup.admin._id && (
                                                <span className="text-xs text-primary">Admin</span>
                                            )}
                                        </div>
                                        {isAdmin && member._id !== authUser._id && (
                                            <button
                                                onClick={() => handleRemoveMember(member)}
                                                className="btn btn-ghost btn-xs text-error hover:bg-error/20"
                                                title="Remove member"
                                            >
                                                <UserMinus className="size-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-4 border-t border-base-300 space-y-2 sticky bottom-0 bg-base-100">
                            {!isAdmin && (
                                <button
                                    onClick={handleLeaveGroup}
                                    className="btn btn-outline btn-error w-full gap-2 btn-sm sm:btn-md"
                                >
                                    <LogOut className="size-4 sm:size-5" />
                                    Leave Group
                                </button>
                            )}
                            {isAdmin && (
                                <button
                                    onClick={handleDeleteGroup}
                                    className="btn btn-error w-full gap-2 btn-sm sm:btn-md"
                                >
                                    <Trash2 className="size-4 sm:size-5" />
                                    Delete Group
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Modal */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={closeConfirmModal}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type}
                confirmText={confirmModal.title.includes("Delete") ? "Delete" : confirmModal.title.includes("Leave") ? "Leave" : "Remove"}
            />

            {/* Add Members Modal */}
            <AddMembersModal
                isOpen={showAddMembers}
                onClose={() => setShowAddMembers(false)}
                group={selectedGroup}
            />
        </div>
    );
};

// Group Header Component
const GroupHeader = ({ group, onClose, onInfoClick }) => {
    return (
        <div className="p-2 sm:p-2.5 border-b border-base-300 flex-shrink-0">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3 cursor-pointer hover:opacity-80 flex-1 min-w-0" onClick={onInfoClick}>
                    {/* Back button on mobile */}
                    <button
                        onClick={(e) => { e.stopPropagation(); onClose(); }}
                        className="md:hidden btn btn-ghost btn-sm btn-circle flex-shrink-0"
                        aria-label="Back to conversations"
                    >
                        <ArrowLeft className="size-5" />
                    </button>

                    <div className="avatar flex-shrink-0">
                        <div className="size-8 sm:size-10 rounded-full relative bg-base-300 flex items-center justify-center overflow-hidden">
                            {group?.groupPic ? (
                                <img src={group.groupPic} alt={group?.name} className="object-cover w-full h-full" />
                            ) : (
                                <Users className="size-4 sm:size-5 text-base-content/50" />
                            )}
                        </div>
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-sm sm:text-base truncate">{group?.name}</h3>
                        <p className="text-xs sm:text-sm text-base-content/70">
                            {group?.members?.length} members
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    <button onClick={onInfoClick} className="btn btn-ghost btn-xs sm:btn-sm btn-circle">
                        <Settings className="size-4 sm:size-5" />
                    </button>
                    <button onClick={onClose} className="hidden md:flex btn btn-ghost btn-xs sm:btn-sm btn-circle">
                        <X className="size-4 sm:size-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GroupChatbox;
