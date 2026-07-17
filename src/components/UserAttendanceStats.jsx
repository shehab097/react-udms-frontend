import React, { useState, useEffect, useMemo } from "react";
import { getToken } from "../services/tokenService";
import Loading from "./Loading";

const UserAttendanceStats = ({ userId }) => {
    const [rawData, setRawData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserStats = async () => {
            setLoading(true);
            const token = getToken();
            try {
                const res = await fetch(
                    `http://localhost:8080/attendance/attendance-data/${userId}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    },
                );
                if (res.ok) {
                    const data = await res.json();
                    setRawData(data);
                } else {
                    setError("Failed to sync attendance records.");
                }
            } catch (err) {
                setError("Network error: Could not reach server.");
            } finally {
                setLoading(false);
            }
        };

        if (userId) fetchUserStats();
    }, [userId]);

    // Grouping flat data into course-wise statistics
    const courseStats = useMemo(() => {
        const groups = rawData.reduce((acc, record) => {
            const code = record.courseCode;
            if (!acc[code]) {
                acc[code] = {
                    name: record.courseName,
                    code: record.courseCode,
                    present: 0,
                    total: 0,
                    semester: record.currSemester?.semesterNo,
                    batch: record.currSemester?.batch,
                    session: record.currSemester?.session,
                };
            }
            acc[code].total += 1;
            if (record.status === "P") acc[code].present += 1;
            return acc;
        }, {});

        return Object.values(groups).map((course) => ({
            ...course,
            percentage: ((course.present / course.total) * 100).toFixed(1),
        }));
    }, [rawData]);

    if (loading)
        return (
            <div className="p-10 text-center text-ui-highlight animate-pulse font-mono">
                LOADING_STATISTICS...
            </div>
        );
    if (error)
        return (
            <div className="p-10 text-center text-ui-secondary font-mono">
                {error}
            </div>
        );

    return (
        <div className="w-full space-y-6">
            {/* Summary Header */}
            <div className="flex items-baseline justify-between px-2">
                <h2 className="text-xl font-bold text-content-primary tracking-tight">
                    Academic Overview
                </h2>
                {/* <span className="text-[10px] font-mono text-ui-highlight uppercase">
                    User ID: {userId}
                </span> */}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {courseStats.map((course) => (
                    <div
                        key={course.code}
                        className="group bg-ui-background/60 border border-ui-neutral/20 p-6 rounded-2xl backdrop-blur-md hover:border-ui-accent/30 transition-all duration-300 shadow-xl"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-content-primary font-bold text-lg leading-tight group-hover:text-ui-accent transition-colors">
                                    {course.name}
                                </h3>
                                <p className="text-xs font-mono text-ui-accent mt-1">
                                    {course.code}
                                </p>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] bg-ui-accent/10 text-ui-accent/60 px-2 py-1 rounded-md font-mono">
                                    SEM {course.semester} • {course.session}
                                </span>
                            </div>
                        </div>

                        {/* Progress Bar Section */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-end">
                                <div className="flex gap-4">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] text-content-muted uppercase font-bold tracking-widest">
                                            Attendance
                                        </span>
                                        <span className="text-content-primary font-mono font-bold">
                                            {course.present}
                                            <span className="text-content-muted mx-1">
                                                /
                                            </span>
                                            {course.total}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span
                                        className={`text-2xl font-black font-mono tracking-tighter ${
                                            parseFloat(course.percentage) < 75
                                                ? "text-ui-secondary"
                                                : "text-ui-highlight"
                                        }`}
                                    >
                                        {course.percentage}%
                                    </span>
                                </div>
                            </div>

                            {/* Visual Progress Bar */}
                            <div className="w-full h-1.5 bg-ui-neutral/20 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-1000 ease-out rounded-full ${
                                        parseFloat(course.percentage) < 75
                                            ? "bg-ui-secondary"
                                            : "bg-ui-highlight"
                                    }`}
                                    style={{ width: `${course.percentage}%` }}
                                />
                            </div>
                        </div>

                        {/* Footer Details */}
                        <div className="mt-5 pt-4 border-t border-ui-neutral/20 flex justify-between items-center text-[10px] text-content-muted font-mono">
                            <span>BATCH {course.batch}</span>
                            <span
                                className={
                                    parseFloat(course.percentage) < 75
                                        ? "text-ui-secondary/60"
                                        : "text-ui-highlight/60"
                                }
                            >
                                {parseFloat(course.percentage) < 75
                                    ? "LOW ATTENDANCE"
                                    : ""}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {courseStats.length === 0 && (
                <div className="p-20 border border-dashed border-ui-neutral/20 rounded-2xl text-center text-content-muted font-mono text-sm">
                    NO_ATTENDANCE_HISTORY_FOUND
                </div>
            )}
        </div>
    );
};

export default UserAttendanceStats;
