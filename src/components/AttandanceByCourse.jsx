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
        <div className="w-full space-y-6 animate-in text-content-primary">
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ ...toast, show: false })}
                />
            )}

            {/* Header: Filters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end bg-ui-background p-6 rounded-2xl border border-ui-neutral backdrop-blur-md ">
                {/* Course Selector */}
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-mono text-ui-accent uppercase tracking-wider">
                        Course
                    </label>
                    <select
                        className="w-full bg-ui-background border border-ui-neutral rounded-xl px-4 py-3 text-sm text-content-primary focus:border-ui-accent focus:ring-1 focus:ring-ui-accent outline-none appearance-none cursor-pointer transition-all"
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
                    <label className="text-[10px] font-mono text-ui-accent uppercase tracking-wider">
                        Filter by Semester
                    </label>
                    <select
                        className="w-full bg-ui-background border border-ui-neutral rounded-xl px-4 py-3 text-sm text-content-primary focus:border-ui-accent focus:ring-1 focus:ring-ui-accent outline-none appearance-none cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                    <label className="text-[10px] font-mono text-ui-accent uppercase tracking-wider">
                        Search Registry
                    </label>
                    <input
                        className="w-full bg-ui-background border border-ui-neutral rounded-xl px-4 py-3 text-sm text-content-primary focus:border-ui-accent focus:ring-1 focus:ring-ui-accent outline-none transition-all placeholder:text-content-muted"
                        placeholder="Student Name or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        disabled={students.length === 0}
                    />
                </div>
            </div>

            {/* Attendance Table Section */}
            {loading ? (
                <div className="flex flex-col items-center justify-center gap-4 text-ui-accent font-mono animate-pulse p-20 bg-ui-background/50 rounded-2xl border border-ui-neutral">
                    <Loading />
                    <span className="text-xs tracking-widest">
                        FETCHING_RECORDS...
                    </span>
                </div>
            ) : (
                <div className="bg-ui-background border border-ui-neutral rounded-2xl overflow-hidden backdrop-blur-md ">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                            <thead className="bg-ui-accent/10 text-[10px] text-ui-accent uppercase tracking-widest font-bold">
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
                            <tbody className="divide-y divide-ui-neutral/20 text-sm">
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
                                            className="hover:bg-ui-accent/[0.05] transition-colors group"
                                        >
                                            <td className="p-5">
                                                <div className="font-bold text-content-primary group-hover:text-ui-accent transition-colors">
                                                    {student.name}
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] font-mono text-content-muted">
                                                        {student.UserId}
                                                    </span>
                                                    {semInfo && (
                                                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-ui-accent/10 text-ui-accent/70 font-mono">
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
                                                                        ? "bg-ui-highlight/10 border-ui-highlight/20 text-ui-highlight"
                                                                        : "bg-ui-secondary/10 border-ui-secondary/20 text-ui-secondary"
                                                                }`}
                                                            >
                                                                {record.status}
                                                            </span>
                                                        ),
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-5 text-center font-mono text-xs">
                                                <span className="text-ui-highlight">
                                                    {
                                                        student.attendance.filter(
                                                            (a) =>
                                                                a.status ===
                                                                "P",
                                                        ).length
                                                    }
                                                </span>
                                                <span className="mx-1 text-content-muted">
                                                    /
                                                </span>
                                                <span className="text-content-secondary">
                                                    {student.totalClass}
                                                </span>
                                            </td>
                                            <td className="p-5 text-right">
                                                <div className="inline-block px-3 py-1.5 rounded-xl bg-ui-accent/10 border border-ui-neutral">
                                                    <span
                                                        className={`text-sm font-bold font-mono ${parseFloat(percent) < 75 ? "text-ui-secondary" : "text-ui-highlight"}`}
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
                        <div className="p-20 text-center text-content-primary/40 font-mono text-xs uppercase tracking-widest flex flex-col items-center gap-2">
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
