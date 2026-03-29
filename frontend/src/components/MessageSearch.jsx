import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, MessageSquare, Image, Mic } from 'lucide-react';
import { ChatStore } from '../store/ChatStore';
import { ChatRequestStore } from '../store/ChatRequestStore';
import { formatedMessageTime } from '../lib/utils';

const MessageSearch = ({ isOpen, onClose, userId = null }) => {
    const [query, setQuery] = useState('');
    const { searchMessages, searchResults, isSearching, clearSearch, setSelectedUser } = ChatStore();
    const { acceptedContacts } = ChatRequestStore();
    const inputRef = useRef(null);
    const debounceRef = useRef(null);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
        return () => {
            clearSearch();
        };
    }, [isOpen, clearSearch]);

    const handleSearch = (value) => {
        setQuery(value);

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        if (value.trim().length >= 2) {
            debounceRef.current = setTimeout(() => {
                searchMessages(value, userId);
            }, 300);
        } else {
            clearSearch();
        }
    };

    const handleResultClick = (message) => {
        // Find the user to chat with
        const chatUserId = message.senderId._id === userId ? message.receiverId._id : message.senderId._id;
        const user = acceptedContacts.find(u => u._id === chatUserId) || message.senderId || message.receiverId;

        setSelectedUser(user);
        onClose();

        // TODO: Scroll to the specific message
    };

    const getMessageIcon = (message) => {
        if (message.image) return <Image className="size-4 text-primary" />;
        if (message.voiceNote) return <Mic className="size-4 text-secondary" />;
        return <MessageSquare className="size-4 text-base-content/50" />;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 p-0 sm:p-4 sm:pt-20">
            <div className="bg-base-100 sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl h-full sm:h-auto overflow-hidden animate-in fade-in sm:slide-in-from-top duration-300 flex flex-col">
                {/* Search Header */}
                <div className="flex items-center gap-3 p-4 border-b border-base-300 bg-base-200">
                    <Search className="size-5 text-base-content/50" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder={userId ? "Search in this chat..." : "Search all messages..."}
                        className="flex-1 bg-transparent outline-none text-lg"
                    />
                    {query && (
                        <button
                            onClick={() => {
                                setQuery('');
                                clearSearch();
                            }}
                            className="p-1 rounded-full hover:bg-base-300"
                        >
                            <X className="size-5 text-base-content/50" />
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="btn btn-ghost btn-sm"
                    >
                        Cancel
                    </button>
                </div>

                {/* Results */}
                <div className="flex-1 sm:max-h-[60vh] overflow-y-auto min-h-0">
                    {isSearching ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="size-8 animate-spin text-primary" />
                        </div>
                    ) : query.length < 2 ? (
                        <div className="text-center py-12 text-base-content/50">
                            <Search className="size-12 mx-auto mb-3 opacity-50" />
                            <p>Type at least 2 characters to search</p>
                        </div>
                    ) : searchResults.length === 0 ? (
                        <div className="text-center py-12 text-base-content/50">
                            <MessageSquare className="size-12 mx-auto mb-3 opacity-50" />
                            <p>No messages found for "{query}"</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-base-200">
                            {searchResults.map(message => (
                                <button
                                    key={message._id}
                                    onClick={() => handleResultClick(message)}
                                    className="w-full flex items-start gap-3 p-4 hover:bg-base-200 transition-colors text-left"
                                >
                                    <img
                                        src={message.senderId?.profilePic || '/avatar.png'}
                                        alt=""
                                        className="size-10 rounded-full object-cover flex-shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <span className="font-medium truncate">
                                                {message.senderId?.fullname}
                                            </span>
                                            <span className="text-xs text-base-content/50 flex-shrink-0">
                                                {formatedMessageTime(message.createdAt)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {getMessageIcon(message)}
                                            <p className="text-sm text-base-content/70 truncate">
                                                {highlightMatch(message.text || 'Media', query)}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {searchResults.length > 0 && (
                    <div className="p-3 bg-base-200 border-t border-base-300 text-center text-sm text-base-content/60">
                        Found {searchResults.length} message{searchResults.length !== 1 ? 's' : ''}
                    </div>
                )}
            </div>
        </div>
    );
};

// Helper function to highlight matching text
const highlightMatch = (text, query) => {
    if (!text || !query) return text;

    const parts = text.split(new RegExp(`(${query})`, 'gi'));

    return parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
            <span key={i} className="bg-primary/30 text-primary font-medium rounded px-0.5">
                {part}
            </span>
        ) : part
    );
};

export default MessageSearch;
