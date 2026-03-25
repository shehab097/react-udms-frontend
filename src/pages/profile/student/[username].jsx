import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getToken, getUsername } from "../../../services/tokenService";
import Toast from "../../../components/Toast"; // Import the alert component

const StudentProfile = ({ username: propUsername }) => {
    const { username: urlUsername } = useParams();
    const username = propUsername || urlUsername || getUsername();

    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [toast, setToast] = useState({
        show: false,
        message: "",
        type: "error",
    });

    const [formData, setFormData] = useState({
        name: "",
        studentID: "",
        email: "",
        phone: "",
        address: "",
        department: "CSE",
        gender: "MALE",
        currSemester: 1, // Defaulting to 1 (Integer)
    });

    const showToast = (message, type = "error") => {
        setToast({ show: true, message, type });
    };

    useEffect(() => {
        if (!username) return;

        const fetchStudent = async () => {
            const token = getToken();
            try {
                const response = await fetch(
                    `http://localhost:8080/student/${username}`,
                    { headers: { Authorization: `Bearer ${token}` } },
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
                        currSemester: data.currSemester || 1,
                    });
                }
            } catch (err) {
                showToast("FAILED_TO_LOAD_PROFILE_DATA");
            } finally {
                setLoading(false);
            }
        };
        fetchStudent();
    }, [username]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        // Logic to ensure numeric fields stay numeric
        setFormData((prev) => ({
            ...prev,
            [name]: name === "currSemester" ? parseInt(value) || 0 : value,
        }));
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        const token = getToken();

        // Ensure numeric fields are sent as integers and Enums aren't empty
        const payload = {
            ...formData,
            currSemester: Number(formData.currSemester),
            department: formData.department || "CSE",
            gender: formData.gender || "MALE",
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
                showToast("PROFILE_SYNCHRONIZED_SUCCESSFULLY", "success");
            } else {
                showToast("UPDATE_FAILED: DATA_FORMAT_ERROR");
            }
        } catch (err) {
            showToast("NETWORK_COMMUNICATION_ERROR");
        } finally {
            setIsUpdating(false);
        }
    };

    if (loading)
        return (
            <div className="p-10 font-mono text-[10px] text-ui-accent animate-pulse tracking-widest uppercase">
                Accessing_Student_Records...
            </div>
        );

    return (
        <div className="max-w-4xl mx-auto p-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Toast Alert */}
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ ...toast, show: false })}
                />
            )}

            {/* Header */}
            <div className="mb-10 border-b border-white/5 pb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">
                        {formData.name || "UNNAMED_ENTITY"}
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
                        {formData.studentID || "PENDING"}
                    </div>
                </div>
            </div>

            <form
                onSubmit={handleUpdate}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
                {/* Academic Section */}
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
                                <option value="FDAE">FDAE</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Contact Section */}
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
                                Current Semester
                            </label>
                            <input
                                name="currSemester"
                                type="number"
                                value={formData.currSemester}
                                onChange={handleChange}
                                className="w-full bg-ui-surface/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-ui-accent/50"
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
                                className="w-full bg-ui-surface/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-ui-accent/50 appearance-none"
                            >
                                <option value="MALE">MALE</option>
                                <option value="FEMALE">FEMALE</option>
                                <option value="OTHER">OTHER</option>
                            </select>
                        </div>
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
                            Address
                        </label>
                        <textarea
                            name="address"
                            rows="1"
                            value={formData.address}
                            onChange={handleChange}
                            className="w-full bg-ui-surface/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-ui-accent/50 resize-none"
                        />
                    </div>
                </div>

                <div className="md:col-span-2 pt-6 border-t border-white/5 mt-4 flex justify-end">
                    <button
                        type="submit"
                        disabled={isUpdating}
                        className={`bg-ui-accent text-white px-10 py-3 rounded-xl text-[11px] font-black tracking-widest transition-all ${
                            isUpdating
                                ? "opacity-50 cursor-wait"
                                : "hover:scale-[1.02] active:scale-95 shadow-lg shadow-ui-accent/20"
                        }`}
                    >
                        {isUpdating
                            ? "SYNCHRONIZING..."
                            : "SAVE_PROFILE_CHANGES"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default StudentProfile;
