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
                        // bg-ui-surface for light theme input
                        className="w-full bg-ui-surface border border-ui-neutral rounded-xl px-4 py-2.5 text-sm text-content-primary outline-none focus:border-ui-accent transition-all placeholder:text-content-muted"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-[11px] font-mono text-ui-highlight uppercase mb-1.5 tracking-wider">
                        Dept
                    </label>
                    <select
                        className="w-full bg-ui-surface border border-ui-neutral rounded-xl px-3 py-2.5 text-sm text-content-primary outline-none cursor-pointer focus:border-ui-accent"
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
                        className="w-full bg-ui-surface border border-ui-neutral rounded-xl px-3 py-2.5 text-sm text-content-primary outline-none cursor-pointer focus:border-ui-accent"
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
                        // text-white for vibrant accent button text
                        className="w-full bg-ui-accent hover:brightness-110 text-white text-[12px] font-black h-[42px] rounded-xl transition-all shadow-md shadow-ui-accent/10 mt-2 lg:mt-0"
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
                        className="bg-ui-surface border border-ui-neutral rounded-2xl p-4 flex flex-col space-y-3 shadow-sm"
                    >
                        <div className="flex justify-between items-start">
                            <div className="text-[10px] font-mono text-ui-secondary">
                                {new Date(n.date).toLocaleDateString()}
                            </div>
                            <div className="flex gap-2">
                                <span
                                    // Indigo for Dept, Blue for Semester, similar to table badges
                                    className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase ${n.department ? "bg-ui-secondary/10 border-ui-secondary/20 text-ui-secondary" : "bg-ui-neutral/50 border-ui-neutral text-content-secondary"}`}
                                >
                                    {n.department || "GLOBAL"}
                                </span>
                                <span className="text-[9px] font-black px-2 py-0.5 rounded border bg-ui-accent/10 border-ui-accent/20 text-ui-accent">
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
                            <div className="font-bold text-content-primary text-sm mb-1 group-hover:text-ui-accent transition-colors">
                                {n.title}
                            </div>
                            <div
                                className={`text-content-secondary text-xs leading-relaxed ${expandedId === n.id ? "" : "line-clamp-2"}`}
                            >
                                {n.content}
                            </div>
                        </div>

                        {!isStudent && (
                            <div className="flex justify-end gap-4 pt-3 border-t border-ui-neutral mt-2">
                                <button
                                    onClick={() => openModal(n)}
                                    // Vibrant Highlight Green
                                    className="text-ui-highlight text-[10px] font-bold uppercase tracking-widest hover:brightness-110"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(n.id)}
                                    // secondary Red/Orange
                                    className="text-ui-secondary hover:brightness-110 text-[10px] font-bold uppercase tracking-widest"
                                >
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* DESKTOP VIEW: Table (Hidden on small screens) */}
            <div className="hidden md:block overflow-x-auto rounded-2xl border border-ui-neutral bg-ui-surface shadow-sm custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                        {/* Gray-100 header background, Gray-600 secondary text */}
                        <tr className="border-b border-ui-neutral bg-ui-background text-[12px] text-content-secondary font-bold uppercase tracking-[0.2em]">
                            <th className="p-5 w-40">Date</th>
                            <th className="p-5">Content</th>
                            <th className="p-5 w-36 text-center">Audience</th>
                            {!isStudent && (
                                <th className="p-5 w-32 text-center">
                                    Management
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-ui-neutral text-[13px]">
                        {filteredNotices.map((n) => (
                            <tr
                                key={n.id}
                                // Very subtle vibrant blue background on hover
                                className="hover:bg-ui-accent/[0.03] transition-colors align-top"
                            >
                                <td className="p-5 font-mono">
                                    {/* Blue Accent for Date */}
                                    <div className="text-ui-accent font-bold">
                                        {new Date(n.date).toLocaleDateString()}
                                    </div>
                                    <div className="text-content-muted text-[11px] mt-1 tracking-tighter">
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
                                    {/* Slate-900 for Primary Text */}
                                    <div className="font-bold text-content-primary text-base mb-1.5 group-hover:text-ui-accent transition-colors">
                                        {n.title}
                                    </div>
                                    {/* Gray-600 for Descriptive Content */}
                                    <div
                                        className={`text-content-secondary leading-relaxed ${expandedId === n.id ? "" : "line-clamp-1"}`}
                                    >
                                        {n.content}
                                    </div>
                                </td>
                                <td className="p-5 text-center">
                                    <div
                                        // Indigo Badge for Dept
                                        className={`text-[10px] font-black px-3 py-1 rounded-full border inline-block mb-1.5 ${n.department ? "bg-ui-secondary/10 border-ui-secondary/20 text-ui-secondary" : "bg-ui-neutral/50 border-ui-neutral text-content-secondary"}`}
                                    >
                                        {n.department || "To all"}
                                    </div>
                                    {/* Muted Text */}
                                    <div className="text-[10px] text-content-muted font-mono uppercase tracking-widest block">
                                        {n.noticeForSem
                                            ? `SEM ${n.noticeForSem}`
                                            : ""}
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
                                                // Vibrant Highlight Green, with underlined style from previous management tables
                                                className="text-ui-highlight hover:brightness-110 text-[11px] font-bold underline decoration-ui-highlight/30 underline-offset-4"
                                            >
                                                EDIT
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(n.id);
                                                }}
                                                // secondary red/orange
                                                className="text-ui-secondary hover:brightness-110 text-[11px] font-bold"
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
                // Neutral gray overlay
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-4">
                    {/* White surface, Neutral gray borders */}
                    <div className="bg-ui-surface border border-ui-neutral p-5 sm:p-8 rounded-2xl sm:rounded-3xl w-full max-w-lg shadow-2xl">
                        <h2 className="text-xs sm:text-sm font-black text-content-primary mb-6 sm:mb-8 uppercase tracking-[0.3em] border-b border-ui-neutral pb-4">
                            {editingNotice
                                ? "EDIT_NOTICE_ENTRY"
                                : "CREATE_NEW_BULLETIN"}
                        </h2>
                        <form
                            onSubmit={handleSubmit}
                            className="space-y-4 sm:space-y-5"
                        >
                            <div>
                                {/* Highlight green form labels */}
                                <label className="text-[10px] font-mono text-ui-highlight uppercase mb-1.5 sm:mb-2 block">
                                    Title_Field
                                </label>
                                <input
                                    placeholder="Enter notice headline..."
                                    required
                                    // background input
                                    className="w-full bg-ui-background border border-ui-neutral rounded-xl p-3 text-sm text-content-primary outline-none focus:border-ui-accent transition-colors placeholder:text-content-muted"
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
                                    className="w-full bg-ui-background border border-ui-neutral rounded-xl p-3 text-sm text-content-primary resize-none outline-none focus:border-ui-accent transition-colors placeholder:text-content-muted"
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
                                        className="w-full bg-ui-background border border-ui-neutral rounded-xl p-3 text-sm text-content-primary outline-none focus:border-ui-accent cursor-pointer"
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
                                        className="w-full bg-ui-background border border-ui-neutral rounded-xl p-3 text-sm text-content-primary outline-none focus:border-ui-accent cursor-pointer"
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
                                    // descriptive secondary text color
                                    className="flex-1 text-[10px] sm:text-[11px] font-black text-content-secondary hover:text-content-primary transition-colors tracking-widest"
                                >
                                    ABORT
                                </button>
                                <button
                                    type="submit"
                                    // text-white for vibrant accent button text
                                    className="flex-1 bg-ui-accent hover:brightness-110 py-3 rounded-xl text-[10px] sm:text-[11px] font-black text-white shadow-lg shadow-ui-accent/20 tracking-widest transition-all"
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

