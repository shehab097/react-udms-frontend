import React, { useEffect, useState, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { ATTENDANCE_ENDPOINT } from "../config/config";
import { getToken } from "../services/tokenService";

const QRScan = () => {
    const [scanResult, setScanResult] = useState(null);
    const [rawQr, setRawQr] = useState(null);
    const [isScanning, setIsScanning] = useState(true);
    const [isLoading, setIsLoading] = useState(false); // New: prevents multiple calls
    const scannerRef = useRef(null);


    const handleAttendance = async (decodedText) => {
        setIsLoading(true);
        try {
            // Inside handleAttendance
            const qrJson = JSON.parse(decodedText);

            const payload = {
                courseId: Number(qrJson.courseId), // Convert "1" to 1
                semesterId: Number(qrJson.semesterId), // Convert "1" to 1
                qrToken: qrJson.qrToken,
            };

            const response = await fetch(`${ATTENDANCE_ENDPOINT}/scan-qr`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getToken()}`,
                },
                body: JSON.stringify(payload),
            });

            if (response.status === 401) {
                throw new Error(
                    "Your session has expired. Please log in again.",
                );
            }

            const result = await response.json();

            setScanResult({
                success: response.ok,
                message:
                    result.message ||
                    (response.ok
                        ? "Attendance Marked!"
                        : "Failed to mark attendance"),
            });
        } catch (err) {
            let errMsg = "Network Error";
            if (err.message === "UNAUTHORIZED_MISSING_TOKEN")
                errMsg = "Session not found. Log in again.";
            else if (err instanceof SyntaxError)
                errMsg = "Invalid QR Code Format";
            else errMsg = err.message;

            setScanResult({ success: false, message: errMsg });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Only initialize if we are in scanning mode and no scanner exists
        if (!isScanning) return;

        const scanner = new Html5QrcodeScanner("reader", {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            showTorchButtonIfSupported: true,
        });

        const onScanSuccess = async (decodedText) => {
            // 1. Immediately stop scanning to prevent double-scans
            if (scannerRef.current) {
                try {
                    await scannerRef.current.clear();
                    scannerRef.current = null;
                } catch (e) {
                    console.warn("Scanner clear failed", e);
                }
            }

            // 2. Set states and trigger API
            setRawQr(decodedText);
            setIsScanning(false);
            handleAttendance(decodedText);
        };

        const onScanError = (err) => {
            /* ignore sync errors */
        };

        scanner.render(onScanSuccess, onScanError);
        scannerRef.current = scanner;

        // Cleanup function for component unmount
        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(() => {});
                scannerRef.current = null;
            }
        };
    }, [isScanning]);

    return (
        <div className="min-h-screen bg-ui-background flex flex-col items-center justify-center p-4 text-white">
            <h1 className="text-3xl font-bold mb-6 text-ui-highlight font-rounded">
                Student Scanner
            </h1>

            <div className="w-full max-w-md bg-ui-surface p-6 rounded-3xl shadow-2xl border border-ui-accent/10">
                {isScanning ? (
                    <div
                        id="reader"
                        className="overflow-hidden rounded-xl"
                    ></div>
                ) : (
                    <div className="space-y-6 text-center animate-in fade-in zoom-in duration-300">
                        {isLoading ? (
                            <div className="py-10">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ui-accent mx-auto"></div>
                                <p className="mt-4 text-content-secondary">
                                    Processing Attendance...
                                </p>
                            </div>
                        ) : (
                            <>
                                <div
                                    className={`w-20 h-20 mx-auto flex items-center justify-center rounded-full text-4xl shadow-lg ${
                                        scanResult?.success
                                            ? "bg-green-500/20 text-green-500"
                                            : "bg-red-500/20 text-red-500"
                                    }`}
                                >
                                    {scanResult?.success ? "✓" : "!"}
                                </div>

                                <div className="bg-ui-background/50 p-4 rounded-xl text-left border border-white/5">
                                    <p className="text-[10px] text-content-secondary uppercase font-bold mb-1 tracking-widest">
                                        Raw QR Content
                                    </p>
                                    <p className="text-xs break-all font-mono opacity-60">
                                        {rawQr}
                                    </p>
                                </div>

                                <div>
                                    <h2 className="text-xl font-bold">
                                        {scanResult?.success
                                            ? "Verified"
                                            : "Scan Failed"}
                                    </h2>
                                    <p className="text-content-secondary text-sm mt-1">
                                        {scanResult?.message}
                                    </p>
                                </div>

                                <button
                                    onClick={() => {
                                        setScanResult(null);
                                        setRawQr(null);
                                        setIsScanning(true);
                                    }}
                                    className="w-full py-4 bg-ui-accent hover:brightness-110 active:scale-[0.98] text-white rounded-2xl font-bold transition-all shadow-lg shadow-ui-accent/20"
                                >
                                    Scan Again
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>

            <style>{`
                #reader__dashboard_section_csr { display: none !important; }
                #reader__status_span { display: none !important; }
                #reader { border: none !important; }
                #reader video { border-radius: 16px !important; object-fit: cover !important; }
                #reader__camera_selection { 
                    background: #1a1a1a; 
                    color: white; 
                    padding: 8px; 
                    border-radius: 8px; 
                    margin-bottom: 10px;
                    width: 100%;
                }
                button#html5-qrcode-button-camera-start, 
                button#html5-qrcode-button-camera-stop {
                    padding: 10px 20px;
                    background: #3b82f6;
                    border-radius: 8px;
                    font-weight: bold;
                    margin-top: 10px;
                }
            `}</style>
        </div>
    );
};

export default QRScan;
