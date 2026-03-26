import React from "react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-ui-background flex flex-col font-sans text-content-primary overflow-hidden relative">
            {/* Background Decorative "Grid" for Cyber Feel */}
            <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                    backgroundImage: `radial-gradient(${"#8B5CF6"} 0.5px, transparent 0.5px)`,
                    backgroundSize: "24px 24px",
                }}
            />

            {/* Header */}
            <header className="p-8 relative z-10">
                <div className="flex items-center gap-2 font-rounded font-bold text-lg">
                    <div className="w-2 h-2 rounded-full bg-ui-secondary shadow-[0_0_10px_#EC4899]" />
                    uDMS <span className="opacity-40">/ Error</span>
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center px-6 relative z-10 text-center">
                {/* Large Glitchy 404 Text */}
                <div className="relative group">
                    <h1 className="text-[12rem] md:text-[15rem] font-rounded font-black leading-none tracking-tighter opacity-10 select-none">
                        404
                    </h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="space-y-4">
                            <h2 className="text-3xl md:text-5xl font-rounded font-bold text-content-primary">
                                Resource{" "}
                                <span className="text-ui-highlight">
                                    Missing
                                </span>
                            </h2>
                            <p className="text-content-secondary max-w-sm mx-auto text-sm md:text-base leading-relaxed">
                                The department record or page you are looking
                                for does not exist in the{" "}
                                <span className="text-ui-accent font-bold">
                                    uDMS
                                </span>{" "}
                                central database.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-12 flex flex-col sm:flex-row gap-4 w-full max-w-md">
                    <button
                        onClick={() => navigate("/")}
                        className="flex-1 bg-ui-accent text-white py-4 rounded-2xl font-bold font-rounded hover:brightness-110 hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all"
                    >
                        Back to Dashboard
                    </button>
                    <button
                        onClick={() => navigate(-1)}
                        className="flex-1 bg-ui-surface border border-white/10 text-content-secondary py-4 rounded-2xl font-bold font-rounded hover:bg-white/5 transition-all"
                    >
                        Previous Page
                    </button>
                </div>

               
            </main>

        </div>
    );
};

export default NotFound;
