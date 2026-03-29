import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
} from "../controllers/notification.controller.js";

const router = express.Router();

router.get("/", protectRoute, getNotifications);
router.get("/unread-count", protectRoute, getUnreadCount);
router.put("/:notificationId/read", protectRoute, markAsRead);
router.put("/read-all", protectRoute, markAllAsRead);
router.delete("/:notificationId", protectRoute, deleteNotification);
router.delete("/", protectRoute, clearAllNotifications);

export default router;
