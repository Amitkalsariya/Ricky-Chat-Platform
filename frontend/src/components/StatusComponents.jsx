import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Eye, Send, Camera, Type, Loader2, Trash2, Plus } from 'lucide-react';
import { StatusStore } from '../store/StatusStore';
import { AuthStore } from '../store/AuthStore';
import toast from './CustomToast';

// Status Ring Component (for sidebar)
export const StatusRing = ({ user, hasUnviewed, onClick, isOwn, statusCount = 1 }) => {
    const segments = Math.min(statusCount, 6);
    const strokeDasharray = `${(360 / segments) - 8} 8`;

    return (
        <button
            onClick={onClick}
            className="relative group"
        >
            <div className="relative">
                {/* Ring SVG */}
                <svg className="size-14 sm:size-16 -rotate-90" viewBox="0 0 100 100">
                    <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        strokeWidth="3"
                        className={hasUnviewed ? 'stroke-primary' : 'stroke-base-content/30'}
                        strokeDasharray={strokeDasharray}
                        strokeLinecap="round"
                    />
                </svg>

                {/* Profile Picture */}
                <img
                    src={user?.profilePic || '/avatar.png'}
                    alt={user?.fullname}
                    className="absolute inset-2 rounded-full object-cover size-10 sm:size-12"
                />

                {/* Add button for own status */}
                {isOwn && (
                    <div className="absolute bottom-0 right-0 bg-primary text-primary-content rounded-full p-1">
                        <Plus className="size-3" />
                    </div>
                )}
            </div>

            <p className="text-xs mt-1 truncate max-w-[60px] text-center">
                {isOwn ? 'My Status' : user?.fullname?.split(' ')[0]}
            </p>
        </button>
    );
};

