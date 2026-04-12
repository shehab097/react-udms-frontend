import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getToken, getUsername } from "../../../services/tokenService";
import Toast from "../../../components/Toast"; // Import the Toast component
import Loading from "../../../components/Loading"; // Import the Loading component

import { ADMIN_ENDPOINT } from "../../../config/config";

const AdminProfile = ({ username: propUsername }) => {
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

        const fetchAdmin = async () => {
            const token = getToken();
            try {
                const response = await fetch(`${ADMIN_ENDPOINT}/${username}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
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
                    showToast(
                        "ADMIN_ACCESS_DENIED: UNAUTHORIZED_REQUEST",
                        "error",
                    );
                }
            } catch (err) {
                showToast("SECURE_FETCH_FAILED: NETWORK_OFFLINE", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchAdmin();
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
                `${ADMIN_ENDPOINT}/${username}`,
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
                showToast("ADMIN_PROFILE_SYNCHRONIZED", "success");
            } else {
                showToast(
                    "UPDATE_REJECTED: SYSTEM_PROTOCOL_VIOLATION",
                    "error",
                );
            }
        } catch (err) {
            showToast("SECURE_UPDATE_FAILURE: COMMUNICATION_LOST", "error");
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
        <div className="max-w-4xl mx-auto ">
            {/* 3. Render Toast */}
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
                    <h1 className="text-2xl font-bold text-white tracking-tight italic">
                        {formData.name || "ROOT_ADMINISTRATOR"}
                    </h1>
                    <p className="text-[10px] font-mono text-ui-accent uppercase mt-1 tracking-widest opacity-80">
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

            <form
                onSubmit={handleUpdate}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
                {/* Identification */}
                <div className="space-y-6">
                    <h2 className="text-[11px] font-bold text-ui-accent uppercase tracking-[0.2em] mb-4">
                        Core_Identity
                    </h2>

                    <div className="space-y-2">
                        <label className="text-[10px] font-mono text-content-secondary uppercase">
                            Display Name
                        </label>
                        <input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full bg-ui-surface/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-ui-accent/50 transition-all"
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
                            className="w-full bg-ui-surface/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-ui-accent/50 appearance-none cursor-pointer"
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

                {/* Contact & Location */}
                <div className="space-y-6">
                    <h2 className="text-[11px] font-bold text-ui-accent uppercase tracking-[0.2em] mb-4">
                        Secure_Contact
                    </h2>

                    <div className="space-y-2">
                        <label className="text-[10px] font-mono text-content-secondary uppercase">
                            Admin Email
                        </label>
                        <input
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full bg-ui-surface/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-ui-accent/50"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-mono text-content-secondary uppercase">
                            Phone
                        </label>
                        <input
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full bg-ui-surface/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-ui-accent/50"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-mono text-content-secondary uppercase">
                            HQ Address
                        </label>
                        <textarea
                            name="address"
                            rows="2"
                            value={formData.address}
                            onChange={handleChange}
                            className="w-full bg-ui-surface/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-ui-accent/50 resize-none"
                        />
                    </div>
                </div>

                {/* Submit Area */}
                <div className="md:col-span-2 pt-6 border-t border-white/5 mt-4 flex justify-between items-center">
                    <p className="text-[9px] font-mono text-content-secondary/30 italic uppercase">
                        Modified records are logged in system audit trails.
                    </p>
                    <button
                        type="submit"
                        disabled={isUpdating}
                        className={`bg-ui-accent text-white px-12 py-3 rounded-xl text-[11px] font-black tracking-widest transition-all ${
                            isUpdating
                                ? "opacity-50 cursor-wait"
                                : "hover:scale-[1.02] active:scale-95 shadow-lg shadow-ui-accent/20"
                        }`}
                    >
                        {isUpdating
                            ? "UPDATING_ROOT..."
                            : "CONFIRM_ADMIN_CHANGES"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminProfile;
