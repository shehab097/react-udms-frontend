import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { getToken } from "../services/tokenService";
import { Edit2, Check, X, ChevronUp, ChevronDown, FilterX } from "lucide-react";
import { STUDENT_ENDPOINT, SEMESTER_ENDPOINT } from "../config/config";
import Toast from "../components/Toast";
import Loading from "../components/Loading";

const Student = () => {
    const [students, setStudents] = useState([]);
    const [availableSemesters, setAvailableSemesters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [userRole, setUserRole] = useState("");

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
        key: "studentID",
        direction: "asc",
    });

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
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setStudents(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            showToast("CONNECTION_FAILURE: Database offline", "error");
        } finally {
            setLoading(false);
        }
    };

    const fetchSemesters = async () => {
        const token = getToken();
        try {
            const response = await fetch(SEMESTER_ENDPOINT, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setAvailableSemesters(Array.isArray(data) ? data : []);
            }
        } catch (err) {}
    };

    useEffect(() => {
        fetchStudents();
        fetchSemesters();
    }, []);

    // Unique departments for filter dropdown
    const departments = [...new Set(students.map((s) => s.department))].filter(
        Boolean,
    );

    const handleSort = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

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
                showToast("Update failed.", "error");
            }
        } catch (err) {
            showToast("Network error", "error");
        }
    };

    const filteredStudents = students.filter((s) => {
        const matchesSearch =
            s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.studentID?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.username?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesDept = deptFilter === "" || s.department === deptFilter;
        const matchesSem =
            semFilter === "" ||
            s.currSemester?.semesterNo?.toString() === semFilter;

        return matchesSearch && matchesDept && matchesSem;
    });

    const sortedStudents = [...filteredStudents].sort((a, b) => {
        let valA, valB;

        if (sortConfig.key === "currSemester") {
            valA = a.currSemester?.semesterNo || 0;
            valB = b.currSemester?.semesterNo || 0;
        } else {
            valA = a[sortConfig.key]?.toString().toLowerCase() || "";
            valB = b[sortConfig.key]?.toString().toLowerCase() || "";
        }

        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
    });

    // Calculate student count statistics
    const studentCounts = useMemo(() => {
        return {
            total: students.length,
            displayed: sortedStudents.length,
        };
    }, [students, sortedStudents]);

    const SortIcon = ({ column }) => {
        if (sortConfig.key !== column) return null;
        return sortConfig.direction === "asc" ? (
            <ChevronUp size={12} className="ml-1 inline" />
        ) : (
            <ChevronDown size={12} className="ml-1 inline" />
        );
    };

    if (loading)
        return (
            <div className="flex items-center gap-3 text-ui-accent font-mono animate-pulse">
                <Loading />
            </div>
        );

    return (
        <div className="w-full space-y-6">
            {/* 🍞 THE TOAST */}
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-ui-surface p-4 rounded-xl border border-ui-neutral shadow-sm">
                <div>
                    <label className="block text-[10px] font-mono text-ui-secondary uppercase tracking-[0.2em] mb-1.5 ml-1">
                        Search
                    </label>
                    <input
                        type="text"
                        placeholder="Name, ID, or @username"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-ui-background border border-ui-neutral rounded-lg px-3 py-2 text-sm focus:border-ui-accent focus:ring-2 focus:ring-ui-accent/10 outline-none text-content-primary placeholder:text-content-muted transition-all"
                    />
                </div>

                <div>
                    <label className="block text-[10px] font-mono text-ui-secondary uppercase tracking-[0.2em] mb-1.5 ml-1">
                        Department
                    </label>
                    <select
                        value={deptFilter}
                        onChange={(e) => setDeptFilter(e.target.value)}
                        className="w-full bg-ui-background border border-ui-neutral rounded-lg px-3 py-2 text-sm focus:border-ui-accent outline-none text-content-primary transition-all"
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
                    <label className="block text-[10px] font-mono text-ui-secondary uppercase tracking-[0.2em] mb-1.5 ml-1">
                        Semester
                    </label>
                    <select
                        value={semFilter}
                        onChange={(e) => setSemFilter(e.target.value)}
                        className="w-full bg-ui-background border border-ui-neutral rounded-lg px-3 py-2 text-sm focus:border-ui-accent outline-none text-content-primary transition-all"
                    >
                        <option value="">All Semesters</option>
                        {[
                            ...new Set(
                                availableSemesters.map((s) => s.semesterNo),
                            ),
                        ]
                            .sort((a, b) => a - b)
                            .map((num) => (
                                <option key={num} value={num}>
                                    Semester {num}
                                </option>
                            ))}
                    </select>
                </div>

                <button
                    onClick={() => {
                        setSearchTerm("");
                        setDeptFilter("");
                        setSemFilter("");
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-mono text-content-secondary hover:text-ui-accent transition-colors group"
                >
                    <FilterX
                        size={14}
                        className="group-hover:rotate-12 transition-transform"
                    />
                    RESET FILTERS
                </button>
            </div>

            {/* Student Count Summary */}
            <div className="flex items-center gap-4 p-4 bg-ui-surface rounded-xl border border-ui-neutral shadow-sm">
                <span className="text-xs font-mono text-content-secondary">
                    TOTAL_STUDENTS:{" "}
                    <span className="text-ui-accent font-bold">
                        {studentCounts.total}
                    </span>
                </span>
                <span className="text-xs font-mono text-content-secondary">
                    DISPLAYED:{" "}
                    <span className="text-ui-highlight font-bold">
                        {studentCounts.displayed}
                    </span>
                </span>
            </div>

            {/* Table Section */}
            <div className="w-full overflow-x-auto rounded-xl border border-ui-neutral bg-ui-surface shadow-sm">
                <table className="w-full text-left border-collapse min-w-[1100px]">
                    <thead className="bg-ui-background text-[10px] font-mono uppercase tracking-widest text-content-secondary border-b border-ui-neutral">
                        <tr>
                            <th
                                onClick={() => handleSort("studentID")}
                                className="p-4 cursor-pointer hover:text-ui-accent transition-colors"
                            >
                                Student ID <SortIcon column="studentID" />
                            </th>
                            <th
                                onClick={() => handleSort("name")}
                                className="p-4 cursor-pointer hover:text-ui-accent transition-colors"
                            >
                                Identity <SortIcon column="name" />
                            </th>
                            <th
                                onClick={() => handleSort("department")}
                                className="p-4 cursor-pointer hover:text-ui-accent transition-colors"
                            >
                                Department <SortIcon column="department" />
                            </th>
                            <th
                                onClick={() => handleSort("currSemester")}
                                className="p-4 cursor-pointer hover:text-ui-accent transition-colors"
                            >
                                Semester <SortIcon column="currSemester" />
                            </th>
                            <th className="p-4">Contact</th>
                            <th className="p-4">Gender</th>
                            <th className="p-4">Location</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-ui-neutral text-sm">
                        {sortedStudents.map((s) => (
                            <tr
                                key={s.id}
                                className="hover:bg-ui-background/50 transition-colors group"
                            >
                                <td className="p-4 font-mono text-ui-accent font-semibold">
                                    {s.studentID || "N/A"}
                                </td>
                                <td className="p-4">
                                    <div className="font-semibold text-content-primary">
                                        {s.name}
                                    </div>
                                    <Link
                                        to={`/view/student/${s.username}`}
                                        className="text-[10px] text-ui-secondary hover:text-ui-accent transition-colors"
                                    >
                                        @{s.username}
                                    </Link>
                                </td>
                                <td className="p-4">
                                    <span className="px-2 py-1 rounded bg-secondary/10 border border-secondary/20 text-[11px] text-secondary font-mono font-medium">
                                        {s.department || "UNDEFINED"}
                                    </span>
                                </td>
                                <td className="p-4">
                                    {editingUsername === s.username ? (
                                        <div className="flex items-center gap-1 animate-in fade-in zoom-in-95 duration-200">
                                            <select
                                                value={newSemValue}
                                                onChange={(e) =>
                                                    setNewSemValue(
                                                        e.target.value,
                                                    )
                                                }
                                                className="bg-white border border-ui-accent rounded px-2 py-1 text-xs outline-none text-content-primary shadow-sm"
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
                                                            (B{sem.batch})
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
                                                className="text-highlight p-1 hover:bg-highlight/10 rounded"
                                            >
                                                <Check size={16} />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    setEditingUsername(null)
                                                }
                                                className="text-content-muted p-1 hover:bg-ui-background rounded"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-content-secondary text-xs">
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
                                                    className="opacity-0 group-hover:opacity-100 text-ui-secondary hover:text-ui-accent transition-all"
                                                >
                                                    <Edit2 size={12} />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </td>
                                <td className="p-4">
                                    <div className="text-xs text-content-secondary font-medium">
                                        {s.email}
                                    </div>
                                    <div className="text-[10px] text-content-muted font-mono">
                                        {s.phone}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span
                                        className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
                                            s.gender === "MALE"
                                                ? "border-ui-accent/30 bg-ui-accent/5 text-ui-accent"
                                                : "border-pink-200 bg-pink-50 text-pink-600"
                                        }`}
                                    >
                                        {s.gender?.charAt(0) || "U"}
                                    </span>
                                </td>
                                <td
                                    className="p-4 text-xs text-content-secondary max-w-[150px] truncate"
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

// import React, { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import { getToken } from "../services/tokenService";
// import { Edit2, Check, X } from "lucide-react";
// // Assuming you add SEMESTER_ENDPOINT to your config file
// import { STUDENT_ENDPOINT, SEMESTER_ENDPOINT } from "../config/config";
// import Toast from "../components/Toast";
// import Loading from "../components/Loading";

// const Student = () => {
//     const [students, setStudents] = useState([]);
//     const [availableSemesters, setAvailableSemesters] = useState([]); // New state for semesters
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [searchTerm, setSearchTerm] = useState("");
//     const [userRole, setUserRole] = useState("");

//     // Toast State
//     const [toastConfig, setToastConfig] = useState({
//         show: false,
//         message: "",
//         type: "error",
//     });

//     // Filtering/Update States
//     const [deptFilter, setDeptFilter] = useState("");
//     const [semFilter, setSemFilter] = useState("");
//     const [editingUsername, setEditingUsername] = useState(null);
//     const [newSemValue, setNewSemValue] = useState("");
//     const [sortConfig, setSortConfig] = useState({
//         key: "name",
//         direction: "asc",
//     });

//     // 🕵️ Manual JWT Decoder
//     const getRoleFromToken = (token) => {
//         try {
//             const base64Url = token.split(".")[1];
//             const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
//             const payload = JSON.parse(window.atob(base64));
//             return payload.role || payload.roles?.[0] || "";
//         } catch (e) {
//             return "";
//         }
//     };

//     const showToast = (message, type = "error") => {
//         setToastConfig({ show: true, message, type });
//     };

//     const fetchStudents = async () => {
//         const token = getToken();
//         if (token) setUserRole(getRoleFromToken(token));

//         try {
//             const response = await fetch(STUDENT_ENDPOINT, {
//                 method: "GET",
//                 headers: {
//                     "Content-Type": "application/json",
//                     Authorization: `Bearer ${token}`,
//                 },
//             });
//             if (response.ok) {
//                 const data = await response.json();
//                 setStudents(Array.isArray(data) ? data : []);
//             } else {
//                 showToast(`ACCESS_ERROR: ${response.status}`, "error");
//             }
//         } catch (err) {
//             showToast("CONNECTION_FAILURE: Database offline", "error");
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Fetch Semesters from the Backend
//     const fetchSemesters = async () => {
//         const token = getToken();
//         try {
//             const response = await fetch(SEMESTER_ENDPOINT, {
//                 method: "GET",
//                 headers: {
//                     "Content-Type": "application/json",
//                     Authorization: `Bearer ${token}`,
//                 },
//             });
//             if (response.ok) {
//                 const data = await response.json();
//                 setAvailableSemesters(Array.isArray(data) ? data : []);
//             }
//         } catch (err) {
//             console.error("Failed to fetch semesters:", err);
//         }
//     };

//     useEffect(() => {
//         fetchStudents();
//         fetchSemesters();
//     }, []);

//     const handleUpdateSemester = async (username) => {
//         const token = getToken();
//         try {
//             const response = await fetch(
//                 `${STUDENT_ENDPOINT}/${username}/semester`,
//                 {
//                     method: "PUT",
//                     headers: {
//                         "Content-Type": "application/json",
//                         Authorization: `Bearer ${token}`,
//                     },
//                     // Send object wrapper for currSemester so backend can extract .getId()
//                     body: JSON.stringify({
//                         currSemester: newSemValue
//                             ? { id: parseInt(newSemValue) }
//                             : null,
//                     }),
//                 },
//             );

//             if (response.ok) {
//                 showToast(`Record updated for @${username}`, "success");
//                 setEditingUsername(null);
//                 fetchStudents();
//             } else {
//                 showToast("Update failed. Insufficient privileges.", "error");
//             }
//         } catch (err) {
//             showToast("Network error during update", "error");
//         }
//     };

//     // Filtering & Sorting Logic
//     const filteredStudents = students.filter((s) => {
//         const matchesSearch =
//             (s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ??
//                 false) ||
//             (s.studentID?.toLowerCase().includes(searchTerm.toLowerCase()) ??
//                 false) ||
//             (s.username?.toLowerCase().includes(searchTerm.toLowerCase()) ??
//                 false);
//         return (
//             matchesSearch &&
//             (deptFilter === "" || s.department === deptFilter) &&
//             // Check against semesterNo object attribute now instead of flat string
//             (semFilter === "" ||
//                 s.currSemester?.semesterNo?.toString() === semFilter)
//         );
//     });

//     const sortedStudents = [...filteredStudents].sort((a, b) => {
//         let valA = a[sortConfig.key] ?? "";
//         let valB = b[sortConfig.key] ?? "";

//         // Handle nested currSemester object sorting
//         if (sortConfig.key === "currSemester") {
//             valA = a.currSemester?.semesterNo ?? 0;
//             valB = b.currSemester?.semesterNo ?? 0;
//             return sortConfig.direction === "asc" ? valA - valB : valB - valA;
//         }

//         valA = valA.toString().toLowerCase();
//         valB = valB.toString().toLowerCase();
//         return sortConfig.direction === "asc"
//             ? valA < valB
//                 ? -1
//                 : 1
//             : valA > valB
//               ? -1
//               : 1;
//     });

//     if (loading)
//         return (
//             <div className="flex items-center gap-3 text-ui-accent font-mono animate-pulse">
//                 <Loading />
//             </div>
//         );

//     return (
//         <div className="w-full space-y-6">
//             {toastConfig.show && (
//                 <Toast
//                     message={toastConfig.message}
//                     type={toastConfig.type}
//                     onClose={() =>
//                         setToastConfig({ ...toastConfig, show: false })
//                     }
//                 />
//             )}

//             {/* Filter Bar */}
//             <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
//                 <div className="md:col-span-1">
//                     <label className="block text-[10px] font-mono text-ui-highlight uppercase tracking-[0.2em] mb-1.5 ml-1">
//                         Search_Records
//                     </label>
//                     <input
//                         type="text"
//                         placeholder="Name, ID, or @username"
//                         value={searchTerm}
//                         onChange={(e) => setSearchTerm(e.target.value)}
//                         className="w-full bg-ui-accent/10 border border-ui-neutral/20 rounded-lg px-3 py-2 text-sm focus:border-ui-accent outline-none text-gray-200"
//                     />
//                 </div>
//             </div>

//             <div className="w-full overflow-x-auto rounded-xl border border-ui-neutral/20 shadow-2xl">
//                 <table className="w-full text-left border-collapse min-w-[1100px]">
//                     <thead className="bg-ui-accent/10 text-[10px] font-mono uppercase tracking-widest text-ui-highlight">
//                         <tr>
//                             <th className="p-4 border-b border-ui-neutral/20">
//                                 Student_ID
//                             </th>
//                             <th className="p-4 border-b border-ui-neutral/20">
//                                 Identity
//                             </th>
//                             <th className="p-4 border-b border-ui-neutral/20">
//                                 Department
//                             </th>
//                             <th className="p-4 border-b border-ui-neutral/20">
//                                 Semester
//                             </th>
//                             <th className="p-4 border-b border-ui-neutral/20">
//                                 Contact
//                             </th>
//                             <th className="p-4 border-b border-ui-neutral/20">
//                                 Gender
//                             </th>
//                             <th className="p-4 border-b border-ui-neutral/20">
//                                 Location
//                             </th>
//                         </tr>
//                     </thead>
//                     <tbody className="divide-y divide-white/5 text-sm">
//                         {sortedStudents.map((s) => (
//                             <tr
//                                 key={s.id}
//                                 className="hover:bg-white/[0.01] transition-colors group"
//                             >
//                                 <td className="p-4 font-mono text-ui-accent font-semibold">
//                                     {s.studentID || "N/A"}
//                                 </td>
//                                 <td className="p-4">
//                                     <div className="font-semibold text-gray-200">
//                                         {s.name}
//                                     </div>
//                                     <Link
//                                         to={`/view/student/${s.username}`}
//                                         className="text-[10px] text-ui-accent/50 hover:text-ui-accent transition-all"
//                                     >
//                                         @{s.username}
//                                     </Link>
//                                 </td>
//                                 <td className="p-4">
//                                     <span className="px-2 py-1 rounded bg-purple-500/5 border border-purple-500/10 text-[11px] text-purple-400 font-mono">
//                                         {s.department || "UNDEFINED"}
//                                     </span>
//                                 </td>

//                                 <td className="p-4">
//                                     {editingUsername === s.username ? (
//                                         <div className="flex items-center gap-1 animate-in slide-in-from-left-2">
//                                             {/* Changed to Select Dropdown */}
//                                             <select
//                                                 value={newSemValue}
//                                                 onChange={(e) =>
//                                                     setNewSemValue(
//                                                         e.target.value,
//                                                     )
//                                                 }
//                                                 className="bg-ui-background border border-ui-accent rounded px-2 py-1 text-xs outline-none text-gray-200 max-w-[150px]"
//                                             >
//                                                 <option value="">
//                                                     Select Sem...
//                                                 </option>
//                                                 {availableSemesters.map(
//                                                     (sem) => (
//                                                         <option
//                                                             key={sem.id}
//                                                             value={sem.id}
//                                                         >
//                                                             Sem {sem.semesterNo}{" "}
//                                                             (Batch {sem.batch} -{" "}
//                                                             {sem.session})
//                                                         </option>
//                                                     ),
//                                                 )}
//                                             </select>

//                                             <button
//                                                 onClick={() =>
//                                                     handleUpdateSemester(
//                                                         s.username,
//                                                     )
//                                                 }
//                                                 className="text-ui-highlight hover:text-ui-highlight p-1"
//                                             >
//                                                 <Check size={16} />
//                                             </button>
//                                             <button
//                                                 onClick={() =>
//                                                     setEditingUsername(null)
//                                                 }
//                                                 className="text-ui-secondary hover:text-ui-secondary p-1"
//                                             >
//                                                 <X size={16} />
//                                             </button>
//                                         </div>
//                                     ) : (
//                                         <div className="flex items-center gap-2">
//                                             {/* Render DTO fields correctly */}
//                                             <span className="font-mono text-content-muted text-xs">
//                                                 {s.currSemester
//                                                     ? `Sem ${s.currSemester.semesterNo} (B${s.currSemester.batch})`
//                                                     : "--"}
//                                             </span>

//                                             {userRole !== "STUDENT" && (
//                                                 <button
//                                                     onClick={() => {
//                                                         setEditingUsername(
//                                                             s.username,
//                                                         );
//                                                         setNewSemValue(
//                                                             s.currSemester
//                                                                 ?.id || "",
//                                                         );
//                                                     }}
//                                                     className="opacity-0 group-hover:opacity-100 text-content-muted hover:text-ui-accent transition-all"
//                                                 >
//                                                     <Edit2 size={12} />
//                                                 </button>
//                                             )}
//                                         </div>
//                                     )}
//                                 </td>

//                                 <td className="p-4">
//                                     <div className="text-xs text-content-muted">
//                                         {s.email}
//                                     </div>
//                                     <div className="text-[10px] text-content-muted font-mono">
//                                         {s.phone}
//                                     </div>
//                                 </td>
//                                 <td className="p-4">
//                                     <span
//                                         className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${s.gender === "MALE" ? "border-ui-accent/20 text-ui-accent" : "border-pink-500/20 text-pink-400"}`}
//                                     >
//                                         {s.gender?.charAt(0) || "U"}
//                                     </span>
//                                 </td>
//                                 <td
//                                     className="p-4 text-xs text-content-muted max-w-[150px] truncate"
//                                     title={s.address}
//                                 >
//                                     {s.address || "---"}
//                                 </td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     );
// };

// export default Student;
