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
        <div className="max-w-4xl mx-auto p-6 space-y-10">
            {/* Toast Integration */}
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={hideToast}
                />
            )}

            {/* Header Section */}
            <div className="border-b border-ui-neutral pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-content-primary tracking-tight">
                        {formData.name || "User Profile"}
                    </h1>
                    <p className="text-[10px] font-mono text-ui-accent uppercase tracking-widest mt-1">
                        Account Identifier // {username}
                    </p>
                </div>
            </div>

            <form
                onSubmit={handleUpdate}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
                {/* Identity Section */}
                <div className="space-y-6">
                    <h2 className="text-[11px] font-bold text-ui-accent uppercase tracking-[0.2em]">
                        Identity
                    </h2>

                    <div className="space-y-2">
                        <label className="text-[10px] font-mono text-content-secondary uppercase ml-1">
                            Display Name
                        </label>
                        <input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full bg-ui-surface/5 border border-ui-neutral rounded-xl px-4 py-3 text-sm text-content-primary outline-none focus:border-ui-accent transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-mono text-content-secondary uppercase ml-1">
                            Gender
                        </label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className="w-full bg-ui-surface/5 border border-ui-neutral rounded-xl px-4 py-3 text-sm text-content-primary outline-none focus:border-ui-accent appearance-none cursor-pointer"
                        >
                            <option
                                value="MALE"
                                className="bg-ui-surface text-content-primary"
                            >
                                MALE
                            </option>
                            <option
                                value="FEMALE"
                                className="bg-ui-surface text-content-primary"
                            >
                                FEMALE
                            </option>
                            <option
                                value="OTHER"
                                className="bg-ui-surface text-content-primary"
                            >
                                OTHER
                            </option>
                        </select>
                    </div>
                </div>

                {/* Contact Section */}
                <div className="space-y-6">
                    <h2 className="text-[11px] font-bold text-ui-accent uppercase tracking-[0.2em]">
                        Contact
                    </h2>

                    <div className="space-y-2">
                        <label className="text-[10px] font-mono text-content-secondary uppercase ml-1">
                            Email Address
                        </label>
                        <input
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full bg-ui-surface/5 border border-ui-neutral rounded-xl px-4 py-3 text-sm text-content-primary outline-none focus:border-ui-accent"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-mono text-content-secondary uppercase ml-1">
                            Phone
                        </label>
                        <input
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full bg-ui-surface/5 border border-ui-neutral rounded-xl px-4 py-3 text-sm text-content-primary outline-none focus:border-ui-accent"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-mono text-content-secondary uppercase ml-1">
                            Address
                        </label>
                        <textarea
                            name="address"
                            rows="2"
                            value={formData.address}
                            onChange={handleChange}
                            className="w-full bg-ui-surface/5 border border-ui-neutral rounded-xl px-4 py-3 text-sm text-content-primary outline-none focus:border-ui-accent resize-none"
                        />
                    </div>
                </div>

                {/* Submit Area */}
                <div className="md:col-span-2 pt-6 border-t border-ui-neutral mt-4 flex justify-end">
                    <button
                        type="submit"
                        disabled={isUpdating}
                        className={`bg-ui-accent text-white px-10 py-3 rounded-xl text-[11px] font-bold tracking-widest transition-all ${
                            isUpdating
                                ? "opacity-50 cursor-wait"
                                : "hover:opacity-90 active:scale-95 shadow-lg shadow-ui-accent/20"
                        }`}
                    >
                        {isUpdating ? "UPDATING..." : "SAVE CHANGES"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminProfile;
