import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getToken, getUsername } from "../../../services/tokenService";
import { STUDENT_ENDPOINT } from "../../../config/config";
// import UserAttendanceStats from "../../UserAttendanceStats"; // Adjust path as needed
import UserAttendanceStats from "../../../components/UserAttendanceStats";
import Navbar from "../../../components/Navbar";

const StudentProfileView = ({ username: propUsername }) => {
    const { username: urlUsername } = useParams();
    const username = propUsername || urlUsername || getUsername();

    const [loading, setLoading] = useState(true);
    const [profileData, setProfileData] = useState(null);

    useEffect(() => {
        if (!username) return;

        const fetchStudent = async () => {
            const token = getToken();
            try {
                const response = await fetch(
                    `${STUDENT_ENDPOINT}/${username}`,
                    { headers: { Authorization: `Bearer ${token}` } },
                );
                if (response.ok) {
                    const data = await response.json();
                    setProfileData(data);
                }
            } catch (err) {
                console.error("FAILED_TO_LOAD_STUDENT_PROFILE", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStudent();
    }, [username]);

    if (loading)
        return (
            <div className="p-10 font-mono text-[10px] text-ui-accent animate-pulse tracking-widest uppercase">
                Accessing_Student_Records...
            </div>
        );

    if (!profileData)
        return (
            <div className="text-red-500 font-mono text-xs p-6">
                ERROR: NO_RECORD_FOUND
            </div>
        );

    const DetailField = ({ label, value, highlight = false }) => (
        <div className="space-y-1">
            <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
                {label}
            </div>
            <div
                className={`text-sm font-medium px-4 py-3 bg-white/5 border border-white/10 rounded-xl transition-all hover:bg-white/[0.08] ${highlight ? "text-ui-accent" : "text-white"}`}
            >
                {value !== null && value !== "" ? (
                    value
                ) : (
                    <span className="text-white/20 italic">UNSPECIFIED</span>
                )}
            </div>
        </div>
    );

    return (
        <>
            <Navbar />
            <div className="max-w-5xl mx-auto p-6 space-y-12 bg-slate-700">
                {/* Header Section */}
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-ui-accent/20 to-purple-600/20 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                    <div className="relative border-b border-white/10 pb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#11111e]/50 p-6 rounded-2xl border border-white/5">
                        <div>
                            <h1 className="text-3xl font-bold text-white tracking-tight">
                                {profileData.name || "UNNAMED_ENTITY"}
                            </h1>
                            <div className="flex items-center gap-3 mt-2">
                                <span className="text-[10px] font-mono text-ui-highlight bg-ui-highlight/10 px-2 py-0.5 rounded uppercase tracking-widest">
                                    Student
                                </span>
                                {/* <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
                                    System_UID: {profileData.userId}
                                </span> */}
                            </div>
                        </div>
                        <div className="text-left md:text-right border-l md:border-l-0 md:border-r border-white/10 pl-4 md:pl-0 md:pr-4">
                            <div className="text-[10px] font-mono text-ui-accent uppercase tracking-tighter">
                                ID
                            </div>
                            <div className="text-2xl font-black text-white font-mono">
                                {profileData.studentID || "PENDING"}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Information Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Academic & Personal Column */}
                    <div className="lg:col-span-2 space-y-8">
                        <section>
                            <h2 className="text-[11px] font-bold text-ui-highlight uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                                <span className="w-8 h-[1px] bg-ui-highlight/30"></span>
                                Academic_Profile
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <DetailField
                                    label="Full Name"
                                    value={profileData.name}
                                />
                                <DetailField
                                    label="Department"
                                    value={profileData.department}
                                />
                                <DetailField
                                    label="Current Semester"
                                    value={
                                        profileData.currSemester
                                            ? `Semester ${profileData.currSemester.semesterNo}`
                                            : "N/A"
                                    }
                                    highlight
                                />
                                <DetailField
                                    label="Gender"
                                    value={profileData.gender}
                                />
                            </div>
                        </section>

                        <section>
                            <h2 className="text-[11px] font-bold text-ui-highlight uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                                <span className="w-8 h-[1px] bg-ui-highlight/30"></span>
                                Attendance_Statistics
                            </h2>
                            {/* Passing the internal 'userId' (11) from your JSON to fetch statistics.
                             */}
                            <UserAttendanceStats userId={profileData.id} />
                        </section>
                    </div>

                    {/* Contact Sidebar */}
                    <div className="space-y-8 bg-white/[0.02] p-6 rounded-3xl border border-white/5 h-fit">
                        <section>
                            <h2 className="text-[11px] font-bold text-ui-highlight uppercase tracking-[0.3em] mb-6">
                                Contact_Link
                            </h2>
                            <div className="space-y-4">
                                <DetailField
                                    label="Email Address"
                                    value={profileData.email}
                                />
                                <DetailField
                                    label="Phone"
                                    value={profileData.phone}
                                />
                                <DetailField
                                    label="Residential Address"
                                    value={profileData.address}
                                />
                            </div>
                        </section>

                        {/* Meta Data */}
                        <div className="pt-6 border-t border-white/5">
                            <div className="p-4 rounded-xl bg-black/20 border border-white/5 space-y-2">
                                <div className="flex justify-between font-mono">
                                    <span className="text-white/20 uppercase">
                                        Batch
                                    </span>
                                    <span className="text-white/60">
                                        {profileData.currSemester?.batch}
                                    </span>
                                </div>
                                {/* <div className="flex justify-between text-[9px] font-mono">
                                    <span className="text-white/20 uppercase">
                                        Session
                                    </span>
                                    <span className="text-white/60">
                                        {profileData.currSemester?.session}
                                    </span>
                                </div> */}
                                {/* <div className="flex justify-between text-[9px] font-mono"> */}
                                    {/* <span className="text-white/20 uppercase">
                                        Username
                                    </span> */}
                                    {/* <span className="text-white/60">
                                        {profileData.username}
                                    </span> */}
                                {/* </div> */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default StudentProfileView;
