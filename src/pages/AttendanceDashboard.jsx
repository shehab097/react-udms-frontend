import React, {
    useState,
    useEffect,
    useMemo,
    useCallback,
    useReducer,
} from "react";
import {
    ChevronUp,
    ChevronDown,
    RotateCcw,
    Loader2,
    AlertCircle,
    Filter,
    Calendar,
    BookOpen,
    Users,
} from "lucide-react";
import { getToken } from "../services/tokenService";
import { ATTENDANCE_ENDPOINT } from "../config/config";
import Toast from "../components/Toast";
import { Link } from "react-router-dom";

// --- Reducer for filter state management ---
const filterReducer = (state, action) => {
    switch (action.type) {
        case "SET_FILTER":
            return { ...state, [action.key]: action.value };
        case "RESET_FILTERS":
            return { ...action.payload };
        default:
            return state;
    }
};

// --- Custom Hook for Attendance Data ---
const useAttendanceData = () => {
    const [attendances, setAttendances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState(null);

    const today = new Date().toISOString().split("T")[0];

    const [filters, dispatchFilters] = useReducer(filterReducer, {
        course: "",
        semesterId: "", // Changed from "semester" to "semesterId"
        status: "",
        date: today,
    });

    const [sortConfig, setSortConfig] = useState({
        key: "date",
        direction: "desc",
    });

    const showToast = useCallback((message, type = "error") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 5000);
    }, []);

    // Fetch attendance data
    useEffect(() => {
        let isMounted = true;

        const fetchAttendance = async () => {
            setLoading(true);
            setError(null);

            try {
                const token = getToken();
                if (!token) {
                    throw new Error("Authentication token not found");
                }

                const response = await fetch(ATTENDANCE_ENDPOINT, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        throw new Error("Unauthorized. Please login again.");
                    }
                    if (response.status === 404) {
                        throw new Error("Attendance endpoint not found");
                    }
                    throw new Error(`HTTP Error: ${response.status}`);
                }

                const data = await response.json();

                if (isMounted) {
                    const attendanceData = Array.isArray(data) ? data : [];
                    setAttendances(attendanceData);
                    showToast(
                        `Loaded ${attendanceData.length} attendance records`,
                        "success",
                    );
                }
            } catch (err) {
                if (isMounted) {
                    setError(err.message);
                    showToast(err.message, "error");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchAttendance();

        return () => {
            isMounted = false;
        };
    }, [showToast]);

    // Reset filters to default
    const resetFilters = useCallback(() => {
        dispatchFilters({
            type: "RESET_FILTERS",
            payload: { course: "", semesterId: "", status: "", date: today },
        });
        showToast("Filters reset to default", "info");
    }, [today, showToast]);

    // Update single filter
    const updateFilter = useCallback((key, value) => {
        dispatchFilters({ type: "SET_FILTER", key, value });
    }, []);

    // Handle sorting
    const handleSort = useCallback((key) => {
        setSortConfig((prev) => ({
            key,
            direction:
                prev.key === key && prev.direction === "asc" ? "desc" : "asc",
        }));
    }, []);

    // Extract unique semesters from attendance records using semester ID
    const availableSemesters = useMemo(() => {
        const semesterMap = new Map();

        attendances.forEach((record) => {
            if (record.semester?.id) {
                const semesterId = record.semester.id;
                if (!semesterMap.has(semesterId)) {
                    semesterMap.set(semesterId, {
                        id: semesterId,
                        semesterNo: record.semester.semesterNo,
                        batch: record.semester.batch,
                        session: record.semester.session,
                    });
                }
            }
        });

        const semesters = Array.from(semesterMap.values()).sort(
            (a, b) => a.id - b.id,
        );

        return { semesters, map: semesterMap };
    }, [attendances]);

    // Extract unique courses from attendance records
    const availableCourses = useMemo(() => {
        return [
            ...new Set(
                attendances
                    .map((record) => record.course?.courseCode)
                    .filter(Boolean),
            ),
        ].sort();
    }, [attendances]);

    // Process and filter data
    const processedData = useMemo(() => {
        let filtered = attendances.filter((record) => {
            // Course filter
            if (
                filters.course &&
                record.course?.courseCode !== filters.course
            ) {
                return false;
            }

            // Semester filter - FIXED: filter by semester ID instead of semester number
            if (filters.semesterId) {
                const recordSemesterId = record.semester?.id;
                const filterSemesterId = parseInt(filters.semesterId);

                // Check if record has semester and if it matches the filter
                if (
                    !recordSemesterId ||
                    recordSemesterId !== filterSemesterId
                ) {
                    return false;
                }
            }

            // Status filter - handle both formats (P/PRESENT, A/ABSENT)
            if (filters.status) {
                const isPresent = ["P", "PRESENT"].includes(record.status);
                const isAbsent = ["A", "ABSENT"].includes(record.status);

                if (filters.status === "PRESENT" && !isPresent) return false;
                if (filters.status === "ABSENT" && !isAbsent) return false;
            }

            // Date filter
            if (filters.date && record.date !== filters.date) {
                return false;
            }

            return true;
        });

        // Apply sorting
        return filtered.sort((a, b) => {
            let aVal, bVal;

            switch (sortConfig.key) {
                case "date":
                    aVal = a.date;
                    bVal = b.date;
                    break;
                case "studentID":
                    aVal = a.student?.studentID || "";
                    bVal = b.student?.studentID || "";
                    break;
                case "name":
                    aVal = a.student?.name || "";
                    bVal = b.student?.name || "";
                    break;
                default:
                    return 0;
            }

            if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
            return 0;
        });
    }, [attendances, filters, sortConfig]);

    // Calculate statistics
    const stats = useMemo(
        () => ({
            total: processedData.length,
            present: processedData.filter((a) =>
                ["P", "PRESENT"].includes(a.status),
            ).length,
            absent: processedData.filter((a) =>
                ["A", "ABSENT"].includes(a.status),
            ).length,
            attendanceRate:
                processedData.length > 0
                    ? (
                          (processedData.filter((a) =>
                              ["P", "PRESENT"].includes(a.status),
                          ).length /
                              processedData.length) *
                          100
                      ).toFixed(1)
                    : 0,
        }),
        [processedData],
    );

    return {
        attendances,
        loading,
        error,
        toast,
        setToast,
        filters,
        sortConfig,
        processedData,
        availableSemesters,
        availableCourses,
        stats,
        updateFilter,
        resetFilters,
        handleSort,
        showToast,
    };
};

// --- Helper Components ---
const StatusBadge = ({ status }) => {
    const isPresent = ["P", "PRESENT"].includes(status);
    const isAbsent = ["A", "ABSENT"].includes(status);

    const config = isPresent
        ? {
              label: "PRESENT",
              color: "text-ui-highlight",
              bg: "bg-ui-highlight/10",
              border: "border-green-500/30",
          }
        : isAbsent
          ? {
                label: "ABSENT",
                color: "text-ui-secondary",
                bg: "bg-ui-secondary/10",
                border: "border-ui-secondary/30",
            }
          : {
                label: status || "UNKNOWN",
                color: "text-content-muted",
                bg: "bg-gray-500/10",
                border: "border-gray-500/30",
            };

    return (
        <span
            className={`px-3 py-1 rounded-md border text-[11px] font-mono font-semibold tracking-tighter ${config.bg} ${config.border} ${config.color}`}
        >
            {config.label}
        </span>
    );
};

const SortIcon = ({ column, currentSort }) => {
    if (currentSort.key !== column) {
        return <ChevronDown size={12} className="opacity-30" />;
    }
    return currentSort.direction === "asc" ? (
        <ChevronUp size={12} className="text-ui-accent" />
    ) : (
        <ChevronDown size={12} className="text-ui-accent" />
    );
};

const FilterSelect = ({
    value,
    onChange,
    options,
    placeholder,
    icon: Icon,
    renderOption,
}) => (
    <div className="relative">
        {Icon && (
            <Icon
                size={12}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted"
            />
        )}
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`bg-ui-accent/10 border border-ui-neutral/20 text-[11px] rounded-md px-3 py-1.5 text-content-muted outline-none focus:border-ui-accent transition-all ${Icon ? "pl-7" : ""}`}
        >
            <option value="" className="bg-[#0a0a0a]">
                {placeholder}
            </option>
            {options.map((opt) => (
                <option
                    key={opt.value || opt}
                    value={opt.value || opt}
                    className="bg-[#0a0a0a]"
                >
                    {renderOption ? renderOption(opt) : opt}
                </option>
            ))}
        </select>
    </div>
);