// Status List for Sidebar
export const StatusList = ({ onStatusClick, onCreateClick }) => {
    const { myStatus, otherStatuses, isStatusLoading, getAllStatuses } = StatusStore();
    const { authUser } = AuthStore();

    useEffect(() => {
        getAllStatuses();
    }, [getAllStatuses]);

    if (isStatusLoading) {
        return (
            <div className="flex items-center justify-center p-4">
                <Loader2 className="size-6 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-2 sm:p-3 border-b border-base-300">
            <h3 className="text-sm font-semibold text-base-content/60 mb-2 sm:mb-3 md:hidden lg:block">Status</h3>
            <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide justify-start md:justify-center lg:justify-start">
                {/* My Status / Add Status */}
                <StatusRing
                    user={authUser}
                    hasUnviewed={false}
                    onClick={() => myStatus ? onStatusClick(myStatus) : onCreateClick()}
                    isOwn={true}
                    statusCount={myStatus?.statuses?.length || 0}
                />

                {/* Other Statuses */}
                {otherStatuses.map(userStatus => (
                    <StatusRing
                        key={userStatus.user._id}
                        user={userStatus.user}
                        hasUnviewed={userStatus.hasUnviewed}
                        onClick={() => onStatusClick(userStatus)}
                        isOwn={false}
                        statusCount={userStatus.statuses.length}
                    />
                ))}
            </div>
        </div>
    );
};

// Create Status Modal
export const CreateStatusModal = ({ isOpen, onClose }) => {
    const [type, setType] = useState('text');
    const [text, setText] = useState('');
    const [backgroundColor, setBackgroundColor] = useState('#6366f1');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [caption, setCaption] = useState('');

    const { createStatus, isCreatingStatus } = StatusStore();
    const fileInputRef = useRef(null);

    const backgroundColors = [
        '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
        '#f97316', '#eab308', '#22c55e', '#06b6d4'
    ];

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setImage(reader.result);
            setImagePreview(reader.result);
            setType('image');
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async () => {
        if (type === 'text' && !text.trim()) {
            toast.error('Please enter some text');
            return;
        }
        if (type === 'image' && !image) {
            toast.error('Please select an image');
            return;
        }

        const result = await createStatus({
            type,
            text: type === 'text' ? text : undefined,
            backgroundColor: type === 'text' ? backgroundColor : undefined,
            image: type === 'image' ? image : undefined,
            caption: type === 'image' ? caption : undefined
        });

        if (result) {
            onClose();
            resetForm();
        }
    };

    const resetForm = () => {
        setText('');
        setImage(null);
        setImagePreview(null);
        setCaption('');
        setType('text');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center z-[100] sm:p-4">
            <div className="bg-base-100 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-base-300">
                    <h3 className="font-bold text-lg">Create Status</h3>
                    <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
                        <X className="size-5" />
                    </button>
                </div>

                {/* Type Tabs */}
                <div className="flex border-b border-base-300">
                    <button
                        onClick={() => setType('text')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 transition-colors
                            ${type === 'text' ? 'text-primary border-b-2 border-primary' : 'text-base-content/60'}`}
                    >
                        <Type className="size-4" />
                        Text
                    </button>
                    <button
                        onClick={() => setType('image')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 transition-colors
                            ${type === 'image' ? 'text-primary border-b-2 border-primary' : 'text-base-content/60'}`}
                    >
                        <Camera className="size-4" />
                        Photo
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 overflow-y-auto flex-1 min-h-0">
                    {type === 'text' ? (
                        <>
                            {/* Text Preview */}
                            <div
                                className="relative w-full h-[350px] sm:h-[400px] rounded-xl overflow-hidden mb-4 flex items-center justify-center p-6 shadow-inner"
                                style={{ backgroundColor }}
                            >
                                <textarea
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="Type a status..."
                                    className="bg-transparent text-white text-2xl sm:text-3xl font-bold text-center w-full h-full resize-none outline-none placeholder:text-white/60"
                                    maxLength={500}
                                />
                            </div>

                            {/* Color Picker */}
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-sm text-base-content/60">Background:</span>
                                <div className="flex gap-2">
                                    {backgroundColors.map(color => (
                                        <button
                                            key={color}
                                            onClick={() => setBackgroundColor(color)}
                                            className={`size-8 rounded-full transition-transform ${backgroundColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-base-100 scale-110' : ''
                                                }`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Image Upload */}
                            {!imagePreview ? (
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full h-[350px] sm:h-[400px] rounded-xl border-2 border-dashed border-base-300 flex flex-col items-center justify-center gap-4 hover:border-primary hover:bg-base-200 transition-colors shadow-sm"
                                >
                                    <div className="size-16 rounded-full bg-base-200/50 flex items-center justify-center">
                                        <Camera className="size-8 text-base-content/40" />
                                    </div>
                                    <span className="text-base-content/60 font-medium">Click to upload photo</span>
                                </button>
                            ) : (
                                <div className="relative w-full h-[350px] sm:h-[400px] rounded-xl overflow-hidden mb-4 bg-base-200/50 shadow-inner">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full h-full object-contain"
                                    />
                                    <button
                                        onClick={() => {
                                            setImage(null);
                                            setImagePreview(null);
                                        }}
                                        className="absolute top-3 right-3 p-2 bg-black/60 backdrop-blur-sm rounded-full text-white hover:bg-black/80 transition-colors shadow-lg"
                                    >
                                        <X className="size-4" />
                                    </button>
                                </div>
                            )}

                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageSelect}
                                accept="image/*"
                                className="hidden"
                            />

                            {imagePreview && (
                                <input
                                    type="text"
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                    placeholder="Add a caption..."
                                    className="input input-bordered w-full"
                                    maxLength={200}
                                />
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-2 p-4 border-t border-base-300 bg-base-200">
                    <button onClick={onClose} className="btn btn-ghost">
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isCreatingStatus || (type === 'text' && !text.trim()) || (type === 'image' && !image)}
                        className="btn btn-primary gap-2"
                    >
                        {isCreatingStatus ? (
                            <>
                                <Loader2 className="size-4 animate-spin" />
                                Posting...
                            </>
                        ) : (
                            <>
                                <Send className="size-4" />
                                Post Status
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Status Viewer Modal
export const StatusViewer = ({ isOpen, onClose }) => {
    const {
        selectedStatus,
        selectedStatusIndex,
        nextStatus,
        prevStatus,
        viewStatus,
        deleteStatus,
        replyToStatus,
        getStatusViewers,
        statusViewers,
        isViewerModalOpen,
        toggleViewerModal
    } = StatusStore();
    const { authUser } = AuthStore();

    const [progress, setProgress] = useState(0);
    const [reply, setReply] = useState('');
    const [isPaused, setIsPaused] = useState(false);
    const progressInterval = useRef(null);

    const currentStatus = selectedStatus?.statuses?.[selectedStatusIndex];
    const isOwn = selectedStatus?.user?._id === authUser?._id;

    useEffect(() => {
        if (!isOpen || !currentStatus || isPaused) return;

        // Mark as viewed
        if (!isOwn && !currentStatus.hasViewed) {
            viewStatus(currentStatus._id);
        }

        // Auto-progress
        setProgress(0);
        progressInterval.current = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    handleNext();
                    return 0;
                }
                return prev + 2; // 5 seconds total
            });
        }, 100);

        return () => {
            if (progressInterval.current) {
                clearInterval(progressInterval.current);
            }
        };
    }, [isOpen, currentStatus?._id, isPaused]);

    const handleNext = () => {
        if (selectedStatusIndex < selectedStatus.statuses.length - 1) {
            nextStatus();
        } else {
            onClose();
        }
    };

    const handlePrev = () => {
        if (selectedStatusIndex > 0) {
            prevStatus();
        }
    };

    const handleReply = async () => {
        if (!reply.trim()) return;
        await replyToStatus(currentStatus._id, reply);
        setReply('');
    };

    const handleDelete = async () => {
        await deleteStatus(currentStatus._id);
        if (selectedStatus.statuses.length <= 1) {
            onClose();
        }
    };

    const handleViewers = () => {
        getStatusViewers(currentStatus._id);
        toggleViewerModal();
    };

    if (!isOpen || !currentStatus) return null;

    return (
        <div
            className="fixed inset-0 bg-black z-[100] flex flex-col"
            onMouseDown={() => setIsPaused(true)}
            onMouseUp={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
        >
            {/* Progress Bars */}
            <div className="absolute top-0 left-0 right-0 z-10 flex gap-1 p-2">
                {selectedStatus.statuses.map((_, idx) => (
                    <div key={idx} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-white transition-all duration-100"
                            style={{
                                width: idx < selectedStatusIndex ? '100%'
                                    : idx === selectedStatusIndex ? `${progress}%`
                                        : '0%'
                            }}
                        />
                    </div>
                ))}
            </div>

            {/* Header */}
            <div className="absolute top-6 left-0 right-0 z-10 flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    <img
                        src={selectedStatus.user.profilePic || '/avatar.png'}
                        alt={selectedStatus.user.fullname}
                        className="size-10 rounded-full object-cover ring-2 ring-white"
                    />
                    <div>
                        <p className="text-white font-medium text-sm">
                            {isOwn ? 'My Status' : selectedStatus.user.fullname}
                        </p>
                        <p className="text-white/60 text-xs">
                            {new Date(currentStatus.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {isOwn && (
                        <>
                            <button
                                onClick={handleViewers}
                                className="p-2 rounded-full hover:bg-white/20 text-white"
                            >
                                <Eye className="size-5" />
                            </button>
                            <button
                                onClick={handleDelete}
                                className="p-2 rounded-full hover:bg-white/20 text-white"
                            >
                                <Trash2 className="size-5" />
                            </button>
                        </>
                    )}
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-white/20 text-white">
                        <X className="size-6" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex items-center justify-center relative">
                {/* Navigation */}
                <button
                    onClick={handlePrev}
                    className="absolute left-2 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 z-10"
                    disabled={selectedStatusIndex === 0}
                >
                    <ChevronLeft className="size-6" />
                </button>

                {currentStatus.type === 'text' ? (
                    <div
                        className="w-full h-full flex items-center justify-center p-8"
                        style={{ backgroundColor: currentStatus.backgroundColor }}
                    >
                        <p className="text-white text-2xl sm:text-4xl font-medium text-center">
                            {currentStatus.text}
                        </p>
                    </div>
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <img
                            src={currentStatus.image}
                            alt="Status"
                            className="max-w-full max-h-full object-contain"
                        />
                        {currentStatus.caption && (
                            <div className="absolute bottom-24 left-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-3 text-white text-center">
                                {currentStatus.caption}
                            </div>
                        )}
                    </div>
                )}

                <button
                    onClick={handleNext}
                    className="absolute right-2 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 z-10"
                >
                    <ChevronRight className="size-6" />
                </button>
            </div>

            {/* Reply (for others' status) */}
            {!isOwn && (
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={reply}
                            onChange={(e) => setReply(e.target.value)}
                            placeholder="Reply to status..."
                            className="flex-1 bg-white/20 backdrop-blur-sm text-white placeholder:text-white/60 rounded-full px-4 py-2 outline-none"
                            onKeyPress={(e) => e.key === 'Enter' && handleReply()}
                        />
                        <button
                            onClick={handleReply}
                            disabled={!reply.trim()}
                            className="p-3 rounded-full bg-primary text-primary-content disabled:opacity-50"
                        >
                            <Send className="size-5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Viewers (for own status) */}
            {isOwn && (
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                    <button
                        onClick={handleViewers}
                        className="flex items-center gap-2 text-white/80 hover:text-white"
                    >
                        <Eye className="size-5" />
                        <span>{currentStatus.viewers?.length || 0} views</span>
                    </button>
                </div>
            )}

            {/* Viewers Modal */}
            {isViewerModalOpen && (
                <div className="absolute inset-x-0 bottom-0 bg-base-100 rounded-t-2xl max-h-[60vh] overflow-hidden animate-in slide-in-from-bottom duration-300">
                    <div className="p-4 border-b border-base-300 flex items-center justify-between">
                        <h3 className="font-bold">Viewed by</h3>
                        <button onClick={toggleViewerModal} className="btn btn-ghost btn-sm btn-circle">
                            <X className="size-5" />
                        </button>
                    </div>
                    <div className="p-4 space-y-3 overflow-y-auto max-h-[50vh]">
                        {statusViewers.length === 0 ? (
                            <p className="text-center text-base-content/60 py-8">No views yet</p>
                        ) : (
                            statusViewers.map(viewer => (
                                <div key={viewer.userId._id} className="flex items-center gap-3">
                                    <img
                                        src={viewer.userId.profilePic || '/avatar.png'}
                                        alt={viewer.userId.fullname}
                                        className="size-10 rounded-full object-cover"
                                    />
                                    <div className="flex-1">
                                        <p className="font-medium">{viewer.userId.fullname}</p>
                                        <p className="text-xs text-base-content/60">
                                            {new Date(viewer.viewedAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StatusViewer;
