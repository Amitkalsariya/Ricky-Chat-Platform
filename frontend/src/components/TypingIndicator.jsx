import React from "react";

const TypingIndicator = ({ userName }) => {
    return (
        <div className="chat chat-start">
            <div className="chat-bubble bg-base-300 text-base-content py-3 px-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-base-content/70">
                        {userName || "User"} is typing
                    </span>
                    <span className="flex gap-1">
                        <span
                            className="w-2 h-2 bg-base-content/60 rounded-full animate-bounce"
                            style={{ animationDelay: "0ms" }}
                        ></span>
                        <span
                            className="w-2 h-2 bg-base-content/60 rounded-full animate-bounce"
                            style={{ animationDelay: "150ms" }}
                        ></span>
                        <span
                            className="w-2 h-2 bg-base-content/60 rounded-full animate-bounce"
                            style={{ animationDelay: "300ms" }}
                        ></span>
                    </span>
                </div>
            </div>
        </div>
    );
};

export default TypingIndicator;
