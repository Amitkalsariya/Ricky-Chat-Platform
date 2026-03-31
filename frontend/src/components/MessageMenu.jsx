import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    MoreVertical, Reply, Forward, Star, StarOff, Copy, Trash2, X, Check, Users
} from 'lucide-react';
import { ChatStore } from '../store/ChatStore';
import { ChatRequestStore } from '../store/ChatRequestStore';
import { AuthStore } from '../store/AuthStore';
import toast from './CustomToast';
import { createPortal } from 'react-dom';

const MessageMenu = ({ message, onClose, onOpenForward, onOpenDelete, style }) => {
    const menuRef = useRef(null);

    const { setReplyingTo, toggleStar, deleteMessage } = ChatStore();
    const { authUser } = AuthStore();

    const isOwn = message.senderId === authUser._id || message.senderId?._id === authUser._id;
    const isStarred = message.starredBy?.includes(authUser._id);

    const handleReply = () => {
        setReplyingTo(message);
        onClose();
    };

    const handleCopy = () => {
        if (message.text) {
            navigator.clipboard.writeText(message.text);
            toast.success('Copied to clipboard');
        }
        onClose();
    };

    const handleStar = async () => {
        await toggleStar(message._id);
        onClose();
    };

    const handleDelete = async (forEveryone = false) => {
        await deleteMessage(message._id, forEveryone);
        setShowDeleteModal(false);
        onClose();
    };

    const menuItems = [
        { icon: Reply, label: 'Reply', onClick: handleReply },
        { icon: Forward, label: 'Forward', onClick: onOpenForward },
        { icon: isStarred ? StarOff : Star, label: isStarred ? 'Unstar' : 'Star', onClick: handleStar },
        ...(message.text ? [{ icon: Copy, label: 'Copy', onClick: handleCopy }] : []),
        { icon: Trash2, label: 'Delete', onClick: onOpenDelete, danger: true },
    ];

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-[60]"
                onClick={onClose}
            />

            {/* Menu - rendered as portal for proper positioning */}
            {createPortal(
                <div
                    ref={menuRef}
                    style={style}
                    className="fixed z-[70] bg-base-100 rounded-xl shadow-2xl border border-base-300 overflow-hidden min-w-[150px] animate-in fade-in zoom-in-95 duration-150"
                >
                    {menuItems.map(({ icon: Icon, label, onClick, danger }) => (
                        <button
                            key={label}
                            onClick={onClick}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors
                                ${danger
                                    ? 'text-error hover:bg-error/10'
                                    : 'hover:bg-base-200'
                                }`}
                        >
                            <Icon className="size-4 flex-shrink-0" />
                            <span className="whitespace-nowrap">{label}</span>
                        </button>
                    ))}
                </div>,
                document.body
            )}
        </>
    );
};

// Forward Modal Component
const ForwardModal = ({ message, onClose, users, forwardMessage }) => {
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [isForwarding, setIsForwarding] = useState(false);

    const toggleUser = (userId) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleForward = async () => {
        if (selectedUsers.length === 0) {
            toast.error('Select at least one recipient');
            return;
        }

        setIsForwarding(true);
        await forwardMessage(message._id, selectedUsers);
        setIsForwarding(false);
        onClose();
    };

    return createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-[110] sm:p-4">
            <div className="bg-base-100 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md max-h-[80vh] overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-base-300 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <Forward className="size-5 text-primary" />
                        <h3 className="font-bold text-lg">Forward Message</h3>
                    </div>
                    <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
                        <X className="size-5" />
                    </button>
                </div>

                {/* Message Preview */}
                <div className="p-4 bg-base-200 border-b border-base-300 flex-shrink-0">
                    <p className="text-sm text-base-content/70 truncate">
                        {message.image ? '📷 Photo' : message.voiceNote ? '🎤 Voice' : message.text}
                    </p>
                </div>

                {/* User List */}
                <div className="p-4 overflow-y-auto flex-1 min-h-0">
                    <div className="space-y-2">
                        {users.map(user => (
                            <label
                                key={user._id}
                                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all
                                    ${selectedUsers.includes(user._id)
                                        ? 'bg-primary/20 border border-primary/30'
                                        : 'hover:bg-base-200 border border-transparent'
                                    }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedUsers.includes(user._id)}
                                    onChange={() => toggleUser(user._id)}
                                    className="checkbox checkbox-primary checkbox-sm"
                                />
                                <img
                                    src={user.profilePic || '/avatar.png'}
                                    alt={user.fullname}
                                    className="size-10 rounded-full object-cover"
                                />
                                <span className="font-medium truncate">{user.fullname}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-4 border-t border-base-300 bg-base-200 flex-shrink-0">
                    <span className="text-sm text-base-content/60">
                        {selectedUsers.length} selected
                    </span>
                    <button
                        onClick={handleForward}
                        disabled={selectedUsers.length === 0 || isForwarding}
                        className="btn btn-primary gap-2"
                    >
                        <Forward className="size-4" />
                        {isForwarding ? 'Forwarding...' : 'Forward'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

const DeleteModal = ({ isOwn, onDeleteForMe, onDeleteForEveryone, onClose }) => {
    return createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-[110] sm:p-4">
            <div className="bg-base-100 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6">
                    <h3 className="font-bold text-lg mb-2">Delete Message?</h3>
                    <p className="text-base-content/60 text-sm mb-6">
                        Choose how you want to delete this message.
                    </p>

                    <div className="space-y-2">
                        <button
                            onClick={onDeleteForMe}
                            className="w-full btn btn-outline gap-2"
                        >
                            <Trash2 className="size-4" />
                            Delete for me
                        </button>

                        {isOwn && (
                            <button
                                onClick={onDeleteForEveryone}
                                className="w-full btn btn-error gap-2"
                            >
                                <Users className="size-4" />
                                Delete for everyone
                            </button>
                        )}

                        <button
                            onClick={onClose}
                            className="w-full btn btn-ghost"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

// Message menu trigger button — calculates position and renders menu via portal
export const MessageMenuButton = ({ message, position }) => {
    const [showMenu, setShowMenu] = useState(false);
    const [showForward, setShowForward] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [menuStyle, setMenuStyle] = useState({});
    const buttonRef = useRef(null);

    const { deleteMessage, forwardMessage } = ChatStore();
    const { acceptedContacts } = ChatRequestStore();
    const { authUser } = AuthStore();
    
    const isOwn = message.senderId === authUser._id || message.senderId?._id === authUser._id;

    const handleDelete = async (forEveryone) => {
        await deleteMessage(message._id, forEveryone);
        setShowDelete(false);
    };

    const calculatePosition = useCallback(() => {
        if (!buttonRef.current) return;

        const rect = buttonRef.current.getBoundingClientRect();
        const menuWidth = 160;
        const menuHeight = 220; // approximate max height
        const padding = 8;

        let top, left;

        // Determine vertical position: try below, if not enough space go above
        if (rect.bottom + menuHeight + padding > window.innerHeight) {
            top = rect.top - menuHeight;
            if (top < padding) top = padding;
        } else {
            top = rect.bottom + 4;
        }

        // Determine horizontal position based on message ownership
        if (position === 'left') {
            // Own messages: menu opens to the left
            left = rect.right - menuWidth;
            if (left < padding) left = padding;
        } else {
            // Other's messages: menu opens to the right
            left = rect.left;
            if (left + menuWidth + padding > window.innerWidth) {
                left = window.innerWidth - menuWidth - padding;
            }
        }

        setMenuStyle({
            top: `${Math.round(top)}px`,
            left: `${Math.round(left)}px`,
        });
    }, [position]);

    const handleClick = () => {
        if (!showMenu) {
            calculatePosition();
        }
        setShowMenu(!showMenu);
    };

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                onClick={handleClick}
                className="p-1 rounded-full hover:bg-base-200 transition-colors opacity-0 group-hover:opacity-100"
            >
                <MoreVertical className="size-4 text-base-content/60" />
            </button>

            {showMenu && (
                <MessageMenu
                    message={message}
                    onClose={() => setShowMenu(false)}
                    style={menuStyle}
                    onOpenForward={() => {
                        setShowMenu(false);
                        setShowForward(true);
                    }}
                    onOpenDelete={() => {
                        setShowMenu(false);
                        setShowDelete(true);
                    }}
                />
            )}

            {showForward && (
                <ForwardModal
                    message={message}
                    onClose={() => setShowForward(false)}
                    users={acceptedContacts}
                    forwardMessage={forwardMessage}
                />
            )}

            {showDelete && (
                <DeleteModal
                    isOwn={isOwn}
                    onDeleteForMe={() => handleDelete(false)}
                    onDeleteForEveryone={() => handleDelete(true)}
                    onClose={() => setShowDelete(false)}
                />
            )}
        </div>
    );
};

export default MessageMenu;
