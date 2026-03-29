import ChatRequest from "../models/chatRequest.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

// ───────────────────────────────────────────
//  SEND CHAT REQUEST
// ───────────────────────────────────────────
export const sendChatRequest = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { receiverId } = req.body;

    if (!receiverId) {
      return res.status(400).json({ message: "Receiver ID is required" });
    }

    if (senderId.toString() === receiverId.toString()) {
      return res.status(400).json({ message: "Cannot send request to yourself" });
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if sender is blocked by receiver
    if (receiver.blockedUsers?.includes(senderId)) {
      return res.status(403).json({ message: "Cannot send request to this user" });
    }

    // Check if there's an existing request in either direction
    const existingRequest = await ChatRequest.findOne({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    });

    if (existingRequest) {
      if (existingRequest.status === "accepted") {
        return res.status(400).json({ message: "You are already connected" });
      }
      if (existingRequest.status === "pending") {
        // If receiver already sent a request to sender, auto-accept
        if (existingRequest.senderId.toString() === receiverId.toString()) {
          existingRequest.status = "accepted";
          await existingRequest.save();

          // Notify both users
          const senderSocketId = getReceiverSocketId(senderId);
          const receiverSocketId = getReceiverSocketId(receiverId);

          if (senderSocketId) {
            io.to(senderSocketId).emit("chatRequestAccepted", {
              requestId: existingRequest._id,
              userId: receiverId,
            });
          }
          if (receiverSocketId) {
            io.to(receiverSocketId).emit("chatRequestAccepted", {
              requestId: existingRequest._id,
              userId: senderId,
            });
          }

          return res.status(200).json({
            message: "Request auto-accepted! You can now chat.",
            request: existingRequest,
            autoAccepted: true,
          });
        }
        return res.status(400).json({ message: "Request already pending" });
      }
      if (existingRequest.status === "rejected") {
        // Allow resending after rejection
        existingRequest.status = "pending";
        existingRequest.senderId = senderId;
        existingRequest.receiverId = receiverId;
        await existingRequest.save();

        // Send real-time notification
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("chatRequestReceived", {
            request: existingRequest,
            sender: req.user,
          });
        }

        // Create notification
        const notification = new Notification({
          userId: receiverId,
          type: "chat_request",
          title: `${req.user.fullname} sent you a chat request`,
          message: "Tap to view and respond",
          senderId: senderId,
        });
        await notification.save();

        if (receiverSocketId) {
          io.to(receiverSocketId).emit("newNotification", {
            ...notification.toObject(),
            sender: req.user,
          });
        }

        return res.status(200).json({
          message: "Chat request sent",
          request: existingRequest,
        });
      }
    }

    // Create new request
    const newRequest = new ChatRequest({ senderId, receiverId });
    await newRequest.save();

    // Send real-time notification
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("chatRequestReceived", {
        request: newRequest,
        sender: req.user,
      });
    }

    // Create notification
    const notification = new Notification({
      userId: receiverId,
      type: "chat_request",
      title: `${req.user.fullname} sent you a chat request`,
      message: "Tap to view and respond",
      senderId: senderId,
    });
    await notification.save();

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newNotification", {
        ...notification.toObject(),
        sender: req.user,
      });
    }

    res.status(201).json({ message: "Chat request sent", request: newRequest });
  } catch (error) {
    console.log("Error in sendChatRequest:", error.message);
    if (error.code === 11000) {
      return res.status(400).json({ message: "Request already exists" });
    }
    res.status(500).json({ message: "Something went wrong" });
  }
};

