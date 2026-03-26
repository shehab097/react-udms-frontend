import React, { useState, useEffect } from "react";
import { getToken } from "../services/tokenService";

const StudentEnrolled = () => {
    // API Data States
    const [enrollments, setEnrollments] = useState([]);
    const [students, setStudents] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [courses, setCourses] = useState([]);

    // UI States
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [studentSearch, setStudentSearch] = useState("");

    // Form State (Matches your DTO structure)
    const [formData, setFormData] = useState({
        studentId: "",
        sem_id: "",
        courseCodes: [],
        name: "",
        semesterNo: 0,
        batch: 0,
        session: "",
        courseName: [],
    });

    const fetchRegistry = async () => {
        const token = getToken();
        const headers = { Authorization: `Bearer ${token}` };
        try {
            const [enRes, stRes, smRes, crRes] = await Promise.all([
                fetch("http://localhost:8080/student-enrolled", { headers }),
                fetch("http://localhost:8080/student", { headers }),
                fetch("http://localhost:8080/semester", { headers }),
                fetch("http://localhost:8080/course", { headers }),
            ]);

            if (enRes.ok) setEnrollments(await enRes.json());
            if (stRes.ok) setStudents(await stRes.json());
            if (smRes.ok) setSemesters(await smRes.json());
            if (crRes.ok) setCourses(await crRes.json());
        } catch (err) {
            console.error("SYSTEM_SYNC_ERROR", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRegistry();
    }, []);

    const handleToggleCourse = (code) => {
        setFormData((prev) => ({
            ...prev,
            courseCodes: prev.courseCodes.includes(code)
                ? prev.courseCodes.filter((c) => c !== code)
                : [...prev.courseCodes, code],
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Strict Validation
        if (!formData.studentId) return alert("Select a student first.");
        if (!formData.sem_id || formData.sem_id === "")
            return alert("Select a semester.");
        if (formData.courseCodes.length === 0)
            return alert("Select at least one course.");

        const token = getToken();
        const method = editingId ? "PUT" : "POST";
        const url = editingId
            ? `http://localhost:8080/student-enrolled/${editingId}`
            : "http://localhost:8080/student-enrolled";

        // Ensuring exact JSON format for DTO Record
        const payload = {
            ...formData,
            sem_id: parseInt(formData.sem_id, 10),
        };

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                await fetchRegistry();
                closeModal();
            } else {
                alert(
                    "Transaction failed. Check for duplicate enrollment in this semester.",
                );
            }
        } catch (err) {
            alert("Network link offline.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Permanently remove this enrollment?")) return;
        const token = getToken();
        try {
            const res = await fetch(
                `http://localhost:8080/student-enrolled/${id}`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                },
            );
            if (res.ok) fetchRegistry();
        } catch (err) {
            console.error("DELETE_ERROR", err);
        }
    };

    const openModal = (enrollment = null) => {
        if (enrollment) {
            setEditingId(enrollment.id);
            setFormData({
                studentId: enrollment.studentId,
                sem_id: enrollment.sem_id.toString(),
                courseCodes: enrollment.courseCodes || [],
                name: "",
                semesterNo: 0,
                batch: 0,
                session: "",
                courseName: [],
            });
        } else {
            setEditingId(null);
            setFormData({
                studentId: "",
                sem_id: "",
                courseCodes: [],
                name: "",
                semesterNo: 0,
                batch: 0,
                session: "",
                courseName: [],
            });
        }
        setStudentSearch("");
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
    };

    // Filter Logic
    const filteredEnrollments = enrollments.filter(
        (e) =>
            e.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.studentId?.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const filteredStudents = students.filter(
        (s) =>
            s.name?.toLowerCase().includes(studentSearch.toLowerCase()) ||
            s.studentID?.toLowerCase().includes(studentSearch.toLowerCase()),
    );

    if (loading)
        return (
            <div className="p-10 font-mono text-[10px] text-ui-accent animate-pulse">
                BOOTING_ENROLLMENT_MODULE...
            </div>
        );

    return (
        <div className="w-full space-y-6 animate-in fade-in duration-700">
            {/* Control Bar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-end">
                <div className="w-full md:w-1/2">
                    <label className="text-[10px] font-mono text-ui-highlight uppercase">
                        Global Filter
                    </label>
                    <input
                        className="w-full bg-ui-background border border-white/10 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-ui-accent/40"
                        placeholder="Search Registry..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button
                    onClick={() => openModal()}
                    className="w-full md:w-auto bg-ui-secondary text-white px-8 py-2.5 rounded-lg text-[11px] font-bold tracking-widest hover:brightness-110 transition-all"
                >
                    + INITIATE ENROLLMENT
                </button>
            </div>

            {/* Registry Table */}
            <div className="bg-ui-surface/10 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-md">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-white/5 text-[10px] font-bold text-ui-highlight uppercase tracking-[0.2em]">
                        <tr>
                            <th className="p-5">Student Identity</th>
                            <th className="p-5">Term Data</th>
                            <th className="p-5">Course Load</th>
                            <th className="p-5 text-center">Operation</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                        {filteredEnrollments.map((e) => (
                            <tr
                                key={e.id}
                                className="hover:bg-white/[0.02] transition-colors"
                            >
                                <td className="p-5">
                                    <div className="font-bold text-content-primary">
                                        {e.name}
                                    </div>
                                    <div className="text-[10px] font-mono text-ui-accent mt-1 uppercase tracking-tighter">
                                        {e.studentId}
                                    </div>
                                </td>
                                <td className="p-5">
                                    <div className="text-xs font-semibold">
                                        Semester {e.semesterNo}
                                    </div>
                                    <div className="text-[10px] text-content-secondary/50 uppercase mt-0.5">
                                        {e.session} • {e.batch}
                                    </div>
                                </td>
                                <td className="p-5">
                                    <div className="flex flex-wrap gap-1.5 max-w-xs">
                                        {e.courseCodes?.map((code) => (
                                            <span
                                                key={code}
                                                className="bg-ui-accent/10 border border-ui-accent/20 text-ui-accent text-[9px] px-2 py-0.5 rounded font-mono font-bold"
                                            >
                                                {code}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="p-5">
                                    <div className="flex justify-center gap-4">
                                        <button
                                            onClick={() => openModal(e)}
                                            className="text-[10px] font-bold text-ui-highlight hover:text-white"
                                        >
                                            EDIT
                                        </button>
                                        <button
                                            onClick={() => handleDelete(e.id)}
                                            className="text-[10px] font-bold text-ui-secondary/60 hover:text-red-400"
                                        >
                                            DELETE
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Deployment Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-ui-background border border-white/10 w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh] animate-in zoom-in-95">
                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                            <h2 className="text-[10px] font-bold text-white uppercase tracking-[0.3em]">
                                Module // Enrollment_Control
                            </h2>
                            <button
                                onClick={closeModal}
                                className="text-ui-highlight hover:text-white transition-colors"
                            >
                                CLOSE_X
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto space-y-8 custom-scrollbar">
                            {/* Section 1: Student Selection */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <label className="text-[10px] font-mono text-ui-highlight uppercase tracking-widest">
                                        01. Select Student Profile
                                    </label>
                                    {formData.studentId && (
                                        <span className="text-[9px] font-bold text-ui-accent font-mono tracking-tighter">
                                            SELECTED: {formData.studentId}
                                        </span>
                                    )}
                                </div>
                                <input
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs outline-none focus:border-ui-accent/50"
                                    placeholder="Filter by Name or Registry ID..."
                                    value={studentSearch}
                                    onChange={(e) =>
                                        setStudentSearch(e.target.value)
                                    }
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2">
                                    {filteredStudents.map((s) => (
                                        <div
                                            key={s.studentID}
                                            onClick={() =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    studentId: s.studentID,
                                                }))
                                            }
                                            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                                                formData.studentId ===
                                                s.studentID
                                                    ? "bg-ui-accent/20 border-ui-accent"
                                                    : "bg-white/5 border-transparent hover:border-white/10"
                                            }`}
                                        >
                                            <div className="truncate pr-2">
                                                <div className="text-xs font-bold text-content-primary">
                                                    {s.name}
                                                </div>
                                                <div className="text-[9px] text-ui-highlight uppercase">
                                                    {s.department}
                                                </div>
                                            </div>
                                            <div className="text-[10px] font-mono opacity-60">
                                                {s.studentID}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Section 2: Semester Dropdown */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-mono text-ui-highlight uppercase tracking-widest">
                                        02. Academic Term
                                    </label>
                                    <select
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-ui-accent/50 appearance-none cursor-pointer"
                                        value={formData.sem_id}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                sem_id: e.target.value,
                                            }))
                                        }
                                    >
                                        <option
                                            value=""
                                            className="bg-ui-background text-content-secondary"
                                        >
                                            Choose Semester...
                                        </option>
                                        {semesters.map((sem) => (
                                            <option
                                                key={sem.id}
                                                value={sem.id}
                                                className="bg-ui-background"
                                            >
                                                {sem.session} — Sem{" "}
                                                {sem.semesterNo}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Section 3: Meta Info (Auto-filled by Backend usually) */}
                                <div className="space-y-4 opacity-30 pointer-events-none">
                                    <label className="text-[10px] font-mono text-ui-highlight uppercase tracking-widest">
                                        03. System Constraints
                                    </label>
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-[10px] text-ui-highlight font-mono">
                                        AUTOMATIC_VALIDATION_ACTIVE
                                    </div>
                                </div>
                            </div>

                            {/* Section 4: Course Checklist */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-mono text-ui-highlight uppercase tracking-widest">
                                    04. Course Subscription (
                                    {formData.courseCodes.length})
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {courses.map((c) => (
                                        <div
                                            key={c.courseCode}
                                            onClick={() =>
                                                handleToggleCourse(c.courseCode)
                                            }
                                            className={`p-3 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${
                                                formData.courseCodes.includes(
                                                    c.courseCode,
                                                )
                                                    ? "bg-ui-accent/10 border-ui-accent"
                                                    : "bg-white/5 border-transparent hover:border-white/10"
                                            }`}
                                        >
                                            <div
                                                className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                                                    formData.courseCodes.includes(
                                                        c.courseCode,
                                                    )
                                                        ? "bg-ui-accent border-ui-accent"
                                                        : "border-white/20"
                                                }`}
                                            >
                                                {formData.courseCodes.includes(
                                                    c.courseCode,
                                                ) && (
                                                    <span className="text-[9px] text-black font-bold">
                                                        ✓
                                                    </span>
                                                )}
                                            </div>
                                            <div className="truncate">
                                                <div className="text-[11px] font-bold">
                                                    {c.courseCode}
                                                </div>
                                                <div className="text-[9px] text-content-secondary truncate max-w-[120px]">
                                                    {c.courseName}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Submit Footer */}
                        <div className="p-8 bg-white/5 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="text-[9px] font-mono flex gap-4 uppercase">
                                <span className="text-ui-highlight">
                                    Status:
                                </span>
                                <span
                                    className={
                                        formData.studentId &&
                                        formData.sem_id &&
                                        formData.courseCodes.length > 0
                                            ? "text-green-400"
                                            : "text-ui-secondary"
                                    }
                                >
                                    {formData.studentId &&
                                    formData.sem_id &&
                                    formData.courseCodes.length > 0
                                        ? "READY_FOR_COMMIT"
                                        : "PENDING_INPUTS"}
                                </span>
                            </div>
                            <div className="flex gap-6 w-full sm:w-auto">
                                <button
                                    onClick={closeModal}
                                    className="flex-1 sm:flex-none text-[10px] font-bold text-content-secondary uppercase tracking-widest hover:text-white"
                                >
                                    Cancel_Esc
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    className="flex-1 sm:flex-none bg-ui-secondary px-10 py-3 rounded-xl text-[11px] font-bold text-white shadow-xl shadow-ui-secondary/10 hover:brightness-110 active:scale-95 transition-all"
                                >
                                    CONFIRM_SUBMISSION
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentEnrolled;
