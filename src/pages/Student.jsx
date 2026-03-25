import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getToken } from "../services/tokenService";
import { Edit2, Check, X, Filter as FilterIcon } from "lucide-react"; // npm install lucide-react
import { STUDENT_ENDPOINT } from "../config/config";

const Student = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Filtering States
    const [deptFilter, setDeptFilter] = useState("");
    const [semFilter, setSemFilter] = useState("");

    // Update States
    const [editingUsername, setEditingUsername] = useState(null);
    const [newSemValue, setNewSemValue] = useState("");

    const [sortConfig, setSortConfig] = useState({
        key: "name",
        direction: "asc",
    });

    const fetchStudents = async () => {
        const token = getToken();
        try {
            const response = await fetch(STUDENT_ENDPOINT, {
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
            setError("CONNECTION_FAILURE: Student database offline.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    // 🔄 Update Semester Logic
    const handleUpdateSemester = async (username) => {
        const token = getToken();
        try {
            const response = await fetch(
                `${STUDENT_ENDPOINT}/${username}/semester`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        currSemester: parseInt(newSemValue),
                    }),
                },
            );

            if (response.ok) {
                setEditingUsername(null);
                fetchStudents(); // Refresh list
            } else {
                alert("Update failed. Ensure you have ADMIN privileges.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    // 🔍 Multi-Variable Filtering
    const filteredStudents = students.filter((s) => {
        const matchesSearch =
            (s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ??
                false) ||
            (s.studentID?.toLowerCase().includes(searchTerm.toLowerCase()) ??
                false) ||
            (s.username?.toLowerCase().includes(searchTerm.toLowerCase()) ??
                false);
        const matchesDept = deptFilter === "" || s.department === deptFilter;
        const matchesSem =
            semFilter === "" || s.currSemester?.toString() === semFilter;

        return matchesSearch && matchesDept && matchesSem;
    });

    const sortedStudents = [...filteredStudents].sort((a, b) => {
        let valA = a[sortConfig.key] ?? "";
        let valB = b[sortConfig.key] ?? "";
        if (sortConfig.key === "userId" || sortConfig.key === "currSemester")
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

    // Extract unique options for filters
    const departments = [...new Set(students.map((s) => s.department))].filter(
        Boolean,
    );
    const semesters = [...new Set(students.map((s) => s.currSemester))]
        .filter(Boolean)
        .sort();

    if (loading)
        return (
            <div className="p-10 text-ui-accent font-mono text-sm animate-pulse">
                L0ADING_STUDENT_DATA...
            </div>
        );

    return (
        <div className="w-full space-y-6 animate-in fade-in duration-500">
            {/* 🛠️ Enhanced Control Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="md:col-span-1">
                    <label className="block text-[10px] font-mono text-ui-highlight uppercase tracking-[0.2em] mb-1.5 ml-1">
                        Search_Records
                    </label>
                    <input
                        type="text"
                        placeholder="Name, ID, or @username"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-ui-accent outline-none text-gray-200"
                    />
                </div>

                <div>
                    <label className="block text-[10px] font-mono text-ui-highlight uppercase tracking-[0.2em] mb-1.5 ml-1">
                        Dept_Filter
                    </label>
                    <select
                        value={deptFilter}
                        onChange={(e) => setDeptFilter(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-ui-accent text-gray-300 outline-none"
                    >
                        <option value="">All Departments</option>
                        {departments.map((d) => (
                            <option key={d} value={d}>
                                {d}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-[10px] font-mono text-ui-highlight uppercase tracking-[0.2em] mb-1.5 ml-1">
                        Sem_Filter
                    </label>
                    <select
                        value={semFilter}
                        onChange={(e) => setSemFilter(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-ui-accent text-gray-300 outline-none"
                    >
                        <option value="">All Semesters</option>
                        {semesters.map((s) => (
                            <option key={s} value={s}>
                                Semester {s}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-[10px] font-mono text-ui-highlight uppercase tracking-[0.2em] mb-1.5 ml-1">
                        Sort_Order
                    </label>
                    <select
                        onChange={handleSortChange}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-ui-accent text-gray-300 outline-none"
                    >
                        <option value="name-asc">Alphabetical (A-Z)</option>
                        <option value="name-desc">Alphabetical (Z-A)</option>
                        <option value="studentID-asc">
                            Student ID (Low-High)
                        </option>
                        <option value="currSemester-asc">Semester (1-8)</option>
                    </select>
                </div>
            </div>

            {/* 📊 Student Table */}
            <div className="w-full overflow-x-auto rounded-xl border border-white/5 shadow-2xl">
                <table className="w-full text-left border-collapse min-w-[1100px]">
                    <thead className="bg-white/[0.03] text-[10px] font-mono uppercase tracking-widest text-ui-highlight">
                        <tr>
                            <th className="p-4 border-b border-white/5">
                                Student_ID
                            </th>
                            <th className="p-4 border-b border-white/5">
                                Identity
                            </th>
                            <th className="p-4 border-b border-white/5">
                                Department
                            </th>
                            <th className="p-4 border-b border-white/5">
                                Semester
                            </th>
                            <th className="p-4 border-b border-white/5">
                                Contact
                            </th>
                            <th className="p-4 border-b border-white/5">
                                Gender
                            </th>
                            <th className="p-4 border-b border-white/5">
                                Location
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                        {sortedStudents.map((s) => (
                            <tr
                                key={s.id}
                                className="hover:bg-white/[0.01] transition-colors group"
                            >
                                <td className="p-4 font-mono text-ui-accent font-semibold">
                                    {s.studentID || "N/A"}
                                </td>
                                <td className="p-4">
                                    <div className="font-semibold text-gray-200">
                                        {s.name}
                                    </div>
                                    <Link
                                        to={`/view/student/${s.username}`}
                                        className="text-[10px] text-ui-accent/50 hover:text-ui-accent transition-all"
                                    >
                                        @{s.username}
                                    </Link>
                                </td>
                                <td className="p-4">
                                    <span className="px-2 py-1 rounded bg-purple-500/5 border border-purple-500/10 text-[11px] text-purple-400 font-mono">
                                        {s.department || "UNDEFINED"}
                                    </span>
                                </td>
                                <td className="p-4">
                                    {editingUsername === s.username ? (
                                        <div className="flex items-center gap-1 animate-in slide-in-from-left-2">
                                            <input
                                                type="number"
                                                value={newSemValue}
                                                onChange={(e) =>
                                                    setNewSemValue(
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-12 bg-ui-background border border-ui-accent rounded px-1 py-0.5 text-xs text-center outline-none"
                                            />
                                            <button
                                                onClick={() =>
                                                    handleUpdateSemester(
                                                        s.username,
                                                    )
                                                }
                                                className="text-green-500 hover:text-green-400"
                                            >
                                                <Check size={16} />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    setEditingUsername(null)
                                                }
                                                className="text-red-500 hover:text-red-400"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-gray-300">
                                                {s.currSemester || "--"}
                                            </span>
                                            <button
                                                onClick={() => {
                                                    setEditingUsername(
                                                        s.username,
                                                    );
                                                    setNewSemValue(
                                                        s.currSemester || "",
                                                    );
                                                }}
                                                className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-ui-accent transition-all"
                                            >
                                                <Edit2 size={12} />
                                            </button>
                                        </div>
                                    )}
                                </td>
                                <td className="p-4">
                                    <div className="text-xs text-gray-300">
                                        {s.email}
                                    </div>
                                    <div className="text-[10px] text-gray-500 font-mono">
                                        {s.phone}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span
                                        className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${s.gender === "MALE" ? "border-blue-500/20 text-blue-400" : "border-pink-500/20 text-pink-400"}`}
                                    >
                                        {s.gender?.charAt(0) || "U"}
                                    </span>
                                </td>
                                <td
                                    className="p-4 text-xs text-gray-500 max-w-[150px] truncate"
                                    title={s.address}
                                >
                                    {s.address || "---"}
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
