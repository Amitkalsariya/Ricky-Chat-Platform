import React, { useEffect, useState } from 'react';
import { AuthStore } from '../store/AuthStore';

// Format last seen time
const formatLastSeen = (date) => {
    if (!date) return 'Last seen recently';

    const now = new Date();
    const lastSeen = new Date(date);
    const diffMs = now - lastSeen;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `Last seen ${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `Last seen ${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `Last seen ${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;

    return `Last seen ${lastSeen.toLocaleDateString()}`;
};

// Online Status Badge
export const OnlineStatusBadge = ({ isOnline, size = 'sm' }) => {
    const sizeClasses = {
        xs: 'size-2',
        sm: 'size-3',
        md: 'size-4',
        lg: 'size-5'
    };

    return (
        <span
            className={`${sizeClasses[size]} rounded-full ${isOnline
                    ? 'bg-green-500 ring-2 ring-base-100'
                    : 'bg-gray-400 ring-2 ring-base-100'
                }`}
        />
    );
};

// User Status Text Component
export const UserStatusText = ({ userId, isOnline: initialOnline, lastSeen: initialLastSeen }) => {
    const [status, setStatus] = useState({
        isOnline: initialOnline,
        lastSeen: initialLastSeen
    });
    const { socket } = AuthStore();

    useEffect(() => {
        if (!socket) return;

        // Request last seen from server
        socket.emit('getLastSeen', { targetUserId: userId });

        // Listen for last seen response
        const handleLastSeen = (data) => {
            if (data.userId === userId) {
                setStatus({
                    isOnline: data.isOnline,
                    lastSeen: data.lastSeen
                });
            }
        };

        // Listen for real-time status updates
        const handleUserOnline = (onlineUsers) => {
            setStatus(prev => ({
                ...prev,
                isOnline: onlineUsers.includes(userId)
            }));
        };

        const handleLastSeenUpdate = (data) => {
            if (data.userId === userId) {
                setStatus({
                    isOnline: false,
                    lastSeen: data.lastSeen
                });
            }
        };

        socket.on('lastSeenResponse', handleLastSeen);
        socket.on('getOnlineUsers', handleUserOnline);
        socket.on('userLastSeenUpdated', handleLastSeenUpdate);

        return () => {
            socket.off('lastSeenResponse', handleLastSeen);
            socket.off('getOnlineUsers', handleUserOnline);
            socket.off('userLastSeenUpdated', handleLastSeenUpdate);
        };
    }, [socket, userId]);

    if (status.isOnline) {
        return (
            <span className="text-green-500 text-sm flex items-center gap-1">
                <span className="size-2 rounded-full bg-green-500 animate-pulse" />
                Online
            </span>
        );
    }

    return (
        <span className="text-base-content/50 text-sm">
            {formatLastSeen(status.lastSeen)}
        </span>
    );
};

// Avatar with online status
export const AvatarWithStatus = ({
    user,
    size = 'md',
    showStatus = true,
    className = ''
}) => {
    const { onlineUsers } = AuthStore();
    const isOnline = onlineUsers?.includes(user?._id);

    const sizeClasses = {
        xs: 'size-8',
        sm: 'size-10',
        md: 'size-12',
        lg: 'size-16',
        xl: 'size-20'
    };

    const badgePositions = {
        xs: '-bottom-0.5 -right-0.5',
        sm: '-bottom-0.5 -right-0.5',
        md: 'bottom-0 right-0',
        lg: 'bottom-0.5 right-0.5',
        xl: 'bottom-1 right-1'
    };

    return (
        <div className={`relative ${className}`}>
            <img
                src={user?.profilePic || '/avatar.png'}
                alt={user?.fullname || 'User'}
                className={`${sizeClasses[size]} rounded-full object-cover`}
            />
            {showStatus && (
                <span className={`absolute ${badgePositions[size]}`}>
                    <OnlineStatusBadge isOnline={isOnline} size={size === 'xs' ? 'xs' : 'sm'} />
                </span>
            )}
        </div>
    );
};

// Typing indicator with status
export const TypingIndicator = ({ userName }) => {
    return (
        <div className="flex items-center gap-1 text-primary text-sm">
            <span>{userName || 'User'} is typing</span>
            <span className="flex gap-0.5">
                <span className="size-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="size-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="size-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </span>
        </div>
    );
};

// Recording indicator
export const RecordingIndicator = ({ userName }) => {
    return (
        <div className="flex items-center gap-2 text-red-500 text-sm">
            <span className="size-2 bg-red-500 rounded-full animate-pulse" />
            <span>{userName || 'User'} is recording a voice message</span>
        </div>
    );
};

export default UserStatusText;
