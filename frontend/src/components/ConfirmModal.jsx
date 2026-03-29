import React from "react";
import { AlertTriangle, X } from "lucide-react";

const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirm Action",
    message = "Are you sure you want to proceed?",
    confirmText = "Confirm",
    cancelText = "Cancel",
    type = "danger", // "danger" | "warning" | "info"
    isLoading = false,
}) => {
    if (!isOpen) return null;

    const typeStyles = {
        danger: {
            icon: "bg-error/20 text-error",
            button: "btn-error",
        },
        warning: {
            icon: "bg-warning/20 text-warning",
            button: "btn-warning",
        },
        info: {
            icon: "bg-info/20 text-info",
            button: "btn-info",
        },
    };

    const styles = typeStyles[type] || typeStyles.danger;

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-[100] sm:p-4">
            <div
                className="bg-base-100 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md overflow-hidden animate-in fade-in zoom-in duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-base-300">
                    <div className="flex items-center gap-3">
                        <div className={`size-10 rounded-full ${styles.icon} flex items-center justify-center`}>
                            <AlertTriangle className="size-5" />
                        </div>
                        <h3 className="font-bold text-lg">{title}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="btn btn-ghost btn-sm btn-circle"
                        disabled={isLoading}
                    >
                        <X className="size-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <p className="text-base-content/80">{message}</p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-4 border-t border-base-300 bg-base-200/50">
                    <button
                        onClick={onClose}
                        className="btn btn-ghost"
                        disabled={isLoading}
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={handleConfirm}
                        className={`btn ${styles.button}`}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className="loading loading-spinner loading-sm"></span>
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
