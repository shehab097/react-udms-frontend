import React, { useState, useMemo } from "react";
import Navbar from "../components/Navbar";
import { getRole, getToken, getUsername } from "../services/tokenService";
import { Menu, X, ExternalLink } from "lucide-react"; // Using Lucide for consistent icons

// Feature Components
import Users from "./Users";
import Teacher from "./Teacher";
import Student from "./Student";
import Admin from "./Admin";
import Course from "./Course";
import Notice from "./Notice";
import StudentEnrolled from "./StudentEnrolled";
import Semester from "./Semester";
import AttendanceDashboard from "./AttendanceDashboard";
import MarkAttendance from "./MarkAttendance";
import NotFound from "./NotFound";

// Profile Components
import StudentProfile from "./profile/student/[username]";
import TeacherProfile from "./profile/teacher/[username]";
import AdminProfile from "./profile/admin/[username]";

const menuItems = [
    { name: "Users", icon: "👥", permissions: ["ADMIN"] },
    { name: "Admin", icon: "👤", permissions: ["ADMIN"] },
    { name: "Teacher", icon: "👩‍🏫", permissions: ["ADMIN", "TEACHER"] },
    {
        name: "Student",
        icon: "🎓",
        permissions: ["ADMIN", "TEACHER", "STUDENT"],
    },
    { name: "Course", icon: "📔", permissions: ["ADMIN", "TEACHER"] },
    { name: "Semester", icon: "📰", permissions: ["ADMIN", "TEACHER"] },
    {
        name: "Notice",
        icon: "🪧",
        permissions: ["ADMIN", "TEACHER", "STUDENT"],
    },
    { name: "Student Enrolled", icon: "🧾", permissions: ["ADMIN", "TEACHER"] },
    { name: "Attendance", icon: "📑", permissions: ["ADMIN", "TEACHER"] },
    { name: "Mark Attendance", icon: "✅", permissions: ["ADMIN", "TEACHER"] },
    {
        name: "Profile",
        icon: "⚙️",
        permissions: ["ADMIN", "TEACHER", "STUDENT"],
    },
];

