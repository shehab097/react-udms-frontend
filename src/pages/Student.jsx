import React, { useState, useEffect } from "react";
import { getToken } from "../services/tokenService";

const Student = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const [sortConfig, setSortConfig] = useState({
        key: "name",
        direction: "asc",
    });

    useEffect(() => {
        const fetchStudents = async () => {
            const token = getToken();
            try {
                const response = await fetch("http://localhost:8080/student", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setStudents(Array.isArray(data) ? data : []);
                } else {
                    setError(`ACCESS_ERROR: ${response.status}`);
                }
            } catch (err) {
                console.log(err)
                setError("CONNECTION_FAILURE: Student database offline.");
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, []);

    const filteredStudents = students.filter((s) => {
        const search = searchTerm.toLowerCase();
        return (
            (s.name?.toLowerCase().includes(search) ?? false) ||
            (s.email?.toLowerCase().includes(search) ?? false) ||
            (s.studentID?.toLowerCase().includes(search) ?? false) ||
            (s.username?.toLowerCase().includes(search) ?? false)
        );
    });

    const sortedStudents = [...filteredStudents].sort((a, b) => {
        let valA = a[sortConfig.key] ?? "";
        let valB = b[sortConfig.key] ?? "";
        if (sortConfig.key === "userId")
            return sortConfig.direction === "asc" ? valA - valB : valB - valA;
        valA = valA.toString().toLowerCase();
        valB = valB.toString().toLowerCase();
        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
    });

    const handleSortChange = (e) => {
        const [key, direction] = e.target.value.split("-");
        setSortConfig({ key, direction });
    };

    if (loading)
        return (
            <div className="p-10 text-ui-accent font-mono text-sm animate-pulse">
                L0ADING_STUDENT_DATA...
            </div>
        );
    if (error)
        return (
            <div className="p-10 text-ui-secondary font-mono text-xs">
                &gt; {error}
            </div>
        );

    return (
        <div className="w-full space-y-5 animate-in fade-in duration-500 overflow-hidden">
            {/* Control Bar */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    <div className="w-full md:w-64">
                        <label className="block text-[11px] font-mono text-ui-highlight uppercase tracking-widest mb-1.5 ml-1">
                            Search
                        </label>
                        <input
                            type="text"
                            placeholder="Search records..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-ui-background/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-ui-accent transition-all text-content-primary"
                        />
                    </div>

                    <div className="w-full md:w-48">
                        <label className="block text-[11px] font-mono text-ui-highlight uppercase tracking-widest mb-1.5 ml-1">
                            Sort
                        </label>
                        <select
                            onChange={handleSortChange}
                            className="w-full bg-ui-background/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-ui-accent text-content-primary cursor-pointer"
                        >
                            <option value="name-asc">Name (A-Z)</option>
                            <option value="name-desc">Name (Z-A)</option>
                            <option value="studentID-asc">Student ID</option>
                            <option value="userId-asc">System ID</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table Container */}
            <div className="w-full overflow-x-auto rounded-xl border border-white/5 bg-ui-surface/20 shadow-xl custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/5">
                            <th className="p-4 text-[11px] uppercase tracking-widest text-ui-highlight font-bold w-36">
                                Student ID
                            </th>
                            <th className="p-4 text-[11px] uppercase tracking-widest text-ui-highlight font-bold w-56">
                                Name
                            </th>
                            <th className="p-4 text-[11px] uppercase tracking-widest text-ui-highlight font-bold w-56">
                                Current Semester
                            </th>
                            <th className="p-4 text-[11px] uppercase tracking-widest text-ui-highlight font-bold">
                                Email
                            </th>
                            <th className="p-4 text-[11px] uppercase tracking-widest text-ui-highlight font-bold w-36">
                                Phone
                            </th>
                            <th className="p-4 text-[11px] uppercase tracking-widest text-ui-highlight font-bold w-28">
                                Gender
                            </th>
                            <th className="p-4 text-[11px] uppercase tracking-widest text-ui-highlight font-bold">
                                Address
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                        {sortedStudents.map((s) => (
                            <tr
                                key={s.id}
                                className="hover:bg-white/[0.02] transition-colors"
                            >
                                <td className="p-4 font-mono text-ui-accent font-semibold">
                                    {s.studentID || "N/A"}
                                </td>
                                <td className="p-4">
                                    <div className="font-semibold text-content-primary">
                                        {s.name || "Unnamed"}
                                    </div>
                                    <div className="text-[10px] text-content-secondary opacity-50">
                                        @{s.username}
                                    </div>
                                </td>
                                <td
                                    className={`p-4 ${s.currSemester ? "text-content-primary" : "text-content-secondary/30 italic"}`}
                                >
                                    {s.currSemester || "--"}
                                </td>
                                <td
                                    className={`p-4 ${s.email ? "text-content-primary" : "text-content-secondary/30 italic"}`}
                                >
                                    {s.email || "no_email"}
                                </td>
                                <td className="p-4 font-mono text-content-secondary text-[13px]">
                                    {s.phone || "---"}
                                </td>
                                <td className="p-4">
                                    <span
                                        className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-tight ${
                                            s.gender === "MALE"
                                                ? "border-blue-500/20 bg-blue-500/5 text-blue-400"
                                                : s.gender === "FEMALE"
                                                  ? "border-pink-500/20 bg-pink-500/5 text-pink-400"
                                                  : "border-white/10 text-content-secondary/40"
                                        }`}
                                    >
                                        {s.gender || "U"}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div
                                        className="max-w-[200px] truncate text-content-secondary text-[13px]"
                                        title={s.address}
                                    >
                                        {s.address || "---"}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Student;