// ───────────────────────────────────────────
//  GET INCOMING REQUESTS
// ───────────────────────────────────────────
export const getIncomingRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const requests = await ChatRequest.find({
      receiverId: userId,
      status: "pending",
    })
      .populate("senderId", "fullname profilePic email about isOnline lastSeen")
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    console.log("Error in getIncomingRequests:", error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// ───────────────────────────────────────────
//  GET OUTGOING REQUESTS
// ───────────────────────────────────────────
export const getOutgoingRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const requests = await ChatRequest.find({
      senderId: userId,
      status: "pending",
    })
      .populate("receiverId", "fullname profilePic email about isOnline lastSeen")
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    console.log("Error in getOutgoingRequests:", error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// ───────────────────────────────────────────
//  ACCEPT CHAT REQUEST
// ───────────────────────────────────────────
export const acceptChatRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const request = await ChatRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.receiverId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ message: `Request already ${request.status}` });
    }

    request.status = "accepted";
    await request.save();

    // Notify the sender
    const senderSocketId = getReceiverSocketId(request.senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("chatRequestAccepted", {
        requestId: request._id,
        userId: userId,
      });
    }

    // Create notification for sender
    const notification = new Notification({
      userId: request.senderId,
      type: "chat_request_accepted",
      title: `${req.user.fullname} accepted your chat request`,
      message: "You can now start chatting!",
      senderId: userId,
    });
    await notification.save();

    if (senderSocketId) {
      io.to(senderSocketId).emit("newNotification", {
        ...notification.toObject(),
        sender: req.user,
      });
    }

    res.status(200).json({ message: "Request accepted", request });
  } catch (error) {
    console.log("Error in acceptChatRequest:", error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// ───────────────────────────────────────────
//  REJECT CHAT REQUEST
// ───────────────────────────────────────────
export const rejectChatRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const request = await ChatRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.receiverId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    request.status = "rejected";
    await request.save();

    // Notify the sender silently (no toast for rejection)
    const senderSocketId = getReceiverSocketId(request.senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("chatRequestRejected", {
        requestId: request._id,
        userId: userId,
      });
    }

    res.status(200).json({ message: "Request rejected", request });
  } catch (error) {
    console.log("Error in rejectChatRequest:", error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// ───────────────────────────────────────────
//  GET ACCEPTED CONTACTS (Friends List)
// ───────────────────────────────────────────
export const getAcceptedContacts = async (req, res) => {
  try {
    const userId = req.user._id;

    const acceptedRequests = await ChatRequest.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
      status: "accepted",
    })
      .populate("senderId", "fullname profilePic email about isOnline lastSeen")
      .populate("receiverId", "fullname profilePic email about isOnline lastSeen");

    // Extract the other user from each request
    const contacts = acceptedRequests.map((req) => {
      const otherUser =
        req.senderId._id.toString() === userId.toString()
          ? req.receiverId
          : req.senderId;
      return otherUser;
    });

    res.status(200).json(contacts);
  } catch (error) {
    console.log("Error in getAcceptedContacts:", error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// ───────────────────────────────────────────
//  GET REQUEST STATUS WITH A USER
// ───────────────────────────────────────────
export const getRequestStatus = async (req, res) => {
  try {
    const myId = req.user._id;
    const { userId } = req.params;

    const request = await ChatRequest.findOne({
      $or: [
        { senderId: myId, receiverId: userId },
        { senderId: userId, receiverId: myId },
      ],
    });

    if (!request) {
      return res.status(200).json({ status: "none" });
    }

    res.status(200).json({
      status: request.status,
      requestId: request._id,
      isSender: request.senderId.toString() === myId.toString(),
    });
  } catch (error) {
    console.log("Error in getRequestStatus:", error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// ───────────────────────────────────────────
//  CANCEL OUTGOING REQUEST
// ───────────────────────────────────────────
export const cancelChatRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const request = await ChatRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.senderId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ message: "Can only cancel pending requests" });
    }

    await ChatRequest.findByIdAndDelete(id);

    res.status(200).json({ message: "Request cancelled" });
  } catch (error) {
    console.log("Error in cancelChatRequest:", error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// ───────────────────────────────────────────
//  REMOVE FRIEND (unfriend)
// ───────────────────────────────────────────
export const removeFriend = async (req, res) => {
  try {
    const myId = req.user._id;
    const { userId } = req.params;

    const request = await ChatRequest.findOne({
      $or: [
        { senderId: myId, receiverId: userId },
        { senderId: userId, receiverId: myId },
      ],
      status: "accepted",
    });

    if (!request) {
      return res.status(404).json({ message: "Connection not found" });
    }

    await ChatRequest.findByIdAndDelete(request._id);

    // Notify the other user
    const otherSocketId = getReceiverSocketId(userId);
    if (otherSocketId) {
      io.to(otherSocketId).emit("friendRemoved", { userId: myId });
    }

    res.status(200).json({ message: "Friend removed" });
  } catch (error) {
    console.log("Error in removeFriend:", error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// ───────────────────────────────────────────
//  SEARCH USERS (for discovery)
// ───────────────────────────────────────────
export const searchUsers = async (req, res) => {
  try {
    const myId = req.user._id;
    const { query } = req.query;

    if (!query || query.trim().length < 1) {
      return res.status(200).json([]);
    }

    // Find users matching the query (exclude self)
    const users = await User.find({
      _id: { $ne: myId },
      $or: [
        { fullname: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
    })
      .select("fullname profilePic email about isOnline lastSeen")
      .limit(20);

    // Get request statuses for each user
    const withStatus = await Promise.all(
      users.map(async (user) => {
        const request = await ChatRequest.findOne({
          $or: [
            { senderId: myId, receiverId: user._id },
            { senderId: user._id, receiverId: myId },
          ],
        });

        return {
          ...user.toObject(),
          requestStatus: request ? request.status : "none",
          requestId: request?._id || null,
          isSender: request
            ? request.senderId.toString() === myId.toString()
            : false,
        };
      })
    );

    res.status(200).json(withStatus);
  } catch (error) {
    console.log("Error in searchUsers:", error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};
