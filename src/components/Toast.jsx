import React, { useEffect } from "react";

const Toast = ({ message, type = "error", onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);

        return () => clearTimeout(timer);
    }, [onClose]);

    // Color logic based on type
    const styles = {
        error: "border-red-500/50 bg-red-500/10 text-red-200",
        success: "border-ui-accent/50 bg-ui-accent/10 text-ui-highlight",
        warn: "border-yellow-500/50 bg-yellow-500/10 text-yellow-200",
    };

    return (
        <div
            className={`fixed top-6 right-6 z-[9999] flex items-center gap-3 px-6 py-4 rounded-2xl border backdrop-blur-md shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 ${styles[type] || styles.error}`}
        >
            <div className="shrink-0 w-2 h-2 rounded-full bg-current animate-pulse" />
            <p className="text-[11px] font-mono font-bold tracking-widest uppercase italic">
                {message || "SYSTEM_ERROR_DETECTED"}
            </p>
            <button
                onClick={onClose}
                className="ml-4 opacity-40 hover:opacity-100 transition-opacity text-xs"
            >
                ✕
            </button>
        </div>
    );
};

export default Toast;
