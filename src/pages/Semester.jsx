import React, { useState, useEffect, useMemo } from "react";
import { getToken, getRole } from "../services/tokenService";
import Toast from "../components/Toast"; 
import Loading from "../components/Loading";

import { SEMESTER_ENDPOINT } from "../config/config";

const Semester = () => {
    const [semesters, setSemesters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);

    // Toast State
    const [toast, setToast] = useState({
        show: false,
        message: "",
        type: "success",
    });

    // Role Logic
    const role = getRole();
    const isAdmin = role?.toUpperCase() === "ADMIN";

    const [formData, setFormData] = useState({
        semesterNo: "",
        batch: "",
        session: "",
    });

    const [sortConfig, setSortConfig] = useState({
        key: "semesterNo",
        direction: "asc",
    });

    // Helper to trigger toast
    const triggerToast = (message, type = "success") => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ ...toast, show: false }), 3000);
    };

    const fetchSemesters = async () => {
        const token = getToken();
        try {
            const response = await fetch(`${SEMESTER_ENDPOINT}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setSemesters(data);
            }
        } catch (err) {
            triggerToast("FAILED_TO_SYNC_DATA", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSemesters();
    }, []);

    const sortedSemesters = useMemo(() => {
        let sortableItems = [...semesters];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key])
                    return sortConfig.direction === "asc" ? -1 : 1;
                if (a[sortConfig.key] > b[sortConfig.key])
                    return sortConfig.direction === "asc" ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [semesters, sortConfig]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isAdmin) return triggerToast("UNAUTHORIZED_ACCESS", "error");

        const token = getToken();
        const url = isEditing
            ? `${SEMESTER_ENDPOINT}/${currentId}`
            : `${SEMESTER_ENDPOINT}`;
        const method = isEditing ? "PUT" : "POST";

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                triggerToast(
                    isEditing ? "SEMESTER_UPDATED" : "SEMESTER_CREATED",
                    "success",
                );
                setIsModalOpen(false);
                setFormData({ semesterNo: "", batch: "", session: "" });
                fetchSemesters();
            } else {
                triggerToast("ACTION_FAILED_ON_SERVER", "error");
            }
        } catch (err) {
            triggerToast("NETWORK_ERROR", "error");
        }
    };

    const handleDelete = async (id) => {
        if (!isAdmin) return triggerToast("ADMIN_ONLY_ACTION", "error");
        if (!window.confirm("DELETE_THIS_RECORD?")) return;

        const token = getToken();
        try {
            const response = await fetch(
                `${SEMESTER_ENDPOINT}/${id}`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                },
            );
            if (response.ok) {
                triggerToast("RECORD_DELETED", "success");
                fetchSemesters();
            }
        } catch (err) {
            triggerToast("DELETE_OPERATION_FAILED", "error");
        }
    };

    return (
        <div className="space-y-6">
            {/* Custom Toast Render */}
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ ...toast, show: false })}
                />
            )}

            <div className="flex justify-between items-center mb-4">
                <div className="space-y-1">
                    <h2 className="text-sm font-mono text-ui-highlight tracking-widest uppercase">
                        Academic_Cycles
                    </h2>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => {
                            setIsEditing(false);
                            setFormData({
                                semesterNo: "",
                                batch: "",
                                session: "",
                            });
                            setIsModalOpen(true);
                        }}
                        className="bg-ui-accent/10 border border-ui-accent/50 text-ui-accent px-4 py-2 rounded-xl text-[10px] font-bold hover:bg-ui-accent hover:text-white transition-all"
                    >
                        + ADD
                    </button>
                )}
            </div>

            {loading ? (
                <div className="flex items-center gap-3 text-ui-accent font-mono animate-pulse">
                    <Loading />
                </div>
            ) : (
                <div className="overflow-x-auto rounded-2xl border border-white/5 bg-ui-surface/10 backdrop-blur-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/5">
                                <th className="p-4 text-[10px] font-mono text-content-secondary uppercase">
                                    No.
                                </th>
                                <th className="p-4 text-[10px] font-mono text-content-secondary uppercase">
                                    Batch
                                </th>
                                <th className="p-4 text-[10px] font-mono text-content-secondary uppercase">
                                    Session
                                </th>
                                {isAdmin && (
                                    <th className="p-4 text-[10px] font-mono text-content-secondary uppercase text-right">
                                        Actions
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {sortedSemesters.map((s) => (
                                <tr
                                    key={s.id}
                                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                >
                                    <td className="p-4 font-bold text-white">
                                        Semester {s.semesterNo}
                                    </td>
                                    <td className="p-4 text-content-primary">
                                        {s.batch}
                                    </td>
                                    <td className="p-4 text-content-secondary">
                                        {s.session}
                                    </td>
                                    {isAdmin && (
                                        <td className="p-4 text-right space-x-3">
                                            <button
                                                onClick={() => {
                                                    setIsEditing(true);
                                                    setCurrentId(s.id);
                                                    setFormData(s);
                                                    setIsModalOpen(true);
                                                }}
                                                className="text-ui-highlight text-[10px] font-mono"
                                            >
                                                EDIT
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDelete(s.id)
                                                }
                                                className="text-red-400/60 text-[10px] font-mono"
                                            >
                                                DEL
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal Logic remains the same, wrapped in isAdmin for safety */}
            {isModalOpen && isAdmin && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-ui-surface border border-white/10 p-8 rounded-3xl w-full max-w-md">
                        <h3 className="text-xl font-bold text-white mb-6 font-mono">
                            {isEditing ? "UPDATE_SEMESTER" : "CREATE_SEMESTER"}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                name="semesterNo"
                                type="number"
                                value={formData.semesterNo}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        semesterNo: e.target.value,
                                    })
                                }
                                className="w-full bg-ui-background border border-white/10 rounded-xl px-4 py-3 text-white"
                                placeholder="Semester No"
                                required
                            />
                            <input
                                name="batch"
                                type="number"
                                value={formData.batch}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        batch: e.target.value,
                                    })
                                }
                                className="w-full bg-ui-background border border-white/10 rounded-xl px-4 py-3 text-white"
                                placeholder="Batch"
                                required
                            />
                            <input
                                name="session"
                                value={formData.session}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        session: e.target.value,
                                    })
                                }
                                className="w-full bg-ui-background border border-white/10 rounded-xl px-4 py-3 text-white"
                                placeholder="Session (e.g. 2023-24)"
                                required
                            />
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-white text-[10px] font-bold"
                                >
                                    CANCEL
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 rounded-xl bg-ui-accent text-white text-[10px] font-bold"
                                >
                                    SAVE
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Semester;
