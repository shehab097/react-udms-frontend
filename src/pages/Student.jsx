import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getToken } from "../services/tokenService";
import { Edit2, Check, X } from "lucide-react";
// Assuming you add SEMESTER_ENDPOINT to your config file
import { STUDENT_ENDPOINT, SEMESTER_ENDPOINT } from "../config/config";
import Toast from "../components/Toast";
import Loading from "../components/Loading";

const Student = () => {
    const [students, setStudents] = useState([]);
    const [availableSemesters, setAvailableSemesters] = useState([]); // New state for semesters
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [userRole, setUserRole] = useState("");

    // Toast State
    const [toastConfig, setToastConfig] = useState({
        show: false,
        message: "",
        type: "error",
    });

    // Filtering/Update States
    const [deptFilter, setDeptFilter] = useState("");
    const [semFilter, setSemFilter] = useState("");
    const [editingUsername, setEditingUsername] = useState(null);
    const [newSemValue, setNewSemValue] = useState("");
    const [sortConfig, setSortConfig] = useState({
        key: "name",
        direction: "asc",
    });

    // 🕵️ Manual JWT Decoder
    const getRoleFromToken = (token) => {
        try {
            const base64Url = token.split(".")[1];
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
            const payload = JSON.parse(window.atob(base64));
            return payload.role || payload.roles?.[0] || "";
        } catch (e) {
            return "";
        }
    };

    const showToast = (message, type = "error") => {
        setToastConfig({ show: true, message, type });
    };

    const fetchStudents = async () => {
        const token = getToken();
        if (token) setUserRole(getRoleFromToken(token));

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
                showToast(`ACCESS_ERROR: ${response.status}`, "error");
            }
        } catch (err) {
            showToast("CONNECTION_FAILURE: Database offline", "error");
        } finally {
            setLoading(false);
        }
    };

    // Fetch Semesters from the Backend
    const fetchSemesters = async () => {
        const token = getToken();
        try {
            const response = await fetch(SEMESTER_ENDPOINT, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setAvailableSemesters(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            console.error("Failed to fetch semesters:", err);
        }
    };

    useEffect(() => {
        fetchStudents();
        fetchSemesters();
    }, []);

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
                    // Send object wrapper for currSemester so backend can extract .getId()
                    body: JSON.stringify({
                        currSemester: newSemValue
                            ? { id: parseInt(newSemValue) }
                            : null,
                    }),
                },
            );

            if (response.ok) {
                showToast(`Record updated for @${username}`, "success");
                setEditingUsername(null);
                fetchStudents();
            } else {
                showToast("Update failed. Insufficient privileges.", "error");
            }
        } catch (err) {
            showToast("Network error during update", "error");
        }
    };

    // Filtering & Sorting Logic
    const filteredStudents = students.filter((s) => {
        const matchesSearch =
            (s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ??
                false) ||
            (s.studentID?.toLowerCase().includes(searchTerm.toLowerCase()) ??
                false) ||
            (s.username?.toLowerCase().includes(searchTerm.toLowerCase()) ??
                false);
        return (
            matchesSearch &&
            (deptFilter === "" || s.department === deptFilter) &&
            // Check against semesterNo object attribute now instead of flat string
            (semFilter === "" ||
                s.currSemester?.semesterNo?.toString() === semFilter)
        );
    });

    const sortedStudents = [...filteredStudents].sort((a, b) => {
        let valA = a[sortConfig.key] ?? "";
        let valB = b[sortConfig.key] ?? "";

        // Handle nested currSemester object sorting
        if (sortConfig.key === "currSemester") {
            valA = a.currSemester?.semesterNo ?? 0;
            valB = b.currSemester?.semesterNo ?? 0;
            return sortConfig.direction === "asc" ? valA - valB : valB - valA;
        }

        valA = valA.toString().toLowerCase();
        valB = valB.toString().toLowerCase();
        return sortConfig.direction === "asc"
            ? valA < valB
                ? -1
                : 1
            : valA > valB
              ? -1
              : 1;
    });

    if (loading)
        return (
            <div className="flex items-center gap-3 text-ui-accent font-mono animate-pulse">
                <Loading />
            </div>
        );

    return (
        <div className="w-full space-y-6">
            {toastConfig.show && (
                <Toast
                    message={toastConfig.message}
                    type={toastConfig.type}
                    onClose={() =>
                        setToastConfig({ ...toastConfig, show: false })
                    }
                />
            )}

            {/* Filter Bar */}
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
            </div>

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
                                            {/* Changed to Select Dropdown */}
                                            <select
                                                value={newSemValue}
                                                onChange={(e) =>
                                                    setNewSemValue(
                                                        e.target.value,
                                                    )
                                                }
                                                className="bg-ui-background border border-ui-accent rounded px-2 py-1 text-xs outline-none text-gray-200 max-w-[150px]"
                                            >
                                                <option value="">
                                                    Select Sem...
                                                </option>
                                                {availableSemesters.map(
                                                    (sem) => (
                                                        <option
                                                            key={sem.id}
                                                            value={sem.id}
                                                        >
                                                            Sem {sem.semesterNo}{" "}
                                                            (Batch {sem.batch} -{" "}
                                                            {sem.session})
                                                        </option>
                                                    ),
                                                )}
                                            </select>

                                            <button
                                                onClick={() =>
                                                    handleUpdateSemester(
                                                        s.username,
                                                    )
                                                }
                                                className="text-green-500 hover:text-green-400 p-1"
                                            >
                                                <Check size={16} />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    setEditingUsername(null)
                                                }
                                                className="text-red-500 hover:text-red-400 p-1"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            {/* Render DTO fields correctly */}
                                            <span className="font-mono text-gray-300 text-xs">
                                                {s.currSemester
                                                    ? `Sem ${s.currSemester.semesterNo} (B${s.currSemester.batch})`
                                                    : "--"}
                                            </span>

                                            {userRole !== "STUDENT" && (
                                                <button
                                                    onClick={() => {
                                                        setEditingUsername(
                                                            s.username,
                                                        );
                                                        setNewSemValue(
                                                            s.currSemester
                                                                ?.id || "",
                                                        );
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-ui-accent transition-all"
                                                >
                                                    <Edit2 size={12} />
                                                </button>
                                            )}
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
