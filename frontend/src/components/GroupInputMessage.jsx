import React, { useRef, useState, useEffect } from "react";
import { GroupStore } from "../store/GroupStore";
import { Image, Send, X, Smile } from "lucide-react";
import toast from "./CustomToast";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";

const GroupInputMessage = () => {
    const [text, setText] = useState("");
    const [previewImage, setPreviewImage] = useState(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const fileInputRef = useRef(null);
    const emojiPickerRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const { sendGroupMessage, selectedGroup, emitGroupTyping, emitGroupStopTyping } = GroupStore();

    // Close emoji picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                emojiPickerRef.current &&
                !emojiPickerRef.current.contains(event.target)
            ) {
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Clean up typing timeout on unmount
    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image");
            return;
        }

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image size should be less than 5MB");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewImage(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setPreviewImage(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleEmojiSelect = (emoji) => {
        setText((prev) => prev + emoji.native);
        setShowEmojiPicker(false);
    };

    const handleTextChange = (e) => {
        setText(e.target.value);

        // Handle typing indicator
        if (selectedGroup) {
            emitGroupTyping(selectedGroup._id);

            // Clear existing timeout
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            // Set timeout to stop typing after 2 seconds
            typingTimeoutRef.current = setTimeout(() => {
                emitGroupStopTyping(selectedGroup._id);
            }, 2000);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!text.trim() && !previewImage) return;

        try {
            // Stop typing indicator
            if (selectedGroup) {
                emitGroupStopTyping(selectedGroup._id);
            }

            await sendGroupMessage(selectedGroup._id, {
                text: text.trim(),
                image: previewImage,
            });

            setText("");
            setPreviewImage(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (error) {
            console.error("Failed to send the message", error);
        }
    };

    return (
        <div className="p-3 sm:p-4 w-full relative border-t border-base-300 bg-base-100 flex-shrink-0">
            {/* Image Preview */}
            {previewImage && (
                <div className="mb-3 flex items-center gap-2">
                    <div className="relative group">
                        <img
                            src={previewImage}
                            alt="Preview"
                            className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl border border-base-300 shadow-md"
                        />
                        <button
                            onClick={removeImage}
                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-error text-error-content flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                            type="button"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>
            )}

            {/* Emoji Picker */}
            {showEmojiPicker && (
                <div
                    ref={emojiPickerRef}
                    className="absolute bottom-full left-2 sm:left-4 mb-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200"
                >
                    <Picker
                        data={data}
                        onEmojiSelect={handleEmojiSelect}
                        theme="auto"
                        previewPosition="none"
                        skinTonePosition="search"
                    />
                </div>
            )}

            {/* Input & Buttons */}
            <form onSubmit={handleSendMessage} className="flex items-center gap-2 sm:gap-3">
                {/* Emoji Button */}
                <button
                    type="button"
                    className={`p-2 sm:p-2.5 rounded-full transition-colors flex-shrink-0 ${showEmojiPicker
                        ? 'bg-primary/20 text-primary'
                        : 'hover:bg-base-200 text-base-content/60'
                        }`}
                    onClick={() => setShowEmojiPicker((prev) => !prev)}
                >
                    <Smile size={20} />
                </button>

                {/* File Upload Button */}
                <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                />
                <button
                    type="button"
                    className={`p-2 sm:p-2.5 rounded-full transition-colors flex-shrink-0 ${previewImage
                        ? 'bg-primary/20 text-primary'
                        : 'hover:bg-base-200 text-base-content/60'
                        }`}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Image size={20} />
                </button>

                {/* Input Field */}
                <div className="flex-1 min-w-0">
                    <input
                        type="text"
                        className="w-full bg-base-200 rounded-full px-4 py-2.5 sm:py-3 text-sm sm:text-base outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        placeholder="Type a message..."
                        value={text}
                        onChange={handleTextChange}
                    />
                </div>

                {/* Send Button */}
                <button
                    type="submit"
                    className="p-3 rounded-full bg-primary text-primary-content hover:bg-primary-focus transition-colors disabled:opacity-50 flex-shrink-0"
                    disabled={!text.trim() && !previewImage}
                >
                    <Send size={20} />
                </button>
            </form>
        </div>
    );
};

export default GroupInputMessage;
