import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getToken } from "../../../services/tokenService";
import { getUsername } from "../../../services/tokenService";

import { TEACHER_ENDPOINT } from "../../../config/config";

const TeacherProfileView = ({ username: propUsername }) => {
    const { username: urlUsername } = useParams();
    const username = propUsername || urlUsername || getUsername();

    const [loading, setLoading] = useState(true);
    const [profileData, setProfileData] = useState(null);

    useEffect(() => {
        if (!username) return;

        const fetchTeacher = async () => {
            const token = getToken();
            try {
                const response = await fetch(
                    `${TEACHER_ENDPOINT}/${username}`,
                    { headers: { Authorization: `Bearer ${token}` } },
                );
                if (response.ok) {
                    const data = await response.json();
                    setProfileData(data);
                }
            } catch (err) {
                console.error("FAILED_TO_LOAD_TEACHER_PROFILE", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTeacher();
    }, [username]);

    if (loading)
        return (
            <div className="p-10 font-mono text-[10px] text-ui-secondary animate-pulse tracking-widest uppercase">
                AUTHENTICATING_FACULTY_DATA...
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
                {value || (
                    <span className="text-white/30 italic">UNSPECIFIED</span>
                )}
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto p-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="mb-10 border-b border-white/5 pb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">
                        {profileData.name || "FACULTY_MEMBER"}
                    </h1>
                    <p className="text-[10px] font-mono text-ui-secondary uppercase mt-1 tracking-widest">
                        Faculty ID // {username}
                    </p>
                </div>
                <div className="bg-ui-secondary/10 border border-ui-secondary/20 px-4 py-2 rounded-lg">
                    <div className="text-[9px] font-mono text-ui-secondary uppercase">
                        Status
                    </div>
                    <div className="text-xs font-bold text-white">
                        ACTIVE_FACULTY
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                    <h2 className="text-[11px] font-bold text-ui-secondary uppercase tracking-[0.2em] mb-4">
                        Faculty_Identity
                    </h2>
                    <DetailField label="Full Name" value={profileData.name} />
                    <DetailField label="Gender" value={profileData.gender} />
                </div>

                <div className="space-y-6">
                    <h2 className="text-[11px] font-bold text-ui-secondary uppercase tracking-[0.2em] mb-4">
                        Communication_Nodes
                    </h2>
                    <DetailField
                        label="Professional Email"
                        value={profileData.email}
                    />
                    <DetailField
                        label="Phone Number"
                        value={profileData.phone}
                    />
                    <DetailField
                        label="Office/Home Address"
                        value={profileData.address}
                    />
                </div>
            </div>
        </div>
    );
};

export default TeacherProfileView;
