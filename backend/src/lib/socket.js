import { Server } from "socket.io";
import http from "http";
import express from "express";
import User from "../models/user.model.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
   cors: {
      origin: function (origin, callback) {
         if (!origin) return callback(null, true);
         if (
            origin.includes("localhost") ||
            origin.includes("127.0.0.1") ||
            origin.match(/^https?:\/\/\d+\.\d+\.\d+\.\d+/) ||
            origin.includes("5173")
         ) {
            return callback(null, true);
         }
         callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
   },
});

// Store user socket mappings
const userSocket = {};

// Store typing status
const typingUsers = {};

// Store last seen timestamps
const lastSeenMap = {};

export function getReceiverSocketId(userId) {
   return userSocket[userId];
}

export function getOnlineUserIds() {
   return Object.keys(userSocket);
}

io.on("connection", async (socket) => {
   console.log("User Has Been Connected ", socket.id);
   const userId = socket.handshake.query.userId;

   if (userId) {
      userSocket[userId] = socket.id;

      // Update user online status in database
      try {
         await User.findByIdAndUpdate(userId, {
            isOnline: true,
            lastSeen: new Date()
         });
      } catch (error) {
         console.log("Error updating online status:", error.message);
      }
   }

   // Emit online users to all clients
   io.emit("getOnlineUsers", Object.keys(userSocket));

   // Handle joining group rooms
   socket.on("joinGroup", (groupId) => {
      socket.join(`group_${groupId}`);
      console.log(`User ${userId} joined group ${groupId}`);
   });

   // Handle leaving group rooms
   socket.on("leaveGroup", (groupId) => {
      socket.leave(`group_${groupId}`);
      console.log(`User ${userId} left group ${groupId}`);
   });

   // Handle typing indicator for direct messages
   socket.on("typing", ({ receiverId }) => {
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
         io.to(receiverSocketId).emit("userTyping", { senderId: userId });
      }
   });

   // Handle stop typing for direct messages
   socket.on("stopTyping", ({ receiverId }) => {
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
         io.to(receiverSocketId).emit("userStoppedTyping", { senderId: userId });
      }
   });

   // Handle typing indicator for group messages
   socket.on("groupTyping", ({ groupId }) => {
      socket.to(`group_${groupId}`).emit("groupUserTyping", {
         groupId,
         senderId: userId,
      });
   });

   // Handle stop typing for group messages
   socket.on("groupStopTyping", ({ groupId }) => {
      socket.to(`group_${groupId}`).emit("groupUserStoppedTyping", {
         groupId,
         senderId: userId,
      });
   });

   // Handle message read status
   socket.on("messageRead", ({ messageId, senderId }) => {
      const senderSocketId = getReceiverSocketId(senderId);
      if (senderSocketId) {
         io.to(senderSocketId).emit("messageWasRead", { messageId, readerId: userId });
      }
   });

   // Handle message reactions in real-time
   socket.on("addReaction", ({ messageId, emoji, receiverId }) => {
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
         io.to(receiverSocketId).emit("reactionAdded", {
            messageId,
            emoji,
            userId,
         });
      }
   });

   // Handle message deletion
   socket.on("deleteMessage", ({ messageId, receiverId, deleteForEveryone }) => {
      if (deleteForEveryone) {
         const receiverSocketId = getReceiverSocketId(receiverId);
         if (receiverSocketId) {
            io.to(receiverSocketId).emit("messageDeleted", {
               messageId,
               deleteForEveryone: true,
            });
         }
      }
   });

   // Handle voice recording status
   socket.on("recordingVoice", ({ receiverId }) => {
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
         io.to(receiverSocketId).emit("userRecordingVoice", { senderId: userId });
      }
   });

   socket.on("stoppedRecordingVoice", ({ receiverId }) => {
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
         io.to(receiverSocketId).emit("userStoppedRecordingVoice", { senderId: userId });
      }
   });

   // Handle status updates
   socket.on("statusCreated", (statusData) => {
      // Broadcast to all online users
      socket.broadcast.emit("newStatus", statusData);
   });

   // Handle status view
   socket.on("viewedStatus", ({ statusId, ownerId }) => {
      const ownerSocketId = getReceiverSocketId(ownerId);
      if (ownerSocketId) {
         io.to(ownerSocketId).emit("statusViewed", {
            statusId,
            viewerId: userId,
         });
      }
   });

   // Get user's last seen
   socket.on("getLastSeen", async ({ targetUserId }) => {
      try {
         const user = await User.findById(targetUserId).select('isOnline lastSeen lastSeenPrivacy');
         if (user) {
            socket.emit("lastSeenResponse", {
               userId: targetUserId,
               isOnline: user.isOnline,
               lastSeen: user.lastSeen,
               privacy: user.lastSeenPrivacy
            });
         }
      } catch (error) {
         console.log("Error getting last seen:", error.message);
      }
   });

   // ── WebRTC Call Signaling ──

   // Initiate a call
   socket.on("callUser", async ({ to, offer, callType }) => {
      const receiverSocketId = getReceiverSocketId(to);
      if (!receiverSocketId) {
         socket.emit("callFailed", { reason: "User is offline" });
         return;
      }
      io.to(receiverSocketId).emit("incomingCall", {
         from: userId,
         offer,
         callType, // "audio" or "video"
      });
   });

   // Answer a call
   socket.on("answerCall", ({ to, answer }) => {
      const callerSocketId = getReceiverSocketId(to);
      if (callerSocketId) {
         io.to(callerSocketId).emit("callAnswered", { answer });
      }
   });

   // ICE candidate exchange
   socket.on("iceCandidate", ({ to, candidate }) => {
      const targetSocketId = getReceiverSocketId(to);
      if (targetSocketId) {
         io.to(targetSocketId).emit("iceCandidate", { candidate, from: userId });
      }
   });

   // Reject a call
   socket.on("rejectCall", ({ to }) => {
      const callerSocketId = getReceiverSocketId(to);
      if (callerSocketId) {
         io.to(callerSocketId).emit("callRejected", { by: userId });
      }
   });

   // End an ongoing call
   socket.on("endCall", ({ to }) => {
      const targetSocketId = getReceiverSocketId(to);
      if (targetSocketId) {
         io.to(targetSocketId).emit("callEnded", { by: userId });
      }
   });

   // User is busy (already in a call)
   socket.on("callBusy", ({ to }) => {
      const callerSocketId = getReceiverSocketId(to);
      if (callerSocketId) {
         io.to(callerSocketId).emit("callBusy", { by: userId });
      }
   });

   // Handle disconnect
   socket.on("disconnect", async () => {
      console.log("User Has been Disconnected", socket.id);
      delete userSocket[userId];
      io.emit("getOnlineUsers", Object.keys(userSocket));

      // Update user's last seen in database
      if (userId) {
         try {
            await User.findByIdAndUpdate(userId, {
               isOnline: false,
               lastSeen: new Date()
            });

            // Broadcast last seen update
            io.emit("userLastSeenUpdated", {
               userId,
               lastSeen: new Date()
            });
         } catch (error) {
            console.log("Error updating last seen:", error.message);
         }
      }

      // Clean up typing status
      if (typingUsers[userId]) {
         delete typingUsers[userId];
      }
   });
});

export { io, server, app };