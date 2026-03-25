import React, { useEffect, useState } from "react";

const Toast = ({ message, type = "error", onClose }) => {
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        const duration = 3000; // 3 seconds
        const intervalTime = 30; // Update every 30ms
        const step = (intervalTime / duration) * 100;

        const timer = setTimeout(() => {
            onClose();
        }, duration);

        const progressInterval = setInterval(() => {
            setProgress((prev) => Math.max(prev - step, 0));
        }, intervalTime);

        return () => {
            clearTimeout(timer);
            clearInterval(progressInterval);
        };
    }, [onClose]);

    // UI Configuration based on type
    const config = {
        error: {
            border: "border-red-500/50",
            bg: "bg-red-500/10",
            text: "text-red-200",
            bar: "bg-red-500",
            icon: "×",
            label: "SYSTEM_ALARM",
        },
        success: {
            border: "border-emerald-500/50",
            bg: "bg-emerald-500/10",
            text: "text-emerald-200",
            bar: "bg-emerald-500",
            icon: "✓",
            label: "EXECUTION_SUCCESS",
        },
        warn: {
            border: "border-amber-500/50",
            bg: "bg-amber-500/10",
            text: "text-amber-200",
            bar: "bg-amber-500",
            icon: "!",
            label: "KERNEL_WARNING",
        },
    };

    const style = config[type] || config.error;

    return (
        <div
            className={`fixed top-6 right-6 z-[9999] w-80 overflow-hidden rounded-2xl border backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 ${style.border} ${style.bg}`}
        >
            <div className="p-4 flex items-start gap-4">
                {/* Icon Circle */}
                <div
                    className={`shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black border ${style.border} ${style.text}`}
                >
                    {style.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div
                        className={`text-[9px] font-mono font-black tracking-[0.2em] uppercase opacity-60 mb-1 ${style.text}`}
                    >
                        {style.label}
                    </div>
                    <p className="text-[11px] font-medium text-white leading-relaxed break-words font-sans">
                        {message}
                    </p>
                </div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="shrink-0 text-white/30 hover:text-white transition-colors p-1"
                >
                    <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="3"
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
            </div>

            {/* Visual Progress Bar */}
            <div className="h-[2px] w-full bg-white/5">
                <div
                    className={`h-full transition-all linear ${style.bar}`}
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
};

export default Toast;
