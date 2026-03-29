import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            default: "",
        },
        groupPic: {
            type: String,
            default: "",
        },
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "users",
            },
        ],
        lastMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "groupmessages",
        },
    },
    { timestamps: true }
);

const Group = mongoose.model("groups", groupSchema);

export default Group;
