// import React, { useRef, useState } from "react";
// import { ChatStore } from "../store/ChatStore";
// import { Image, Send, X } from "lucide-react";
// import toast from "react-hot-toast";

// const InputOfMessage = () => {
//   const [text, setText] = useState("");
//   const [previewImage, setpreviewImage] = useState(null);
//   const fileInputRef = useRef(null);
//   const { sendMessage } = ChatStore();
//   const handleImageChange = (e) => {
//     const file=e.target.files[0]
//     if(!file.type.startsWith("image/"))
//     {
//       toast.error("Please Select an Image")
//       return  ;
//     }
//     const reader=new FileReader()
//     reader.onloadend=()=>{
//       setpreviewImage(reader.result)
//     }
//     reader.readAsDataURL(file)
//   };
//   const removeImage = () => {
//     setpreviewImage(null)
//     if(fileInputRef.current) fileInputRef.current.value=""
//   };
//   const handlesendMessage = async (e) => {
//     e.preventDefault()
//     try {
//       await sendMessage({
//         text:text.trim(),
//         image:previewImage,

//       })
//       setText("")
//       setpreviewImage(null)
//     if(fileInputRef.current) fileInputRef.current.value=""
      
//     } catch (error) {
//       console.error("Fail To Send The Message",error);
      
//     }
//   };
//   return (
//     <div className="p-4 w-full">
//       {previewImage && (
//         <div className="mb-3 flex items-center gap-2">
//           <div className="relative">
//             <img
//               src={previewImage}
//               alt="Preview"
//               className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
//             />
//             <button
//               onClick={removeImage}
//               className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
//               flex items-center justify-center"
//               type="button"
//             >
//               <X className="size-3" />
//             </button>
//           </div>
//         </div>
//       )}
//       <form onSubmit={handlesendMessage} className="flex items-center gap-2">
//         <div className="flex-1 flex gap-2">
//           <input
//             type="text"
//             className="w-full input input-bordered rounded-lg input-sm sm:input-md"
//             placeholder="Type a message..."
//             value={text}
//             onChange={(e) => setText(e.target.value)}
//           />

//           <input
//             type="file"
//             accept="image/*"
//             className="hidden"
//             ref={fileInputRef}
//             onChange={handleImageChange}
//           />
//             <button
//             type="button"
//             className={`hidden sm:flex btn btn-circle
//                      ${previewImage ? "text-emerald-500" : "text-zinc-400"}`}
//             onClick={() => fileInputRef.current?.click()}
//           >
//             <Image size={20} />
//           </button>
//         </div>

//         <button
//           type="submit"
//           className="btn btn-sm btn-circle"
//           disabled={!text.trim() && !previewImage}
//         >
//           <Send size={22} />
//         </button>
//       </form>
//     </div>
//   );
// };

// export default InputOfMessage;
import React, { useRef, useState, useEffect } from "react";
import { ChatStore } from "../store/ChatStore";
import { Image, Send, X, Smile } from "lucide-react";
import toast from "react-hot-toast";
import Picker from "@emoji-mart/react"; // Latest version of emoji-mart
import data from "@emoji-mart/data"; // Required for latest emoji-mart

const InputOfMessage = () => {
  const [text, setText] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const { sendMessage } = ChatStore();

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
    if (!file.type.startsWith("image/")) {
      toast.error("Please Select an Image");
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
    setShowEmojiPicker(false); // Close picker after selection
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    try {
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

  return (
    <div className="p-4 w-full relative">
      {/* Image Preview */}
      {previewImage && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={previewImage}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-base-300 flex items-center justify-center"
              type="button"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Emoji Picker (Latest Version & Closes on Outside Click) */}
      {showEmojiPicker && (
        <div
          ref={emojiPickerRef}
          className="absolute bottom-full left-0 mb-2 z-50 bg-white shadow-lg rounded-lg border border-gray-300 w-[320px] sm:w-[280px] xs:w-[250px]"
        >
          <Picker
            data={data}
            onEmojiSelect={handleEmojiSelect}
            theme="light"
          />
        </div>
      )}

      {/* Input & Buttons */}
      <form onSubmit={handleSendMessage} className="flex items-center gap-3">
        <div className="flex w-full gap-2 _400:flex-row flex-col">
          {/* Input Field */}
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md text-sm sm:text-base"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <div className="_400:w-auto w-full _400:gap-2 flex gap-7 relative">
            {/* Emoji Button */}
            <button
              type="button"
              className="btn btn-circle w-10 h-10 flex items-center justify-center text-zinc-500 hover:text-emerald-500"
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
              className={`btn btn-circle w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-emerald-500 ${
                previewImage ? "text-emerald-500" : "text-zinc-400"
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <Image size={20} />
            </button>

            {/* Send Button */}
            <button
              type="submit"
              className="btn btn-circle w-10 h-10 flex items-center justify-center text-zinc-500 hover:text-emerald-500"
              disabled={!text.trim() && !previewImage}
            >
              <Send size={22} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default InputOfMessage;




