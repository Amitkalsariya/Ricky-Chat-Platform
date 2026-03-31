import React, { useEffect, useState } from 'react';
import { Star, X, Loader2, MessageSquare, Image, Mic, Trash2 } from 'lucide-react';
import { ChatStore } from '../store/ChatStore';
import { ChatRequestStore } from '../store/ChatRequestStore';
import { AuthStore } from '../store/AuthStore';
import { formatedMessageTime } from '../lib/utils';

const StarredMessages = ({ isOpen, onClose }) => {
    const { starredMessages, isStarredLoading, getStarredMessages, toggleStar, setSelectedUser } = ChatStore();
    const { acceptedContacts } = ChatRequestStore();
    const { authUser } = AuthStore();
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        if (isOpen) {
            getStarredMessages();
        }
    }, [isOpen, getStarredMessages]);

    const handleMessageClick = (message) => {
        // Find the user to chat with
        const chatUserId = message.senderId._id === authUser._id
            ? message.receiverId._id
            : message.senderId._id;
        const user = acceptedContacts.find(u => u._id === chatUserId) ||
            (message.senderId._id === authUser._id ? message.receiverId : message.senderId);

        setSelectedUser(user);
        onClose();
    };

    const handleUnstar = async (e, messageId) => {
        e.stopPropagation();
        await toggleStar(messageId);
        // Refresh the list
        getStarredMessages();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 sm:p-4">
            <div className="bg-base-100 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl max-h-[85vh] sm:max-h-[80vh] overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col">
                {/* Header */}
                <div className="flex items-center gap-3 p-4 border-b border-base-300 bg-gradient-to-r from-yellow-500/10 to-amber-500/10">
                    <div className="p-2 rounded-full bg-yellow-500/20">
                        <Star className="size-5 text-yellow-500 fill-yellow-500" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-lg">Starred Messages</h3>
                        <p className="text-sm text-base-content/60">
                            {starredMessages.length} saved message{starredMessages.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
                        <X className="size-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto flex-1 min-h-0">
                    {isStarredLoading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="size-8 animate-spin text-primary" />
                        </div>
                    ) : starredMessages.length === 0 ? (
                        <div className="text-center py-16 text-base-content/50">
                            <Star className="size-16 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium mb-2">No starred messages</p>
                            <p className="text-sm">Star important messages to find them easily later</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-base-200">
                            {starredMessages.map(message => {
                                const isOwn = message.senderId._id === authUser._id;
                                const otherUser = isOwn ? message.receiverId : message.senderId;

                                return (
                                    <button
                                        key={message._id}
                                        onClick={() => handleMessageClick(message)}
                                        className="w-full flex items-start gap-3 p-4 hover:bg-base-200 transition-colors text-left group"
                                    >
                                        <img
                                            src={message.senderId?.profilePic || '/avatar.png'}
                                            alt=""
                                            className="size-10 rounded-full object-cover flex-shrink-0"
                                        />

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">
                                                        {isOwn ? 'You' : message.senderId?.fullname}
                                                    </span>
                                                    <span className="text-base-content/40">→</span>
                                                    <span className="text-base-content/70">
                                                        {isOwn ? otherUser?.fullname : 'You'}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-base-content/50 flex-shrink-0">
                                                    {formatedMessageTime(message.createdAt)}
                                                </span>
                                            </div>

                                            {/* Message content */}
                                            <div className="flex items-start gap-2">
                                                {message.image ? (
                                                    <div className="relative">
                                                        <img
                                                            src={message.image}
                                                            alt=""
                                                            className="w-20 h-20 rounded-lg object-cover"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedImage(message.image);
                                                            }}
                                                        />
                                                        <div className="absolute bottom-1 left-1 bg-black/50 rounded px-1.5 py-0.5 flex items-center gap-1">
                                                            <Image className="size-3 text-white" />
                                                        </div>
                                                    </div>
                                                ) : message.voiceNote ? (
                                                    <div className="flex items-center gap-2 bg-base-200 rounded-lg px-3 py-2">
                                                        <Mic className="size-4 text-primary" />
                                                        <span className="text-sm text-base-content/70">
                                                            Voice message • {Math.floor((message.voiceNote.duration || 0) / 60)}:{String(Math.floor((message.voiceNote.duration || 0) % 60)).padStart(2, '0')}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-base-content/70 line-clamp-2">
                                                        {message.text}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Unstar button */}
                                        <button
                                            onClick={(e) => handleUnstar(e, message._id)}
                                            className="p-2 rounded-full hover:bg-base-300 opacity-0 group-hover:opacity-100 transition-all"
                                            title="Remove from starred"
                                        >
                                            <Star className="size-4 text-yellow-500 fill-yellow-500" />
                                        </button>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Image Preview */}
            {selectedImage && (
                <div
                    className="fixed inset-0 bg-black/95 flex items-center justify-center z-[60]"
                    onClick={() => setSelectedImage(null)}
                >
                    <button
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-white"
                    >
                        <X className="size-6" />
                    </button>
                    <img
                        src={selectedImage}
                        alt=""
                        className="max-w-[90vw] max-h-[90vh] object-contain"
                    />
                </div>
            )}
        </div>
    );
};

export default StarredMessages;
