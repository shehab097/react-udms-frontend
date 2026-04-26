import React, { useState, useEffect, useMemo } from "react";
import { getToken } from "../services/tokenService";
import Toast from "../components/Toast";
import Loading from "../components/Loading";
import { STUDENT_ENDPOINT } from "../config/config";

const CourseAttendance = () => {
    const [courses, setCourses] = useState([]);
    const [students, setStudents] = useState([]);

    // Filters
    const [selectedCourseId, setSelectedCourseId] = useState("");
    const [selectedSemester, setSelectedSemester] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({
        show: false,
        message: "",
        type: "success",
    });

    const triggerToast = (message, type = "success") => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
    };

    // 1. Fetch Courses on Mount
    useEffect(() => {
        const fetchCourses = async () => {
            const token = getToken();
            try {
                const res = await fetch("http://localhost:8080/course", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    setCourses(data);
                }
            } catch (err) {
                triggerToast("FAILED_TO_LOAD_COURSES", "error");
            }
        };
        fetchCourses();
    }, []);

    // 2. Fetch Students when a Course is selected
    useEffect(() => {
        const fetchAttendance = async () => {
            if (!selectedCourseId) {
                setStudents([]);
                return;
            }
            setLoading(true);
            const token = getToken();
            try {
                const res = await fetch(
                    `${STUDENT_ENDPOINT}/attendances/${selectedCourseId}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    },
                );
                if (res.ok) {
                    const data = await res.json();
                    setStudents(data);
                    setSelectedSemester(""); // Reset semester filter when changing courses
                } else {
                    triggerToast("FAILED_TO_FETCH_ATTENDANCE", "error");
                }
            } catch (err) {
                triggerToast("NETWORK_ERROR", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchAttendance();
    }, [selectedCourseId]);

    // 3. Extract unique semesters from the loaded students
    const availableSemesters = useMemo(() => {
        const sems = new Set();
        students.forEach((student) => {
            student.attendance?.forEach((record) => {
                if (record.currSemester?.semesterNo) {
                    sems.add(record.currSemester.semesterNo);
                }
            });
        });
        return Array.from(sems).sort((a, b) => a - b);
    }, [students]);

    // 4. Apply Filters (Search + Semester)
    const filteredStudents = useMemo(() => {
        return students.filter((student) => {
            // Search Match
            const matchesSearch =
                student.name
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                student.UserId?.toLowerCase().includes(
                    searchTerm.toLowerCase(),
                );

            // Semester Match (Checking if any attendance record matches the selected semester)
            let matchesSemester = true;
            if (selectedSemester) {
                matchesSemester = student.attendance?.some(
                    (record) =>
                        String(record.currSemester?.semesterNo) ===
                        String(selectedSemester),
                );
            }

            return matchesSearch && matchesSemester;
        });
    }, [students, searchTerm, selectedSemester]);

    const calculatePercentage = (attendance, total) => {
        if (!total || total === 0) return "0.0";
        const presentCount = attendance.filter((a) => a.status === "P").length;
        return ((presentCount / total) * 100).toFixed(1);
    };

    return (
        <div className="w-full space-y-6 animate-in text-white">
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ ...toast, show: false })}
                />
            )}

            {/* Header: Filters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end bg-[#1a1a2e]/80 p-6 rounded-2xl border border-white/5 backdrop-blur-md shadow-lg">
                {/* Course Selector */}
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-mono text-[#a288e3] uppercase tracking-wider">
                        Course
                    </label>
                    <select
                        className="w-full bg-[#11111e] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#a288e3] focus:ring-1 focus:ring-[#a288e3] outline-none appearance-none cursor-pointer transition-all"
                        value={selectedCourseId}
                        onChange={(e) => setSelectedCourseId(e.target.value)}
                    >
                        <option value="">Select a course...</option>
                        {courses.map((course) => (
                            <option
                                key={course.id || course.courseCode}
                                value={course.id}
                            >
                                {course.courseCode} — {course.courseName}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Semester Filter (Populated from Students) */}
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-mono text-[#a288e3] uppercase tracking-wider">
                        Filter by Semester
                    </label>
                    <select
                        className="w-full bg-[#11111e] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#a288e3] focus:ring-1 focus:ring-[#a288e3] outline-none appearance-none cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        value={selectedSemester}
                        onChange={(e) => setSelectedSemester(e.target.value)}
                        disabled={students.length === 0}
                    >
                        <option value="">All Semesters</option>
                        {availableSemesters.map((sem) => (
                            <option key={sem} value={String(sem)}>
                                Semester {sem}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Search Filter */}
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-mono text-[#a288e3] uppercase tracking-wider">
                        Search Registry
                    </label>
                    <input
                        className="w-full bg-[#11111e] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#a288e3] focus:ring-1 focus:ring-[#a288e3] outline-none transition-all placeholder:text-white/20"
                        placeholder="Student Name or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        disabled={students.length === 0}
                    />
                </div>
            </div>

            {/* Attendance Table Section */}
            {loading ? (
                <div className="flex flex-col items-center justify-center gap-4 text-[#a288e3] font-mono animate-pulse p-20 bg-[#1a1a2e]/50 rounded-2xl border border-white/5">
                    <Loading />
                    <span className="text-xs tracking-widest">
                        FETCHING_RECORDS...
                    </span>
                </div>
            ) : (
                <div className="bg-[#1a1a2e]/80 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-md shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                            <thead className="bg-black/20 text-[10px] text-[#a288e3] uppercase tracking-widest font-bold">
                                <tr>
                                    <th className="p-5 font-mono">
                                        Student Details
                                    </th>
                                    <th className="p-5 font-mono">
                                        Attendance Log
                                    </th>
                                    <th className="p-5 text-center font-mono">
                                        Summary
                                    </th>
                                    <th className="p-5 text-right font-mono">
                                        Percentage
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-sm">
                                {filteredStudents.map((student) => {
                                    const percent = calculatePercentage(
                                        student.attendance,
                                        student.totalClass,
                                    );
                                    // Extract semester info to display under the student's name
                                    const semInfo =
                                        student.attendance?.[0]?.currSemester;

                                    return (
                                        <tr
                                            key={student.UserId}
                                            className="hover:bg-white/[0.02] transition-colors group"
                                        >
                                            <td className="p-5">
                                                <div className="font-bold text-white group-hover:text-[#a288e3] transition-colors">
                                                    {student.name}
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] font-mono text-white/50">
                                                        {student.UserId}
                                                    </span>
                                                    {semInfo && (
                                                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-white/40 font-mono">
                                                            Sem{" "}
                                                            {semInfo.semesterNo}{" "}
                                                            • B{semInfo.batch}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <div className="flex gap-1.5 flex-wrap">
                                                    {student.attendance.map(
                                                        (record, idx) => (
                                                            <span
                                                                key={idx}
                                                                className={`w-6 h-6 flex items-center justify-center rounded-lg text-[10px] font-bold font-mono border transition-all ${
                                                                    record.status ===
                                                                    "P"
                                                                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                                                        : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                                                                }`}
                                                            >
                                                                {record.status}
                                                            </span>
                                                        ),
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-5 text-center font-mono text-xs">
                                                <span className="text-emerald-400">
                                                    {
                                                        student.attendance.filter(
                                                            (a) =>
                                                                a.status ===
                                                                "P",
                                                        ).length
                                                    }
                                                </span>
                                                <span className="mx-1 text-white/20">
                                                    /
                                                </span>
                                                <span className="text-white/60">
                                                    {student.totalClass}
                                                </span>
                                            </td>
                                            <td className="p-5 text-right">
                                                <div className="inline-block px-3 py-1.5 rounded-xl bg-black/20 border border-white/5">
                                                    <span
                                                        className={`text-sm font-bold font-mono ${parseFloat(percent) < 75 ? "text-rose-400" : "text-[#a288e3]"}`}
                                                    >
                                                        {percent}%
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {(!selectedCourseId || filteredStudents.length === 0) && (
                        <div className="p-20 text-center text-white/40 font-mono text-xs uppercase tracking-widest flex flex-col items-center gap-2">
                            <span className="text-2xl opacity-50">📂</span>
                            {!selectedCourseId
                                ? "Select a Course to View Records"
                                : "No Records Found for this Filter"}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CourseAttendance;
