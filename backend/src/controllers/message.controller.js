import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId ,io} from "../lib/socket.js";
export const getUserForSidebar = async (req, res) => {
  try {
    const loggedInuserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInuserId },
    }).select("-password");
    res.status(200).json(filteredUsers)
  } catch (error) {
    console.log("Error In Get User in Side Bar controller", error.message);
    res.status(500).json({
      message: "Something Went Wrong As an Internal Error",
    });
  }
};
export const getMessages=async (req,res)=>{
  try {
        const {id:userToChatId} = req.params
        const myId=req.user._id
        const messages=await Message.find({
          $or:[
            {senderId:myId,receiverId:userToChatId},
            {senderId:userToChatId,receiverId:myId}
          ]
        })
        res.status(200).json(messages)
  } catch (error) {
    console.log("Error In getMessages controller", error.message);
    res.status(500).json({
      message: "Something Went Wrong As an Internal Error",
    });
  }
}

export const sendMessages=async(req,res)=>{
try {
  const {text,image}=req.body
  const {id :receiverId}=req.params
  const senderId=req.user._id
  let imageUrl
  if(image)
  {
    const uploadImages=await cloudinary.uploader.upload(image)
    imageUrl=uploadImages.secure_url
  }
  else{
    imageUrl = image;
  }

  const newMessage=new Message({
    senderId,receiverId,text,image:imageUrl
  })
  await newMessage.save()

  // Real time Functionality Goes Here
  const receiverSocketId=getReceiverSocketId(receiverId)
  if(receiverSocketId)
  {
    io.to(receiverSocketId).emit("newMessage",newMessage)
  }
  res.status(200).json(newMessage)
} catch (error) {
  console.log("Error In sendMessages controller", error.message);
  res.status(500).json({
    message: "Something Went Wrong As an Internal Error",
  });
}
}
