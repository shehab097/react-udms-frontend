import React, { useState, useEffect } from "react";
import { getToken, getRole } from "../services/tokenService";
import { NOTICE_ENDPOINT } from "../config/config";
import Toast from "../components/Toast";
import { Link } from "react-router-dom";
import Loading from "../components/Loading";

const Notice = () => {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);

    // Role Check
    const role = getRole();
    const isStudent = role === "ROLE_STUDENT" || role === "STUDENT";

    // Toast State
    const [toast, setToast] = useState({
        show: false,
        message: "",
        type: "error",
    });

    // Filter/Sort States
    const [searchTerm, setSearchTerm] = useState("");
    const [deptFilter, setDeptFilter] = useState("ALL");
    const [semFilter, setSemFilter] = useState("ALL");
    const [sortOrder, setSortOrder] = useState("desc");

    // Modal & Form
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingNotice, setEditingNotice] = useState(null);

    const DEPARTMENTS = ["CSE", "EEE", "BBA", "ENGLISH", "CIVIL"];
    const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

    const [formData, setFormData] = useState({
        title: "",
        content: "",
        noticeForSem: "ALL",
        department: "ALL",
    });

    const showToast = (message, type = "error") =>
        setToast({ show: true, message, type });
    const hideToast = () => setToast((prev) => ({ ...prev, show: false }));

    const fetchNotices = async () => {
        const token = getToken();
        try {
            const response = await fetch(NOTICE_ENDPOINT, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setNotices(data);
            }
        } catch (err) {
            showToast("FAILED_TO_FETCH_NOTICES", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotices();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Confirm deletion?")) return;
        const token = getToken();
        try {
            const response = await fetch(`${NOTICE_ENDPOINT}/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                showToast("NOTICE_DELETED", "success");
                fetchNotices();
            }
        } catch (err) {
            showToast("DELETE_FAILED", "error");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = getToken();
        const timestamp = new Date().toISOString().split(".")[0];

        const payload = {
            title: formData.title,
            content: formData.content,
            date: timestamp,
            postBy: "Admin",
            noticeForSem:
                formData.noticeForSem === "ALL"
                    ? null
                    : parseInt(formData.noticeForSem),
            department:
                formData.department === "ALL" ? null : formData.department,
        };

        const method = editingNotice ? "PUT" : "POST";
        const url = editingNotice
            ? `${NOTICE_ENDPOINT}/${editingNotice.id}`
            : NOTICE_ENDPOINT;

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });
            if (response.ok) {
                showToast(
                    editingNotice ? "NOTICE_UPDATED" : "NOTICE_PUBLISHED",
                    "success",
                );
                fetchNotices();
                closeModal();
            }
        } catch (err) {
            showToast("SUBMISSION_FAILED", "error");
        }
    };

    const openModal = (notice = null) => {
        if (notice) {
            setEditingNotice(notice);
            setFormData({
                title: notice.title,
                content: notice.content,
                noticeForSem: notice.noticeForSem ?? "ALL",
                department: notice.department ?? "ALL",
            });
        } else {
            setEditingNotice(null);
            setFormData({
                title: "",
                content: "",
                noticeForSem: "ALL",
                department: "ALL",
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingNotice(null);
    };

    const filteredNotices = notices
        .filter((n) => {
            const matchesSearch = n.title
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase());
            const matchesDept =
                deptFilter === "ALL" || n.department === deptFilter;
            const matchesSem =
                semFilter === "ALL" ||
                (n.noticeForSem !== null &&
                    n.noticeForSem.toString() === semFilter);
            return matchesSearch && matchesDept && matchesSem;
        })
        .sort((a, b) => {
            const timeA = new Date(a.date).getTime();
            const timeB = new Date(b.date).getTime();
            return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
        });

    if (loading)
        return (
            <div className="flex items-center justify-center py-20 text-ui-accent font-mono animate-pulse">
                <Loading />
            </div>
        );

    return (
        <div className="w-full space-y-6">
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={hideToast}
                />
            )}

            {/* Control Bar - Adjusted for mobile stacking */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 items-end">
                <div className="sm:col-span-2 lg:col-span-2">
                    <label className="block text-[11px] font-mono text-ui-highlight uppercase mb-1.5 tracking-wider">
                        Search
                    </label>
                    <input
                        type="text"
                        placeholder="Filter by title..."
                        className="w-full bg-ui-background/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-content-primary outline-none focus:border-ui-accent/50 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-[11px] font-mono text-ui-highlight uppercase mb-1.5 tracking-wider">
                        Dept
                    </label>
                    <select
                        className="w-full bg-ui-background/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-content-primary outline-none cursor-pointer"
                        value={deptFilter}
                        onChange={(e) => setDeptFilter(e.target.value)}
                    >
                        <option value="ALL">All Depts</option>
                        {DEPARTMENTS.map((d) => (
                            <option key={d} value={d}>
                                {d}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-[11px] font-mono text-ui-highlight uppercase mb-1.5 tracking-wider">
                        Sem
                    </label>
                    <select
                        className="w-full bg-ui-background/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-content-primary outline-none cursor-pointer"
                        value={semFilter}
                        onChange={(e) => setSemFilter(e.target.value)}
                    >
                        <option value="ALL">All Sem</option>
                        {SEMESTERS.map((s) => (
                            <option key={s} value={s.toString()}>
                                Sem {s}
                            </option>
                        ))}
                    </select>
                </div>
                {!isStudent && (
                    <button
                        onClick={() => openModal()}
                        className="w-full bg-ui-accent hover:bg-ui-accent/80 text-white text-[12px] font-black h-[42px] rounded-xl transition-all shadow-lg shadow-ui-accent/10 mt-2 lg:mt-0"
                    >
                        + POST_NOTICE
                    </button>
                )}
            </div>

            {/* MOBILE VIEW: Stacked Cards (Hidden on md and up) */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {filteredNotices.map((n) => (
                    <div
                        key={n.id}
                        className="bg-ui-surface/20 border border-white/5 rounded-2xl p-4 flex flex-col space-y-3"
                    >
                        <div className="flex justify-between items-start">
                            <div className="text-[10px] font-mono text-ui-accent">
                                {new Date(n.date).toLocaleDateString()}
                            </div>
                            <div className="flex gap-2">
                                <span
                                    className={`text-[9px] font-black px-2 py-0.5 rounded border ${n.department ? "bg-ui-accent/10 border-ui-accent/30 text-ui-accent" : "bg-white/5 border-white/20 text-content-secondary"}`}
                                >
                                    {n.department || "GLOBAL"}
                                </span>
                                <span className="text-[9px] font-black px-2 py-0.5 rounded border bg-white/5 border-white/20 text-content-secondary">
                                    {n.noticeForSem
                                        ? `SEM_${n.noticeForSem}`
                                        : "ALL"}
                                </span>
                            </div>
                        </div>

                        <div
                            className="cursor-pointer group"
                            onClick={() =>
                                setExpandedId(expandedId === n.id ? null : n.id)
                            }
                        >
                            <div className="font-bold text-white text-sm mb-1 group-hover:text-ui-accent transition-colors">
                                {n.title}
                            </div>
                            <div
                                className={`text-content-secondary text-xs leading-relaxed ${expandedId === n.id ? "" : "line-clamp-2"}`}
                            >
                                {n.content}
                            </div>
                        </div>

                        {!isStudent && (
                            <div className="flex justify-end gap-4 pt-3 border-t border-white/5 mt-2">
                                <button
                                    onClick={() => openModal(n)}
                                    className="text-ui-highlight text-[10px] font-bold uppercase tracking-widest"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(n.id)}
                                    className="text-red-400/80 text-[10px] font-bold uppercase tracking-widest"
                                >
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* DESKTOP VIEW: Table (Hidden on small screens) */}
            <div className="hidden md:block overflow-x-auto rounded-2xl border border-white/5 bg-ui-surface/20 backdrop-blur-md custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/5 text-[12px] text-ui-highlight font-bold uppercase tracking-[0.2em]">
                            <th className="p-5 w-40">Time_Stamp</th>
                            <th className="p-5">Bulletin_Content</th>
                            <th className="p-5 w-36 text-center">Audience</th>
                            {!isStudent && (
                                <th className="p-5 w-32 text-center">
                                    Management
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-[13px]">
                        {filteredNotices.map((n) => (
                            <tr
                                key={n.id}
                                className="hover:bg-white/[0.02] transition-colors align-top"
                            >
                                <td className="p-5 font-mono">
                                    <div className="text-ui-accent font-bold">
                                        {new Date(n.date).toLocaleDateString()}
                                    </div>
                                    <div className="text-content-secondary text-[11px] opacity-50 mt-1 tracking-tighter">
                                        Post: {n.postBy || "UNKNOWN"}
                                    </div>
                                </td>
                                <td
                                    className="p-5 cursor-pointer group"
                                    onClick={() =>
                                        setExpandedId(
                                            expandedId === n.id ? null : n.id,
                                        )
                                    }
                                >
                                    <div className="font-bold text-white text-base mb-1.5 group-hover:text-ui-accent transition-colors">
                                        {n.title}
                                    </div>
                                    <div
                                        className={`text-content-secondary leading-relaxed ${expandedId === n.id ? "" : "line-clamp-1"}`}
                                    >
                                        {n.content}
                                    </div>
                                </td>
                                <td className="p-5 text-center">
                                    <div
                                        className={`text-[10px] font-black px-3 py-1 rounded-full border inline-block mb-1.5 ${n.department ? "bg-ui-accent/10 border-ui-accent/30 text-ui-accent" : "bg-white/5 border-white/20 text-content-secondary"}`}
                                    >
                                        {n.department || "GLOBAL"}
                                    </div>
                                    <div className="text-[10px] text-content-secondary font-mono uppercase tracking-widest block">
                                        {n.noticeForSem
                                            ? `SEM_${n.noticeForSem}`
                                            : "ALL_LEVELS"}
                                    </div>
                                </td>
                                {!isStudent && (
                                    <td className="p-5">
                                        <div className="flex justify-center gap-4">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openModal(n);
                                                }}
                                                className="text-ui-highlight hover:text-white text-[11px] font-bold underline decoration-ui-highlight/30 underline-offset-4"
                                            >
                                                EDIT
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(n.id);
                                                }}
                                                className="text-ui-secondary/70 hover:text-white text-[11px] font-bold"
                                            >
                                                DELETE
                                            </button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal - Adjusted padding for mobile */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-3 sm:p-4">
                    <div className="bg-ui-background border border-white/10 p-5 sm:p-8 rounded-2xl sm:rounded-3xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
                        <h2 className="text-xs sm:text-sm font-black text-white mb-6 sm:mb-8 uppercase tracking-[0.3em] border-b border-white/5 pb-4">
                            {editingNotice
                                ? "EDIT_NOTICE_ENTRY"
                                : "CREATE_NEW_BULLETIN"}
                        </h2>
                        <form
                            onSubmit={handleSubmit}
                            className="space-y-4 sm:space-y-5"
                        >
                            <div>
                                <label className="text-[10px] font-mono text-ui-highlight uppercase mb-1.5 sm:mb-2 block">
                                    Title_Field
                                </label>
                                <input
                                    placeholder="Enter notice headline..."
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-ui-accent"
                                    value={formData.title}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            title: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-mono text-ui-highlight uppercase mb-1.5 sm:mb-2 block">
                                    Content_Body
                                </label>
                                <textarea
                                    placeholder="Type notice details..."
                                    required
                                    rows="4"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white resize-none outline-none focus:border-ui-accent"
                                    value={formData.content}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            content: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                <div>
                                    <label className="text-[10px] font-mono text-ui-highlight uppercase mb-1.5 sm:mb-2 block">
                                        Target_Dept
                                    </label>
                                    <select
                                        className="w-full bg-ui-surface border border-white/10 rounded-xl p-3 text-sm text-white outline-none"
                                        value={formData.department}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                department: e.target.value,
                                            })
                                        }
                                    >
                                        <option value="ALL">All Depts</option>
                                        {DEPARTMENTS.map((d) => (
                                            <option key={d} value={d}>
                                                {d}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-mono text-ui-highlight uppercase mb-1.5 sm:mb-2 block">
                                        Target_Sem
                                    </label>
                                    <select
                                        className="w-full bg-ui-surface border border-white/10 rounded-xl p-3 text-sm text-white outline-none"
                                        value={formData.noticeForSem}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                noticeForSem: e.target.value,
                                            })
                                        }
                                    >
                                        <option value="ALL">All Sems</option>
                                        {SEMESTERS.map((s) => (
                                            <option key={s} value={s}>
                                                Sem {s}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-3 sm:gap-4 mt-6 sm:mt-8 pt-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 text-[10px] sm:text-[11px] font-black text-content-secondary hover:text-white transition-colors tracking-widest"
                                >
                                    ABORT
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-ui-accent py-3 rounded-xl text-[10px] sm:text-[11px] font-black text-ui-background shadow-lg shadow-ui-accent/20 tracking-widest"
                                >
                                    {editingNotice ? "UPDATE" : "PUBLISH"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Notice;
