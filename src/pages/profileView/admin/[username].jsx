import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getToken } from "../../../services/tokenService";
import { getUsername } from "../../../services/tokenService";

const AdminProfileView = ({ username: propUsername }) => {
    const { username: urlUsername } = useParams();
    const username = propUsername || urlUsername || getUsername();

    const [loading, setLoading] = useState(true);
    const [profileData, setProfileData] = useState(null);

    useEffect(() => {
        if (!username) return;

        const fetchAdmin = async () => {
            const token = getToken();
            try {
                const response = await fetch(
                    `http://localhost:8080/admin/${username}`,
                    { headers: { Authorization: `Bearer ${token}` } },
                );
                if (response.ok) {
                    const data = await response.json();
                    setProfileData(data);
                }
            } catch (err) {
                console.error("FAILED_TO_LOAD_ADMIN_PROFILE", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAdmin();
    }, [username]);

    if (loading)
        return (
            <div className="p-10 font-mono text-[10px] text-ui-accent animate-pulse tracking-widest uppercase">
                Accessing_Secure_Admin_Records...
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
                    <h1 className="text-2xl font-bold text-white tracking-tight italic">
                        {profileData.name || "ROOT_ADMINISTRATOR"}
                    </h1>
                    <p className="text-[10px] font-mono text-ui-accent uppercase mt-1 tracking-widest">
                        System Principal // {username}
                    </p>
                </div>
                <div className="bg-ui-accent/10 border border-ui-accent/30 px-5 py-2 rounded-xl">
                    <div className="text-[9px] font-mono text-ui-accent uppercase tracking-tighter">
                        Auth_Level
                    </div>
                    <div className="text-xs font-black text-white">
                        ROOT_ACCESS
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                    <h2 className="text-[11px] font-bold text-ui-highlight uppercase tracking-[0.2em] mb-4">
                        Core_Identity
                    </h2>
                    <DetailField
                        label="Display Name"
                        value={profileData.name}
                    />
                    <DetailField label="Gender" value={profileData.gender} />
                </div>
                <div className="space-y-6">
                    <h2 className="text-[11px] font-bold text-ui-highlight uppercase tracking-[0.2em] mb-4">
                        Secure_Contact
                    </h2>
                    <DetailField
                        label="Admin Email"
                        value={profileData.email}
                    />
                    <DetailField label="Phone" value={profileData.phone} />
                    <DetailField
                        label="HQ Address"
                        value={profileData.address}
                    />
                </div>
            </div>
        </div>
    );
};

export default AdminProfileView;
