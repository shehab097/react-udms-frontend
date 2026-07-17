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
                    {/* Optional Header can go here */}
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
                        className="bg-ui-accent text-ui-background px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-colors"
                    >
                        + ADD_CYCLE
                    </button>
                )}
            </div>

            {loading ? (
                <div className="flex items-center gap-3 text-ui-highlight font-mono py-10 justify-center">
                    <Loading />
                    <span className="text-[10px] uppercase tracking-[0.3em]">
                        Syncing_Data...
                    </span>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-2xl border border-ui-neutral bg-ui-surface">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-ui-neutral bg-ui-background">
                                <th className="p-5 text-[10px] font-mono text-ui-secondary uppercase tracking-widest">
                                    No.
                                </th>
                                <th className="p-5 text-[10px] font-mono text-ui-secondary uppercase tracking-widest">
                                    Batch
                                </th>
                                <th className="p-5 text-[10px] font-mono text-ui-secondary uppercase tracking-widest">
                                    Session
                                </th>
                                {isAdmin && (
                                    <th className="p-5 text-[10px] font-mono text-ui-secondary uppercase tracking-widest text-right">
                                        Actions
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {sortedSemesters.map((s) => (
                                <tr
                                    key={s.id}
                                    className="border-b border-ui-neutral last:border-0 hover:bg-ui-background transition-colors group"
                                >
                                    <td className="p-5 font-bold text-content-primary">
                                        Semester {s.semesterNo}
                                    </td>
                                    <td className="p-5 text-content-primary">
                                        {s.batch}
                                    </td>
                                    <td className="p-5 text-content-secondary font-mono">
                                        {s.session}
                                    </td>
                                    {isAdmin && (
                                        <td className="p-5 text-right">
                                            <div className="flex justify-end gap-5">
                                                <button
                                                    onClick={() => {
                                                        setIsEditing(true);
                                                        setCurrentId(s.id);
                                                        setFormData(s);
                                                        setIsModalOpen(true);
                                                    }}
                                                    className="text-ui-highlight text-[10px] font-black uppercase tracking-tighter hover:underline underline-offset-4"
                                                >
                                                    EDIT
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(s.id)
                                                    }
                                                    className="text-ui-secondary text-[10px] font-black uppercase tracking-tighter hover:text-red-500"
                                                >
                                                    DEL
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal Logic */}
            {isModalOpen && isAdmin && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90">
                    <div className="bg-ui-surface border border-ui-neutral p-8 rounded-[2rem] w-full max-w-md shadow-2xl">
                        <h3 className="text-lg font-black text-content-primary mb-8 font-mono uppercase tracking-tighter">
                            {isEditing ? "Update_Semester" : "Create_Semester"}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-1">
                                <label className="text-[9px] font-mono text-ui-highlight uppercase ml-1">
                                    Semester_No
                                </label>
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
                                    className="w-full bg-ui-background border border-ui-neutral rounded-xl px-4 py-3 text-content-primary focus:border-ui-accent outline-none transition-colors"
                                    placeholder="e.g. 1"
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[9px] font-mono text-ui-highlight uppercase ml-1">
                                    Batch_Identifier
                                </label>
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
                                    className="w-full bg-ui-background border border-ui-neutral rounded-xl px-4 py-3 text-content-primary focus:border-ui-accent outline-none transition-colors"
                                    placeholder="e.g. 58"
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[9px] font-mono text-ui-highlight uppercase ml-1">
                                    Academic_Session
                                </label>
                                <input
                                    name="session"
                                    value={formData.session}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            session: e.target.value,
                                        })
                                    }
                                    className="w-full bg-ui-background border border-ui-neutral rounded-xl px-4 py-3 text-content-primary focus:border-ui-accent outline-none transition-colors"
                                    placeholder="e.g. 2023-24"
                                    required
                                />
                            </div>

                            <div className="flex gap-4 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-3 rounded-xl border border-ui-neutral text-content-secondary text-[10px] font-black uppercase hover:bg-ui-background transition-colors"
                                >
                                    CANCEL
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 rounded-xl bg-ui-accent text-ui-background text-[10px] font-black uppercase hover:brightness-110 transition-all shadow-lg shadow-ui-accent/10"
                                >
                                    SAVE_DATA
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

