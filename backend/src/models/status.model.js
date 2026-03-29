import mongoose from "mongoose";

const viewerSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    viewedAt: {
        type: Date,
        default: Date.now
    }
}, { _id: false });

const statusSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    type: {
        type: String,
        enum: ['text', 'image'],
        required: true
    },
    // For text status
    text: {
        type: String,
        maxlength: 500
    },
    backgroundColor: {
        type: String,
        default: '#6366f1' // Default gradient color
    },
    fontStyle: {
        type: String,
        enum: ['normal', 'bold', 'italic'],
        default: 'normal'
    },
    // For image status
    image: {
        type: String
    },
    caption: {
        type: String,
        maxlength: 200
    },
    // Viewers
    viewers: [viewerSchema],
    // Auto-expire after 24 hours
    expiresAt: {
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
    }
}, { timestamps: true });

// TTL index for automatic deletion
statusSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index for fetching user statuses
statusSchema.index({ userId: 1, createdAt: -1 });

const Status = mongoose.model('statuses', statusSchema);

export default Status;
