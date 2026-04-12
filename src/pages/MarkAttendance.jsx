import React, {
    useState,
    useEffect,
    useMemo,
    useCallback,
    useReducer,
} from "react";
import {
    Check,
    X,
    Save,
    BookOpen,
    Layers,
    Calendar as CalendarIcon,
    AlertCircle,
    CheckCircle,
    Loader2,
    Users,
} from "lucide-react";
import { getToken } from "../services/tokenService";
import Toast from "../components/Toast";
import {
    STUDENT_ENDPOINT,
    COURSES_ENDPOINT,
    SEMESTER_ENDPOINT,
    ATTENDANCE_ENDPOINT,
} from "../config/config";
import Student from "./Student";

// --- Reducer for better state management ---
const initialState = {
    students: [],
    courses: [],
    semesters: [],
    records: [],
    loading: false,
    error: null,
};



function dataReducer(state, action) {
    switch (action.type) {
        case "SET_DATA":
            return { ...state, ...action.payload, loading: false, error: null };
        case "SET_RECORDS":
            return { ...state, records: action.payload };
        case "SET_LOADING":
            return { ...state, loading: action.payload };
        case "SET_ERROR":
            return { ...state, error: action.payload, loading: false };
        default:
            return state;
    }
}

// --- Custom Hook for Attendance Logic ---
const useAttendanceData = () => {
    const [state, dispatch] = useReducer(dataReducer, initialState);
    const [selection, setSelection] = useState({
        course: null,
        semester: null,
        date: new Date().toISOString().split("T")[0],
    });
    const [attendanceMap, setAttendanceMap] = useState({});
    const [toast, setToast] = useState(null);

    const headers = useMemo(
        () => ({
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
        }),
        [],
    );

    const showToast = useCallback((message, type = "error") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 5000);
    }, []);

    // Fetch initial data
    useEffect(() => {
        let isMounted = true;
        const loadInitialData = async () => {
            dispatch({ type: "SET_LOADING", payload: true });

            try {
                const [studentsRes, coursesRes, semestersRes, recordsRes] =
                    await Promise.all([
                        fetch(STUDENT_ENDPOINT, { headers }),
                        fetch(COURSES_ENDPOINT, { headers }),
                        fetch(SEMESTER_ENDPOINT, { headers }),
                        fetch(ATTENDANCE_ENDPOINT, { headers }),
                    ]);
                

                if (
                    !studentsRes.ok ||
                    !coursesRes.ok ||
                    !semestersRes.ok ||
                    !recordsRes.ok
                ) {
                    throw new Error("Failed to fetch data from server");
                }

                const [students, courses, semesters, records] =
                    await Promise.all([
                        studentsRes.json(),
                        coursesRes.json(),
                        semestersRes.json(),
                        recordsRes.json(),
                    ]);

                if (isMounted) {
                    dispatch({
                        type: "SET_DATA",
                        payload: { students, courses, semesters, records },
                    });
                }

                // console.log(JSON.stringify(students[0]));
            } catch (err) {
                if (isMounted) {
                    dispatch({ type: "SET_ERROR", payload: err.message });
                    showToast(
                        "Failed to load data. Please refresh the page.",
                        "error",
                    );
                }
            }
        };

        loadInitialData();
        return () => {
            isMounted = false;
        };
    }, [headers, showToast]);

    // Sync attendance map with selected records
    useEffect(() => {
        const { course, semester, date } = selection;
        if (course?.id && semester?.id && date && state.records.length) {
            const existingMap = state.records
                .filter(
                    (rec) =>
                        Number(rec.course?.id) === Number(course.id) &&
                        Number(rec.semester?.id) === Number(semester.id) &&
                        rec.date === date,
                )
                .reduce((acc, rec) => {
                    if (rec.student?.id) {
                        acc[rec.student.id] = rec.status;
                    }
                    return acc;
                }, {});
            setAttendanceMap(existingMap);
        } else {
            setAttendanceMap({});
        }
    }, [selection, state.records]);

    // Filter students based on selected semester ID
    // FIXED: Students should be filtered by semester ID, not semester number
    const filteredStudents = useMemo(() => {
        if (!selection.semester) return state.students;

        return state.students.filter((student) => {
            // Check if student's current semester ID matches the selected semester ID
            const studentSemesterId = student.currSemester?.id;
            const selectedSemesterId = selection.semester.id;

            return Number(studentSemesterId) === Number(selectedSemesterId);
        });
    }, [state.students, selection.semester]);

    const handleStatusChange = useCallback((studentId, status) => {
        setAttendanceMap((prev) => ({ ...prev, [studentId]: status }));
    }, []);

    const markAllPresent = useCallback(() => {
        if (!filteredStudents.length) {
            showToast("No students to mark", "warn");
            return;
        }

        const newMap = filteredStudents.reduce(
            (acc, s) => ({ ...acc, [s.id]: "P" }),
            { ...attendanceMap },
        );
        setAttendanceMap(newMap);
        showToast(
            `Marked ${filteredStudents.length} students present locally`,
            "success",
        );
    }, [filteredStudents, attendanceMap, showToast]);

    const submitAttendance = useCallback(async () => {
        if (!selection.course || !selection.semester) {
            showToast("Please select both course and semester", "error");
            return;
        }

        const entries = Object.entries(attendanceMap);
        if (!entries.length) {
            showToast("No attendance records to submit", "warn");
            return;
        }

        dispatch({ type: "SET_LOADING", payload: true });

        try {
            // FIXED: Submit with proper data structure - using student id directly
            const payload = entries.map(([studentId, status]) => ({
                student: { id: Number(studentId) },
                course: { id: selection.course.id },
                semester: { id: selection.semester.id },
                status,
                date: selection.date,
            }));

            const response = await fetch(`${ATTENDANCE_ENDPOINT}/batch`, {
                method: "POST",
                headers,
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    errorData.message || "Failed to submit attendance",
                );
            }

            // Refresh attendance records
            const refreshRes = await fetch(ATTENDANCE_ENDPOINT, { headers });
            if (refreshRes.ok) {
                const newRecords = await refreshRes.json();
                dispatch({ type: "SET_RECORDS", payload: newRecords });
            }

            showToast("Attendance submitted successfully!", "success");
        } catch (err) {
            console.error("Submit error:", err);
            showToast(err.message || "Failed to submit attendance", "error");
        } finally {
            dispatch({ type: "SET_LOADING", payload: false });
        }
    }, [selection, attendanceMap, headers, showToast]);

    return {
        state,
        selection,
        setSelection,
        attendanceMap,
        filteredStudents,
        handleStatusChange,
        markAllPresent,
        submitAttendance,
        toast,
        setToast,
    };
};

