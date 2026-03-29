import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import ChatRequest from "../models/chatRequest.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Notification from "../models/notification.model.js";

// Get all users for sidebar
export const getUserForSidebar = async (req, res) => {
  try {
    const loggedInuserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInuserId },
    }).select("-password");
    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("Error In Get User in Side Bar controller", error.message);
    res.status(500).json({
      message: "Something Went Wrong As an Internal Error",
    });
  }
};

// Get messages between two users
export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId }
      ],
      // Don't show messages deleted for this user
      deletedFor: { $ne: myId }
    })
      .populate('replyTo', 'text image senderId')
      .populate('reactions.userId', 'fullname profilePic')
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error In getMessages controller", error.message);
    res.status(500).json({
      message: "Something Went Wrong As an Internal Error",
    });
  }
};

// Send a message
export const sendMessages = async (req, res) => {
  try {
    const { text, image, voiceNote, replyTo, isForwarded, forwardedFrom, expiresIn } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    // ── CHAT REQUEST GUARD ──
    const chatRequest = await ChatRequest.findOne({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
      status: "accepted",
    });
    if (!chatRequest) {
      return res.status(403).json({ message: "You need an accepted chat request to message this user" });
    }

    // ── BLOCK GUARD ──
    const receiver = await User.findById(receiverId);
    if (receiver?.blockedUsers?.includes(senderId)) {
      return res.status(403).json({ message: "You cannot message this user" });
    }

    let imageUrl;
    if (image) {
      const uploadImages = await cloudinary.uploader.upload(image);
      imageUrl = uploadImages.secure_url;
    }

    let voiceNoteData;
    if (voiceNote) {
      const uploadVoice = await cloudinary.uploader.upload(voiceNote.url, {
        resource_type: "video"
      });
      voiceNoteData = {
        url: uploadVoice.secure_url,
        duration: voiceNote.duration,
        waveform: voiceNote.waveform
      };
    }

    // Calculate expiry time for disappearing messages
    let expiresAt;
    if (expiresIn) {
      const durations = {
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '90d': 90 * 24 * 60 * 60 * 1000
      };
      if (durations[expiresIn]) {
        expiresAt = new Date(Date.now() + durations[expiresIn]);
      }
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      voiceNote: voiceNoteData,
      replyTo,
      isForwarded: isForwarded || false,
      forwardedFrom,
      expiresAt
    });

    await newMessage.save();

    // Populate reply message if exists
    const populatedMessage = await Message.findById(newMessage._id)
      .populate('replyTo', 'text image senderId');

    // Real time functionality
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", populatedMessage);

      // Send notification
      const notification = new Notification({
        userId: receiverId,
        type: "message",
        title: `New message from ${req.user.fullname}`,
        message: text
          ? text.length > 50 ? text.substring(0, 50) + "..." : text
          : voiceNote ? "🎤 Voice message" : "Sent an image",
        senderId: senderId,
      });
      await notification.save();

      io.to(receiverSocketId).emit("newNotification", {
        ...notification.toObject(),
        sender: req.user,
      });
    }

    res.status(200).json(populatedMessage);
  } catch (error) {
    console.log("Error In sendMessages controller", error.message);
    res.status(500).json({
      message: "Something Went Wrong As an Internal Error",
    });
  }
};

