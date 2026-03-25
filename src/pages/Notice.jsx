import React, { useState, useEffect } from "react";
import { getToken } from "../services/tokenService";
import { NOTICE_ENDPOINT } from "../config/config";

const Notice = () => {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);

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
            console.error("FETCH_ERROR", err);
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
            if (response.ok) fetchNotices();
        } catch (err) {
            console.error("DELETE_FAILED", err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = getToken();
        const timestamp = new Date().toISOString().split(".")[0];

        // Logic: Send null for "ALL" selections
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
                fetchNotices();
                closeModal();
            }
        } catch (err) {
            console.log(err);
            alert("PUBLISH_FAILED");
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
            <div className="p-10 text-ui-accent font-mono text-xs">
                SYNCING_BULLETIN...
            </div>
        );

    return (
        <div className="w-full space-y-5 animate-in fade-in duration-500">
            {/* Control Bar */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
                <div className="lg:col-span-2">
                    <label className="block text-[10px] font-mono text-ui-highlight uppercase mb-1">
                        Search
                    </label>
                    <input
                        type="text"
                        className="w-full bg-ui-background/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-content-primary outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-mono text-ui-highlight uppercase mb-1">
                        Dept
                    </label>
                    <select
                        className="w-full bg-ui-background/50 border border-white/10 rounded-lg px-2 py-2 text-sm text-content-primary outline-none"
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
                    <label className="block text-[10px] font-mono text-ui-highlight uppercase mb-1">
                        Sem
                    </label>
                    <select
                        className="w-full bg-ui-background/50 border border-white/10 rounded-lg px-2 py-2 text-sm text-content-primary outline-none"
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
                <button
                    onClick={() => openModal()}
                    className="bg-ui-secondary text-white text-[11px] font-bold h-[38px] rounded-lg"
                >
                    + POST
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-white/5 bg-ui-surface/20">
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/5 text-[11px] text-ui-highlight font-bold uppercase tracking-widest">
                            <th className="p-4 w-36">Time</th>
                            <th className="p-4">Content</th>
                            <th className="p-4 w-32 text-center">Audience</th>
                            <th className="p-4 w-28 text-center">Manage</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                        {filteredNotices.map((n) => (
                            <tr
                                key={n.id}
                                className="hover:bg-white/[0.01] align-top"
                            >
                                <td className="p-4 font-mono text-[11px]">
                                    <div className="text-ui-accent font-bold">
                                        {new Date(n.date).toLocaleDateString()}
                                    </div>
                                    <div className="text-content-secondary opacity-40 text-[9px] uppercase">
                                        By {n.postBy}
                                    </div>
                                </td>
                                <td
                                    className="p-4 cursor-pointer"
                                    onClick={() =>
                                        setExpandedId(
                                            expandedId === n.id ? null : n.id,
                                        )
                                    }
                                >
                                    <div className="font-bold text-content-primary mb-1">
                                        {n.title}
                                    </div>
                                    <div
                                        className={`text-xs text-content-secondary leading-relaxed ${expandedId === n.id ? "" : "line-clamp-1"}`}
                                    >
                                        {n.content}
                                    </div>
                                </td>
                                <td className="p-4 text-center">
                                    <div
                                        className={`text-[10px] font-bold px-2 py-0.5 rounded border inline-block uppercase ${n.department ? "bg-ui-accent/10 border-ui-accent/20 text-ui-accent" : "bg-white/5 border-white/10 text-content-secondary"}`}
                                    >
                                        {n.department || "GLOBAL"}
                                    </div>
                                    <div className="text-[9px] text-content-secondary mt-1 font-mono uppercase">
                                        {n.noticeForSem
                                            ? `SEM ${n.noticeForSem}`
                                            : "ALL SEM"}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex justify-center gap-3">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openModal(n);
                                            }}
                                            className="text-ui-highlight text-[10px] font-bold"
                                        >
                                            EDIT
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(n.id);
                                            }}
                                            className="text-ui-secondary/60 text-[10px] font-bold"
                                        >
                                            DEL
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 text-sm">
                    <div className="bg-ui-background border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl">
                        <h2 className="text-xs font-bold text-white mb-6 uppercase tracking-widest">
                            Notice_Composer
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                placeholder="Title"
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white outline-none"
                                value={formData.title}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        title: e.target.value,
                                    })
                                }
                            />
                            <textarea
                                placeholder="Content..."
                                required
                                rows="4"
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white resize-none outline-none"
                                value={formData.content}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        content: e.target.value,
                                    })
                                }
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <select
                                    className="bg-ui-surface border border-white/10 rounded-lg p-2.5 text-white outline-none"
                                    value={formData.department}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            department: e.target.value,
                                        })
                                    }
                                >
                                    <option value="ALL">All Departments</option>
                                    {DEPARTMENTS.map((d) => (
                                        <option key={d} value={d}>
                                            {d}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    className="bg-ui-surface border border-white/10 rounded-lg p-2.5 text-white outline-none"
                                    value={formData.noticeForSem}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            noticeForSem: e.target.value,
                                        })
                                    }
                                >
                                    <option value="ALL">All Semesters</option>
                                    {SEMESTERS.map((s) => (
                                        <option key={s} value={s}>
                                            Semester {s}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-4 mt-6">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 text-[10px] font-bold text-content-secondary"
                                >
                                    CANCEL
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-ui-secondary py-2 rounded-lg text-[10px] font-bold text-white"
                                >
                                    PUBLISH
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