// --- Helper Components ---
const SelectField = ({ label, icon, children, required = false }) => (
    <div className="space-y-2">
        <label className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-blue-400">
            {icon} {label}
            {required && <span className="text-red-400 text-xs">*</span>}
        </label>
        {children}
    </div>
);

const StatusButton = ({ active, type, onClick, disabled = false }) => {
    const isP = type === "P";
    const baseClasses =
        "flex items-center justify-center w-16 py-3 rounded font-mono text-xs transition-all duration-200";

    let statusClasses;
    if (active) {
        statusClasses = isP
            ? "bg-green-500 text-black font-bold shadow-lg shadow-green-500/30"
            : "bg-red-500 text-white font-bold shadow-lg shadow-red-500/30";
    } else {
        statusClasses = "bg-white/5 text-gray-400 hover:bg-white/10";
    }

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${baseClasses} ${statusClasses} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
            {isP ? (
                <Check size={14} className="mr-1" />
            ) : (
                <X size={14} className="mr-1" />
            )}{" "}
            {type}
        </button>
    );
};

const StatsCard = ({ totalStudents, markedCount }) => (
    <div className="flex gap-4 text-xs font-mono text-gray-400">
        <div className="flex items-center gap-2">
            <Users size={14} />
            <span>Total: {totalStudents}</span>
        </div>
        <div className="flex items-center gap-2">
            <CheckCircle size={14} className="text-green-400" />
            <span>Marked: {markedCount}</span>
        </div>
        {markedCount < totalStudents && totalStudents > 0 && (
            <div className="flex items-center gap-2 text-yellow-400">
                <AlertCircle size={14} />
                <span>Pending: {totalStudents - markedCount}</span>
            </div>
        )}
    </div>
);

