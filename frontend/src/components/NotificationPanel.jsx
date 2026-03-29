import React, { useEffect, useRef } from "react";
import { NotificationStore } from "../store/NotificationStore";
import { Bell, Check, Trash2, X, Users, MessageSquare, AlertCircle, Heart, UserPlus, UserCheck } from "lucide-react";
import { formatedMessageTime } from "../lib/utils";

const NotificationPanel = ({ isOpen, onClose }) => {
    const {
        notifications,
        unreadCount,
        isLoading,
        getNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications,
    } = NotificationStore();

    const panelRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            getNotifications();
        }
    }, [isOpen, getNotifications]);

    // Close panel when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (panelRef.current && !panelRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, onClose]);

    const getNotificationConfig = (type) => {
        switch (type) {
            case "message":
                return {
                    icon: <MessageSquare className="size-4" />,
                    color: "text-primary",
                    bg: "bg-primary/10",
                    accent: "border-l-primary",
                };
            case "reaction":
                return {
                    icon: <Heart className="size-4" />,
                    color: "text-rose-400",
                    bg: "bg-rose-500/10",
                    accent: "border-l-rose-500",
                };
            case "chat_request":
                return {
                    icon: <UserPlus className="size-4" />,
                    color: "text-blue-400",
                    bg: "bg-blue-500/10",
                    accent: "border-l-blue-500",
                };
            case "chat_request_accepted":
                return {
                    icon: <UserCheck className="size-4" />,
                    color: "text-emerald-400",
                    bg: "bg-emerald-500/10",
                    accent: "border-l-emerald-500",
                };
            case "group_invite":
            case "group_message":
                return {
                    icon: <Users className="size-4" />,
                    color: "text-secondary",
                    bg: "bg-secondary/10",
                    accent: "border-l-secondary",
                };
            case "mention":
                return {
                    icon: <Bell className="size-4" />,
                    color: "text-warning",
                    bg: "bg-warning/10",
                    accent: "border-l-warning",
                };
            default:
                return {
                    icon: <AlertCircle className="size-4" />,
                    color: "text-info",
                    bg: "bg-info/10",
                    accent: "border-l-info",
                };
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div
                ref={panelRef}
                className="fixed inset-0 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[400px] bg-base-100 sm:rounded-2xl shadow-2xl sm:border sm:border-base-300/80 overflow-hidden z-50 flex flex-col sm:block sm:max-h-[80vh]"
                style={{ animation: 'toast-slide-in 0.3s cubic-bezier(0.21, 1.02, 0.73, 1)' }}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-base-300/80 bg-gradient-to-r from-primary/8 via-secondary/5 to-transparent">
                    <div className="flex items-center gap-2.5">
                        <div className="size-8 rounded-xl bg-primary/15 flex items-center justify-center">
                            <Bell className="size-4 text-primary" />
                        </div>
                        <h3 className="font-bold text-base">Notifications</h3>
                        {unreadCount > 0 && (
                            <span className="min-w-[22px] h-[22px] bg-gradient-to-r from-primary to-secondary text-white text-[11px] rounded-full flex items-center justify-center font-bold px-1.5 shadow-lg shadow-primary/20">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-base-200 transition-colors">
                        <X className="size-4 text-base-content/50" />
                    </button>
                </div>

                {/* Actions */}
                {notifications.length > 0 && (
                    <div className="flex items-center justify-between px-4 py-2 border-b border-base-300/60 bg-base-200/30">
                        <button
                            onClick={markAllAsRead}
                            className="text-xs font-semibold text-primary hover:text-primary-focus transition-colors flex items-center gap-1.5 py-1"
                            disabled={unreadCount === 0}
                        >
                            <Check className="size-3" />
                            Mark all read
                        </button>
                        <button
                            onClick={clearAllNotifications}
                            className="text-xs font-semibold text-base-content/40 hover:text-rose-500 transition-colors flex items-center gap-1.5 py-1"
                        >
                            <Trash2 className="size-3" />
                            Clear all
                        </button>
                    </div>
                )}

                {/* Notification List */}
                <div className="flex-1 sm:max-h-96 overflow-y-auto min-h-0">
                    {isLoading ? (
                        <div className="p-10 text-center">
                            <span className="loading loading-spinner loading-md text-primary"></span>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-10 text-center">
                            <div className="size-16 rounded-2xl bg-base-200/60 flex items-center justify-center mx-auto mb-4">
                                <Bell className="size-7 text-base-content/20" />
                            </div>
                            <p className="text-base-content/60 font-semibold text-sm">No notifications yet</p>
                            <p className="text-xs text-base-content/35 mt-1">
                                We'll notify you when something happens
                            </p>
                        </div>
                    ) : (
                        <div className="py-1">
                            {notifications.map((notification) => {
                                const config = getNotificationConfig(notification.type);
                                return (
                                    <div
                                        key={notification._id}
                                        className={`group px-4 py-3 hover:bg-base-200/40 transition-all cursor-pointer border-l-[3px] ${
                                            !notification.isRead
                                                ? `${config.accent} bg-primary/[0.03]`
                                                : "border-l-transparent"
                                        }`}
                                        onClick={() => !notification.isRead && markAsRead(notification._id)}
                                    >
                                        <div className="flex gap-3">
                                            {/* Avatar or Icon */}
                                            <div className="flex-shrink-0">
                                                {notification.senderId?.profilePic ? (
                                                    <div className="relative">
                                                        <div className="size-10 rounded-full overflow-hidden ring-2 ring-base-300/80">
                                                            <img
                                                                src={notification.senderId.profilePic}
                                                                alt=""
                                                                className="size-full object-cover"
                                                            />
                                                        </div>
                                                        <div className={`absolute -bottom-0.5 -right-0.5 size-5 rounded-full ${config.bg} flex items-center justify-center ring-2 ring-base-100`}>
                                                            <span className={config.color}>{config.icon}</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className={`size-10 rounded-full ${config.bg} flex items-center justify-center`}>
                                                        <span className={config.color}>{config.icon}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm leading-snug ${!notification.isRead ? "font-semibold text-base-content" : "text-base-content/80"}`}>
                                                    {notification.title}
                                                </p>
                                                <p className="text-xs text-base-content/45 truncate mt-0.5">
                                                    {notification.message}
                                                </p>
                                                <time className="text-[11px] text-base-content/30 mt-1 block font-medium">
                                                    {formatedMessageTime(notification.createdAt)}
                                                </time>
                                            </div>

                                            {/* Delete + Unread Indicator */}
                                            <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                                                {!notification.isRead && (
                                                    <div className="size-2 rounded-full bg-primary shadow-sm shadow-primary/50" />
                                                )}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteNotification(notification._id);
                                                    }}
                                                    className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-base-200 transition-all"
                                                >
                                                    <X className="size-3 text-base-content/40" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default NotificationPanel;
