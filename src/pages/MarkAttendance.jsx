import React, { useState, useEffect } from "react";
import {
    Check,
    X,
    Save,
    BookOpen,
    Layers,
    Calendar as CalendarIcon,
} from "lucide-react";
import { getToken } from "../services/tokenService"; // Added your service import
import { STUDENT_ENDPOINT, COURSES_ENDPOINT, SEMESTER_ENDPOINT, ATTENDANCE_ENDPOINT } from "../config/config";

const MarkAttendance = () => {
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [selectedSemester, setSelectedSemester] = useState(null);
    const [attendanceDate, setAttendanceDate] = useState(
        new Date().toISOString().split("T")[0],
    );
    const [attendanceMap, setAttendanceMap] = useState({});
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    // Use your token service
    const headers = {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
    };

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [stdRes, crsRes, semRes] = await Promise.all([
                    fetch(STUDENT_ENDPOINT, { headers }),
                    fetch(COURSES_ENDPOINT, { headers }),
                    fetch(SEMESTER_ENDPOINT, { headers }),
                ]);
                setStudents(await stdRes.json());
                setCourses(await crsRes.json());
                setSemesters(await semRes.json());
            } catch (err) {
                setMessage({
                    type: "error",
                    text: "System link failure: Data unreachable.",
                });
            }
        };
        loadInitialData();
    }, []);

    const filteredStudents = students.filter(
        (s) =>
            !selectedSemester || s.currSemester === selectedSemester.semesterNo,
    );

    const handleStatusChange = (studentId, status) => {
        setAttendanceMap((prev) => ({ ...prev, [studentId]: status }));
    };

    const submitAttendance = async () => {
        if (!selectedCourse || !selectedSemester) {
            setMessage({
                type: "error",
                text: "Course and Semester are required.",
            });
            return;
        }

        setLoading(true);
        try {
            // Note: We only send the IDs because CourseSimpleDTO fields are now Double/Integer (Null-safe)
            const promises = Object.entries(attendanceMap).map(
                ([studentId, status]) => {
                    const payload = {
                        student: { id: Number(studentId) },
                        course: { id: selectedCourse.id },
                        semester: { id: selectedSemester.id },
                        status: status,
                        date: attendanceDate,
                    };

                    return fetch(ATTENDANCE_ENDPOINT, {
                        method: "POST",
                        headers,
                        body: JSON.stringify(payload),
                    });
                },
            );

            await Promise.all(promises);
            setMessage({
                type: "success",
                text: `Registry updated: ${Object.keys(attendanceMap).length} records saved.`,
            });
            setAttendanceMap({}); // Clear after success
        } catch (err) {
            setMessage({
                type: "error",
                text: "Commit failed: JSON mapping or Network error.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full text-gray-200 font-sans">
            {/* 1. Configuration Header (Transparent & Minimal) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-ui-accent">
                        <BookOpen size={14} /> Course_Selection
                    </label>
                    <select
                        onChange={(e) =>
                            setSelectedCourse(
                                courses.find(
                                    (c) => c.id === parseInt(e.target.value),
                                ),
                            )
                        }
                        className="w-full bg-white/5 border border-white/10 rounded-md p-3 text-sm focus:border-ui-accent outline-none transition-all"
                    >
                        <option value="">Select Course</option>
                        {courses.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.courseCode} - {c.courseName}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-ui-accent">
                        <Layers size={14} /> Academic_Semester
                    </label>
                    <select
                        onChange={(e) =>
                            setSelectedSemester(
                                semesters.find(
                                    (s) => s.id === parseInt(e.target.value),
                                ),
                            )
                        }
                        className="w-full bg-white/5 border border-white/10 rounded-md p-3 text-sm focus:border-ui-accent outline-none transition-all"
                    >
                        <option value="">Select Semester</option>
                        {semesters.map((s) => (
                            <option key={s.id} value={s.id}>
                                Semester {s.semesterNo} (Batch {s.batch})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-ui-accent">
                        <CalendarIcon size={14} /> Session_Date
                    </label>
                    <input
                        type="date"
                        value={attendanceDate}
                        onChange={(e) => setAttendanceDate(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-md p-3 text-sm focus:border-ui-accent outline-none transition-all css-color-scheme-dark"
                    />
                </div>
            </div>

            {/* 2. Feedback Message */}
            {message.text && (
                <div
                    className={`mb-6 p-4 rounded-md font-mono text-xs border ${
                        message.type === "error"
                            ? "bg-red-500/10 border-red-500/20 text-red-400"
                            : "bg-green-500/10 border-green-500/20 text-green-400"
                    }`}
                >
                    [{message.type.toUpperCase()}] {message.text}
                </div>
            )}

            {/* 3. Student Marking Table (Transparent Background) */}
            <div className="border border-white/5 rounded-xl overflow-hidden backdrop-blur-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white/[0.02] text-[10px] font-mono uppercase tracking-widest text-gray-500 border-b border-white/5">
                        <tr>
                            <th className="px-6 py-4">Student Info</th>
                            <th className="px-6 py-4">ID Reference</th>
                            <th className="px-6 py-4 text-center">
                                Status Marking
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredStudents.length === 0 ? (
                            <tr>
                                <td
                                    colSpan="3"
                                    className="px-6 py-20 text-center text-gray-500 font-mono"
                                >
                                    [ No students found for this semester ]
                                </td>
                            </tr>
                        ) : (
                            filteredStudents.map((student) => (
                                <tr
                                    key={student.id}
                                    className="hover:bg-white/[0.01] transition-colors"
                                >
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-white">
                                            {student.name}
                                        </div>
                                        <div className="text-[10px] text-gray-500 font-mono uppercase">
                                            {student.department}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-ui-accent">
                                        {student.studentID}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() =>
                                                    handleStatusChange(
                                                        student.id,
                                                        "P",
                                                    )
                                                }
                                                className={`flex items-center gap-1 px-4 py-2 rounded font-mono text-xs transition-all ${
                                                    attendanceMap[
                                                        student.id
                                                    ] === "P"
                                                        ? "bg-green-500 text-black font-bold shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                                                        : "bg-white/5 text-gray-400 hover:bg-white/10"
                                                }`}
                                            >
                                                <Check size={14} /> P
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleStatusChange(
                                                        student.id,
                                                        "A",
                                                    )
                                                }
                                                className={`flex items-center gap-1 px-4 py-2 rounded font-mono text-xs transition-all ${
                                                    attendanceMap[
                                                        student.id
                                                    ] === "A"
                                                        ? "bg-red-500 text-white font-bold shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                                                        : "bg-white/5 text-gray-400 hover:bg-white/10"
                                                }`}
                                            >
                                                <X size={14} /> A
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* 4. Action Bar */}
            <div className="mt-8 flex justify-end">
                <button
                    disabled={
                        loading || Object.keys(attendanceMap).length === 0
                    }
                    onClick={submitAttendance}
                    className="flex items-center gap-2 bg-ui-accent hover:bg-ui-highlight text-white px-8 py-4 rounded-md font-mono font-bold uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Save size={18} />{" "}
                    {loading ? "Processing..." : "Commit_Attendance"}
                </button>
            </div>
        </div>
    );
};

export default MarkAttendance;
