import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import {
    createGroup,
    getGroups,
    getGroupById,
    updateGroup,
    addMembers,
    removeMember,
    leaveGroup,
    deleteGroup,
    getGroupMessages,
    sendGroupMessage,
} from "../controllers/group.controller.js";

const router = express.Router();

// Group CRUD operations
router.post("/create", protectRoute, createGroup);
router.get("/", protectRoute, getGroups);
router.get("/:groupId", protectRoute, getGroupById);
router.put("/:groupId", protectRoute, updateGroup);
router.delete("/:groupId", protectRoute, deleteGroup);

// Member management
router.post("/:groupId/members", protectRoute, addMembers);
router.delete("/:groupId/members/:memberId", protectRoute, removeMember);
router.post("/:groupId/leave", protectRoute, leaveGroup);

// Group messages
router.get("/:groupId/messages", protectRoute, getGroupMessages);
router.post("/:groupId/messages", protectRoute, sendGroupMessage);

export default router;
