import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Users from "./Users";
import Teacher from "./Teacher";
import Student from "./Student";
import Admin from "./Admin";
import Course from "./Course";
import Notice from "./Notice";
import StudentEnrolled from "./StudentEnrolled";
import { getRole, getUsername } from "../services/tokenService";
import StudentProfile from "./student/[username]";
import TeacherProfile from "./teacher/[username]";
import NotFound from "./NotFound";
import AdminProfile from "./admin/[username]";
import Semester from "./Semester"

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState("Users");
    const [isExpanded, setIsExpanded] = useState(false);

    const currentUsername = getUsername();
    const userRole = getRole(); // e.g., "STUDENT", "TEACHER", "ADMIN"

    const menuItems = [
        { name: "Users", icon: "👥" },
        { name: "Teacher", icon: "👩‍🏫" },
        { name: "Student", icon: "🎓" },
        { name: "Admin", icon: "👤" },
        { name: "Course", icon: "📔" },
        { name: "Notice", icon: "🪧" },
        { name: "StudentEnrolled", icon: "🧾" },
        { name: "Reports", icon: "📑" },
        { name: "Semester", icon: "📰" },
        { name: "Profile", icon: "⚙️" },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case "Users":
                return <Users />;
            case "Teacher":
                return <Teacher />;
            case "Student":
                return <Student />;
            case "Admin":
                return <Admin />;
            case "Course":
                return <Course />;
            case "Notice":
                return <Notice />;
            case "Semester":
                return <Semester />;
            case "StudentEnrolled":
                return <StudentEnrolled />;
            case "Profile":
                // Logic: Render the profile component matching the logged-in user's role
                if (userRole === "STUDENT") {
                    return <StudentProfile username={currentUsername} />;
                } else if (userRole === "TEACHER") {
                    return <TeacherProfile username={currentUsername} />;
                } else {
                    return <AdminProfile username={currentUsername} />;
                }
            default:
                return <NotFound />;
        }
    };

    const handleOpenInNewTab = () => {
        let path = activeTab.toLowerCase();

        // Specific routing for the Profile tab based on role
        if (activeTab === "Profile") {
            if (userRole === "STUDENT") path = `student/${currentUsername}`;
            else if (userRole === "TEACHER")
                path = `teacher/${currentUsername}`;
            else path = `admin/${currentUsername}`;
        }

        window.open(`/${path}`, "_blank", "noopener,noreferrer");
    };

    return (
        <div className="h-screen bg-ui-background flex flex-col font-sans text-content-primary overflow-hidden">
            {/* FIXED NAVBAR */}
            <div className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-white/5 bg-ui-background/80 backdrop-blur-md">
                <Navbar />
            </div>

            <div className="flex flex-1 pt-16 relative overflow-hidden">
                {/* SIDEBAR */}
                <aside
                    className={`${
                        isExpanded ? "w-64" : "w-14"
                    } md:w-64 bg-ui-surface border-r border-white/5 flex flex-col transition-all duration-300 z-40 h-full overflow-y-auto overflow-x-hidden`}
                >
                    <div className="py-4 px-2 md:px-4 flex flex-col h-full">
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg bg-ui-accent/10 text-ui-accent mb-6"
                        >
                            {isExpanded ? "✕" : "☰"}
                        </button>

                        <nav className="space-y-2">
                            {menuItems.map((item) => (
                                <button
                                    key={item.name}
                                    onClick={() => {
                                        setActiveTab(item.name);
                                        if (isExpanded) setIsExpanded(false);
                                    }}
                                    className={`w-full flex items-center p-2.5 md:p-3 rounded-xl transition-all ${
                                        activeTab === item.name
                                            ? "bg-ui-accent text-white shadow-lg shadow-ui-accent/20"
                                            : "text-content-secondary hover:bg-white/5"
                                    }`}
                                >
                                    <span
                                        className={`flex justify-center shrink-0 ${
                                            isExpanded
                                                ? "text-lg w-6"
                                                : "text-sm md:text-xl w-full md:w-8"
                                        }`}
                                    >
                                        {item.icon}
                                    </span>
                                    <span
                                        className={`ml-3 font-medium whitespace-nowrap transition-opacity duration-200 ${
                                            isExpanded
                                                ? "opacity-100"
                                                : "opacity-0 md:opacity-100 hidden md:block"
                                        }`}
                                    >
                                        {item.name}
                                    </span>
                                </button>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* MAIN SCROLLABLE AREA */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden bg-ui-background/30 custom-scrollbar">
                    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
                        <header className="mb-6 flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                                    {activeTab}
                                </h1>
                                <p className="text-[10px] md:text-xs text-ui-highlight font-mono uppercase tracking-widest mt-1 opacity-70">
                                    System_Core / {activeTab}
                                </p>
                            </div>

                            <button
                                onClick={handleOpenInNewTab}
                                className="p-2.5 rounded-xl bg-ui-surface border border-white/5 hover:border-ui-accent transition-all group"
                                title="Open in new window"
                            >
                                <svg
                                    className="w-5 h-5 text-content-secondary group-hover:text-ui-accent"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </button>
                        </header>

                        {/* CONTENT CONTAINER */}
                        <div className="w-full bg-ui-surface/40 border border-white/5 rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-2xl backdrop-blur-sm">
                            {renderContent()}
                        </div>
                    </div>
                </main>

                {/* MOBILE OVERLAY */}
                {isExpanded && (
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-30 md:hidden"
                        onClick={() => setIsExpanded(false)}
                    />
                )}
            </div>
        </div>
    );
};

export default Dashboard;
