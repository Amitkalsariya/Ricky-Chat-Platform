import React, { useState, useRef } from "react";
import { X, Users, Camera, Loader2 } from "lucide-react";
import { GroupStore } from "../store/GroupStore";
import { ChatRequestStore } from "../store/ChatRequestStore";
import toast from "./CustomToast";

const CreateGroupModal = ({ isOpen, onClose }) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [groupPic, setGroupPic] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const fileInputRef = useRef(null);

    const { createGroup, isCreatingGroup } = GroupStore();
    const { acceptedContacts } = ChatRequestStore();

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewImage(reader.result);
            setGroupPic(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const toggleMember = (userId) => {
        setSelectedMembers((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error("Group name is required");
            return;
        }

        if (selectedMembers.length === 0) {
            toast.error("Please select at least one member");
            return;
        }

        const result = await createGroup({
            name: name.trim(),
            description: description.trim(),
            members: selectedMembers,
            groupPic,
        });

        if (result) {
            resetForm();
            onClose();
        }
    };

    const resetForm = () => {
        setName("");
        setDescription("");
        setSelectedMembers([]);
        setGroupPic(null);
        setPreviewImage(null);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 sm:p-4">
            <div className="bg-base-100 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-base-300 bg-gradient-to-r from-primary/10 to-secondary/10">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <Users className="size-5 text-primary" />
                        </div>
                        <h2 className="text-xl font-bold">Create New Group</h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="btn btn-ghost btn-sm btn-circle hover:bg-base-300"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto flex-1 min-h-0">
                    {/* Group Image */}
                    <div className="flex justify-center">
                        <div className="relative group">
                            <div
                                className="size-24 rounded-full bg-base-300 flex items-center justify-center overflow-hidden cursor-pointer border-4 border-primary/30 hover:border-primary/60 transition-all duration-300"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {previewImage ? (
                                    <img
                                        src={previewImage}
                                        alt="Group"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <Users className="size-10 text-base-content/50" />
                                )}
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="size-6 text-white" />
                                </div>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                accept="image/*"
                                className="hidden"
                            />
                        </div>
                    </div>

                    {/* Group Name */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium">Group Name *</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter group name"
                            className="input input-bordered w-full focus:input-primary"
                            maxLength={50}
                        />
                    </div>

                    {/* Description */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium">Description</span>
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What's this group about?"
                            className="textarea textarea-bordered w-full resize-none focus:textarea-primary"
                            rows={2}
                            maxLength={200}
                        />
                    </div>

                    {/* Member Selection */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium">
                                Add Members ({selectedMembers.length} selected)
                            </span>
                        </label>
                        <div className="bg-base-200 rounded-xl p-3 max-h-48 overflow-y-auto space-y-2">
                            {acceptedContacts.length === 0 ? (
                                <p className="text-center text-base-content/50 py-4">No friends yet — send chat requests first</p>
                            ) : (
                                acceptedContacts.map((user) => (
                                    <label
                                        key={user._id}
                                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all duration-200 ${selectedMembers.includes(user._id)
                                            ? "bg-primary/20 border border-primary/30"
                                            : "hover:bg-base-300"
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedMembers.includes(user._id)}
                                            onChange={() => toggleMember(user._id)}
                                            className="checkbox checkbox-primary checkbox-sm"
                                        />
                                        <img
                                            src={user.profilePic || "/avatar.png"}
                                            alt={user.fullname}
                                            className="size-9 rounded-full object-cover ring-2 ring-base-300"
                                        />
                                        <span className="font-medium truncate">{user.fullname}</span>
                                    </label>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isCreatingGroup || !name.trim() || selectedMembers.length === 0}
                        className="btn btn-primary w-full gap-2"
                    >
                        {isCreatingGroup ? (
                            <>
                                <Loader2 className="size-5 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Users className="size-5" />
                                Create Group
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateGroupModal;
