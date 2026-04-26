import React from "react";
import CourseAttendance from "../components/AttandanceByCourse";
import Navbar from "../components/Navbar";

function AttendanceInfo() {
    return (
        <div className="w-full h-screen bg-slate-700 bg-fixed">
            <Navbar />
            <div className="max-w-7xl mx-auto mt-5 px-2 sm:px-5 md:px-10">
                <CourseAttendance />
            </div>
        </div>
    );
}

export default AttendanceInfo;
