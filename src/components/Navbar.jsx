import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import UserCard from "./UserCard";

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const links = [
        { name: "Dashboard", path: "/dashboard" },
        { name: "Access Denied", path: "/accessdenied" },
        { name: "Register", path: "/register" },
    ];

    // Close mobile menu when route changes
    useEffect(() => {
        setIsOpen(false);
    }, [location]);

    // Prevent background scrolling when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
    }, [isOpen]);

    return (
        <header className="w-full sticky top-0 left-0 z-[100] bg-ui-background border-b border-white/10 shadow-lg">
            <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo Section */}
                <Link to="/" className="flex items-center gap-3 group shrink-0">
                    <div className="relative">
                        <span className="block w-3 h-3 rounded-sm bg-ui-accent rotate-45 group-hover:rotate-180 transition-all duration-500" />
                        <span className="absolute inset-0 w-3 h-3 rounded-sm bg-ui-accent/50 animate-ping" />
                    </div>
                    <span className="font-mono font-black text-xl text-content-primary tracking-tighter uppercase">
                        uDMS<span className="text-ui-accent">.</span>
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
                    <div className="flex items-center space-x-1">
                        {links.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`px-4 py-2 rounded-md text-xs font-mono uppercase tracking-widest transition-all ${
                                    location.pathname === link.path
                                        ? "text-ui-accent bg-ui-accent/5"
                                        : "text-content-secondary hover:text-ui-highlight hover:bg-white/5"
                                }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    <div className="h-6 w-px bg-white/10" />

                    <div className="flex items-center gap-6">
                        <UserCard />
                        <Link
                            to="/logout"
                            className="bg-ui-secondary/10 hover:bg-ui-secondary/20 text-ui-secondary text-[11px] font-bold font-mono px-4 py-2 border border-ui-secondary/20 rounded uppercase tracking-tighter transition-all"
                        >
                            Terminate_Session
                        </Link>
                    </div>
                </div>

                {/* Mobile Controls */}
                <div className="md:hidden flex items-center gap-4">
                    {!isOpen && <UserCard />}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="p-2 text-ui-highlight hover:bg-white/5 rounded-lg transition-colors"
                        aria-label="Toggle Menu"
                    >
                        {isOpen ? (
                            <span className="font-mono text-xs">[ CLOSE ]</span>
                        ) : (
                            <div className="space-y-1 w-5">
                                <div className="h-0.5 w-full bg-ui-accent" />
                                <div className="h-0.5 w-full bg-ui-accent" />
                                <div className="h-0.5 w-3 bg-ui-accent" />
                            </div>
                        )}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <div
                className={` fixed inset-0 top-16 z-[90] md:hidden transition-all duration-500 transform ${
                    isOpen ? "translate-x-0" : "translate-x-full "
                }`}
            >
                {/* 1. The Blur Layer: This blurs the website content behind the menu */}
                <div className="absolute inset-0 bg-ui-background/80 backdrop-blur-md border" />

                {/* 2. The Content Layer: Solid and focused */}
                <div className="relative flex flex-col h-full p-8 border-l border-white/5 bg-ui-background shadow-2xl">
                    <div className="space-y-6">
                        <p className="text-[10px] font-mono text-ui-accent uppercase tracking-[0.4em] mb-8 flex items-center gap-2">
                            <span className="w-1 h-1 bg-ui-accent animate-pulse" />
                            System_Navigation
                        </p>

                        {links.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className="group bg-ui-background block text-3xl font-mono text-content-primary hover:text-ui-accent transition-all"
                                onClick={() => setIsOpen(false)}
                            >
                                <span className="text-ui-accent opacity-0 group-hover:opacity-100 transition-opacity mr-2">
                                    &gt;
                                </span>
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Bottom Section */}
                    <div className="mt-auto pt-10 border-t border-white/5 space-y-6">
                        <div className="flex items-center justify-between bg-white/5 p-4 rounded-lg">
                            <span className="text-[11px] font-mono text-content-secondary uppercase tracking-widest">
                                Active_User
                            </span>
                            <UserCard />
                        </div>

                        <Link
                            to="/logout"
                            className="block w-full text-center py-4 bg-ui-secondary text-ui-background font-mono font-bold uppercase tracking-widest hover:bg-ui-highlight transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            Terminate_Session
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
