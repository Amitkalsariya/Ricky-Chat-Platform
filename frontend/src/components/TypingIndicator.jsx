import React from "react";

const TypingIndicator = ({ userName }) => {
    return (
        <div className="flex items-start gap-2 animate-[fadeSlideUp_300ms_ease-out]">
            {/* Subtle glow background */}
            <div className="relative">
                <div className="bg-base-200/80 backdrop-blur-sm rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-sm border border-base-300/40">
                    <div className="flex items-center gap-2.5">
                        {/* Animated wave dots */}
                        <div className="flex items-end gap-[3px] h-4">
                            <span
                                className="w-[7px] h-[7px] rounded-full bg-primary/70"
                                style={{
                                    animation: "typingWave 1.2s ease-in-out infinite",
                                    animationDelay: "0ms",
                                }}
                            />
                            <span
                                className="w-[7px] h-[7px] rounded-full bg-primary/50"
                                style={{
                                    animation: "typingWave 1.2s ease-in-out infinite",
                                    animationDelay: "150ms",
                                }}
                            />
                            <span
                                className="w-[7px] h-[7px] rounded-full bg-primary/30"
                                style={{
                                    animation: "typingWave 1.2s ease-in-out infinite",
                                    animationDelay: "300ms",
                                }}
                            />
                        </div>
                        <span className="text-[11px] font-medium text-base-content/40 tracking-wide">
                            {userName || "User"} is typing
                        </span>
                    </div>
                </div>
            </div>

            {/* Inline keyframe styles */}
            <style>{`
                @keyframes typingWave {
                    0%, 60%, 100% {
                        transform: translateY(0) scale(1);
                        opacity: 0.4;
                    }
                    30% {
                        transform: translateY(-8px) scale(1.15);
                        opacity: 1;
                    }
                }
                @keyframes fadeSlideUp {
                    from {
                        opacity: 0;
                        transform: translateY(8px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
};

export default TypingIndicator;
