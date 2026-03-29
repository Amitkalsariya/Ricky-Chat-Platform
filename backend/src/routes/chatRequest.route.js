import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import {
  sendChatRequest,
  getIncomingRequests,
  getOutgoingRequests,
  acceptChatRequest,
  rejectChatRequest,
  getAcceptedContacts,
  getRequestStatus,
  cancelChatRequest,
  removeFriend,
  searchUsers,
} from "../controllers/chatRequest.controller.js";

const router = express.Router();

router.post("/send", protectRoute, sendChatRequest);
router.get("/incoming", protectRoute, getIncomingRequests);
router.get("/outgoing", protectRoute, getOutgoingRequests);
router.get("/accepted", protectRoute, getAcceptedContacts);
router.get("/status/:userId", protectRoute, getRequestStatus);
router.get("/search-users", protectRoute, searchUsers);
router.put("/:id/accept", protectRoute, acceptChatRequest);
router.put("/:id/reject", protectRoute, rejectChatRequest);
router.delete("/:id/cancel", protectRoute, cancelChatRequest);
router.delete("/remove/:userId", protectRoute, removeFriend);

export default router;
