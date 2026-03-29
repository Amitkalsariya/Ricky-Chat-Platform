import React from 'react';
import { Reply, X } from 'lucide-react';

const ReplyPreview = ({ message, onClear, isOwn }) => {
    if (!message) return null;

    const senderName = message.senderId?.fullname || 'Unknown';
    const isImage = message.image && !message.text;
    const isVoice = message.voiceNote?.url;

    return (
        <div className="flex items-center gap-2 p-2 bg-base-200 rounded-lg border-l-4 border-primary mb-2 animate-in slide-in-from-bottom duration-200">
            <Reply className="size-4 text-primary flex-shrink-0" />

            <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-primary truncate">
                    {isOwn ? 'You' : senderName}
                </p>
                <p className="text-sm text-base-content/70 truncate">
                    {isImage ? '📷 Photo' : isVoice ? '🎤 Voice message' : message.text}
                </p>
            </div>

            {message.image && (
                <img
                    src={message.image}
                    alt="Reply preview"
                    className="size-10 rounded object-cover flex-shrink-0"
                />
            )}

            <button
                onClick={onClear}
                className="p-1 rounded-full hover:bg-base-300 transition-colors flex-shrink-0"
            >
                <X className="size-4 text-base-content/50" />
            </button>
        </div>
    );
};

// Reply bubble shown in message
export const ReplyBubble = ({ replyTo, onClick, isOwn }) => {
    if (!replyTo) return null;

    const isImage = replyTo.image && !replyTo.text;
    const isVoice = replyTo.voiceNote?.url;

    return (
        <button
            onClick={onClick}
            className={`w-full text-left p-2 rounded-lg mb-1 border-l-2 transition-colors ${isOwn
                    ? 'bg-primary/10 border-primary-content/50 hover:bg-primary/20'
                    : 'bg-base-300/50 border-primary hover:bg-base-300'
                }`}
        >
            <p className={`text-xs font-semibold truncate ${isOwn ? 'text-primary-content/80' : 'text-primary'}`}>
                {replyTo.senderId?.fullname || 'Unknown'}
            </p>
            <div className="flex items-center gap-2">
                <p className={`text-xs truncate flex-1 ${isOwn ? 'text-primary-content/60' : 'text-base-content/60'}`}>
                    {isImage ? '📷 Photo' : isVoice ? '🎤 Voice message' : replyTo.text}
                </p>
                {replyTo.image && (
                    <img
                        src={replyTo.image}
                        alt="Reply"
                        className="size-8 rounded object-cover flex-shrink-0"
                    />
                )}
            </div>
        </button>
    );
};

export default ReplyPreview;
