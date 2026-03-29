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

const groupMessageSchema = new mongoose.Schema(
    {
        groupId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "groups",
            required: true,
        },
        senderId: {
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
            duration: Number,
            waveform: [Number]
        },
        // Message reactions
        reactions: [reactionSchema],
        // Reply to message
        replyTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "groupmessages"
        },
        // Forwarding
        isForwarded: {
            type: Boolean,
            default: false
        },
        forwardedFrom: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "groupmessages"
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
        // Read by users
        readBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "users",
            },
        ],
        // Disappearing messages
        expiresAt: Date
    },
    { timestamps: true }
);

// TTL index for disappearing messages
groupMessageSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index for faster queries
groupMessageSchema.index({ groupId: 1, createdAt: 1 });
groupMessageSchema.index({ starredBy: 1 });

const GroupMessage = mongoose.model("groupmessages", groupMessageSchema);

export default GroupMessage;
