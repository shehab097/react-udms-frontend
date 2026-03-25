import React, { useState, useEffect, useMemo } from "react";
import {
    Filter,
    CheckCircle,
    XCircle,
    Clock,
    AlertTriangle,
} from "lucide-react";
import { getToken } from "../services/tokenService";
import { ATTENDANCE_ENDPOINT } from "../config/config";

const AttendanceDashboard = () => {
    const [attendances, setAttendances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        course: "",
        semester: "",
        status: "",
        date: "",
    });

    useEffect(() => {
        const fetchAttendance = async () => {
            setLoading(true);
            try {
                const token = getToken();
                const response = await fetch(ATTENDANCE_ENDPOINT, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!response.ok)
                    throw new Error(`ERR_CODE: ${response.status}`);
                const data = await response.json();
                setAttendances(Array.isArray(data) ? data : []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchAttendance();
    }, []);

    const available = useMemo(
        () => ({
            courses: [
                ...new Set(attendances.map((a) => a.course?.courseCode)),
            ].filter(Boolean),
            semesters: [
                ...new Set(attendances.map((a) => a.semester?.semesterNo)),
            ]
                .filter(Boolean)
                .sort(),
        }),
        [attendances],
    );

    const filteredData = useMemo(
        () =>
            attendances.filter(
                (record) =>
                    (!filters.course ||
                        record.course?.courseCode === filters.course) &&
                    (!filters.semester ||
                        record.semester?.semesterNo.toString() ===
                            filters.semester) &&
                    (!filters.status || record.status === filters.status) &&
                    (!filters.date || record.date === filters.date),
            ),
        [attendances, filters],
    );

    const stats = {
        total: filteredData.length,
        present: filteredData.filter((a) => a.status === "PRESENT").length,
        absent: filteredData.filter((a) => a.status === "ABSENT").length,
    };

    const StatusBadge = ({ status }) => {
        const colors = {
            PRESENT: "text-green-400 border-green-500/30 bg-green-500/5",
            ABSENT: "text-red-400 border-red-500/30 bg-red-500/5",
            LATE: "text-yellow-400 border-yellow-500/30 bg-yellow-500/5",
        };
        return (
            <span
                className={`px-2 py-0.5 rounded border text-[10px] font-mono font-bold ${colors[status] || "text-gray-500 border-white/10"}`}
            >
                {status || "N/A"}
            </span>
        );
    };

    return (
        <div className="w-full space-y-6">
            {/* Minimal Header */}
            <div className="flex flex-col md:flex-row justify-between items-end border-b border-white/5 pb-4 gap-4">
                <div className="space-y-1">
                    <h2 className="text-xl font-black text-white uppercase tracking-tighter">
                        Attendance_Log
                    </h2>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500">
                        <span className="text-ui-accent">●</span> SYSTEM_READY /{" "}
                        {stats.total}_ENTRIES
                    </div>
                </div>

                {/* Inline Filters */}
                <div className="flex flex-wrap gap-2">
                    <select
                        value={filters.course}
                        onChange={(e) =>
                            setFilters({ ...filters, course: e.target.value })
                        }
                        className="bg-transparent border border-white/10 text-[11px] rounded px-2 py-1 text-gray-400 outline-none focus:border-ui-accent transition-colors"
                    >
                        <option value="">Course: All</option>
                        {available.courses.map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </select>
                    <select
                        value={filters.semester}
                        onChange={(e) =>
                            setFilters({ ...filters, semester: e.target.value })
                        }
                        className="bg-transparent border border-white/10 text-[11px] rounded px-2 py-1 text-gray-400 outline-none focus:border-ui-accent transition-colors"
                    >
                        <option value="">Sem: All</option>
                        {available.semesters.map((s) => (
                            <option key={s} value={s}>
                                Sem 0{s}
                            </option>
                        ))}
                    </select>
                    <input
                        type="date"
                        value={filters.date}
                        onChange={(e) =>
                            setFilters({ ...filters, date: e.target.value })
                        }
                        className="bg-transparent border border-white/10 text-[11px] rounded px-2 py-1 text-gray-400 outline-none focus:border-ui-accent color-scheme-dark"
                    />
                    <button
                        onClick={() =>
                            setFilters({
                                course: "",
                                semester: "",
                                status: "",
                                date: "",
                            })
                        }
                        className="text-[10px] font-mono text-ui-accent border border-ui-accent/20 px-2 py-1 rounded hover:bg-ui-accent/10 transition-all uppercase"
                    >
                        Reset
                    </button>
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-2 text-red-400 font-mono text-xs bg-red-500/5 border border-red-500/20 p-3 rounded">
                    <AlertTriangle size={14} /> [ ERROR_LOG: {error} ]
                </div>
            )}

            {/* Micro Stats */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    {
                        label: "Total",
                        val: stats.total,
                        color: "text-ui-accent",
                    },
                    {
                        label: "Present",
                        val: stats.present,
                        color: "text-green-400",
                    },
                    {
                        label: "Absent",
                        val: stats.absent,
                        color: "text-red-400",
                    },
                ].map((s, i) => (
                    <div
                        key={i}
                        className="border-l-2 border-white/5 pl-3 py-1"
                    >
                        <p className="text-[9px] uppercase font-mono text-gray-500 tracking-widest">
                            {s.label}
                        </p>
                        <p className={`text-lg font-bold ${s.color}`}>
                            {s.val}
                        </p>
                    </div>
                ))}
            </div>

            {/* Main Data Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-separate border-spacing-y-1.5">
                    <thead className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                        <tr>
                            <th className="px-4 py-2 font-medium">Date</th>
                            <th className="px-4 py-2 font-medium">
                                Student_ID
                            </th>
                            <th className="px-4 py-2 font-medium">Name</th>
                            <th className="px-4 py-2 font-medium">Code</th>
                            <th className="px-4 py-2 font-medium text-center">
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {loading ? (
                            <tr>
                                <td
                                    colSpan="5"
                                    className="px-4 py-10 text-center font-mono text-xs text-ui-accent animate-pulse uppercase"
                                >
                                    &gt; Loading_Registry...
                                </td>
                            </tr>
                        ) : filteredData.length === 0 ? (
                            <tr>
                                <td
                                    colSpan="5"
                                    className="px-4 py-10 text-center font-mono text-xs text-gray-600 uppercase"
                                >
                                    &gt; Query_Empty
                                </td>
                            </tr>
                        ) : (
                            filteredData.map((record) => (
                                <tr
                                    key={record.id}
                                    className="bg-white/[0.03] hover:bg-white/[0.06] transition-all group"
                                >
                                    <td className="px-4 py-3 font-mono text-xs text-gray-500 first:rounded-l-lg">
                                        {record.date}
                                    </td>
                                    <td className="px-4 py-3 font-mono font-bold text-ui-accent">
                                        {record.student?.studentID}
                                    </td>
                                    <td className="px-4 py-3 text-gray-300 font-medium">
                                        {record.student?.name}
                                    </td>
                                    <td className="px-4 py-3 font-mono text-xs text-purple-400">
                                        {record.course?.courseCode}
                                    </td>
                                    <td className="px-4 py-3 text-center last:rounded-r-lg">
                                        <StatusBadge status={record.status} />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AttendanceDashboard;
