import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getToken, getUsername } from "../../services/tokenService";

const StudentProfile = ({ username: propUsername }) => {
    const { username: urlUsername } = useParams();
    const username = propUsername || urlUsername || getUsername();

    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        studentID: "",
        email: "",
        phone: "",
        address: "",
        department: "CSE", // Set a default valid Enum value
        gender: "MALE", // Set a default valid Enum value
    });

    useEffect(() => {
        if (!username) return;

        const fetchStudent = async () => {
            const token = getToken();
            try {
                const response = await fetch(
                    `http://localhost:8080/student/${username}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    },
                );
                if (response.ok) {
                    const data = await response.json();
                    setFormData({
                        name: data.name || "",
                        studentID: data.studentID || "",
                        email: data.email || "",
                        phone: data.phone || "",
                        address: data.address || "",
                        department: data.department || "CSE",
                        gender: data.gender || "MALE",
                    });
                }
            } catch (err) {
                console.error("FAILED_TO_LOAD_PROFILE", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStudent();
    }, [username]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        const token = getToken();

        // Clean data: Convert empty strings to null for Enums if necessary
        // but since we provided defaults, we just ensure they aren't empty.
        const payload = {
            ...formData,
            department: formData.department === "" ? null : formData.department,
            gender: formData.gender === "" ? null : formData.gender,
        };

        try {
            const response = await fetch(
                `http://localhost:8080/student/${username}`,
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
                alert("PROFILE_UPDATED_SUCCESSFULLY");
            } else {
                alert("UPDATE_FAILED: DATA_FORMAT_ERROR");
            }
        } catch (err) {
            alert("NETWORK_ERROR");
        } finally {
            setIsUpdating(false);
        }
    };

    if (loading)
        return (
            <div className="p-10 font-mono text-[10px] text-ui-accent tracking-widest">
                LOADING_PROFILE_DATA...
            </div>
        );

    return (
        <div className="max-w-4xl mx-auto p-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-10 border-b border-white/5 pb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">
                        {formData.name || "UNNAMED_ENTITY"}
                    </h1>
                    <p className="text-[10px] font-mono text-ui-highlight uppercase mt-1 tracking-widest">
                        System User // {username}
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-[10px] font-mono text-ui-accent uppercase">
                        ID_RECORDED
                    </div>
                    <div className="text-lg font-bold text-content-primary">
                        {formData.studentID || "PENDING"}
                    </div>
                </div>
            </div>

            <form
                onSubmit={handleUpdate}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
                <div className="space-y-6">
                    <h2 className="text-[11px] font-bold text-ui-highlight uppercase tracking-[0.2em] mb-4">
                        Academic_&_Personal
                    </h2>
                    <div className="space-y-2">
                        <label className="text-[10px] font-mono text-content-secondary uppercase">
                            Full Name
                        </label>
                        <input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full bg-ui-surface/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-ui-accent/50"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-mono text-content-secondary uppercase">
                                Student ID
                            </label>
                            <input
                                name="studentID"
                                value={formData.studentID}
                                onChange={handleChange}
                                className="w-full bg-ui-surface/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-ui-accent/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-mono text-content-secondary uppercase">
                                Department
                            </label>
                            <select
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                                className="w-full bg-ui-surface/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-ui-accent/50 appearance-none"
                            >
                                <option value="CSE">CSE</option>
                                <option value="EEE">EEE</option>
                                <option value="ME">ME</option>
                                <option value="BBA">BBA</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-[11px] font-bold text-ui-highlight uppercase tracking-[0.2em] mb-4">
                        Contact_Details
                    </h2>
                    <div className="space-y-2">
                        <label className="text-[10px] font-mono text-content-secondary uppercase">
                            Email Address
                        </label>
                        <input
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full bg-ui-surface/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-ui-accent/50"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-mono text-content-secondary uppercase">
                                Phone Number
                            </label>
                            <input
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full bg-ui-surface/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none"
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
                                className="w-full bg-ui-surface/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none appearance-none"
                            >
                                <option value="MALE">MALE</option>
                                <option value="FEMALE">FEMALE</option>
                                <option value="OTHER">OTHER</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-mono text-content-secondary uppercase">
                            Address
                        </label>
                        <textarea
                            name="address"
                            rows="2"
                            value={formData.address}
                            onChange={handleChange}
                            className="w-full bg-ui-surface/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none resize-none"
                        />
                    </div>
                </div>

                <div className="md:col-span-2 pt-6 border-t border-white/5 mt-4 flex justify-end">
                    <button
                        type="submit"
                        disabled={isUpdating}
                        className={`bg-ui-secondary text-white px-10 py-3 rounded-xl text-[11px] font-bold tracking-widest ${isUpdating ? "opacity-50" : "hover:brightness-110"}`}
                    >
                        {isUpdating ? "SYNCHRONIZING..." : "SAVE_CHANGES"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default StudentProfile;
