import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getToken, getUsername } from "../../../services/tokenService";
import Toast from "../../../components/Toast"; 
import { TEACHER_ENDPOINT } from "../../../config/config";
import Loading from "../../../components/Loading";

const TeacherProfile = ({ username: propUsername }) => {
    const { username: urlUsername } = useParams();
    const username = propUsername || urlUsername || getUsername();

    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    // 1. Initialize Toast State
    const [toast, setToast] = useState({
        show: false,
        message: "",
        type: "error",
    });

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        gender: "MALE",
    });

    // 2. Helper functions for Toast
    const showToast = (message, type = "error") => {
        setToast({ show: true, message, type });
    };

    const hideToast = () => {
        setToast((prev) => ({ ...prev, show: false }));
    };

    useEffect(() => {
        if (!username) return;

        const fetchTeacher = async () => {
            const token = getToken();
            try {
                const response = await fetch(
                    `${TEACHER_ENDPOINT}/${username}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    },
                );
                if (response.ok) {
                    const data = await response.json();
                    setFormData({
                        name: data.name || "",
                        email: data.email || "",
                        phone: data.phone || "",
                        address: data.address || "",
                        gender: data.gender || "MALE",
                    });
                } else {
                    showToast("FAILED_TO_RETRIEVE_FACULTY_RECORDS", "error");
                }
            } catch (err) {
                showToast("NETWORK_ACCESS_DENIED", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchTeacher();
    }, [username]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        const token = getToken();

        const payload = {
            ...formData,
            gender: formData.gender || "MALE",
        };

        try {
            const response = await fetch(
                `${TEACHER_ENDPOINT}/${username}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                },
            );

            if (response.ok) {
                // 3. Trigger Success Toast
                showToast("FACULTY_PROFILE_SYNCHRONIZED", "success");
            } else {
                // 4. Trigger Error Toast
                showToast("UPDATE_REJECTED: INVALID_DATA_STRUCTURE", "error");
            }
        } catch (err) {
            showToast("KERNEL_COMMUNICATION_FAILURE", "error");
        } finally {
            setIsUpdating(false);
        }
    };

    if (loading)
        return (
            <div className="flex items-center gap-3 text-ui-accent font-mono animate-pulse">
                <Loading />
            </div>
        );

    return (
        <div className="max-w-4xl mx-auto  ">
            {/* 5. Render Toast Component */}
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={hideToast}
                />
            )}

            {/* Header Section */}
            <div className="mb-10 border-b border-white/5 pb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">
                        {formData.name || "FACULTY_MEMBER"}
                    </h1>
                    <p className="text-[10px] font-mono text-ui-secondary uppercase mt-1 tracking-widest opacity-70">
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

            <form
                onSubmit={handleUpdate}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
                {/* Profile Information */}
                <div className="space-y-6">
                    <h2 className="text-[11px] font-bold text-ui-secondary uppercase tracking-[0.2em] mb-4">
                        Faculty_Identity
                    </h2>

                    <div className="space-y-2">
                        <label className="text-[10px] font-mono text-content-secondary uppercase">
                            Full Name
                        </label>
                        <input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full bg-ui-surface/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-ui-secondary/50 transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-mono text-content-secondary uppercase">
                            Gender
                        </label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className="w-full bg-ui-surface/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-ui-secondary/50 appearance-none cursor-pointer"
                        >
                            <option
                                value="MALE"
                                className="bg-ui-surface text-white"
                            >
                                MALE
                            </option>
                            <option
                                value="FEMALE"
                                className="bg-ui-surface text-white"
                            >
                                FEMALE
                            </option>
                            <option
                                value="OTHER"
                                className="bg-ui-surface text-white"
                            >
                                OTHER
                            </option>
                        </select>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-6">
                    <h2 className="text-[11px] font-bold text-ui-secondary uppercase tracking-[0.2em] mb-4">
                        Communication_Nodes
                    </h2>

                    <div className="space-y-2">
                        <label className="text-[10px] font-mono text-content-secondary uppercase">
                            Professional Email
                        </label>
                        <input
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full bg-ui-surface/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-ui-secondary/50"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-mono text-content-secondary uppercase">
                            Phone Number
                        </label>
                        <input
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full bg-ui-surface/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-ui-secondary/50"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-mono text-content-secondary uppercase">
                            Office/Home Address
                        </label>
                        <textarea
                            name="address"
                            rows="2"
                            value={formData.address}
                            onChange={handleChange}
                            className="w-full bg-ui-surface/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-ui-secondary/50 resize-none"
                        />
                    </div>
                </div>

                {/* Action Bar */}
                <div className="md:col-span-2 pt-6 border-t border-white/5 mt-4 flex justify-end items-center gap-6">
                    <span className="text-[9px] font-mono text-content-secondary/40 uppercase">
                        Confidential Faculty Record
                    </span>
                    <button
                        type="submit"
                        disabled={isUpdating}
                        className={`bg-ui-secondary text-white px-10 py-3 rounded-xl text-[11px] font-bold tracking-widest transition-all ${
                            isUpdating
                                ? "opacity-50 cursor-wait"
                                : "hover:brightness-110 active:scale-95 shadow-lg shadow-ui-secondary/20"
                        }`}
                    >
                        {isUpdating
                            ? "SYNCING_RECORDS..."
                            : "UPDATE_FACULTY_DATA"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TeacherProfile;