const StatCard = ({ label, value, color, icon: Icon }) => (
    <div className="bg-ui-accent/[0.05] border border-ui-neutral/20 p-4 rounded-lg hover:bg-white/[0.04] transition-all">
        <div className="flex items-center justify-between mb-2">
            <p className="text-[9px] uppercase font-mono text-content-muted tracking-[0.2em]">
                {label}
            </p>
            {Icon && <Icon size={14} className={`${color} opacity-70`} />}
        </div>
        <p className={`text-2xl font-black ${color}`}>{value}</p>
    </div>
);

const TableSkeleton = () => (
    <tbody>
        {[...Array(5)].map((_, i) => (
            <tr key={i} className="animate-pulse">
                <td className="px-6 py-4">
                    <div className="h-4 bg-ui-accent/10 rounded w-24"></div>
                </td>
                <td className="px-6 py-4">
                    <div className="h-4 bg-ui-accent/10 rounded w-20"></div>
                </td>
                <td className="px-6 py-4">
                    <div className="h-4 bg-ui-accent/10 rounded w-32"></div>
                </td>
                <td className="px-6 py-4">
                    <div className="h-4 bg-ui-accent/10 rounded w-16"></div>
                </td>
                <td className="px-6 py-4">
                    <div className="h-6 bg-ui-accent/10 rounded w-20 mx-auto"></div>
                </td>
            </tr>
        ))}
    </tbody>
);

