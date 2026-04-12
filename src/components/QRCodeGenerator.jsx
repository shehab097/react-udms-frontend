import React, { useState, useEffect, useCallback } from "react";
import { getToken } from "../services/tokenService";
import { ATTENDANCE_ENDPOINT } from "../config/config";

const TIME_COUNT_DOWN = 60;

const QRCodeGenerator = ({ courseId, semesterId }) => {
    // We store the Base64 image string directly from the backend
    const [qrImageBase64, setQrImageBase64] = useState("");
    const [timeLeft, setTimeLeft] = useState(TIME_COUNT_DOWN);
    const [error, setError] = useState(null);

    const fetchNewToken = useCallback(async () => {
        if (!courseId || !semesterId) return;

        try {
            setError(null);
            const response = await fetch(
                `${ATTENDANCE_ENDPOINT}/generate-qr/${courseId}/${semesterId}`,
                {
                    headers: {
                        Authorization: `Bearer ${getToken()}`,
                    },
                },
            );

            if (!response.ok) throw new Error("Failed to fetch QR");

            const data = await response.json();

            // Your backend sends { qrImage: "base64-string..." }
            if (data.qrImage) {
                setQrImageBase64(data.qrImage);
            }

            setTimeLeft(TIME_COUNT_DOWN);
        } catch (err) {
            console.error("Failed to fetch QR token:", err);
            setError("Failed to load QR code");
        }
    }, [courseId, semesterId]);

    useEffect(() => {
        if (courseId && semesterId) {
            fetchNewToken();

            const timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        fetchNewToken();
                        return TIME_COUNT_DOWN;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [courseId, semesterId, fetchNewToken]);

    if (!courseId || !semesterId) {
        return (
            <div className="flex items-center justify-center h-full text-gray-400 font-medium">
                Please select a course to generate QR.
            </div>
        );
    }

    const imgSrc = qrImageBase64.startsWith("data:image")
        ? qrImageBase64
        : `data:image/png;base64,${qrImageBase64}`;

    return (
        <div className="flex flex-col items-center justify-between h-full w-full p-4 bg-white">
            {/* Minimal Top Info */}
            <div className="text-center pt-2">
                <h2 className="text-lg font-black text-gray-800 uppercase tracking-tighter">
                    Live Attendance QR
                </h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    Scan now to check-in
                </p>
            </div>

            {/* Main QR Container - Takes maximum available space */}
            <div className="flex-1 flex items-center justify-center w-full max-h-[70vh]">
                <div className="relative group aspect-square h-full max-w-full p-4 bg-white border-[12px] border-gray-50 rounded-[2rem] shadow-sm">
                    {qrImageBase64 ? (
                        <img
                            src={imgSrc}
                            alt="QR"
                            className="w-full h-full object-contain transition-transform duration-500"
                        />
                    ) : (
                        <div className="aspect-square w-full flex flex-col items-center justify-center bg-gray-50 rounded-2xl animate-pulse">
                            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <span className="text-gray-400 text-xs font-bold uppercase">
                                Syncing QR...
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Progress Bar - Fixed at bottom */}
            <div className="w-full max-w-md pb-6 px-4">
                <div className="flex justify-between items-end mb-2">
                    <span className="text-xl font-black text-gray-400 uppercase tracking-widest">
                        Security Refresh
                    </span>
                    <span className="text-xl font-mono font-black text-blue-600">
                        {timeLeft}s
                    </span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden shadow-inner">
                    <div
                        className="bg-blue-600 h-full transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(37,99,235,0.3)]"
                        style={{
                            width: `${(timeLeft / TIME_COUNT_DOWN) * 100}%`,
                        }}
                    ></div>
                </div>
                <p className="text-[9px] text-gray-400 text-center mt-3 font-medium uppercase tracking-tighter italic">
                    QR rotates automatically for secure validation
                </p>
            </div>
        </div>
    );
};

export default QRCodeGenerator;
