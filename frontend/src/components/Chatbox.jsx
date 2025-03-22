// import React, { useEffect, useRef } from 'react';
// import HeaderChat from './HeaderChat';
// import InputOfMessage from './InputOfMessage';
// import { ChatStore } from '../store/ChatStore';
// import MessageSkeleton from './skeletons/MessageSkeleton';
// import { AuthStore } from '../store/AuthStore';
// import { formatedMessageTime } from '../lib/utils';

// const Chatbox = () => {
//   const { messages, getMessages, isMessagesLoading, selectedUser,AllowToMessage,DisalllowFromMessage } = ChatStore();
//   const {authUser}=AuthStore()
//   const messageEndRef=useRef(null)
//   useEffect(() => {
//     // if (selectedUser && selectedUser._id) {
//     //   getMessages(selectedUser._id);  // Use selectedUser here
//     // }
//     getMessages(selectedUser._id)

//     AllowToMessage()
//     return ()=>DisalllowFromMessage()
//   }, [selectedUser._id, getMessages,AllowToMessage,DisalllowFromMessage]);  // Listen to selectedUser, not selectedUsers

//   useEffect(()=>{
//     if(messageEndRef.current && messages)
//     {

//       messageEndRef.current.scrollIntoView({behavior :"smooth"})
//     }
//   },[messages])

//   if (isMessagesLoading) return 
//   <div className='flex-1 flex flex-col overflow-auto'>
//       <HeaderChat />
//       <MessageSkeleton />
//       <InputOfMessage />
//   </div>;

//   return (
//     <div className="flex-1 flex flex-col overflow-auto">
//       <HeaderChat />
//       <div className='flex-1 overflow-y-auto p-4 space-y-4'>
//         {messages.map((message)=>(
//           <div
//             key={message._id}
//             className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
//             ref={messageEndRef}

//           >
//             <div className='chat-image avatar'>
//               <div className='size-10 rounded-full border'>
//                 <img 
//                 src={message.senderId === authUser._id
//                   ? authUser.profilePic || "/avatar.png"
//                   : selectedUser.profilePic || "/avatar.png"
//                 } 
//                 alt="Profile Pic" />

//               </div>

//             </div>

//             <div className='chat-header mb-1'>
//                 <time className='text-xs opacity-50 ml-1'>
//                   {formatedMessageTime(message.createdAt)}
//                 </time>
//             </div>
//             <div className="chat-bubble flex flex-col"> 
//                 {message.image && (
//                   <img src={message.image} alt="Attachment"
//                   className='sm:mx-w-[200px] rounded-md mb-2' 
//                   />
//                 )}
//                 {message.text && <p>{message.text}</p>}

//             </div>
//           </div>
//         ))}
        
//       </div>
//       <InputOfMessage />
//     </div>
//   );
// };

// export default Chatbox;
import React, { useEffect, useRef, useState } from "react";
import HeaderChat from "./HeaderChat";
import InputOfMessage from "./InputOfMessage";
import { ChatStore } from "../store/ChatStore";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { AuthStore } from "../store/AuthStore";
import { formatedMessageTime } from "../lib/utils";
import { X, Download } from "lucide-react";

const Chatbox = () => {
  const { messages, getMessages, isMessagesLoading, selectedUser, AllowToMessage, DisalllowFromMessage } = ChatStore();
  const { authUser } = AuthStore();
  const messageEndRef = useRef(null);

  // State for fullscreen image modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");

  useEffect(() => {
    getMessages(selectedUser._id);
    AllowToMessage();
    return () => DisalllowFromMessage();
  }, [selectedUser._id, getMessages, AllowToMessage, DisalllowFromMessage]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

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

  if (isMessagesLoading)
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <HeaderChat />
        <MessageSkeleton />
        <InputOfMessage />
      </div>
    );

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <HeaderChat />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
       <div className="flex items-center justify-center h-full px-4 text-center">
       <p className="text-base sm:text-lg md:text-xl text-gray-400 font-semibold animate-pulse leading-snug max-w-xs sm:max-w-sm">
         Start a conversation with a message!
       </p>
     </div>
     
        ) : (
          messages.map((message) => (
            <div
              key={message._id}
              className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
              ref={messageEndRef}
            >
              <div className="flex flex-col gap-2">
                <div className={`chat-header mb-1 flex ${message.senderId === authUser._id ? "flex-row-reverse" : "flex-row"} items-center gap-2`}>
                  <div className="chat-image avatar">
                    <div className="size-10 rounded-full border">
                      <img
                        src={message.senderId === authUser._id ? authUser.profilePic || "/avatar.png" : selectedUser.profilePic || "/avatar.png"}
                        alt="Profile Pic"
                      />
                    </div>
                  </div>
                  <time className="text-xs opacity-50 ml-1">{formatedMessageTime(message.createdAt)}</time>
                </div>

                {/* IMAGE MESSAGE */}
                {message.image && (
                  <div>
                    <img
                      src={message.image}
                      alt="Attachment"
                      className="max-w-[130px] sm:max-w-[200px] w-full object-contain mb-2 cursor-pointer rounded-2xl border-none"
                      onClick={() => openImageModal(message.image)}
                    />
                  </div>
                )}

                {/* TEXT WITH IMAGE */}
                {message.text && message.image && (
                  <div className="chat-bubble flex flex-col w-auto text-white">
                    <p>{message.text}</p>
                  </div>
                )}

                {/* TEXT MESSAGE */}
                {message.text && !message.image && (
                  <div className="chat-bubble flex flex-col w-auto text-white">
                    <p>{message.text}</p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      <InputOfMessage />

      {/* Fullscreen Image Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
          <div className="relative max-w-full max-h-full">
            <img src={selectedImage} alt="Fullscreen" className="max-w-full max-h-screen object-contain rounded-md" />
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 text-white text-3xl font-bold bg-gray-800 bg-opacity-50 px-2 py-1 rounded-full cursor-pointer hover:bg-gray-600 transition"
            >
              <X />
            </button>
            <button
              onClick={handleDownloadImage}
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-full cursor-pointer"
            >
              <Download />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbox;

