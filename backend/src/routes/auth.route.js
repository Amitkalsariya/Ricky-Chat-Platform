import express from "express";
import { login, logout, signup, sendSignupOTP, googleAuth, forgotPassword, resetPassword, blockUser, unblockUser, getBlockedUsers } from "../controllers/auth.controller.js";
import {protectRoute} from "../middlewares/auth.middleware.js"
import { updateProfile } from "../controllers/auth.controller.js";
import { checkAuth } from "../controllers/auth.controller.js";
const router = express.Router();

router.post("/send-otp", sendSignupOTP);
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/google", googleAuth);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:resetToken", resetPassword);

router.put('/update-profile',protectRoute,updateProfile)

router.get('/check',protectRoute,checkAuth)

router.post('/block/:userId', protectRoute, blockUser)
router.post('/unblock/:userId', protectRoute, unblockUser)
router.get('/blocked-users', protectRoute, getBlockedUsers)

export default router;
