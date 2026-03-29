import React, { useState, useRef, useCallback } from 'react';
import { Smile, ThumbsUp, Heart, Laugh, Frown, Angry } from 'lucide-react';
import { createPortal } from 'react-dom';

const REACTIONS = [
    { emoji: '👍', icon: ThumbsUp, label: 'Like', color: 'text-blue-500' },
    { emoji: '❤️', icon: Heart, label: 'Love', color: 'text-red-500' },
    { emoji: '😂', icon: Laugh, label: 'Haha', color: 'text-yellow-500' },
    { emoji: '😢', icon: Frown, label: 'Sad', color: 'text-yellow-600' },
    { emoji: '😠', icon: Angry, label: 'Angry', color: 'text-orange-500' },
];

// Portal-based reaction picker that renders outside the scrollable container
const ReactionPickerPortal = ({ onSelect, onClose, style }) => {
    return createPortal(
        <>
            <div className="fixed inset-0 z-[60]" onClick={onClose} />
            <div
                style={style}
                className="fixed z-[70] animate-in fade-in zoom-in-95 duration-150"
            >
                <div className="bg-base-100 rounded-full shadow-2xl border border-base-300 p-1.5 flex gap-1">
                    {REACTIONS.map(({ emoji, label }) => (
                        <button
                            key={emoji}
                            onClick={() => onSelect(emoji)}
                            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-base-200 hover:scale-125 transition-all duration-200 text-lg"
                            title={label}
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            </div>
        </>,
        document.body
    );
};

// Inline reaction picker (used within message reactions row — no portal needed since it's visible)
const ReactionPicker = ({ onSelect, onClose, position = 'top' }) => {
    return (
        <div
            className={`absolute ${position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'} left-0 z-50 animate-in fade-in zoom-in duration-200`}
            onMouseLeave={onClose}
        >
            <div className="bg-base-100 rounded-full shadow-xl border border-base-300 p-1.5 flex gap-1">
                {REACTIONS.map(({ emoji, label }) => (
                    <button
                        key={emoji}
                        onClick={() => onSelect(emoji)}
                        className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-base-200 hover:scale-125 transition-all duration-200 text-lg"
                        title={label}
                    >
                        {emoji}
                    </button>
                ))}
            </div>
        </div>
    );
};

// Display reactions on a message
export const MessageReactions = ({ reactions = [], onReact, messageId, currentUserId }) => {
    const [showPicker, setShowPicker] = useState(false);

    // Group reactions by emoji
    const groupedReactions = reactions.reduce((acc, r) => {
        if (!acc[r.emoji]) {
            acc[r.emoji] = { emoji: r.emoji, users: [], count: 0 };
        }
        acc[r.emoji].users.push(r.userId);
        acc[r.emoji].count++;
        return acc;
    }, {});

    const reactionList = Object.values(groupedReactions);

    return (
        <div className="relative flex flex-wrap gap-1 mt-1">
            {/* Existing reactions */}
            {reactionList.map(({ emoji, users, count }) => {
                const hasReacted = users.some(u => u._id === currentUserId || u === currentUserId);
                return (
                    <button
                        key={emoji}
                        onClick={() => onReact(messageId, emoji)}
                        className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs transition-all
                            ${hasReacted
                                ? 'bg-primary/20 border border-primary/40'
                                : 'bg-base-200 border border-base-300 hover:bg-base-300'
                            }`}
                        title={users.map(u => u.fullname || 'You').join(', ')}
                    >
                        <span>{emoji}</span>
                        <span className="font-medium">{count}</span>
                    </button>
                );
            })}

            {/* Add reaction button */}
            <div className="relative">
                <button
                    onClick={() => setShowPicker(!showPicker)}
                    className="w-6 h-6 flex items-center justify-center rounded-full bg-base-200 hover:bg-base-300 transition-colors"
                    title="Add reaction"
                >
                    <Smile className="size-3.5 text-base-content/60" />
                </button>

                {showPicker && (
                    <ReactionPicker
                        onSelect={(emoji) => {
                            onReact(messageId, emoji);
                            setShowPicker(false);
                        }}
                        onClose={() => setShowPicker(false)}
                    />
                )}
            </div>
        </div>
    );
};

// Quick reaction button for message hover — uses portal to avoid overflow
export const QuickReactionButton = ({ onReact, messageId }) => {
    const [showPicker, setShowPicker] = useState(false);
    const [pickerStyle, setPickerStyle] = useState({});
    const buttonRef = useRef(null);

    const calculatePosition = useCallback(() => {
        if (!buttonRef.current) return;

        const rect = buttonRef.current.getBoundingClientRect();
        const pickerWidth = 230; // approximate: 5 emojis × 36px + padding
        const pickerHeight = 44;
        const padding = 8;

        let top = rect.top - pickerHeight - 8;
        if (top < padding) {
            top = rect.bottom + 8;
        }

        let left = rect.left - pickerWidth / 2 + rect.width / 2;
        if (left < padding) left = padding;
        if (left + pickerWidth + padding > window.innerWidth) {
            left = window.innerWidth - pickerWidth - padding;
        }

        setPickerStyle({
            top: `${Math.round(top)}px`,
            left: `${Math.round(left)}px`,
        });
    }, []);

    const handleClick = () => {
        if (!showPicker) {
            calculatePosition();
        }
        setShowPicker(!showPicker);
    };

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                onClick={handleClick}
                className="p-1.5 rounded-full hover:bg-base-200 transition-colors opacity-0 group-hover:opacity-100"
                title="React"
            >
                <Smile className="size-4 text-base-content/60" />
            </button>

            {showPicker && (
                <ReactionPickerPortal
                    onSelect={(emoji) => {
                        onReact(messageId, emoji);
                        setShowPicker(false);
                    }}
                    onClose={() => setShowPicker(false)}
                    style={pickerStyle}
                />
            )}
        </div>
    );
};

export default ReactionPicker;
