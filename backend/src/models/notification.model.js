import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        type: {
            type: String,
            enum: ["message", "group_invite", "group_message", "mention", "system", "chat_request", "chat_request_accepted", "reaction"],
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
        },
        groupId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "groups",
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        link: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

const Notification = mongoose.model("notifications", notificationSchema);

export default Notification;
