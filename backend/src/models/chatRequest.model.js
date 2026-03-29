import mongoose from "mongoose";

const chatRequestSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Ensure one request per sender-receiver pair
chatRequestSchema.index({ senderId: 1, receiverId: 1 }, { unique: true });
// Fast lookup for incoming requests
chatRequestSchema.index({ receiverId: 1, status: 1 });

const ChatRequest = mongoose.model("chatRequests", chatRequestSchema);

export default ChatRequest;
