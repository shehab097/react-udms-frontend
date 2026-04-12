import React, { useState, useEffect, useCallback } from "react";
import { getToken } from "../services/tokenService";
import Toast from "../components/Toast";
import Loading from "../components/Loading";

import { TEACHER_ENDPOINT } from "../config/config";

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

    if (loading)
        return (
            <div className="flex items-center gap-3 text-ui-accent font-mono animate-pulse">
                <Loading />
            </div>
        );

    return (
        <div className="space-y-6 ">
            {/* 🍞 THE TOAST (Using 'key' to ensure it renders when state changes) */}
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
                    <label className="block text-[10px] font-mono text-ui-highlight uppercase tracking-widest mb-2 ml-1">
                        Search_Registry
                    </label>
                    <input
                        type="text"
                        placeholder="Search faculty..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-ui-accent text-white"
                    />
                </div>
                {/* Manual Test Button to verify toast works */}
                <button
                    onClick={() =>
                        showToast("Manual system ping successful", "success")
                    }
                    className="text-[10px] font-mono text-white/20 hover:text-ui-accent transition-colors"
                >
                    [ TEST_TOAST ]
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-2xl border border-white/5 bg-ui-surface/20">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/5 text-[10px] font-mono text-ui-highlight uppercase">
                            <th className="p-5">Faculty_Member</th>
                            <th className="p-5">Contact</th>
                            <th className="p-5">Gender</th>
                            <th className="p-5">Address</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredTeachers.map((t) => (
                            <React.Fragment key={t.id}>
                                <tr
                                    onClick={() => toggleExpand(t.id)}
                                    className="cursor-pointer hover:bg-white/[0.02] group transition-colors"
                                >
                                    <td className="p-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-ui-surface border border-white/10 flex items-center justify-center font-bold text-ui-highlight group-hover:border-ui-accent transition-colors font-mono">
                                                {(t.name || t.username || "U")
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-200 text-sm flex items-center gap-2">
                                                    {t.name || "Anonymous"}
                                                    <span
                                                        className={`text-[8px] transition-transform ${expandedTeacherId === t.id ? "rotate-180" : ""}`}
                                                    >
                                                        ▼
                                                    </span>
                                                </div>
                                                <div className="text-[10px] font-mono text-white/40 uppercase">
                                                    @{t.username}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <div className="text-xs text-gray-300">
                                            {t.email}
                                        </div>
                                        <div className="text-[10px] text-gray-500 font-mono">
                                            {t.phone}
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <span
                                            className={`px-2 py-0.5 rounded text-[9px] font-black border tracking-widest uppercase ${t.gender === "MALE" ? "border-blue-500/20 text-blue-400" : "border-pink-500/20 text-pink-400"}`}
                                        >
                                            {t.gender || "U"}
                                        </span>
                                    </td>
                                    <td className="p-5 text-xs text-gray-500 max-w-[150px] truncate">
                                        {t.address || "---"}
                                    </td>
                                </tr>

                                {expandedTeacherId === t.id && (
                                    <tr className="bg-ui-background/30 border-l-2 border-ui-accent">
                                        <td colSpan="4" className="p-6">
                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-mono text-ui-accent uppercase tracking-[0.2em] font-bold">
                                                    Assigned_Courses
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                    {t.courses?.map((c) => (
                                                        <div
                                                            key={c.id}
                                                            className="bg-white/5 border border-white/10 p-3 rounded-xl"
                                                        >
                                                            <div className="text-[9px] font-mono text-ui-highlight">
                                                                {c.courseCode}
                                                            </div>
                                                            <div className="text-xs font-bold text-white">
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
