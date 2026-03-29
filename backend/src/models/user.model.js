import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    fullname: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    profilePic: {
        type: String,
        default: ""
    },
    // Online/Last Seen
    isOnline: {
        type: Boolean,
        default: false
    },
    lastSeen: {
        type: Date,
        default: Date.now
    },
    // Privacy Settings
    lastSeenPrivacy: {
        type: String,
        enum: ['everyone', 'contacts', 'nobody'],
        default: 'everyone'
    },
    onlinePrivacy: {
        type: String,
        enum: ['everyone', 'contacts', 'nobody'],
        default: 'everyone'
    },
    profilePicPrivacy: {
        type: String,
        enum: ['everyone', 'contacts', 'nobody'],
        default: 'everyone'
    },
    statusPrivacy: {
        type: String,
        enum: ['everyone', 'contacts', 'nobody'],
        default: 'everyone'
    },
    // Disappearing Messages Default
    disappearingDefault: {
        type: String,
        enum: ['off', '24h', '7d', '90d'],
        default: 'off'
    },
    // About/Bio
    about: {
        type: String,
        default: "Hey there! I am using Ricky Chat"
    },
    // Blocked Users
    blockedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    }],
    // Password Reset
    resetPasswordToken: String,
    resetPasswordExpires: Date

}, { timestamps: true });

// Update lastSeen on disconnect
userSchema.methods.updateLastSeen = function () {
    this.lastSeen = new Date();
    this.isOnline = false;
    return this.save();
};

// Set online status
userSchema.methods.setOnline = function () {
    this.isOnline = true;
    return this.save();
};

const User = mongoose.model('users', userSchema);

export default User;
