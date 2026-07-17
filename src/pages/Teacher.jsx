import React, { useState, useEffect, useCallback, useMemo } from "react";
import { getToken } from "../services/tokenService";
import Toast from "../components/Toast";
import Loading from "../components/Loading";

import { TEACHER_ENDPOINT } from "../config/config";
import { Link } from "react-router-dom";

const Teacher = () => {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // 🍞 Toast State
    const [toast, setToast] = useState({
        show: false,
        message: "",
        type: "error",
        id: 0,
    });

    const [expandedTeacherId, setExpandedTeacherId] = useState(null);
    // const [sortConfig, setSortConfig] = useState({
    //     key: "name",
    //     direction: "asc",
    // });

    // 📣 Improved Toast Trigger
    const showToast = useCallback((message, type = "error") => {
        setToast({
            show: true,
            message,
            type,
            id: Date.now(), // Unique ID forces the portal to re-mount and show
        });
    }, []);

    // // 🕵️ Manual JWT Decoder
    // const getRoleFromToken = (token) => {
    //     try {
    //         const base64Url = token.split(".")[1];
    //         const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    //         return JSON.parse(window.atob(base64)).role || "";
    //     } catch (e) {
    //         return "";
    //     }
    // };

    const fetchTeachers = async () => {
        const token = getToken();
        setLoading(true);
        try {
            const response = await fetch(`${TEACHER_ENDPOINT}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setTeachers(Array.isArray(data) ? data : []);
            } else {
                // THIS TRIGGERS THE MESSAGE
                showToast(
                    `ALARM: Request rejected with status ${response.status}`,
                    "error",
                );
            }
        } catch (err) {
            // THIS TRIGGERS THE MESSAGE
            showToast(
                "KERNEL_PANIC: Faculty database connection lost",
                "error",
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeachers();
    }, []);

    const toggleExpand = (id) => {
        setExpandedTeacherId(expandedTeacherId === id ? null : id);
    };

    // Filter/Sort Logic
    const filteredTeachers = teachers.filter((t) => {
        const s = searchTerm.toLowerCase();
        return (
            !s ||
            t.name?.toLowerCase().includes(s) ||
            t.username?.toLowerCase().includes(s)
        );
    });

    // Calculate teacher count statistics
    const teacherCounts = useMemo(() => {
        return {
            total: teachers.length,
            displayed: filteredTeachers.length,
        };
    }, [teachers, filteredTeachers]);

    if (loading)
        return (
            <div className="flex items-center gap-3 text-ui-accent font-mono animate-pulse">
                <Loading />
            </div>
        );

    return (
        <div className="space-y-6">
            {/* 🍞 THE TOAST */}
            {toast.show && (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={() =>
                        setToast((prev) => ({ ...prev, show: false }))
                    }
                />
            )}

            {/* Control Bar */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div className="w-full md:w-64">
                    <label className="block text-[10px] font-mono text-ui-secondary uppercase tracking-widest mb-2 ml-1">
                        Search
                    </label>
                    <input
                        type="text"
                        placeholder="Search ID or Name ..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ backgroundColor: "#FFFFFF" }}
                        className="w-full border border-ui-neutral rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ui-accent/20 focus:border-ui-accent text-content-primary transition-all shadow-sm placeholder:text-content-muted"
                    />
                </div>
            </div>

            {/* Teacher Count Summary */}
            <div className="flex items-center gap-4 p-4 bg-ui-surface rounded-xl border border-ui-neutral shadow-sm">
                <span className="text-xs font-mono text-content-secondary">
                    TOTAL_TEACHERS:{" "}
                    <span className="text-ui-accent font-bold">
                        {teacherCounts.total}
                    </span>
                </span>
                <span className="text-xs font-mono text-content-secondary">
                    DISPLAYED:{" "}
                    <span className="text-ui-highlight font-bold">
                        {teacherCounts.displayed}
                    </span>
                </span>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto rounded-2xl border border-ui-neutral bg-ui-surface shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-ui-neutral bg-ui-background text-[10px] font-mono text-content-secondary uppercase">
                            <th className="p-5 font-bold">Teacher</th>
                            <th className="p-5 font-bold">Contact</th>
                            <th className="p-5 font-bold">Gender</th>
                            <th className="p-5 font-bold">Address</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-ui-neutral">
                        {filteredTeachers.map((t) => (
                            <React.Fragment key={t.id}>
                                <tr
                                    onClick={() => toggleExpand(t.id)}
                                    className="cursor-pointer hover:bg-ui-background group transition-colors"
                                >
                                    <td className="p-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-ui-background border border-ui-neutral flex items-center justify-center font-bold text-ui-accent group-hover:border-ui-accent group-hover:bg-white transition-all font-mono">
                                                {(t.name || t.username || "U")
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-bold text-content-primary text-sm flex items-center gap-2">
                                                    {t.name || "Anonymous"}
                                                    <span
                                                        className={`text-[8px] text-ui-accent transition-transform duration-300 ${expandedTeacherId === t.id ? "rotate-180" : ""}`}
                                                    >
                                                        ▼
                                                    </span>
                                                </div>
                                                <div className="text-[10px] font-mono text-ui-secondary hover:text-ui-accent transition-colors">
                                                    <Link
                                                        to={`teacher/${t.username}`}
                                                        className="hover:underline"
                                                    >
                                                        @{t.username}
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <div className="text-xs text-content-secondary">
                                            {t.email}
                                        </div>
                                        <div className="text-[10px] text-content-muted font-mono">
                                            {t.phone}
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <span
                                            className={`px-2 py-0.5 rounded text-[9px] font-black border tracking-widest uppercase ${
                                                t.gender === "MALE"
                                                    ? "border-ui-accent/30 bg-ui-accent/5 text-ui-accent"
                                                    : "border-pink-200 bg-pink-50 text-pink-600"
                                            }`}
                                        >
                                            {t.gender || "U"}
                                        </span>
                                    </td>
                                    <td className="p-5 text-xs text-content-secondary max-w-[150px] truncate">
                                        {t.address || "---"}
                                    </td>
                                </tr>

                                {/* Expanded Area */}
                                {expandedTeacherId === t.id && (
                                    <tr className="bg-ui-background/50 border-l-4 border-ui-accent">
                                        <td colSpan="4" className="p-6">
                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-mono text-ui-secondary uppercase tracking-[0.2em] font-bold flex items-center gap-2">
                                                    <span className="w-2 h-2 bg-ui-highlight rounded-full"></span>
                                                    Assigned_Courses
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                    {t.courses?.map((c) => (
                                                        <div
                                                            key={c.id}
                                                            className="bg-ui-surface border border-ui-neutral p-3 rounded-xl shadow-sm hover:border-ui-accent transition-colors"
                                                        >
                                                            <div className="text-[9px] font-mono text-ui-secondary">
                                                                {c.courseCode}
                                                            </div>
                                                            <div className="text-xs font-bold text-content-primary">
                                                                {c.courseName}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Teacher;
