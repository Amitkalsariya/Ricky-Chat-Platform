import mongoose from "mongoose";

const reactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    emoji: {
        type: String,
        required: true
    }
}, { _id: false, timestamps: true });

const messageSchema = new mongoose.Schema({
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
    text: {
        type: String,
    },
    image: {
        type: String,
    },
    // Voice message support
    voiceNote: {
        url: String,
        duration: Number, // in seconds
        waveform: [Number] // amplitude data for visualization
    },
    // Message reactions
    reactions: [reactionSchema],
    // Reply to message
    replyTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "messages"
    },
    // Forwarding
    isForwarded: {
        type: Boolean,
        default: false
    },
    forwardedFrom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "messages"
    },
    // Delete functionality
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedFor: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    }],
    deletedAt: Date,
    // Starred messages
    starredBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    }],
    // Disappearing messages
    expiresAt: Date,
    // Read status
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: Date,
    // Delivered status
    isDelivered: {
        type: Boolean,
        default: false
    },
    deliveredAt: Date
}, { timestamps: true });

// Index for disappearing messages cleanup
messageSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index for faster queries
messageSchema.index({ senderId: 1, receiverId: 1 });
messageSchema.index({ starredBy: 1 });

const Message = mongoose.model('messages', messageSchema);

export default Message;
