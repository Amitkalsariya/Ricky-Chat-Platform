import Group from "../models/group.model.js";
import GroupMessage from "../models/groupMessage.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import cloudinary from "../lib/cloudinary.js";
import { io, getReceiverSocketId } from "../lib/socket.js";

// Create a new group
export const createGroup = async (req, res) => {
    try {
        const { name, description, members, groupPic } = req.body;
        const adminId = req.user._id;

        if (!name) {
            return res.status(400).json({ message: "Group name is required" });
        }

        let groupPicUrl = "";
        if (groupPic) {
            const uploadResponse = await cloudinary.uploader.upload(groupPic);
            groupPicUrl = uploadResponse.secure_url;
        }

        // Create members array including admin
        const membersList = members ? [...new Set([adminId.toString(), ...members])] : [adminId.toString()];

        const newGroup = new Group({
            name,
            description: description || "",
            groupPic: groupPicUrl,
            admin: adminId,
            members: membersList,
        });

        await newGroup.save();

        // Populate the group with member details
        const populatedGroup = await Group.findById(newGroup._id)
            .populate("admin", "-password")
            .populate("members", "-password");

        // Send notifications to all members
        for (const memberId of membersList) {
            if (memberId.toString() !== adminId.toString()) {
                const notification = new Notification({
                    userId: memberId,
                    type: "group_invite",
                    title: "Added to Group",
                    message: `You have been added to the group "${name}"`,
                    senderId: adminId,
                    groupId: newGroup._id,
                });
                await notification.save();

                // Send real-time notification
                const receiverSocketId = getReceiverSocketId(memberId);
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit("newNotification", {
                        ...notification.toObject(),
                        sender: req.user,
                    });
                }
            }
        }

        // Emit to all members that a new group has been created
        for (const memberId of membersList) {
            const receiverSocketId = getReceiverSocketId(memberId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("groupCreated", populatedGroup);
            }
        }

        res.status(201).json(populatedGroup);
    } catch (error) {
        console.log("Error in createGroup controller:", error.message);
        res.status(500).json({ message: "Something went wrong as an internal error" });
    }
};

// Get all groups for a user
export const getGroups = async (req, res) => {
    try {
        const userId = req.user._id;

        const groups = await Group.find({ members: userId })
            .populate("admin", "-password")
            .populate("members", "-password")
            .populate({
                path: "lastMessage",
                populate: {
                    path: "senderId",
                    select: "-password",
                },
            })
            .sort({ updatedAt: -1 });

        res.status(200).json(groups);
    } catch (error) {
        console.log("Error in getGroups controller:", error.message);
        res.status(500).json({ message: "Something went wrong as an internal error" });
    }
};

// Get a single group by ID
export const getGroupById = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user._id;

        const group = await Group.findById(groupId)
            .populate("admin", "-password")
            .populate("members", "-password");

        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        // Check if user is a member
        if (!group.members.some((member) => member._id.toString() === userId.toString())) {
            return res.status(403).json({ message: "You are not a member of this group" });
        }

        res.status(200).json(group);
    } catch (error) {
        console.log("Error in getGroupById controller:", error.message);
        res.status(500).json({ message: "Something went wrong as an internal error" });
    }
};

// Update group details
export const updateGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { name, description, groupPic } = req.body;
        const userId = req.user._id;

        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        // Only admin can update group
        if (group.admin.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Only admin can update the group" });
        }

        if (name) group.name = name;
        if (description !== undefined) group.description = description;

        if (groupPic) {
            const uploadResponse = await cloudinary.uploader.upload(groupPic);
            group.groupPic = uploadResponse.secure_url;
        }

        await group.save();

        const updatedGroup = await Group.findById(groupId)
            .populate("admin", "-password")
            .populate("members", "-password");

        // Notify all members about the update
        for (const member of group.members) {
            const receiverSocketId = getReceiverSocketId(member.toString());
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("groupUpdated", updatedGroup);
            }
        }

        res.status(200).json(updatedGroup);
    } catch (error) {
        console.log("Error in updateGroup controller:", error.message);
        res.status(500).json({ message: "Something went wrong as an internal error" });
    }
};

// Add members to group
export const addMembers = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { members } = req.body;
        const userId = req.user._id;

        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        // Only admin can add members
        if (group.admin.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Only admin can add members" });
        }

        // Add new members
        const newMembers = members.filter(
            (memberId) => !group.members.some((m) => m.toString() === memberId)
        );

        group.members.push(...newMembers);
        await group.save();

        const updatedGroup = await Group.findById(groupId)
            .populate("admin", "-password")
            .populate("members", "-password");

        // Send notifications to new members
        for (const memberId of newMembers) {
            const notification = new Notification({
                userId: memberId,
                type: "group_invite",
                title: "Added to Group",
                message: `You have been added to the group "${group.name}"`,
                senderId: userId,
                groupId: group._id,
            });
            await notification.save();

            const receiverSocketId = getReceiverSocketId(memberId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("newNotification", {
                    ...notification.toObject(),
                    sender: req.user,
                });
                io.to(receiverSocketId).emit("addedToGroup", updatedGroup);
            }
        }

        // Notify existing members
        for (const member of group.members) {
            const receiverSocketId = getReceiverSocketId(member.toString());
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("groupUpdated", updatedGroup);
            }
        }

        res.status(200).json(updatedGroup);
    } catch (error) {
        console.log("Error in addMembers controller:", error.message);
        res.status(500).json({ message: "Something went wrong as an internal error" });
    }
};

