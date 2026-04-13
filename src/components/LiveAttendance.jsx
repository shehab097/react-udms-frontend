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
            <div className="p-10 text-center font-black text-gray-300 animate-pulse">
                SYNCING ROSTER...
            </div>
        );

    return (
        <div className="h-full flex flex-col p-4 bg-gray-50/30">
            <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-1 px-1">
                <div className="flex items-center gap-3 pt-1">
                    <h3 className="text-[12px] font-black text-gray-400 uppercase tracking-widest">
                        Live Monitor
                    </h3>
                    <div className="flex gap-2">
                        <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-sm">
                            P:{" "}
                            {
                                students.filter((s) => s.currentStatus === "P")
                                    .length
                            }
                        </span>
                        <span className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-sm">
                            A:{" "}
                            {
                                students.filter((s) => s.currentStatus === "A")
                                    .length
                            }
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-white border border-gray-100 px-3 py-1.5 rounded-full shadow-sm">
                    <div
                        className={`w-2 h-2 rounded-full ${status === "connected" ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`}
                    />
                    <span className="text-[10px] font-black text-gray-500 uppercase">
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
            bg: "bg-white border-emerald-500 shadow-[0_4px_15px_rgba(16,185,129,0.15)] z-10 scale-[1.03]",
            text: "text-emerald-700",
            label: "PRESENT",
            labelBg: "bg-emerald-500 text-white",
            idColor: "text-emerald-600",
            nameColor: "text-slate-800",
        },
        A: {
            bg: "bg-rose-50 border-rose-200 opacity-90",
            text: "text-rose-700",
            label: "ABSENT",
            labelBg: "bg-rose-600 text-white",
            idColor: "text-rose-400",
            nameColor: "text-rose-900",
        },
        default: {
            bg: "bg-slate-100/50 border-slate-100 grayscale-[0.8] opacity-50",
            text: "text-slate-400",
            label: "NO DATA",
            labelBg: "bg-slate-200 text-slate-500",
            idColor: "text-slate-300",
            nameColor: "text-slate-400",
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
                <div className="mt-3 w-full h-1 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
            )}
        </motion.div>
    );
}

export default LiveAttendance;
