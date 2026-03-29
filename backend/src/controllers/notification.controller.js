import Notification from "../models/notification.model.js";
import { io, getReceiverSocketId } from "../lib/socket.js";

// Get all notifications for a user
export const getNotifications = async (req, res) => {
    try {
        const userId = req.user._id;

        const notifications = await Notification.find({ userId })
            .populate("senderId", "-password")
            .populate("groupId", "name groupPic")
            .sort({ createdAt: -1 })
            .limit(50);

        res.status(200).json(notifications);
    } catch (error) {
        console.log("Error in getNotifications controller:", error.message);
        res.status(500).json({ message: "Something went wrong as an internal error" });
    }
};

// Get unread notification count
export const getUnreadCount = async (req, res) => {
    try {
        const userId = req.user._id;

        const count = await Notification.countDocuments({ userId, isRead: false });

        res.status(200).json({ count });
    } catch (error) {
        console.log("Error in getUnreadCount controller:", error.message);
        res.status(500).json({ message: "Something went wrong as an internal error" });
    }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.user._id;

        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, userId },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        res.status(200).json(notification);
    } catch (error) {
        console.log("Error in markAsRead controller:", error.message);
        res.status(500).json({ message: "Something went wrong as an internal error" });
    }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user._id;

        await Notification.updateMany({ userId, isRead: false }, { isRead: true });

        res.status(200).json({ message: "All notifications marked as read" });
    } catch (error) {
        console.log("Error in markAllAsRead controller:", error.message);
        res.status(500).json({ message: "Something went wrong as an internal error" });
    }
};

// Delete a notification
export const deleteNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.user._id;

        const notification = await Notification.findOneAndDelete({
            _id: notificationId,
            userId,
        });

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        res.status(200).json({ message: "Notification deleted successfully" });
    } catch (error) {
        console.log("Error in deleteNotification controller:", error.message);
        res.status(500).json({ message: "Something went wrong as an internal error" });
    }
};

// Clear all notifications
export const clearAllNotifications = async (req, res) => {
    try {
        const userId = req.user._id;

        await Notification.deleteMany({ userId });

        res.status(200).json({ message: "All notifications cleared" });
    } catch (error) {
        console.log("Error in clearAllNotifications controller:", error.message);
        res.status(500).json({ message: "Something went wrong as an internal error" });
    }
};

// Create a notification (internal use)
export const createNotification = async (userId, type, title, message, senderId = null, groupId = null) => {
    try {
        const notification = new Notification({
            userId,
            type,
            title,
            message,
            senderId,
            groupId,
        });

        await notification.save();

        const populatedNotification = await Notification.findById(notification._id)
            .populate("senderId", "-password")
            .populate("groupId", "name groupPic");

        // Send real-time notification
        const receiverSocketId = getReceiverSocketId(userId.toString());
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newNotification", populatedNotification);
        }

        return populatedNotification;
    } catch (error) {
        console.log("Error creating notification:", error.message);
        return null;
    }
};
