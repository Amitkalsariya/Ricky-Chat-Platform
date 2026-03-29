import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import {
    getMessages,
    getUserForSidebar,
    sendMessages,
    addReaction,
    deleteMessage,
    toggleStarMessage,
    getStarredMessages,
    forwardMessage,
    searchMessages,
    getMediaGallery,
    markAsRead,
    markAllAsRead
} from "../controllers/message.controller.js";

const router = express.Router();

// User routes
router.get('/users', protectRoute, getUserForSidebar);

// Message routes
router.get('/search', protectRoute, searchMessages);
router.get('/starred', protectRoute, getStarredMessages);
router.get('/:id', protectRoute, getMessages);
router.post('/send/:id', protectRoute, sendMessages);

// Media gallery
router.get('/gallery/:userId', protectRoute, getMediaGallery);

// Reaction routes
router.post('/:messageId/react', protectRoute, addReaction);

// Delete message
router.delete('/:messageId', protectRoute, deleteMessage);

// Star/Unstar message
router.post('/:messageId/star', protectRoute, toggleStarMessage);

// Forward message
router.post('/:messageId/forward', protectRoute, forwardMessage);

// Read receipts
router.post('/:messageId/read', protectRoute, markAsRead);
router.post('/read-all/:userId', protectRoute, markAllAsRead);

export default router;