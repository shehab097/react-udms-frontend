import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getToken } from "../../../services/tokenService";
import { getUsername } from "../../../services/tokenService";

import { STUDENT_ENDPOINT } from "../../../config/config";

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

    const DetailField = ({ label, value }) => (
        <div className="space-y-1">
            <div className="text-[10px] font-mono text-content-secondary uppercase tracking-widest">
                {label}
            </div>
            <div className="text-sm text-white font-medium px-4 py-3 bg-white/5 border border-white/10 rounded-xl">
                {value !== null && value !== "" ? (
                    value
                ) : (
                    <span className="text-white/30 italic">UNSPECIFIED</span>
                )}
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto p-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="mb-10 border-b border-white/5 pb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">
                        {profileData.name || "UNNAMED_ENTITY"}
                    </h1>
                    <p className="text-[10px] font-mono text-ui-highlight uppercase mt-1 tracking-widest">
                        System Student // {username}
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-[10px] font-mono text-ui-accent uppercase">
                        ID_RECORDED
                    </div>
                    <div className="text-lg font-bold text-content-primary">
                        {profileData.studentID || "PENDING"}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                    <h2 className="text-[11px] font-bold text-ui-highlight uppercase tracking-[0.2em] mb-4">
                        Academic_&_Personal
                    </h2>
                    <DetailField label="Full Name" value={profileData.name} />
                    <div className="grid grid-cols-2 gap-4">
                        <DetailField
                            label="Student ID"
                            value={profileData.studentID}
                        />
                        <DetailField
                            label="Department"
                            value={profileData.department}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <DetailField
                            label="Current Semester"
                            value={profileData.currSemester}
                        />
                        <DetailField
                            label="Gender"
                            value={profileData.gender}
                        />
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-[11px] font-bold text-ui-highlight uppercase tracking-[0.2em] mb-4">
                        Contact_Details
                    </h2>
                    <DetailField
                        label="Email Address"
                        value={profileData.email}
                    />
                    <DetailField label="Phone" value={profileData.phone} />
                    <DetailField label="Address" value={profileData.address} />
                </div>
            </div>
        </div>
    );
};

export default StudentProfileView;