// --- Main Component ---
const MarkAttendance = () => {
    const {
        state,
        selection,
        setSelection,
        attendanceMap,
        filteredStudents,
        handleStatusChange,
        markAllPresent,
        submitAttendance,
        toast,
        setToast,
    } = useAttendanceData();

    const markedCount = useMemo(() => {
        return filteredStudents.filter((s) => attendanceMap[s.id]).length;
    }, [filteredStudents, attendanceMap]);

    const isSubmitDisabled = useMemo(() => {
        return (
            state.loading ||
            !filteredStudents.length ||
            !selection.course ||
            !selection.semester
        );
    }, [
        state.loading,
        filteredStudents.length,
        selection.course,
        selection.semester,
    ]);

    const hasUnsavedChanges = useMemo(() => {
        if (!selection.course || !selection.semester) return false;

        const existingMap = state.records
            .filter(
                (rec) =>
                    Number(rec.course?.id) === Number(selection.course.id) &&
                    Number(rec.semester?.id) ===
                        Number(selection.semester.id) &&
                    rec.date === selection.date,
            )
            .reduce((acc, rec) => {
                if (rec.student?.id) acc[rec.student.id] = rec.status;
                return acc;
            }, {});

        return JSON.stringify(attendanceMap) !== JSON.stringify(existingMap);
    }, [selection, state.records, attendanceMap]);

    if (state.error && !state.students.length) {
        return (
            <div className="w-full max-w-6xl mx-auto p-4">
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-8 text-center">
                    <AlertCircle
                        className="mx-auto mb-4 text-red-400"
                        size={48}
                    />
                    <h3 className="text-lg font-semibold text-red-400 mb-2">
                        Failed to Load Data
                    </h3>
                    <p className="text-gray-400">{state.error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded text-sm"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full text-gray-200 font-sans max-w-6xl mx-auto p-4">
            {toast && <Toast {...toast} onClose={() => setToast(null)} />}

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Mark Attendance
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    Record and manage student attendance
                </p>
            </div>



            {/* Selection Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <SelectField
                    label="Course"
                    icon={<BookOpen size={14} />}
                    required
                >
                    <select
                        className="w-full bg-white/5 border border-white/10 rounded-md p-3 text-sm focus:border-blue-500 outline-none transition-colors"
                        onChange={(e) => {
                            const course = state.courses.find(
                                (c) => c.id === parseInt(e.target.value),
                            );
                            setSelection((prev) => ({
                                ...prev,
                                course: course || null,
                            }));
                        }}
                        value={selection.course?.id || ""}
                    >
                        <option value="">Select Course</option>
                        {state.courses.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.courseCode} - {c.courseName}
                            </option>
                        ))}
                    </select>
                </SelectField>

                <SelectField
                    label="Semester"
                    icon={<Layers size={14} />}
                    required
                >
                    <select
                        className="w-full bg-white/5 border border-white/10 rounded-md p-3 text-sm focus:border-blue-500 outline-none transition-colors"
                        onChange={(e) => {
                            const semester = state.semesters.find(
                                (s) => s.id === parseInt(e.target.value),
                            );
                            setSelection((prev) => ({
                                ...prev,
                                semester: semester || null,
                            }));
                        }}
                        value={selection.semester?.id || ""}
                    >
                        <option value="">Select Semester</option>
                        {state.semesters.map((s) => (
                            <option key={s.id} value={s.id}>
                                Semester {s.semesterNo} (Batch {s.batch} |{" "}
                                {s.session})
                            </option>
                        ))}
                    </select>
                </SelectField>

                <SelectField
                    label="Date"
                    icon={<CalendarIcon size={14} />}
                    required
                >
                    <input
                        type="date"
                        value={selection.date}
                        className="w-full bg-white/5 border border-white/10 rounded-md p-3 text-sm outline-none transition-colors"
                        onChange={(e) =>
                            setSelection((prev) => ({
                                ...prev,
                                date: e.target.value,
                            }))
                        }
                    />
                </SelectField>
            </div>

            {/* Attendance Table */}
            <div className="border border-white/5 rounded-xl overflow-hidden backdrop-blur-sm bg-white/[0.02]">
                <div className="bg-white/[0.03] px-6 py-4 border-b border-white/5 flex flex-wrap justify-between items-center gap-4">
                    <div className="space-y-1">
                        <h3 className="text-[10px] font-mono uppercase tracking-widest text-gray-400">
                            Attendance Registry
                        </h3>
                        {selection.course && selection.semester && (
                            <StatsCard
                                totalStudents={filteredStudents.length}
                                markedCount={markedCount}
                            />
                        )}
                    </div>
                    <div className="flex gap-2">
                        {hasUnsavedChanges && (
                            <div className="flex items-center text-xs text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded">
                                <AlertCircle size={12} className="mr-1" />
                                Unsaved changes
                            </div>
                        )}
                        <button
                            onClick={markAllPresent}
                            disabled={!filteredStudents.length}
                            className="text-[9px] font-mono bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            Mark All Present
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm min-w-[600px]">
                        <thead className="bg-white/[0.01] text-[10px] font-mono uppercase tracking-widest text-gray-500 border-b border-white/5">
                            <tr>
                                <th className="px-6 py-4 font-normal">
                                    Student Info
                                </th>
                                <th className="px-6 py-4 font-normal">
                                    ID Reference
                                </th>
                                <th className="px-6 py-4 text-center font-normal">
                                    Attendance Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {state.loading && !filteredStudents.length ? (
                                <tr>
                                    <td
                                        colSpan="3"
                                        className="px-6 py-12 text-center"
                                    >
                                        <Loader2
                                            className="animate-spin mx-auto mb-2"
                                            size={24}
                                        />
                                        <p className="text-gray-500 text-sm">
                                            Loading students...
                                        </p>
                                    </td>
                                </tr>
                            ) : filteredStudents.length ? (
                                filteredStudents.map((student) => (
                                    <tr
                                        key={student.id}
                                        className="hover:bg-white/[0.01] transition-colors group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-white group-hover:text-blue-400 transition-colors">
                                                {student.name}
                                            </div>
                                            <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                                                {student.department}
                                            </div>
                                            {/* Display semester info for debugging */}
                                            <div className="text-[9px] text-gray-600 font-mono mt-0.5">
                                                Sem ID:{" "}
                                                {student.currSemester?.id ||
                                                    "N/A"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-blue-400/80 text-sm">
                                            {student.studentID}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center gap-3">
                                                <StatusButton
                                                    active={
                                                        attendanceMap[
                                                            student.id
                                                        ] === "P"
                                                    }
                                                    type="P"
                                                    onClick={() =>
                                                        handleStatusChange(
                                                            student.id,
                                                            "P",
                                                        )
                                                    }
                                                    disabled={state.loading}
                                                />
                                                <StatusButton
                                                    active={
                                                        attendanceMap[
                                                            student.id
                                                        ] === "A"
                                                    }
                                                    type="A"
                                                    onClick={() =>
                                                        handleStatusChange(
                                                            student.id,
                                                            "A",
                                                        )
                                                    }
                                                    disabled={state.loading}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="3"
                                        className="px-6 py-12 text-center"
                                    >
                                        <div className="text-gray-500">
                                            <Users
                                                className="mx-auto mb-2 opacity-50"
                                                size={32}
                                            />
                                            <p className="font-mono italic">
                                                {selection.course &&
                                                selection.semester
                                                    ? "No students found for this course and semester"
                                                    : "Select a course and semester to view students"}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8 flex justify-end">
                <button
                    disabled={isSubmitDisabled || !hasUnsavedChanges}
                    onClick={submitAttendance}
                    className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-8 py-3 rounded-md font-mono font-black uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
                >
                    {state.loading ? (
                        <>
                            <Loader2 size={18} className="animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            <Save size={18} />
                            Submit Attendance
                        </>
                    )}
                </button>
            </div>

            {/* Debug Panel */}
            <details className="mt-8">
                <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400">
                    Debug Info
                </summary>
                <div className="mt-2 p-4 bg-black/50 border border-white/10 rounded text-xs space-y-2">
                    <div>
                        <strong className="text-blue-400">
                            Selected Semester:
                        </strong>
                        <pre className="mt-1 text-gray-400">
                            {JSON.stringify(selection.semester, null, 2)}
                        </pre>
                    </div>
                    <div>
                        <strong className="text-blue-400">
                            Filtered Students (by Semester ID):
                        </strong>
                        <pre className="mt-1 text-gray-400">
                            {JSON.stringify(
                                filteredStudents.map((s) => ({
                                    id: s.id,
                                    name: s.name,
                                    semesterId: s.currSemester?.id,
                                    semesterNo: s.currSemester?.semesterNo,
                                })),
                                null,
                                2,
                            )}
                        </pre>
                    </div>
                    <div>
                        <strong className="text-blue-400">
                            Attendance Map:
                        </strong>
                        <pre className="mt-1 text-gray-400">
                            {JSON.stringify(attendanceMap, null, 2)}
                        </pre>
                    </div>
                </div>
            </details>
        </div>
    );
};

export default MarkAttendance;
