import cloudinary from "../lib/cloudinary.js";
import { gnttoken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendEmail } from "../lib/mailer.js";
import {
  getResetPasswordTemplate,
  getWelcomeTemplate,
  getPasswordChangedTemplate,
  getGoogleWelcomeTemplate,
  getSignupOTPTemplate,
} from "../lib/emailTemplates.js";
import OTP from "../models/otp.model.js";

// ───────────────────────────────────────────
//  SEND SIGNUP OTP
// ───────────────────────────────────────────
export const sendSignupOTP = async (req, res) => {
  const { email, fullname } = req.body;
  try {
    if (!email || !fullname) {
      return res.status(400).json({ message: "Email and fullname are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete existing OTPs for this email to prevent spam
    await OTP.deleteMany({ email });

    const newOtp = new OTP({ email, otp });
    await newOtp.save();

    // Send OTP email
    await sendEmail(email, "Your Verification Code — Ricky Chat", getSignupOTPTemplate(otp));
    
    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.log("Error in sendSignupOTP controller:", error.message);
    res.status(500).json({ message: "Something went wrong sending OTP" });
  }
};

// ───────────────────────────────────────────
//  SIGNUP (WITH OTP VERIFICATION)
// ───────────────────────────────────────────
export const signup = async (req, res) => {
  const { fullname, email, password, otp } = req.body;
  try {
    if (!fullname || !email || !password || !otp) {
      return res.status(400).json({ message: "Please fill all the fields including OTP" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Verify OTP
    const otpRecord = await OTP.findOne({ email }).sort({ createdAt: -1 });
    if (!otpRecord) {
      return res.status(400).json({ message: "OTP expired or not found. Please resend." });
    }
    if (otpRecord.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const hashpwd = await bcrypt.hash(password, 10);
    const newUser = new User({ fullname, email, password: hashpwd });

    if (newUser) {
      gnttoken(newUser._id, res);
      await newUser.save();
      
      // Clear OTP after successful signup
      await OTP.deleteMany({ email });

      // Send welcome email (non-blocking)
      const origin = req.headers.origin || "http://localhost:5173";
      sendEmail(email, "Welcome to Ricky Chat! 🎉", getWelcomeTemplate(fullname, origin)).catch((err) =>
        console.log("Welcome email failed:", err.message)
      );

      res.status(201).json({
        _id: newUser._id,
        fullname: newUser.fullname,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller:", error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// ───────────────────────────────────────────
//  LOGIN
// ───────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const checkpwd = await bcrypt.compare(password, user.password);
    if (!checkpwd) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    gnttoken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log("Error in login controller:", error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// ───────────────────────────────────────────
//  LOGOUT
// ───────────────────────────────────────────
export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller:", error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// ───────────────────────────────────────────
//  UPDATE PROFILE
// ───────────────────────────────────────────
export const updateProfile = async (req, res) => {
  try {
    const { profilePic, fullname, about } = req.body;
    const userId = req.user._id;

    const updateData = {};

    if (profilePic) {
      const uploadResponse = await cloudinary.uploader.upload(profilePic);
      updateData.profilePic = uploadResponse.secure_url;
    }
    if (fullname) {
      updateData.fullname = fullname;
    }
    if (about !== undefined) {
      updateData.about = about;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No data to update" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    );
    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("Error in update profile:", error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// ───────────────────────────────────────────
//  CHECK AUTH
// ───────────────────────────────────────────
export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller:", error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// ───────────────────────────────────────────
//  GOOGLE AUTH (Login / Sign-up)
// ───────────────────────────────────────────
export const googleAuth = async (req, res) => {
  const { email, fullname, profilePic, googleId } = req.body;
  try {
    if (!email) {
      return res.status(400).json({ message: "Google account must have an email" });
    }

    let user = await User.findOne({ email });
    let isNewUser = false;

    if (!user) {
      // CASE B: User does not exist -> Create new user -> Save fields
      isNewUser = true;
      const randomPassword = crypto.randomBytes(16).toString("hex");
      const hashpwd = await bcrypt.hash(randomPassword, 10);
      user = new User({
        fullname,
        email,
        password: hashpwd,
        profilePic: profilePic || "",
        googleId: googleId || "",
        authType: "google"
      });
      await user.save();

      // Send Google welcome email (non-blocking)
      const origin = req.headers.origin || "http://localhost:5173";
      sendEmail(email, "Welcome to Ricky Chat! 🚀", getGoogleWelcomeTemplate(fullname, origin)).catch((err) =>
        console.log("Google welcome email failed:", err.message)
      );
    } else {
      // CASE A & Account Linking: User exists -> Log user in
      // If user signed up via email, just link googleId and keep info intact
      if (!user.googleId && googleId) {
        user.googleId = googleId;
        await user.save();
      }
    }

    gnttoken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      profilePic: user.profilePic,
      isNewUser // Helps frontend determine the toast message
    });
  } catch (error) {
    console.log("Error in google auth controller:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// ───────────────────────────────────────────
//  FORGOT PASSWORD
// ───────────────────────────────────────────
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "No account found with that email" });
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Build reset URL & send beautiful email
    const origin = req.headers.origin || "http://localhost:5173";
    const resetUrl = `${origin}/reset-password/${resetToken}`;
    const html = getResetPasswordTemplate(resetUrl, user.fullname);

    try {
      await sendEmail(user.email, "🔐 Reset Your Ricky Chat Password", html);
      res.status(200).json({ message: "Password reset link sent to your email!" });
    } catch (emailError) {
      // Rollback token if email fails
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      console.log("Email send failed:", emailError);
      return res.status(500).json({ message: "Failed to send email. Please try again." });
    }
  } catch (error) {
    console.log("Forgot password error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// ───────────────────────────────────────────
//  RESET PASSWORD
// ───────────────────────────────────────────
export const resetPassword = async (req, res) => {
  const resetPasswordToken = crypto.createHash("sha256").update(req.params.resetToken).digest("hex");

  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    if (!req.body.password || req.body.password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    user.password = await bcrypt.hash(req.body.password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Send password changed confirmation email (non-blocking)
    sendEmail(user.email, "✅ Password Changed — Ricky Chat", getPasswordChangedTemplate(user.fullname)).catch(
      (err) => console.log("Password changed email failed:", err.message)
    );

    // Auto-login after reset
    gnttoken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log("Reset password error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// ───────────────────────────────────────────
//  BLOCK USER
// ───────────────────────────────────────────
export const blockUser = async (req, res) => {
  try {
    const myId = req.user._id;
    const { userId } = req.params;

    if (myId.toString() === userId) {
      return res.status(400).json({ message: "Cannot block yourself" });
    }

    const user = await User.findById(myId);
    if (user.blockedUsers.includes(userId)) {
      return res.status(400).json({ message: "User already blocked" });
    }

    user.blockedUsers.push(userId);
    await user.save();

    res.status(200).json({ message: "User blocked successfully" });
  } catch (error) {
    console.log("Error in blockUser:", error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// ───────────────────────────────────────────
//  UNBLOCK USER
// ───────────────────────────────────────────
export const unblockUser = async (req, res) => {
  try {
    const myId = req.user._id;
    const { userId } = req.params;

    const user = await User.findById(myId);
    user.blockedUsers = user.blockedUsers.filter(
      (id) => id.toString() !== userId
    );
    await user.save();

    res.status(200).json({ message: "User unblocked successfully" });
  } catch (error) {
    console.log("Error in unblockUser:", error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// ───────────────────────────────────────────
//  GET BLOCKED USERS
// ───────────────────────────────────────────
export const getBlockedUsers = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "blockedUsers",
      "fullname profilePic email"
    );
    res.status(200).json(user.blockedUsers || []);
  } catch (error) {
    console.log("Error in getBlockedUsers:", error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};