import Status from "../models/status.model.js";
import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io, getOnlineUserIds } from "../lib/socket.js";

// Create a new status
export const createStatus = async (req, res) => {
    try {
        const { type, text, backgroundColor, fontStyle, image, caption } = req.body;
        const userId = req.user._id;

        let imageUrl;
        if (type === 'image' && image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newStatus = new Status({
            userId,
            type,
            text: type === 'text' ? text : undefined,
            backgroundColor: type === 'text' ? backgroundColor : undefined,
            fontStyle: type === 'text' ? fontStyle : undefined,
            image: imageUrl,
            caption: type === 'image' ? caption : undefined
        });

        await newStatus.save();

        // Populate user info
        const populatedStatus = await Status.findById(newStatus._id)
            .populate('userId', 'fullname profilePic');

        // Notify all online users about new status
        const onlineUsers = getOnlineUserIds();
        onlineUsers.forEach(onlineUserId => {
            if (onlineUserId !== userId.toString()) {
                const socketId = getReceiverSocketId(onlineUserId);
                if (socketId) {
                    io.to(socketId).emit('newStatus', populatedStatus);
                }
            }
        });

        res.status(201).json(populatedStatus);
    } catch (error) {
        console.log("Error in createStatus controller:", error.message);
        res.status(500).json({ message: "Something went wrong" });
    }
};

// Get all statuses (including own and others)
export const getAllStatuses = async (req, res) => {
    try {
        const userId = req.user._id;

        // Get all non-expired statuses
        const statuses = await Status.find({
            expiresAt: { $gt: new Date() }
        })
            .populate('userId', 'fullname profilePic')
            .populate('viewers.userId', 'fullname profilePic')
            .sort({ createdAt: -1 });

        // Group statuses by user
        const groupedStatuses = {};

        statuses.forEach(status => {
            const statusUserId = status.userId._id.toString();
            if (!groupedStatuses[statusUserId]) {
                groupedStatuses[statusUserId] = {
                    user: status.userId,
                    statuses: [],
                    hasUnviewed: false,
                    isOwn: statusUserId === userId.toString()
                };
            }

            // Check if current user has viewed this status
            const hasViewed = status.viewers.some(
                v => v.userId._id.toString() === userId.toString()
            );

            if (!hasViewed && statusUserId !== userId.toString()) {
                groupedStatuses[statusUserId].hasUnviewed = true;
            }

            groupedStatuses[statusUserId].statuses.push({
                ...status.toObject(),
                hasViewed
            });
        });

        // Convert to array and separate own status
        const myStatus = groupedStatuses[userId.toString()] || null;
        const otherStatuses = Object.values(groupedStatuses)
            .filter(g => !g.isOwn)
            .sort((a, b) => {
                // Unviewed first
                if (a.hasUnviewed && !b.hasUnviewed) return -1;
                if (!a.hasUnviewed && b.hasUnviewed) return 1;
                return 0;
            });

        res.status(200).json({
            myStatus,
            otherStatuses
        });
    } catch (error) {
        console.log("Error in getAllStatuses controller:", error.message);
        res.status(500).json({ message: "Something went wrong" });
    }
};

// View a status (mark as viewed)
export const viewStatus = async (req, res) => {
    try {
        const { statusId } = req.params;
        const userId = req.user._id;

        const status = await Status.findById(statusId);
        if (!status) {
            return res.status(404).json({ message: "Status not found" });
        }

        // Don't add view for own status
        if (status.userId.toString() === userId.toString()) {
            return res.status(200).json({ message: "Own status" });
        }

        // Check if already viewed
        const alreadyViewed = status.viewers.some(
            v => v.userId.toString() === userId.toString()
        );

        if (!alreadyViewed) {
            status.viewers.push({ userId, viewedAt: new Date() });
            await status.save();

            // Notify status owner about new view
            const ownerSocketId = getReceiverSocketId(status.userId.toString());
            if (ownerSocketId) {
                io.to(ownerSocketId).emit('statusViewed', {
                    statusId,
                    viewer: req.user
                });
            }
        }

        res.status(200).json({ message: "Status viewed" });
    } catch (error) {
        console.log("Error in viewStatus controller:", error.message);
        res.status(500).json({ message: "Something went wrong" });
    }
};

// Delete a status
export const deleteStatus = async (req, res) => {
    try {
        const { statusId } = req.params;
        const userId = req.user._id;

        const status = await Status.findById(statusId);
        if (!status) {
            return res.status(404).json({ message: "Status not found" });
        }

        if (status.userId.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        await Status.findByIdAndDelete(statusId);

        res.status(200).json({ message: "Status deleted successfully" });
    } catch (error) {
        console.log("Error in deleteStatus controller:", error.message);
        res.status(500).json({ message: "Something went wrong" });
    }
};

// Get status viewers
export const getStatusViewers = async (req, res) => {
    try {
        const { statusId } = req.params;
        const userId = req.user._id;

        const status = await Status.findById(statusId)
            .populate('viewers.userId', 'fullname profilePic');

        if (!status) {
            return res.status(404).json({ message: "Status not found" });
        }

        if (status.userId.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        res.status(200).json(status.viewers);
    } catch (error) {
        console.log("Error in getStatusViewers controller:", error.message);
        res.status(500).json({ message: "Something went wrong" });
    }
};

// Reply to status (creates a direct message)
export const replyToStatus = async (req, res) => {
    try {
        const { statusId } = req.params;
        const { text } = req.body;
        const senderId = req.user._id;

        const status = await Status.findById(statusId)
            .populate('userId', 'fullname profilePic');

        if (!status) {
            return res.status(404).json({ message: "Status not found" });
        }

        const Message = (await import("../models/message.model.js")).default;

        // Create a message with status reference
        const newMessage = new Message({
            senderId,
            receiverId: status.userId._id,
            text: `📸 Replied to status: ${text}`,
        });

        await newMessage.save();

        // Notify the status owner
        const receiverSocketId = getReceiverSocketId(status.userId._id.toString());
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", {
                ...newMessage.toObject(),
                isStatusReply: true,
                statusId
            });
        }

        res.status(200).json({
            message: "Reply sent",
            data: newMessage
        });
    } catch (error) {
        console.log("Error in replyToStatus controller:", error.message);
        res.status(500).json({ message: "Something went wrong" });
    }
};
