import React, { useState } from "react";
import { Link } from "react-router-dom";
import UserCard from "./UserCard";

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const links = ["Dashboard", "Access Denied", "Register"];

    return (
        <div className="w-full bg-ui-background z-50 sticky top-0 l-0 ">
            <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between font-sans">
                {/* Logo */}
                <a href="/" className="flex items-center gap-3 group z-50">
                    <span className="w-2.5 h-2.5 rounded-full bg-ui-accent group-hover:bg-ui-highlight transition-colors duration-300 shadow-[0_0_10px_rgba(139,92,246,0.3)]" />
                    <span className="font-rounded font-bold text-xl text-content-primary tracking-tight leading-none inline-flex gap-1 items-end">
                        uDMS
                    </span>
                </a>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center justify-end space-x-10 flex-1">
                    <div className="flex items-center space-x-8">
                        {links.map((item) => (
                            <Link
                                key={item}
                                to={`/${item.toLowerCase().replace(" ","")}`}
                                className="text-content-secondary hover:text-ui-highlight text-sm font-medium transition-colors duration-200"
                            >
                                {item}
                            </Link>
                        ))}
                    </div>
                    <div className="h-4 w-px bg-ui-surface" />
                    <UserCard />
                    <Link
                        to="/logout"
                        className="text-content-primary hover:text-ui-secondary text-sm font-bold font-rounded transition-colors duration-200 border-2 px-5 py-2 rounded-full border-ui-accent"
                    >
                        Log out
                    </Link>
                </div>

                {/* Mobile Toggle & UserCard */}
                <div className="md:hidden flex items-center gap-4 z-50">
                    {!isOpen && <UserCard />}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="text-content-secondary hover:text-ui-highlight text-xs font-bold font-rounded tracking-widest uppercase focus:outline-none"
                    >
                        {isOpen ? "Close" : "Menu"}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu - Full Screen Overlay */}
            {isOpen && (
                <div className="fixed inset-0 bg-ui-background z-40 flex flex-col animate-in fade-in zoom-in-95 duration-300">
                    <div className="flex flex-col items-center justify-center flex-1 space-y-8 px-6 text-center">
                        {links.map((item) => (
                            <Link
                                key={item}
                                to={`/${item.toLowerCase().replace(" ","")}`}
                                className="text-content-primary text-3xl font-rounded font-bold hover:text-ui-accent transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                {item}
                            </Link>
                        ))}

                        <div className="w-12 h-px bg-ui-surface" />

                        <Link
                            to="/logout"
                            className="text-ui-secondary text-2xl font-bold font-rounded"
                            onClick={() => setIsOpen(false)}
                        >
                            Log out →
                        </Link>
                    </div>

                    {/* Bottom branding for the full screen menu */}
                    <div className="p-12 text-center opacity-20 font-mono text-[10px] tracking-[0.5em] uppercase">
                        uDMS / System Navigation
                    </div>
                </div>
            )}
        </div>
    );
};

export default Navbar;
