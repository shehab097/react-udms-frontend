import React, { useRef, useState, useEffect, useMemo } from "react";
import QRCodeGenerator from "../components/QRCodeGenerator";
import Navbar from "../components/Navbar";
import LiveAttendance from "../components/LiveAttendance";
import { Maximize, Minimize, BookOpen, Calendar } from "lucide-react";

import BASE_URL from "../config/config";
import { getRole, getToken } from "../services/tokenService";

export default function QR() {
    const screenRef = useRef(null);
    const [isFullScreen, setIsFullScreen] = useState(false);

    // State for data and selection
    const [semesters, setSemesters] = useState([]);
    const [courses, setCourses] = useState([]);
    const [selectedSemester, setSelectedSemester] = useState("");
    const [selectedCourse, setSelectedCourse] = useState("");

    const headers = useMemo(
        () => ({
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
        }),
        [],
    );

    // Fetch Semesters and Courses
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [semRes, courseRes] = await Promise.all([
                    fetch(`${BASE_URL}/semester`, { headers }),
                    fetch(`${BASE_URL}/course`, { headers }),
                ]);
                const semData = await semRes.json();
                const courseData = await courseRes.json();

                setSemesters(semData);
                setCourses(courseData);

                // Optional: Auto-select first items if available
                if (semData.length > 0)
                    setSelectedSemester(semData[0].id.toString());
                if (courseData.length > 0)
                    setSelectedCourse(courseData[0].id.toString());
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, []);

    const toggleFullScreen = () => {
        // on click F toggle fullscreen for the screenRef container

        if (!document.fullscreenElement) {
            screenRef.current.requestFullscreen().catch((err) => {
                alert(`Error: ${err.message}`);
            });
            setIsFullScreen(true);
        } else {
            document.exitFullscreen();
            setIsFullScreen(false);
        }
    };


    useEffect(() => {
        const handleFSChange = () =>
            setIsFullScreen(!!document.fullscreenElement);
        document.addEventListener("fullscreenchange", handleFSChange);
        return () =>
            document.removeEventListener("fullscreenchange", handleFSChange);
    }, []);

    if (getRole() !== "TEACHER") {
        return (
            <div className="h-screen w-full bg-gray-50 items-center justify-center font-sans">
                <Navbar />
                <div className="text-center p-8 bg-white rounded-lg shadow-lg">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">
                        Access Denied
                    </h1>
                    <p className="text-gray-600">
                        You do not have permission to view this page.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-full bg-gray-50 flex flex-col overflow-hidden font-sans">
            {/* <Navbar /> */}

            {/* Selection Bar */}
            <div className="bg-white border-b border-gray-200 p-4 flex gap-6 items-center justify-center shadow-sm z-10">
                <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-blue-600" />
                    <select
                        className="border border-gray-300 rounded-md p-2 bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={selectedSemester}
                        onChange={(e) => setSelectedSemester(e.target.value)}
                    >
                        <option value="">Select Semester</option>
                        {semesters.map((sem) => (
                            <option key={sem.id} value={sem.id}>
                                Batch {sem.batch} - Sem {sem.semesterNo} (
                                {sem.session})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <BookOpen size={18} className="text-blue-600" />
                    <select
                        className="border border-gray-300 rounded-md p-2 bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                    >
                        <option value="">Select Course</option>
                        {courses.map((course) => (
                            <option key={course.id} value={course.id}>
                                {course.courseCode}: {course.courseName}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div
                className="relative flex flex-1 overflow-hidden"
                ref={screenRef}
            >
                <button
                    onClick={toggleFullScreen}
                    className="absolute top-4 right-4 z-50 p-2 bg-white/80 hover:bg-white border border-gray-200 rounded-lg shadow-sm transition-all text-gray-600 hover:text-blue-600"
                >
                    {isFullScreen ? (
                        <Minimize size={20} />
                    ) : (
                        <Maximize size={20} />
                    )}
                </button>

                {/* Main Content: Render only if both are selected */}
                {selectedCourse && selectedSemester ? (
                    <>
                        <div className="w-1/2 flex items-center justify-center border-r border-gray-200 bg-white shadow-inner">
                            <QRCodeGenerator
                                courseId={selectedCourse}
                                semesterId={selectedSemester}
                            />
                        </div>

                        <div className="w-1/2 bg-gray-50 overflow-hidden">
                            <LiveAttendance
                                courseId={selectedCourse}
                                semesterId={selectedSemester}
                            />
                        </div>
                    </>
                ) : (
                    <div className="w-full flex items-center justify-center text-gray-400 italic">
                        Please select a Semester and Course to generate QR code.
                    </div>
                )}
            </div>
        </div>
    );
}
