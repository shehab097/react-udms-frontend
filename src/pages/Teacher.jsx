import React, { useState, useEffect } from "react";
import { getToken } from "../services/tokenService";
import { TEACHER_ENDPOINT } from "../config/config";

const Teacher = () => {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Track which teacher card is expanded
    const [expandedTeacherId, setExpandedTeacherId] = useState(null);

    const [sortConfig, setSortConfig] = useState({
        key: "name",
        direction: "asc",
    });

    useEffect(() => {
        const fetchTeachers = async () => {
            const token = getToken();
            try {
                const response = await fetch(TEACHER_ENDPOINT, {
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
                    setError(`ACCESS_ERROR: ${response.status}`);
                }
            } catch (err) {
                setError("CONNECTION_FAILURE: Faculty database offline.");
            } finally {
                setLoading(false);
            }
        };
        fetchTeachers();
    }, []);

    const toggleExpand = (id) => {
        setExpandedTeacherId(expandedTeacherId === id ? null : id);
    };

    const filteredTeachers = teachers.filter((t) => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
            (t.name?.toLowerCase().includes(search) ?? false) ||
            (t.email?.toLowerCase().includes(search) ?? false) ||
            (t.username?.toLowerCase().includes(search) ?? false)
        );
    });

    const sortedTeachers = [...filteredTeachers].sort((a, b) => {
        let valA = a[sortConfig.key] ?? "";
        let valB = b[sortConfig.key] ?? "";

        if (sortConfig.key === "userId" || sortConfig.key === "id") {
            return sortConfig.direction === "asc" ? valA - valB : valB - valA;
        }

        valA = valA.toString().toLowerCase();
        valB = valB.toString().toLowerCase();

        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
    });

    if (loading)
        return (
            <div className="p-10 text-ui-accent font-mono animate-pulse">
                L0ADING_TEACHER_REGISTRY...
            </div>
        );
    if (error)
        return (
            <div className="p-10 text-ui-secondary font-mono text-sm">
                &gt; {error}
            </div>
        );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Control Bar (Search/Sort) - Keeping your existing UI here */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    <div className="w-full md:w-64">
                        <label className="block text-[10px] font-mono text-ui-highlight uppercase tracking-widest mb-2 ml-1">
                            Search
                        </label>
                        <input
                            type="text"
                            placeholder="Name, email, or user..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-ui-background/50 border border-white/10 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-ui-accent transition-all text-content-primary"
                        />
                    </div>
                    {/* ... (Keeping your Sort Dropdown code) */}
                </div>
            </div>

            {/* Table with Expansion Logic */}
            <div className="overflow-x-auto rounded-2xl border border-white/5 bg-ui-surface/20">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/5">
                            <th className="p-5 text-[10px] uppercase tracking-widest text-ui-highlight font-bold">
                                Faculty Member
                            </th>
                            <th className="p-5 text-[10px] uppercase tracking-widest text-ui-highlight font-bold">
                                Contact Info
                            </th>
                            <th className="p-5 text-[10px] uppercase tracking-widest text-ui-highlight font-bold">
                                Gender
                            </th>
                            <th className="p-5 text-[10px] uppercase tracking-widest text-ui-highlight font-bold">
                                Campus Address
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {sortedTeachers.map((t) => (
                            <React.Fragment key={t.id}>
                                <tr
                                    onClick={() => toggleExpand(t.id)}
                                    className={`cursor-pointer transition-colors group ${expandedTeacherId === t.id ? "bg-white/[0.05]" : "hover:bg-white/[0.02]"}`}
                                >
                                    <td className="p-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-ui-surface border border-white/10 flex items-center justify-center font-bold text-ui-highlight group-hover:border-ui-accent transition-colors">
                                                {t.name
                                                    ? t.name
                                                          .charAt(0)
                                                          .toUpperCase()
                                                    : t.username
                                                          .charAt(0)
                                                          .toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-bold text-content-primary text-sm flex items-center gap-2">
                                                    {t.name ||
                                                        "Unnamed Faculty"}
                                                    <span
                                                        className={`text-[8px] transition-transform duration-300 ${expandedTeacherId === t.id ? "rotate-180" : ""}`}
                                                    >
                                                        ▼
                                                    </span>
                                                </div>
                                                <div className="text-[10px] font-mono text-content-secondary uppercase">
                                                    @{t.username} | ID: {t.id}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-xs text-content-primary">
                                                {t.email || "no_email"}
                                            </span>
                                            <span className="text-[10px] font-mono text-content-secondary">
                                                {t.phone || "no_phone"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <span
                                            className={`px-2 py-0.5 rounded text-[9px] font-black border tracking-widest uppercase ${t.gender === "MALE" ? "bg-blue-500/5 border-blue-500/20 text-blue-400" : "bg-pink-500/5 border-pink-500/20 text-pink-400"}`}
                                        >
                                            {t.gender || "UNDEFINED"}
                                        </span>
                                    </td>
                                    <td className="p-5">
                                        <div className="max-w-[180px] text-xs leading-relaxed line-clamp-2 text-content-secondary">
                                            {t.address ||
                                                "No address synchronized."}
                                        </div>
                                    </td>
                                </tr>

                                {/* Expanded Course Section */}
                                {expandedTeacherId === t.id && (
                                    <tr className="bg-ui-background/30 border-l-2 border-ui-accent animate-in slide-in-from-top-2 duration-300">
                                        <td colSpan="4" className="p-6">
                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-mono text-ui-accent uppercase tracking-[0.2em] font-bold">
                                                    Assigned_Courses [
                                                    {t.courses?.length || 0}]
                                                </h4>

                                                {t.courses &&
                                                t.courses.length > 0 ? (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                        {t.courses.map(
                                                            (course) => (
                                                                <div
                                                                    key={
                                                                        course.id
                                                                    }
                                                                    className="bg-white/5 border border-white/10 p-3 rounded-xl flex flex-col justify-between hover:border-white/20 transition-all"
                                                                >
                                                                    <div>
                                                                        <div className="text-[10px] font-mono text-ui-highlight mb-1">
                                                                            {
                                                                                course.courseCode
                                                                            }
                                                                        </div>
                                                                        <div className="text-sm font-bold text-white leading-tight">
                                                                            {
                                                                                course.courseName
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                    <div className="mt-3 flex justify-between items-center text-[9px] font-mono text-content-secondary uppercase">
                                                                        <span>
                                                                            Sem:{" "}
                                                                            {
                                                                                course.courseSemester
                                                                            }
                                                                        </span>
                                                                        <span>
                                                                            Cr:{" "}
                                                                            {
                                                                                course.courseCredit
                                                                            }
                                                                        </span>
                                                                        <span className="text-ui-accent">
                                                                            {
                                                                                course.courseDepartment
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>
                                                ) : (
                                                    <p className="text-xs italic text-content-secondary/50 font-mono">
                                                        &gt; No active course
                                                        assignments found in
                                                        registry.
                                                    </p>
                                                )}
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