// Add reaction to message
export const addReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Check if user already reacted, update or add
    const existingReactionIndex = message.reactions.findIndex(
      r => r.userId.toString() === userId.toString()
    );

    if (existingReactionIndex > -1) {
      if (message.reactions[existingReactionIndex].emoji === emoji) {
        // Remove reaction if same emoji
        message.reactions.splice(existingReactionIndex, 1);
      } else {
        // Update emoji
        message.reactions[existingReactionIndex].emoji = emoji;
      }
    } else {
      // Add new reaction
      message.reactions.push({ userId, emoji });
    }

    await message.save();

    const updatedMessage = await Message.findById(messageId)
      .populate('reactions.userId', 'fullname profilePic')
      .populate('replyTo', 'text image senderId');

    // Notify the other user
    const otherUserId = message.senderId.toString() === userId.toString()
      ? message.receiverId
      : message.senderId;

    const receiverSocketId = getReceiverSocketId(otherUserId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageReactionUpdated", {
        messageId,
        reactions: updatedMessage.reactions
      });

      // Create reaction notification
      const reactor = await User.findById(userId).select('fullname');
      const notification = new Notification({
        userId: otherUserId,
        type: "reaction",
        title: `${reactor.fullname} reacted ${emoji} to your message`,
        message: message.text
          ? message.text.length > 40 ? message.text.substring(0, 40) + "..." : message.text
          : message.image ? "📷 Photo" : "🎤 Voice message",
        senderId: userId,
      });
      await notification.save();

      io.to(receiverSocketId).emit("newNotification", {
        ...notification.toObject(),
        sender: { _id: userId, fullname: reactor.fullname },
      });
    }

    res.status(200).json(updatedMessage);
  } catch (error) {
    console.log("Error In addReaction controller", error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Delete message
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { deleteForEveryone } = req.body;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Only sender can delete for everyone
    if (deleteForEveryone && message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only sender can delete for everyone" });
    }

    if (deleteForEveryone) {
      message.isDeleted = true;
      message.deletedAt = new Date();
      message.text = null;
      message.image = null;
      message.voiceNote = null;
      await message.save();

      // Notify receiver
      const receiverSocketId = getReceiverSocketId(message.receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("messageDeleted", {
          messageId,
          deleteForEveryone: true
        });
      }
    } else {
      // Delete for me only
      message.deletedFor.push(userId);
      await message.save();
    }

    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    console.log("Error In deleteMessage controller", error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Star/Unstar message
export const toggleStarMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    const starIndex = message.starredBy.indexOf(userId);
    if (starIndex > -1) {
      message.starredBy.splice(starIndex, 1);
    } else {
      message.starredBy.push(userId);
    }

    await message.save();

    res.status(200).json({
      starred: starIndex === -1,
      message: starIndex === -1 ? "Message starred" : "Message unstarred"
    });
  } catch (error) {
    console.log("Error In toggleStarMessage controller", error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Get all starred messages
export const getStarredMessages = async (req, res) => {
  try {
    const userId = req.user._id;

    const starredMessages = await Message.find({
      starredBy: userId,
      deletedFor: { $ne: userId }
    })
      .populate('senderId', 'fullname profilePic')
      .populate('receiverId', 'fullname profilePic')
      .populate('replyTo', 'text image senderId')
      .sort({ createdAt: -1 });

    res.status(200).json(starredMessages);
  } catch (error) {
    console.log("Error In getStarredMessages controller", error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Forward message
export const forwardMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { receiverIds } = req.body; // Array of user IDs to forward to
    const senderId = req.user._id;

    const originalMessage = await Message.findById(messageId);
    if (!originalMessage) {
      return res.status(404).json({ message: "Message not found" });
    }

    const forwardedMessages = [];

    for (const receiverId of receiverIds) {
      const forwardedMessage = new Message({
        senderId,
        receiverId,
        text: originalMessage.text,
        image: originalMessage.image,
        voiceNote: originalMessage.voiceNote,
        isForwarded: true,
        forwardedFrom: messageId
      });

      await forwardedMessage.save();
      forwardedMessages.push(forwardedMessage);

      // Send real-time message
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", forwardedMessage);
      }
    }

    res.status(200).json({
      message: "Message forwarded successfully",
      forwardedMessages
    });
  } catch (error) {
    console.log("Error In forwardMessage controller", error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Search messages
export const searchMessages = async (req, res) => {
  try {
    const { query, userId } = req.query;
    const myId = req.user._id;

    const searchFilter = {
      $and: [
        {
          $or: [
            { senderId: myId },
            { receiverId: myId }
          ]
        },
        { deletedFor: { $ne: myId } },
        { isDeleted: { $ne: true } },
        {
          $or: [
            { text: { $regex: query, $options: 'i' } }
          ]
        }
      ]
    };

    // If searching within specific chat
    if (userId) {
      searchFilter.$and.push({
        $or: [
          { senderId: myId, receiverId: userId },
          { senderId: userId, receiverId: myId }
        ]
      });
    }

    const messages = await Message.find(searchFilter)
      .populate('senderId', 'fullname profilePic')
      .populate('receiverId', 'fullname profilePic')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error In searchMessages controller", error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Get media gallery for a chat
export const getMediaGallery = async (req, res) => {
  try {
    const { userId } = req.params;
    const myId = req.user._id;

    const mediaMessages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userId },
        { senderId: userId, receiverId: myId }
      ],
      deletedFor: { $ne: myId },
      isDeleted: { $ne: true },
      $or: [
        { image: { $exists: true, $ne: null } },
        { 'voiceNote.url': { $exists: true, $ne: null } }
      ]
    })
      .select('image voiceNote createdAt senderId')
      .populate('senderId', 'fullname')
      .sort({ createdAt: -1 });

    // Categorize media
    const gallery = {
      images: mediaMessages.filter(m => m.image),
      voiceNotes: mediaMessages.filter(m => m.voiceNote?.url)
    };

    res.status(200).json(gallery);
  } catch (error) {
    console.log("Error In getMediaGallery controller", error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Mark message as read
export const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Only receiver can mark as read
    if (message.receiverId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (!message.isRead) {
      message.isRead = true;
      message.readAt = new Date();
      await message.save();

      // Notify sender
      const senderSocketId = getReceiverSocketId(message.senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit("messageRead", {
          messageId,
          readAt: message.readAt
        });
      }
    }

    res.status(200).json({ message: "Message marked as read" });
  } catch (error) {
    console.log("Error In markAsRead controller", error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Mark all messages as read in a chat
export const markAllAsRead = async (req, res) => {
  try {
    const { userId: senderId } = req.params;
    const receiverId = req.user._id;

    const result = await Message.updateMany(
      {
        senderId,
        receiverId,
        isRead: false
      },
      {
        $set: { isRead: true, readAt: new Date() }
      }
    );

    // Notify sender
    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("allMessagesRead", {
        by: receiverId
      });
    }

    res.status(200).json({
      message: "All messages marked as read",
      count: result.modifiedCount
    });
  } catch (error) {
    console.log("Error In markAllAsRead controller", error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};
