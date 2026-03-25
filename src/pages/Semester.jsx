import React, { useState, useEffect, useMemo } from "react";
import { getToken } from "../services/tokenService";
import { SEMESTER_ENDPOINT } from "../config/config";

const Semester = () => {
    const [semesters, setSemesters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);

    // Sorting State
    const [sortConfig, setSortConfig] = useState({
        key: "semesterNo",
        direction: "asc",
    });

    const [formData, setFormData] = useState({
        semesterNo: "",
        batch: "",
        session: "",
    });

    const fetchSemesters = async () => {
        const token = getToken();
        try {
            const response = await fetch(SEMESTER_ENDPOINT, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setSemesters(data);
            }
        } catch (err) {
            console.error("FETCH_ERROR", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSemesters();
    }, []);

    // Sorting Logic
    const sortedSemesters = useMemo(() => {
        let sortableItems = [...semesters];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === "asc" ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === "asc" ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [semesters, sortConfig]);

    const requestSort = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return "↕";
        return sortConfig.direction === "asc" ? "↑" : "↓";
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = getToken();
        const url = isEditing
            ? `${SEMESTER_ENDPOINT}/${currentId}`
            : SEMESTER_ENDPOINT;

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
                setIsModalOpen(false);
                setFormData({ semesterNo: "", batch: "", session: "" });
                fetchSemesters();
            }
        } catch (err) {
            alert("ACTION_FAILED");
        }
    };

    const handleEdit = (semester) => {
        setIsEditing(true);
        setCurrentId(semester.id);
        setFormData({
            semesterNo: semester.semesterNo,
            batch: semester.batch,
            session: semester.session,
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("ARE_YOU_SURE_BY_DELETING_THIS_RECORD?")) return;
        const token = getToken();
        try {
            const response = await fetch(`${SEMESTER_ENDPOINT}/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) fetchSemesters();
        } catch (err) {
            alert("DELETE_FAILED");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                <div className="space-y-1">
                    <h2 className="text-sm font-mono text-ui-highlight tracking-widest uppercase">
                        Academic_Cycles
                    </h2>
                    <p className="text-[9px] text-content-secondary uppercase font-mono italic opacity-50">
                        Click headers to sort table data
                    </p>
                </div>
                <button
                    onClick={() => {
                        setIsEditing(false);
                        setIsModalOpen(true);
                    }}
                    className="bg-ui-accent/10 border border-ui-accent/50 text-ui-accent px-4 py-2 rounded-xl text-[10px] font-bold hover:bg-ui-accent hover:text-white transition-all shadow-lg shadow-ui-accent/5"
                >
                    + ADD_NEW_SEMESTER
                </button>
            </div>

            {loading ? (
                <div className="text-center py-10 font-mono text-[10px] text-content-secondary animate-pulse tracking-widest">
                    SYNCING_SEMESTER_DATA...
                </div>
            ) : (
                <div className="overflow-x-auto rounded-2xl border border-white/5 bg-ui-surface/10 backdrop-blur-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/5">
                                <th
                                    onClick={() => requestSort("semesterNo")}
                                    className="p-4 text-[10px] font-mono text-content-secondary uppercase cursor-pointer hover:text-ui-accent transition-colors"
                                >
                                    No.{" "}
                                    <span className="ml-1 opacity-60">
                                        {getSortIcon("semesterNo")}
                                    </span>
                                </th>
                                <th
                                    onClick={() => requestSort("batch")}
                                    className="p-4 text-[10px] font-mono text-content-secondary uppercase cursor-pointer hover:text-ui-accent transition-colors"
                                >
                                    Batch{" "}
                                    <span className="ml-1 opacity-60">
                                        {getSortIcon("batch")}
                                    </span>
                                </th>
                                <th
                                    onClick={() => requestSort("session")}
                                    className="p-4 text-[10px] font-mono text-content-secondary uppercase cursor-pointer hover:text-ui-accent transition-colors"
                                >
                                    Session{" "}
                                    <span className="ml-1 opacity-60">
                                        {getSortIcon("session")}
                                    </span>
                                </th>
                                <th className="p-4 text-[10px] font-mono text-content-secondary uppercase text-right">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {sortedSemesters.map((s) => (
                                <tr
                                    key={s.id}
                                    className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                                >
                                    <td className="p-4 font-bold text-white group-hover:text-ui-accent transition-colors">
                                        Semester {s.semesterNo}
                                    </td>
                                    <td className="p-4 text-content-primary">
                                        {s.batch}
                                    </td>
                                    <td className="p-4 text-content-secondary">
                                        {s.session}
                                    </td>
                                    <td className="p-4 text-right space-x-3">
                                        <button
                                            onClick={() => handleEdit(s)}
                                            className="text-ui-highlight hover:text-white text-[10px] font-mono tracking-tighter transition-all"
                                        >
                                            EDIT
                                        </button>
                                        <button
                                            onClick={() => handleDelete(s.id)}
                                            className="text-red-400/60 hover:text-red-400 text-[10px] font-mono tracking-tighter transition-all"
                                        >
                                            DEL
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* MODAL remains the same as previous response */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-ui-surface border border-white/10 p-8 rounded-3xl w-full max-w-md shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-6 tracking-tight font-mono">
                            {isEditing
                                ? "UPDATE_SEMESTER_RECORD"
                                : "INITIALIZE_ACADEMIC_CYCLE"}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-mono text-content-secondary uppercase ml-1">
                                    Semester Number
                                </label>
                                <input
                                    name="semesterNo"
                                    type="number"
                                    value={formData.semesterNo}
                                    onChange={handleChange}
                                    className="w-full bg-ui-background border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-ui-accent/50"
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-mono text-content-secondary uppercase ml-1">
                                    Batch
                                </label>
                                <input
                                    name="batch"
                                    type="number"
                                    value={formData.batch}
                                    onChange={handleChange}
                                    className="w-full bg-ui-background border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-ui-accent/50"
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-mono text-content-secondary uppercase ml-1">
                                    Session
                                </label>
                                <input
                                    name="session"
                                    placeholder="e.g. 2023-24"
                                    value={formData.session}
                                    onChange={handleChange}
                                    className="w-full bg-ui-background border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-ui-accent/50"
                                    required
                                />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-[10px] font-bold text-white hover:bg-white/5"
                                >
                                    CANCEL
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 rounded-xl bg-ui-accent text-white text-[10px] font-bold shadow-lg shadow-ui-accent/20 transition-transform active:scale-95"
                                >
                                    {isEditing
                                        ? "SAVE_CHANGES"
                                        : "CREATE_RECORD"}
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
