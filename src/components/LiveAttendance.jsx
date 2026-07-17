import React, { useEffect, useState, useRef } from "react";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import { motion, AnimatePresence } from "framer-motion";

import BASE_URL from "../config/config";

const LiveAttendance = ({ semesterId, courseId }) => {
    const [students, setStudents] = useState([]);
    const [status, setStatus] = useState("connecting");
    const [loading, setLoading] = useState(true);
    const stompClientRef = useRef(null);

    const fetchData = async () => {
        if (!semesterId || !courseId) return;
        try {
            setLoading(true);
            const headers = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            };

            const [rosterRes, attendanceRes] = await Promise.all([
                fetch(`${BASE_URL}/student/semester/${semesterId}`, {
                    headers,
                }),
                fetch(`${BASE_URL}/attendance/today/${courseId}`, { headers }),
            ]);

            const roster = await rosterRes.json();
            const attendance = await attendanceRes.json();

            const combinedData = roster
                .map((student) => {
                    const record = attendance.find(
                        (a) => a.student?.studentID === student.studentID,
                    );
                    return {
                        ...student,
                        // যদি রেকর্ড না থাকে তবে null, থাকলে তার স্ট্যাটাস (P/A)
                        currentStatus: record ? record.status : null,
                    };
                })
                .sort((a, b) => a.studentID.localeCompare(b.studentID));

            setStudents(combinedData);
        } catch (err) {
            console.error("Fetch Error:", err);
            setStatus("error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [semesterId, courseId]);

    useEffect(() => {
        if (!courseId) return;
        const socket = new SockJS(`${BASE_URL}/ws-attendance`);
        const client = Stomp.over(socket);
        client.debug = null;

        client.connect(
            {},
            () => {
                setStatus("connected");
                stompClientRef.current = client;
                client.subscribe(`/topic/attendance/${courseId}`, (message) => {
                    const updatedRecord = JSON.parse(message.body);
                    setStudents((prev) =>
                        prev.map((s) =>
                            s.studentID === updatedRecord.student?.studentID
                                ? { ...s, currentStatus: updatedRecord.status }
                                : s,
                        ),
                    );
                });
            },
            () => setStatus("error"),
        );

        return () => {
            if (stompClientRef.current?.connected)
                stompClientRef.current.disconnect();
        };
    }, [courseId]);

    if (loading)
        return (
            <div className="p-10 text-center font-black text-content-secondary animate-pulse">
                SYNCING ROSTER...
            </div>
        );

    return (
        <div className="h-full flex flex-col p-4 bg-ui-surface/10">
            <div className="flex justify-between items-center mb-6 border-b border-ui-neutral/20 pb-1 px-1">
                <div className="flex items-center gap-3 pt-1">
                    <h3 className="text-[12px] font-black text-content-muted uppercase tracking-widest">
                        Live Monitor
                    </h3>
                    <div className="flex gap-2">
                        <span className="bg-ui-highlight text-ui-background text-[10px] font-black px-2 py-0.5 rounded shadow-sm">
                            P:{" "}
                            {
                                students.filter((s) => s.currentStatus === "P")
                                    .length
                            }
                        </span>
                        <span className="bg-ui-secondary text-ui-background text-[10px] font-black px-2 py-0.5 rounded shadow-sm">
                            A:{" "}
                            {
                                students.filter((s) => s.currentStatus === "A")
                                    .length
                            }
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-ui-surface border border-ui-neutral/20 px-3 py-1.5 rounded-full shadow-sm">
                    <div
                        className={`w-2 h-2 rounded-full ${status === "connected" ? "bg-ui-highlight animate-pulse" : "bg-ui-secondary"}`}
                    />
                    <span className="text-[10px] font-black text-content-muted uppercase">
                        {status}
                    </span>
                </div>
            </div>

            <div
                className="grid gap-3 overflow-y-auto pr-1 pb-10 scrollbar-hide pt-2 pl-1"
                style={{
                    gridTemplateColumns:
                        "repeat(auto-fill, minmax(145px, 1fr))",
                }}
            >
                <AnimatePresence mode="popLayout">
                    {students.map((student) => (
                        <AttendanceInfoCard
                            key={student.studentID}
                            student={student}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

function AttendanceInfoCard({ student }) {
    const status = student.currentStatus; // P, A, or null

    // স্টাইল কনফিগ
    const config = {
        P: {
            bg: "bg-ui-surface border-ui-highlight shadow-[0_4px_15px_rgba(16,185,129,0.15)] z-10 scale-[1.03]",
            text: "text-ui-highlight",
            label: "PRESENT",
            labelBg: "bg-ui-highlight text-ui-background",
            idColor: "text-ui-highlight",
            nameColor: "text-content-primary",
        },
        A: {
            bg: "bg-ui-secondary/10 border-ui-secondary/50 opacity-90",
            text: "text-ui-secondary",
            label: "ABSENT",
            labelBg: "bg-ui-secondary text-ui-background",
            idColor: "text-ui-secondary",
            nameColor: "text-ui-secondary",
        },
        default: {
            bg: "bg-ui-neutral/20 border-ui-neutral/20 grayscale-[0.8] opacity-50",
            text: "text-content-muted",
            label: "NO DATA",
            labelBg: "bg-ui-neutral/30 text-content-muted",
            idColor: "text-content-muted",
            nameColor: "text-content-muted",
        },
    };

    const currentStyle = config[status] || config.default;

    return (
        <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`flex flex-col p-4 rounded-2xl border-2 transition-all duration-500 ${currentStyle.bg}`}
        >
            <div className="flex justify-between items-start mb-2">
                <span
                    className={`text-[12px] font-black font-mono tracking-tighter ${currentStyle.idColor}`}
                >
                    #{student.studentID}
                </span>
                <div
                    className={`text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm ${currentStyle.labelBg}`}
                >
                    {currentStyle.label}
                </div>
            </div>

            <h4
                className={`text-[14px] font-black leading-tight break-words min-h-[2.4em] flex items-center ${currentStyle.nameColor}`}
            >
                {student.name}
            </h4>

            {status === "P" && (
                <div className="mt-3 w-full h-1 bg-ui-highlight rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
            )}
        </motion.div>
    );
}

export default LiveAttendance;