const Dashboard = () => {
    const userRole = getRole();
    const currentUsername = getUsername();

    const [activeTab, setActiveTab] = useState(
        userRole === "ADMIN" ? "Users" : "Notice",
    );

    // isSidebarOpen controls the mobile drawer
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const filteredMenuItems = useMemo(() => {
        if (!userRole) return [];
        return menuItems.filter((item) => item.permissions.includes(userRole));
    }, [userRole]);

    const renderContent = () => {
        const currentItem = menuItems.find((i) => i.name === activeTab);
        if (!currentItem || !currentItem.permissions.includes(userRole)) {
            return <NotFound />;
        }

        switch (activeTab) {
            case "Users":
                return <Users />;
            case "Admin":
                return <Admin />;
            case "Teacher":
                return <Teacher />;
            case "Student":
                return <Student />;
            case "Course":
                return <Course />;
            case "Notice":
                return <Notice />;
            case "Semester":
                return <Semester />;
            case "Attendance":
                return <AttendanceDashboard />;
            case "Mark Attendance":
                return <MarkAttendance />;
            case "Student Enrolled":
                return <StudentEnrolled />;
            case "Profile":
                if (userRole === "STUDENT")
                    return <StudentProfile username={currentUsername} />;
                if (userRole === "TEACHER")
                    return <TeacherProfile username={currentUsername} />;
                if (userRole === "ADMIN")
                    return <AdminProfile username={currentUsername} />;
                return <NotFound />;
            default:
                return <NotFound />;
        }
    };

    const handleOpenInNewTab = () => {
        let path = activeTab.replace(/\s+/g, "-").toLowerCase();
        if (activeTab === "Profile") {
            const rolePath = (userRole || "").toLowerCase();
            path = `profile/${rolePath}/${currentUsername}`;
        }
        window.open(`/${path}`, "_blank", "noopener,noreferrer");
    };

    if (getToken() == null) {
        window.location.href = "/login";
        return null;
    }

    return (
        <div className="h-screen bg-ui-background flex flex-col font-sans text-content-primary overflow-hidden">
            {/* NAVBAR with Mobile Toggle */}
            <div className="z-50 border-b border-white/5">
                <div className="flex items-center">
                    {/* Mobile Toggle Button */}
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="md:hidden ml-4 p-2 text-content-secondary hover:text-ui-accent transition-colors"
                    >
                        <Menu size={24} />
                    </button>
                    <div className="flex-1">
                        <Navbar />
                    </div>
                </div>
            </div>

            <div className="flex flex-1 relative overflow-hidden">
                {/* SIDEBAR (Responsive Drawer) */}
                <aside
                    className={`
                        fixed inset-y-0 left-0 z-[60] w-72 bg-ui-surface border-r border-white/5 
                        transform transition-transform duration-300 ease-in-out
                        md:relative md:translate-x-0 md:z-40 md:w-64
                        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
                    `}
                >
                    <div className="flex flex-col h-full">
                        {/* Mobile Header in Sidebar */}
                        <div className="flex items-center justify-between p-4 md:hidden border-b border-white/5">
                            <span className="font-black text-ui-accent tracking-widest uppercase text-sm">
                                Navigation 
                            </span>
                            <button
                                onClick={() => setIsSidebarOpen(false)}
                                className="text-content-secondary"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <nav className="flex-1 overflow-y-auto p-4 space-y-1.5 custom-scrollbar">
                            {filteredMenuItems.map((item) => (
                                <button
                                    key={item.name}
                                    onClick={() => {
                                        setActiveTab(item.name);
                                        setIsSidebarOpen(false); // Close on selection
                                    }}
                                    className={`w-full flex items-center p-3 rounded-xl transition-all group ${
                                        activeTab === item.name
                                            ? "bg-ui-accent text-white shadow-lg shadow-ui-accent/20"
                                            : "text-content-secondary hover:bg-white/5"
                                    }`}
                                >
                                    <span className="flex justify-center shrink-0 text-xl w-8">
                                        <abbr
                                            className="inline-block decoration-black/0"
                                            title={item.name}
                                        >
                                            {" "}
                                            {item.icon}
                                        </abbr>
                                    </span>
                                    <span className="ml-3 font-medium whitespace-nowrap">
                                        {item.name} 
                                    </span>
                                </button>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* MAIN CONTENT */}
                <main className="flex-1 overflow-y-auto bg-ui-background/30 custom-scrollbar relative">
                    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
                        <header className=" flex items-center justify-between">
                            <div>
                                {/* <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase italic">
                                    {activeTab} 
                                </h1> */}
                                {/* <p className="text-[10px] md:text-xs text-ui-accent font-mono uppercase tracking-[0.2em] mt-1 opacity-80">
                                    System_Core //{" "}
                                    {activeTab.replace(/\s+/g, "_")}
                                </p> */}
                            </div>

                            {/* BUTTON FOR OPENING IN NEW TAB */}

                            {/* <button
                                onClick={handleOpenInNewTab}
                                className="p-2.5 rounded-xl bg-ui-surface border border-white/5 hover:border-ui-accent transition-all group text-content-secondary hover:text-ui-accent"
                                title="Open in new window"
                            >
                                <ExternalLink size={20} />
                            </button> */}
                        </header>

                        {/* Content Area */}
                        <div className="w-full bg-ui-surface/40 border border-white/5 rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-2xl backdrop-blur-sm min-h-[60vh]">
                            {renderContent()}
                        </div>
                    </div>
                </main>

                {/* MOBILE OVERLAY (Black-out when sidebar open) */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 md:hidden transition-opacity duration-300"
                        onClick={() => setIsSidebarOpen(false)}
                    />

                    
                )}
            </div>
        </div>
    );
};

export default Dashboard;