// Remove member from group
export const removeMember = async (req, res) => {
    try {
        const { groupId, memberId } = req.params;
        const userId = req.user._id;

        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        // Only admin can remove members (or member can remove themselves)
        if (group.admin.toString() !== userId.toString() && memberId !== userId.toString()) {
            return res.status(403).json({ message: "Not authorized to remove this member" });
        }

        // Cannot remove admin
        if (memberId === group.admin.toString()) {
            return res.status(400).json({ message: "Cannot remove the admin from the group" });
        }

        group.members = group.members.filter((m) => m.toString() !== memberId);
        await group.save();

        const updatedGroup = await Group.findById(groupId)
            .populate("admin", "-password")
            .populate("members", "-password");

        // Notify the removed member
        const removedMemberSocketId = getReceiverSocketId(memberId);
        if (removedMemberSocketId) {
            io.to(removedMemberSocketId).emit("removedFromGroup", groupId);
        }

        // Notify remaining members
        for (const member of group.members) {
            const receiverSocketId = getReceiverSocketId(member.toString());
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("groupUpdated", updatedGroup);
            }
        }

        res.status(200).json(updatedGroup);
    } catch (error) {
        console.log("Error in removeMember controller:", error.message);
        res.status(500).json({ message: "Something went wrong as an internal error" });
    }
};

// Leave group
export const leaveGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user._id;

        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        // Admin cannot leave, must delete or transfer ownership
        if (group.admin.toString() === userId.toString()) {
            return res.status(400).json({
                message: "Admin cannot leave the group. Transfer admin role or delete the group."
            });
        }

        group.members = group.members.filter((m) => m.toString() !== userId.toString());
        await group.save();

        const updatedGroup = await Group.findById(groupId)
            .populate("admin", "-password")
            .populate("members", "-password");

        // Notify remaining members
        for (const member of group.members) {
            const receiverSocketId = getReceiverSocketId(member.toString());
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("groupUpdated", updatedGroup);
            }
        }

        res.status(200).json({ message: "Left group successfully" });
    } catch (error) {
        console.log("Error in leaveGroup controller:", error.message);
        res.status(500).json({ message: "Something went wrong as an internal error" });
    }
};

// Delete group
export const deleteGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user._id;

        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        // Only admin can delete group
        if (group.admin.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Only admin can delete the group" });
        }

        const members = group.members;

        // Delete all messages in the group
        await GroupMessage.deleteMany({ groupId });

        // Delete the group
        await Group.findByIdAndDelete(groupId);

        // Notify all members
        for (const member of members) {
            const receiverSocketId = getReceiverSocketId(member.toString());
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("groupDeleted", groupId);
            }
        }

        res.status(200).json({ message: "Group deleted successfully" });
    } catch (error) {
        console.log("Error in deleteGroup controller:", error.message);
        res.status(500).json({ message: "Something went wrong as an internal error" });
    }
};

// Get group messages
export const getGroupMessages = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user._id;

        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        // Check if user is a member
        if (!group.members.some((m) => m.toString() === userId.toString())) {
            return res.status(403).json({ message: "You are not a member of this group" });
        }

        const messages = await GroupMessage.find({ groupId })
            .populate("senderId", "-password")
            .sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (error) {
        console.log("Error in getGroupMessages controller:", error.message);
        res.status(500).json({ message: "Something went wrong as an internal error" });
    }
};

// Send group message
export const sendGroupMessage = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { text, image } = req.body;
        const senderId = req.user._id;

        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        // Check if user is a member
        if (!group.members.some((m) => m.toString() === senderId.toString())) {
            return res.status(403).json({ message: "You are not a member of this group" });
        }

        let imageUrl;
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new GroupMessage({
            groupId,
            senderId,
            text,
            image: imageUrl,
            readBy: [senderId],
        });

        await newMessage.save();

        // Update group's last message
        group.lastMessage = newMessage._id;
        await group.save();

        // Populate sender info
        const populatedMessage = await GroupMessage.findById(newMessage._id).populate(
            "senderId",
            "-password"
        );

        // Send real-time message to all group members
        for (const memberId of group.members) {
            if (memberId.toString() !== senderId.toString()) {
                const receiverSocketId = getReceiverSocketId(memberId.toString());
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit("newGroupMessage", {
                        groupId,
                        message: populatedMessage,
                    });

                    // Send notification
                    const notification = new Notification({
                        userId: memberId,
                        type: "group_message",
                        title: `New message in ${group.name}`,
                        message: text ? (text.length > 50 ? text.substring(0, 50) + "..." : text) : "Sent an image",
                        senderId,
                        groupId,
                    });
                    await notification.save();

                    io.to(receiverSocketId).emit("newNotification", {
                        ...notification.toObject(),
                        sender: req.user,
                    });
                }
            }
        }

        res.status(200).json(populatedMessage);
    } catch (error) {
        console.log("Error in sendGroupMessage controller:", error.message);
        res.status(500).json({ message: "Something went wrong as an internal error" });
    }
};
