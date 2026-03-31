import React, { useEffect, useRef, useState } from "react";
import HeaderChat from "./HeaderChat";
import InputOfMessage from "./InputOfMessage";
import { ChatStore } from "../store/ChatStore";
import { ChatRequestStore } from "../store/ChatRequestStore";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { AuthStore } from "../store/AuthStore";
import { formatedMessageTime } from "../lib/utils";
import { X, Download, Star, Forward, Check, CheckCheck, ShieldBan, ShieldCheck } from "lucide-react";
import { MessageReactions, QuickReactionButton } from "./ReactionPicker";
import { MessageMenuButton } from "./MessageMenu";
import { ReplyBubble } from "./ReplyPreview";
import { VoiceMessagePlayer } from "./VoiceRecorder";

const Chatbox = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    AllowToMessage,
    DisalllowFromMessage,
    isTyping,
    addReaction,
    replyingTo,
    markAllAsRead
  } = ChatStore();
  const { unblockUser } = ChatRequestStore();
  const { authUser } = AuthStore();
  const messageEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  
  const isBlocked = authUser?.blockedUsers?.includes(selectedUser?._id);

  // State for fullscreen image modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");

  useEffect(() => {
    getMessages(selectedUser._id);
    AllowToMessage();
    markAllAsRead(selectedUser._id);
    return () => DisalllowFromMessage();
  }, [selectedUser._id, getMessages, AllowToMessage, DisalllowFromMessage, markAllAsRead]);

  useEffect(() => {
    if (messageEndRef.current && (messages || isTyping)) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setIsModalOpen(true);
  };

  const closeImageModal = () => {
    setIsModalOpen(false);
    setSelectedImage("");
  };

  const handleDownloadImage = async () => {
    try {
      const response = await fetch(selectedImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = selectedImage.split("/").pop();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  };

  const scrollToMessage = (messageId) => {
    const messageElement = document.getElementById(`message-${messageId}`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: "smooth", block: "center" });
      messageElement.classList.add("ring-2", "ring-primary", "ring-offset-2");
      setTimeout(() => {
        messageElement.classList.remove("ring-2", "ring-primary", "ring-offset-2");
      }, 2000);
    }
  };

  const handleReaction = (messageId, emoji) => {
    addReaction(messageId, emoji);
  };

  // Helper function to check if avatar should be shown (WhatsApp-style grouping)
  const shouldShowAvatar = (message, index) => {
    if (index === 0) return true;

    const prevMessage = messages[index - 1];
    const currentSenderId = message.senderId?._id || message.senderId;
    const prevSenderId = prevMessage.senderId?._id || prevMessage.senderId;

    // Show avatar if sender changed
    if (currentSenderId !== prevSenderId) return true;

    // Show avatar if more than 5 minutes gap between messages
    const currentTime = new Date(message.createdAt);
    const prevTime = new Date(prevMessage.createdAt);
    const timeDiff = (currentTime - prevTime) / 1000 / 60; // in minutes

    return timeDiff > 5;
  };

  // Helper to check if timestamp should be shown
  const shouldShowTimestamp = (message, index) => {
    if (index === messages.length - 1) return true;

    const nextMessage = messages[index + 1];
    const currentSenderId = message.senderId?._id || message.senderId;
    const nextSenderId = nextMessage.senderId?._id || nextMessage.senderId;

    // Show timestamp if sender changes next
    if (currentSenderId !== nextSenderId) return true;

    // Show timestamp if more than 5 minutes gap
    const currentTime = new Date(message.createdAt);
    const nextTime = new Date(nextMessage.createdAt);
    const timeDiff = (nextTime - currentTime) / 1000 / 60;

    return timeDiff > 5;
  };

  if (isMessagesLoading)
    return (
      <div className="flex-1 flex flex-col overflow-hidden h-full">
        <HeaderChat />
        <MessageSkeleton />
        <InputOfMessage />
      </div>
    );

  return (
    <div className="flex-1 flex flex-col overflow-hidden h-full">
      <HeaderChat />
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden p-2 sm:p-4 space-y-1"
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full px-4 text-center">
            <div className="text-center">
              <div className="size-16 sm:size-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <span className="text-3xl sm:text-4xl">👋</span>
              </div>
              <p className="text-sm sm:text-base text-gray-400 font-semibold animate-pulse leading-snug max-w-xs">
                Start a conversation with a message!
              </p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwn = message.senderId === authUser._id || message.senderId?._id === authUser._id;
            const isDeleted = message.isDeleted;
            const isStarred = message.starredBy?.includes(authUser._id);
            const showAvatar = shouldShowAvatar(message, index);
            const showTimestamp = shouldShowTimestamp(message, index);

            return (
              <div
                key={message._id}
                id={`message-${message._id}`}
                className={`flex items-end gap-2 group transition-all duration-300 ${showAvatar ? 'mt-3' : 'mt-0.5'} ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                ref={index === messages.length - 1 ? messageEndRef : null}
              >
                {/* Avatar */}
                <div className="flex-shrink-0 w-8 sm:w-10">
                  {showAvatar ? (
                    <img
                      src={isOwn ? (authUser.profilePic || "/avatar.png") : (selectedUser.profilePic || "/avatar.png")}
                      alt="Profile"
                      className="size-8 sm:size-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="size-8 sm:size-10"></div>
                  )}
                </div>

                {/* Message Content */}
                <div className={`flex flex-col max-w-[70%] sm:max-w-[60%] ${isOwn ? 'items-end' : 'items-start'}`}>
                  {/* Reply Context */}
                  {message.replyTo && !isDeleted && (
                    <ReplyBubble
                      replyTo={message.replyTo}
                      onClick={() => scrollToMessage(message.replyTo._id)}
                      isOwn={isOwn}
                    />
                  )}

                  {/* Message bubble wrapper with actions */}
                  <div className={`relative flex items-center gap-1 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Message Bubble */}
                    <div className={`relative ${isOwn ? '' : ''}`}>
                      {/* Forwarded label */}
                      {message.isForwarded && !isDeleted && (
                        <div className={`flex items-center gap-1 text-[10px] text-base-content/50 mb-0.5 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          <Forward className="size-3" />
                          <span>Forwarded</span>
                        </div>
                      )}

                      {/* Deleted Message */}
                      {isDeleted ? (
                        <div className={`px-3 py-2 rounded-2xl text-sm italic ${isOwn
                          ? 'bg-primary/20 text-primary-content/60 rounded-br-sm'
                          : 'bg-base-200 text-base-content/50 rounded-bl-sm'
                          }`}>
                          🚫 This message was deleted
                        </div>
                      ) : (
                        <>
                          {/* Voice Message */}
                          {message.voiceNote?.url && (
                            <VoiceMessagePlayer
                              voiceNote={message.voiceNote}
                              isOwn={isOwn}
                            />
                          )}

                          {/* Image Message */}
                          {message.image && (
                            <div className={`rounded-2xl overflow-hidden mb-1 ${isOwn ? 'rounded-br-sm' : 'rounded-bl-sm'
                              }`}>
                              <img
                                src={message.image}
                                alt="Attachment"
                                className="max-w-[180px] sm:max-w-[250px] w-full object-contain cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => openImageModal(message.image)}
                              />
                            </div>
                          )}

                          {/* Text Message */}
                          {message.text && !message.voiceNote?.url && (
                            <div className={`px-3 py-2 rounded-2xl text-sm sm:text-base break-words ${isOwn
                              ? `bg-primary text-primary-content ${showAvatar ? 'rounded-br-sm' : ''}`
                              : `bg-base-200 text-base-content ${showAvatar ? 'rounded-bl-sm' : ''}`
                              }`}>
                              {message.text}
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Actions (visible on hover) */}
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <QuickReactionButton
                        onReact={handleReaction}
                        messageId={message._id}
                      />
                      <MessageMenuButton
                        message={message}
                        position={isOwn ? 'left' : 'right'}
                      />
                    </div>
                  </div>

                  {/* Reactions */}
                  {message.reactions?.length > 0 && (
                    <MessageReactions
                      reactions={message.reactions}
                      onReact={handleReaction}
                      messageId={message._id}
                      currentUserId={authUser._id}
                    />
                  )}

                  {/* Timestamp and read receipt - only show for last message in group */}
                  {showTimestamp && (
                    <div className={`flex items-center gap-1 mt-0.5 ${isOwn ? 'flex-row-reverse' : ''}`}>
                      <span className="text-[10px] text-base-content/40">
                        {formatedMessageTime(message.createdAt)}
                      </span>
                      {isStarred && (
                        <Star className="size-3 text-yellow-500 fill-yellow-500" />
                      )}
                      {isOwn && !isDeleted && (
                        <>
                          {message.isRead ? (
                            <CheckCheck className="size-3.5 text-blue-500" title="Read" />
                          ) : message.isDelivered ? (
                            <CheckCheck className="size-3.5 text-base-content/40" title="Delivered" />
                          ) : (
                            <Check className="size-3.5 text-base-content/40" title="Sent" />
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-end gap-2 mt-3 animate-[fadeSlideUp_300ms_ease-out]">
            <img
              src={selectedUser.profilePic || "/avatar.png"}
              alt="Profile"
              className="size-8 sm:size-10 rounded-full object-cover flex-shrink-0"
            />
            <div className="bg-base-200/80 backdrop-blur-sm rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-sm border border-base-300/40">
              <div className="flex items-center gap-2.5">
                <div className="flex items-end gap-[3px] h-4">
                  <span className="w-[7px] h-[7px] rounded-full bg-primary/70" style={{ animation: 'typingWave 1.2s ease-in-out infinite', animationDelay: '0ms' }} />
                  <span className="w-[7px] h-[7px] rounded-full bg-primary/50" style={{ animation: 'typingWave 1.2s ease-in-out infinite', animationDelay: '150ms' }} />
                  <span className="w-[7px] h-[7px] rounded-full bg-primary/30" style={{ animation: 'typingWave 1.2s ease-in-out infinite', animationDelay: '300ms' }} />
                </div>
                <span className="text-[11px] font-medium text-base-content/40 tracking-wide">
                  {selectedUser.fullname?.split(' ')[0]} is typing
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Typing animation keyframes */}
        {isTyping && (
          <style>{`
            @keyframes typingWave {
              0%, 60%, 100% { transform: translateY(0) scale(1); opacity: 0.4; }
              30% { transform: translateY(-8px) scale(1.15); opacity: 1; }
            }
            @keyframes fadeSlideUp {
              from { opacity: 0; transform: translateY(8px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        )}
      </div>

      {/* Input or Blocked Banner */}
      {isBlocked ? (
        <div className="px-4 py-3 border-t border-base-200 bg-base-200/50 flex-shrink-0">
          <div className="flex items-center justify-center gap-3">
            <ShieldBan className="size-4 text-rose-400 flex-shrink-0" />
            <span className="text-sm text-base-content/60">You blocked this user</span>
            <button
              onClick={async () => {
                await unblockUser(selectedUser._id);
                window.location.reload();
              }}
              className="flex items-center gap-1.5 text-xs font-semibold text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-full transition-colors"
            >
              <ShieldCheck className="size-3.5" />
              Unblock
            </button>
          </div>
        </div>
      ) : (
        <InputOfMessage />
      )}

      {/* Fullscreen Image Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="relative max-w-full max-h-full">
            <img src={selectedImage} alt="Fullscreen" className="max-w-full max-h-[90vh] object-contain rounded-lg" />
            <button
              onClick={closeImageModal}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 text-white bg-black/50 backdrop-blur-sm p-2 rounded-full cursor-pointer hover:bg-black/70 transition"
            >
              <X className="size-5 sm:size-6" />
            </button>
            <button
              onClick={handleDownloadImage}
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-primary hover:bg-primary-focus px-4 sm:px-6 py-2 rounded-full cursor-pointer flex items-center gap-2 transition-colors text-sm sm:text-base"
            >
              <Download className="size-4 sm:size-5" />
              <span className="hidden sm:inline">Download</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbox;
