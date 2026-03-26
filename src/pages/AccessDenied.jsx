import React from "react";
import { useNavigate } from "react-router-dom";

const AccessDenied = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-ui-background flex flex-col font-sans text-content-primary">
            {/* Minimal Header */}
            <header className="p-8">
                <div className="font-rounded font-bold text-lg flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-ui-secondary" />
                    uDMS
                </div>
            </header>

            <main className="flex-1 flex items-center justify-center px-6">
                <div className="max-w-md w-full text-center space-y-8">
                    {/* Simple Alert Icon */}
                    <div className="inline-block p-4 rounded-full bg-ui-secondary/10 text-ui-secondary">
                        <svg
                            className="w-12 h-12"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>

                    <div className="space-y-3">
                        <h1 className="text-3xl font-rounded font-bold text-white">
                            Access Restricted
                        </h1>
                        <p className="text-content-secondary leading-relaxed">
                            You don't have the required permissions to access
                            this department resource.
                        </p>
                    </div>

                    {/* Simple Button Group */}
                    <div className="pt-4 flex flex-col gap-3">
                        <button
                            onClick={() => navigate("/")}
                            className="w-full bg-ui-accent py-3 rounded-xl font-bold font-rounded hover:opacity-90 transition-all"
                        >
                            Return to Dashboard
                        </button>
                        <button
                            onClick={() => navigate(-1)}
                            className="w-full bg-ui-surface border border-white/5 py-3 rounded-xl font-bold font-rounded hover:bg-white/5 transition-all"
                        >
                            Go Back
                        </button>
                    </div>

                    <p className="text-[10px] text-content-secondary/40 uppercase tracking-widest font-mono">
                        Error 403: Forbidden
                    </p>
                </div>
            </main>
        </div>
    );
};

export default AccessDenied;
