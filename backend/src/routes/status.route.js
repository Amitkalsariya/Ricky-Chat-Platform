import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import {
    createStatus,
    getAllStatuses,
    viewStatus,
    deleteStatus,
    getStatusViewers,
    replyToStatus
} from "../controllers/status.controller.js";

const router = express.Router();

// Get all statuses
router.get('/', protectRoute, getAllStatuses);

// Create new status
router.post('/', protectRoute, createStatus);

// View a status
router.post('/:statusId/view', protectRoute, viewStatus);

// Get viewers
router.get('/:statusId/viewers', protectRoute, getStatusViewers);

// Reply to status
router.post('/:statusId/reply', protectRoute, replyToStatus);

// Delete status
router.delete('/:statusId', protectRoute, deleteStatus);

export default router;
