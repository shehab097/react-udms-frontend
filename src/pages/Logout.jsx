import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { removeToken } from "../services/tokenService";

const Logout = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Clear auth data
        const timer = setTimeout(() => {
          console.log("CLEAR")
          navigate("/login");
        }, 3000);
      
      removeToken();
        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="min-h-screen bg-ui-background flex flex-col font-sans text-content-primary">
            {/* Header */}
            <header className="p-8">
                <div className="flex items-center gap-2 font-rounded font-bold text-lg tracking-tight">
                    {/* Pulsing Accent Dot */}
                    <div className="w-2.5 h-2.5 rounded-full bg-ui-accent shadow-[0_0_12px_rgba(139,92,246,0.6)] animate-pulse" />
                    <span className="text-content-primary">uDMS</span>
                </div>
            </header>

            <main className="flex-1 flex items-center justify-center px-6">
                <div className="w-full max-w-sm text-center space-y-8">
                    {/* Visual Icon using ui.surface and ui.secondary */}
                    <div className="flex justify-center">
                        <div className="w-20 h-20 rounded-3xl bg-ui-surface border border-ui-accent/20 flex items-center justify-center shadow-2xl rotate-3">
                            <svg
                                className="w-10 h-10 text-ui-secondary"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="1.5"
                                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                />
                            </svg>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h1 className="text-4xl font-rounded font-bold tracking-tight bg-gradient-to-r from-ui-accent to-ui-secondary bg-clip-text text-transparent">
                            See you later
                        </h1>
                        <p className="text-content-secondary text-sm font-medium">
                            Your session has been terminated. <br />
                            Returning to login in{" "}
                            <span className="text-ui-highlight font-bold">
                                3 seconds
                            </span>
                            .
                        </p>
                    </div>

                    {/* Button using ui.accent */}
                    <button
                        onClick={() => navigate("/home")}
                        className="w-full bg-ui-accent text-white py-4 rounded-2xl font-rounded font-bold hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-ui-accent/20"
                    >
                        Login Again
                    </button>
                </div>
            </main>

            <footer className="p-8 text-center text-xs text-content-secondary/30 uppercase tracking-[0.2em] font-bold">
                Logging out ...
            </footer>
        </div>
    );
};

export default Logout;
