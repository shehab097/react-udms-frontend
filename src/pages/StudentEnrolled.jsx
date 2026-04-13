import React, { useState, useEffect } from "react";
import { getToken, getRole } from "../services/tokenService";
import Toast from "../components/Toast";
import Loading from "../components/Loading";

import {
    STUDENT_ENROLLED_ENDPOINT,
    STUDENT_ENDPOINT,
    SEMESTER_ENDPOINT,
    COURSES_ENDPOINT,
} from "../config/config";


const StudentEnrolled = () => {
    const [enrollments, setEnrollments] = useState([]);
    const [students, setStudents] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [courses, setCourses] = useState([]);

    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [studentSearch, setStudentSearch] = useState("");

    const [toast, setToast] = useState({
        show: false,
        message: "",
        type: "success",
    });

    const role = getRole();
    const isAdmin = role?.toUpperCase() === "ADMIN";

    const [formData, setFormData] = useState({
        studentId: "",
        sem_id: "",
        courseCodes: [],
    });

    const triggerToast = (message, type = "success") => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
    };

    const fetchRegistry = async () => {
        const token = getToken();
        const headers = { Authorization: `Bearer ${token}` };
        try {
            const [enRes, stRes, smRes, crRes] = await Promise.all([
                fetch(`${STUDENT_ENROLLED_ENDPOINT}`, { headers }),
                fetch(`${STUDENT_ENDPOINT}`, { headers }),
                fetch(`${SEMESTER_ENDPOINT}`, { headers }),
                fetch(`${COURSES_ENDPOINT}`, { headers }),
            ]);

            // Fix: Parse JSON once and store in variables
            if (enRes.ok) {
                const enData = await enRes.json();
                setEnrollments(enData);
            }
            if (stRes.ok) setStudents(await stRes.json());
            if (smRes.ok) setSemesters(await smRes.json());
            if (crRes.ok) setCourses(await crRes.json());
        } catch (err) {
            triggerToast("SYSTEM_SYNC_ERROR", "error");
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
        if (!isAdmin) return triggerToast("ACTION_DENIED", "error");
        if (
            !formData.studentId ||
            !formData.sem_id ||
            formData.courseCodes.length === 0
        ) {
            return triggerToast("MISSING_REQUIRED_FIELDS", "error");
        }

        const token = getToken();
        const method = editingId ? "PUT" : "POST";
        const url = editingId
            ? `${STUDENT_ENROLLED_ENDPOINT}/${editingId}`
            : `${STUDENT_ENROLLED_ENDPOINT}`;

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...formData,
                    sem_id: parseInt(formData.sem_id, 10),
                }),
            });

            if (res.ok) {
                triggerToast(
                    editingId ? "REGISTRY_UPDATED" : "ENROLLMENT_SUCCESS",
                );
                await fetchRegistry();
                closeModal();
            } else {
                triggerToast("SERVER_REJECTED_ENTRY", "error");
            }
        } catch (err) {
            triggerToast("CONNECTION_FAILURE", "error");
        }
    };

    const handleDelete = async (id) => {
        if (!isAdmin || !window.confirm("PERMANENTLY_REMOVE_ENTRY?")) return;
        const token = getToken();
        try {
            const res = await fetch(
                `${STUDENT_ENROLLED_ENDPOINT}/${id}`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                },
            );
            if (res.ok) {
                triggerToast("RECORD_PURGED");
                fetchRegistry();
            }
        } catch (err) {
            triggerToast("DELETE_FAILED", "error");
        }
    };

    const openModal = (enrollment = null) => {
        if (enrollment) {
            setEditingId(enrollment.id);
            setFormData({
                studentId: enrollment.studentId,
                sem_id: enrollment.sem_id?.toString() || "",
                courseCodes: enrollment.courseCodes || [],
            });
        } else {
            setEditingId(null);
            setFormData({ studentId: "", sem_id: "", courseCodes: [] });
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
            <div className="flex items-center gap-3 text-ui-accent font-mono animate-pulse">
                <Loading />
            </div>
        );

    return (
        <div className="w-full space-y-6 animate-in ">
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ ...toast, show: false })}
                />
            )}

            {/* Header / Search Area */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-end">
                <div className="w-full md:w-1/2">
                    <label className="text-[10px] font-mono text-ui-highlight uppercase">
                        Filter
                    </label>
                    <input
                        className="w-full bg-ui-surface/20 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:border-ui-accent outline-none"
                        placeholder="Search Name or Student ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {isAdmin && (
                    <button
                        onClick={() => openModal()}
                        className="bg-ui-secondary text-white px-6 py-2 rounded-lg text-[11px] font-bold tracking-widest hover:brightness-110"
                    >
                        + NEW ENROLLMENT
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="border border-white/5 rounded-2xl overflow-scroll backdrop-blur-md">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-white/5 text-[10px] text-ui-highlight uppercase tracking-widest font-bold">
                        <tr>
                            <th className="p-5">Student Identity</th>
                            <th className="p-5">Term Data</th>
                            <th className="p-5">Course Load</th>
                            {isAdmin && (
                                <th className="p-5 text-center">Operation</th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm text-white">
                        {filteredEnrollments.map((e) => (
                            <tr key={e.id} className="hover:bg-white/[0.02]">
                                <td className="p-5">
                                    <div className="font-bold">{e.name}</div>
                                    <div className="text-[10px] font-mono text-ui-accent">
                                        {e.studentId}
                                    </div>
                                </td>
                                <td className="p-5">
                                    <div className="text-xs">
                                        Semester {e.semesterNo}
                                    </div>
                                    <div className="text-[10px] text-gray-500 uppercase">
                                        {e.session} • {e.batch}
                                    </div>
                                </td>
                                <td className="p-5">
                                    <div className="flex flex-wrap gap-1">
                                        {e.courseCodes?.map((code) => (
                                            <span
                                                key={code}
                                                className="bg-ui-accent/10 border border-ui-accent/20 text-ui-accent text-[9px] px-2 py-0.5 rounded font-mono"
                                            >
                                                {code}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                {isAdmin && (
                                    <td className="p-5">
                                        <div className="flex justify-center gap-4">
                                            <button
                                                disabled
                                                onClick={() => openModal(e)}
                                                className="text-[10px] font-bold text-ui-highlight hover:text-white hidden"
                                            >
                                                EDIT
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDelete(e.id)
                                                }
                                                className="text-[10px] font-bold text-red-500 hover:text-red-400"
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

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-ui-background border border-white/10 w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-white/5 flex justify-between bg-white/5 items-center">
                            <h2 className="text-[10px] font-bold text-white uppercase tracking-widest">
                                Enrollment Control
                            </h2>
                            <button
                                onClick={closeModal}
                                className="text-ui-highlight hover:text-white"
                            >
                                CLOSE
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto space-y-6">
                            {/* Student Search */}
                            <div>
                                <label className="text-[10px] font-mono text-ui-highlight block mb-2 uppercase">
                                    01. Select Student
                                </label>
                                <input
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white mb-2"
                                    placeholder="Find student..."
                                    value={studentSearch}
                                    onChange={(e) =>
                                        setStudentSearch(e.target.value)
                                    }
                                />
                                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-1">
                                    {filteredStudents.map((s) => (
                                        <div
                                            key={s.studentID}
                                            onClick={() =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    studentId: s.studentID,
                                                }))
                                            }
                                            className={`p-2 rounded border text-[10px] cursor-pointer transition ${formData.studentId === s.studentID ? "border-ui-accent bg-ui-accent/10" : "border-white/5 bg-white/5 hover:border-white/20"}`}
                                        >
                                            <div className="text-white font-bold">
                                                {s.name}
                                            </div>
                                            <div className="text-ui-highlight">
                                                {s.studentID}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Semester Selection */}
                            <div>
                                <label className="text-[10px] font-mono text-ui-highlight block mb-2 uppercase">
                                    02. Academic Term
                                </label>
                                <select
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white"
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
                                        className="bg-ui-background"
                                    >
                                        Select Semester...
                                    </option>
                                    {semesters.map((sem) => (
                                        <option
                                            key={sem.id}
                                            value={sem.id}
                                            className="bg-ui-background"
                                        >
                                            {sem.session} - Sem {sem.semesterNo}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Course Selection */}
                            <div>
                                <label className="text-[10px] font-mono text-ui-highlight block mb-2 uppercase">
                                    03. Courses ({formData.courseCodes.length})
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {courses.map((c) => (
                                        <div
                                            key={c.courseCode}
                                            onClick={() =>
                                                handleToggleCourse(c.courseCode)
                                            }
                                            className={`p-2 rounded border text-[10px] cursor-pointer transition ${formData.courseCodes.includes(c.courseCode) ? "border-ui-accent bg-ui-accent/20" : "border-white/5 bg-white/5"}`}
                                        >
                                            <div className="text-white font-mono">
                                                {c.courseCode}
                                            </div>
                                            <div className="text-gray-500 truncate">
                                                {c.courseName}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/5 bg-white/5 flex justify-end gap-4">
                            <button
                                onClick={closeModal}
                                className="text-[10px] font-bold text-gray-400 hover:text-white uppercase"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="bg-ui-secondary text-white px-8 py-2 rounded-lg text-[10px] font-bold hover:brightness-110"
                            >
                                CONFIRM_SUBMISSION
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentEnrolled;