// --- Main Component ---
const AttendanceDashboard = () => {
    const {
        loading,
        error,
        toast,
        setToast,
        filters,
        sortConfig,
        processedData,
        availableSemesters,
        availableCourses,
        stats,
        updateFilter,
        resetFilters,
        handleSort,
    } = useAttendanceData();

    if (error && !loading) {
        return (
            <div className="w-full space-y-6">
                <div className="bg-ui-secondary/10 border border-ui-secondary/30 rounded-lg p-8 text-center">
                    <AlertCircle
                        className="mx-auto mb-4 text-ui-secondary"
                        size={48}
                    />
                    <h3 className="text-lg font-semibold text-ui-secondary mb-2">
                        Failed to Load Data
                    </h3>
                    <p className="text-content-muted mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-ui-secondary/20 hover:bg-ui-secondary/30 rounded-md text-sm transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full space-y-6">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-ui-neutral/20 pb-4 gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Attendance Dashboard
                    </h1>
                    <div className="flex items-center gap-3 text-[10px] font-mono text-content-muted">
                        <span className="flex items-center gap-1">
                            <Users size={10} />
                            {loading ? "..." : `${stats.total} records`}
                        </span>
                        {stats.total > 0 && (
                            <span
                                className={`${stats.attendanceRate >= 75 ? "text-ui-highlight" : stats.attendanceRate >= 50 ? "text-yellow-400" : "text-ui-secondary"}`}
                            >
                                {stats.attendanceRate}% present
                            </span>
                        )}
                    </div>
                    <div className="block">
                        <Link
                            className="border-ui-secondary py-1 px-3 font-thin text-gray-200  border rounded block hover:bg-ui-secondary "
                            to="/attendance-info"
                        >
                            Attendance Percengate
                        </Link>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2 items-center">
                    <Filter size={12} className="text-content-muted" />

                    {/* Semester Filter - FIXED: using semester ID */}
                    <FilterSelect
                        value={filters.semesterId}
                        onChange={(val) => updateFilter("semesterId", val)}
                        options={availableSemesters.semesters.map(
                            (semester) => ({
                                value: semester.id.toString(),
                                label: `Semester ${semester.semesterNo} (Batch ${semester.batch} | ${semester.session})`,
                            }),
                        )}
                        placeholder="All Semesters"
                        icon={null}
                        renderOption={(option) => option.label}
                    />

                    {/* Course Filter */}
                    <FilterSelect
                        value={filters.course}
                        onChange={(val) => updateFilter("course", val)}
                        options={availableCourses}
                        placeholder="All Courses"
                        icon={null}
                    />

                    {/* Status Filter */}
                    <FilterSelect
                        value={filters.status}
                        onChange={(val) => updateFilter("status", val)}
                        options={["PRESENT", "ABSENT"]}
                        placeholder="All Statuses"
                        icon={null}
                    />

                    {/* Date Filter */}
                    <div className="relative">
                        <Calendar
                            size={12}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted"
                        />
                        <input
                            type="date"
                            value={filters.date}
                            onChange={(e) =>
                                updateFilter("date", e.target.value)
                            }
                            className="bg-ui-accent/10 border border-ui-neutral/20 text-[11px] rounded-md px-3 py-1.5 pl-7 text-content-muted outline-none focus:border-ui-accent transition-all color-scheme-dark"
                        />
                    </div>

                    {/* Reset Button */}
                    <button
                        onClick={resetFilters}
                        className="flex items-center gap-1 text-[10px] font-mono text-ui-accent border border-ui-accent/30 px-3 py-1.5 rounded-md hover:bg-blue-400/10 transition-all uppercase"
                    >
                        <RotateCcw size={10} /> Reset
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard
                    label="Total Records"
                    value={loading ? "..." : stats.total}
                    color="text-ui-accent"
                    icon={Users}
                />
                <StatCard
                    label="Present"
                    value={loading ? "..." : stats.present}
                    color="text-ui-highlight"
                    icon={null}
                />
                <StatCard
                    label="Absent"
                    value={loading ? "..." : stats.absent}
                    color="text-ui-secondary"
                    icon={null}
                />
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto border border-ui-neutral/20 rounded-xl bg-ui-accent/[0.05]">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-ui-accent/10 text-[10px] font-mono text-content-muted uppercase tracking-widest border-b border-ui-neutral/20">
                        <tr>
                            <th
                                className="px-6 py-4 cursor-pointer hover:text-content-primary transition-colors"
                                onClick={() => handleSort("date")}
                            >
                                <div className="flex items-center gap-2">
                                    Date{" "}
                                    <SortIcon
                                        column="date"
                                        currentSort={sortConfig}
                                    />
                                </div>
                            </th>
                            <th
                                className="px-6 py-4 cursor-pointer hover:text-content-primary transition-colors"
                                onClick={() => handleSort("studentID")}
                            >
                                <div className="flex items-center gap-2">
                                    Student ID{" "}
                                    <SortIcon
                                        column="studentID"
                                        currentSort={sortConfig}
                                    />
                                </div>
                            </th>
                            <th
                                className="px-6 py-4 cursor-pointer hover:text-content-primary transition-colors"
                                onClick={() => handleSort("name")}
                            >
                                <div className="flex items-center gap-2">
                                    Name{" "}
                                    <SortIcon
                                        column="name"
                                        currentSort={sortConfig}
                                    />
                                </div>
                            </th>
                            <th className="px-6 py-4">Course</th>
                            <th className="px-6 py-4 text-center">Status</th>
                            <th className="px-6 py-4 text-center">
                                Semester Info
                            </th>
                        </tr>
                    </thead>

                    {loading ? (
                        <TableSkeleton />
                    ) : processedData.length === 0 ? (
                        <tbody>
                            <tr>
                                <td
                                    colSpan="6"
                                    className="px-6 py-12 text-center"
                                >
                                    <div className="flex flex-col items-center gap-2">
                                        <AlertCircle
                                            size={32}
                                            className="text-gray-600"
                                        />
                                        <p className="font-mono text-xs text-content-muted uppercase tracking-widest">
                                            No attendance records found
                                        </p>
                                        {(filters.course ||
                                            filters.semesterId ||
                                            filters.status ||
                                            filters.date !==
                                                new Date()
                                                    .toISOString()
                                                    .split("T")[0]) && (
                                            <button
                                                onClick={resetFilters}
                                                className="text-xs text-ui-accent hover:text-blue-300 mt-2"
                                            >
                                                Clear filters to see all records
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    ) : (
                        <tbody className="text-sm divide-y divide-white/5">
                            {processedData.map((record) => (
                                <tr
                                    key={record.id}
                                    className="hover:bg-ui-accent/[0.05] transition-colors group"
                                >
                                    <td className="px-6 py-4 font-mono text-xs text-content-muted">
                                        {record.date}
                                    </td>
                                    <td className="px-6 py-4 font-mono font-bold text-ui-accent">
                                        {record.student?.studentID || "N/A"}
                                    </td>
                                    <td className="px-6 py-4 text-content-muted font-medium">
                                        {record.student?.name || "Unknown"}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <div className="font-mono text-xs text-content-muted">
                                                {record.course?.courseCode ||
                                                    "N/A"}
                                            </div>
                                            <div className="text-[10px] text-gray-600">
                                                {record.course?.courseName?.substring(
                                                    0,
                                                    30,
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <StatusBadge status={record.status} />
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="text-[10px] font-mono text-content-muted">
                                            Sem {record.semester?.semesterNo}
                                            <br />
                                            <span className="text-[8px] text-gray-600">
                                                (ID: {record.semester?.id})
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    )}
                </table>

                {!loading && processedData.length > 0 && (
                    <div className="px-6 py-3 border-t border-ui-neutral/20 bg-white/[0.01]">
                        <p className="text-[10px] font-mono text-content-muted">
                            Showing {processedData.length} of {stats.total}{" "}
                            records
                        </p>
                    </div>
                )}
            </div>

            {/* Debug Panel */}
            <details className="mt-4 hidden">
                <summary className="text-xs text-content-muted cursor-pointer hover:text-content-muted">
                    Debug Info
                </summary>
                <div className="mt-2 p-4 bg-black/50 border border-ui-neutral/20 rounded text-xs space-y-2">
                    <div>
                        <strong className="text-ui-accent">
                            Active Filters:
                        </strong>
                        <pre className="mt-1 text-content-muted">
                            {JSON.stringify(filters, null, 2)}
                        </pre>
                    </div>
                    <div>
                        <strong className="text-ui-accent">
                            Available Semesters:
                        </strong>
                        <pre className="mt-1 text-content-muted">
                            {JSON.stringify(
                                availableSemesters.semesters,
                                null,
                                2,
                            )}
                        </pre>
                    </div>
                </div>
            </details>
        </div>
    );
};

export default AttendanceDashboard;

