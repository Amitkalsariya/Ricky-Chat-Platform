import React, { useRef, useState, useEffect } from "react";
import { ChatStore } from "../store/ChatStore";
import { Image, Send, X, Smile, Mic, MicOff } from "lucide-react";
import toast from "./CustomToast";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import ReplyPreview from "./ReplyPreview";
import VoiceRecorder from "./VoiceRecorder";
import { AuthStore } from "../store/AuthStore";

const InputOfMessage = () => {
  const [text, setText] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const inputRef = useRef(null);

  const {
    sendMessage,
    emitTyping,
    emitStopTyping,
    replyingTo,
    clearReplyingTo,
    selectedUser
  } = ChatStore();
  const { authUser, socket } = AuthStore();

  // Focus input when reply is set
  useEffect(() => {
    if (replyingTo && inputRef.current) {
      inputRef.current.focus();
    }
  }, [replyingTo]);

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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please Select an Image");
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
    emitTyping();
  };

  const handleVoiceSend = async (voiceNote) => {
    try {
      await sendMessage({
        voiceNote
      });
      setIsRecordingVoice(false);
    } catch (error) {
      console.error("Failed to send voice message", error);
      toast.error("Failed to send voice message");
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!text.trim() && !previewImage) return;

    try {
      emitStopTyping();
      await sendMessage({
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

  // Emit voice recording status
  const handleStartRecording = () => {
    setIsRecordingVoice(true);
    if (socket) {
      socket.emit("recordingVoice", { receiverId: selectedUser._id });
    }
  };

  const handleCancelRecording = () => {
    setIsRecordingVoice(false);
    if (socket) {
      socket.emit("stoppedRecordingVoice", { receiverId: selectedUser._id });
    }
  };

  return (
    <div className="p-3 sm:p-4 w-full relative border-t border-base-300 bg-base-100 flex-shrink-0">
      {/* Reply Preview */}
      {replyingTo && (
        <ReplyPreview
          message={replyingTo}
          onClear={clearReplyingTo}
          isOwn={replyingTo.senderId === authUser._id || replyingTo.senderId?._id === authUser._id}
        />
      )}

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

      {/* Voice Recorder */}
      {isRecordingVoice ? (
        <VoiceRecorder
          onSend={handleVoiceSend}
          onCancel={handleCancelRecording}
        />
      ) : (
        <>
          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div
              ref={emojiPickerRef}
              className="fixed bottom-20 left-2 right-2 sm:absolute sm:bottom-full sm:left-2 sm:right-auto sm:mb-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200"
            >
              <Picker
                data={data}
                onEmojiSelect={handleEmojiSelect}
                theme="auto"
                previewPosition="none"
                skinTonePosition="search"
                perLine={window.innerWidth < 640 ? 7 : 9}
              />
            </div>
          )}

          {/* Input & Buttons */}
          <form onSubmit={handleSendMessage} className="flex items-center gap-2 sm:gap-3">
            {/* Emoji Button */}
            <button
              type="button"
              className={`p-2 sm:p-2.5 rounded-full transition-colors ${showEmojiPicker
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
              className={`p-2 sm:p-2.5 rounded-full transition-colors ${previewImage
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
                ref={inputRef}
                type="text"
                className="w-full bg-base-200 rounded-full px-4 py-2.5 sm:py-3 text-sm sm:text-base outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="Type a message..."
                value={text}
                onChange={handleTextChange}
              />
            </div>

            {/* Voice / Send Button */}
            {!text.trim() && !previewImage ? (
              <button
                type="button"
                onClick={handleStartRecording}
                className="p-3 rounded-full bg-primary text-primary-content hover:bg-primary-focus transition-colors"
              >
                <Mic size={20} />
              </button>
            ) : (
              <button
                type="submit"
                className="p-3 rounded-full bg-primary text-primary-content hover:bg-primary-focus transition-colors disabled:opacity-50"
                disabled={!text.trim() && !previewImage}
              >
                <Send size={20} />
              </button>
            )}
          </form>
        </>
      )}
    </div>
  );
};

export default InputOfMessage;
