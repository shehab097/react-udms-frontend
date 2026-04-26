import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getToken, getUsername } from "../../../services/tokenService";
import Toast from "../../../components/Toast";
import { STUDENT_ENDPOINT } from "../../../config/config";
import Loading from "../../../components/Loading";
import UserAttendanceStats from "../../../components/UserAttendanceStats";

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
        id: null,
        name: "",
        studentID: "",
        email: "",
        phone: "",
        address: "",
        department: "CSE",
        gender: "MALE",
        currSemester: null,
    });

    const showToast = (message, type = "error") => {
        setToast({ show: true, message, type });
    };

    const hideToast = () => {
        setToast((prev) => ({ ...prev, show: false }));
    };

    useEffect(() => {
        if (!username) {
            showToast("INVALID_SESSION: USERNAME_NOT_FOUND", "error");
            setLoading(false);
            return;
        }

        const fetchStudent = async () => {
            const token = getToken();
            try {
                const baseUrl = STUDENT_ENDPOINT.endsWith("/")
                    ? STUDENT_ENDPOINT
                    : `${STUDENT_ENDPOINT}/`;

                const response = await fetch(`${baseUrl}${username}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log(data);
                    setFormData({
                        id: data.id,
                        name: data.name || "",
                        studentID: data.studentID || "",
                        email: data.email || "",
                        phone: data.phone || "",
                        address: data.address || "",
                        department: data.department || "CSE",
                        gender: data.gender || "MALE",
                        currSemester: data.currSemester,
                    });
                } else {
                    const errorMsg =
                        response.status === 404
                            ? "PROFILE_NOT_FOUND"
                            : "ACCESS_DENIED";
                    showToast(`SYSTEM_ERROR: ${errorMsg}`, "error");
                }
            } catch (err) {
                console.error("FETCH_ERROR:", err);
                showToast("NETWORK_FAILURE: CANNOT_REACH_SERVER", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchStudent();
    }, [username]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        const token = getToken();

        // Prepare payload for Spring Boot Backend
        const payload = {
            name: formData.name || null,
            studentID: formData.studentID || null,
            email: formData.email || null,
            phone: formData.phone || null,
            address: formData.address || null,
            department: formData.department
                ? formData.department.toUpperCase()
                : null,
            gender: formData.gender ? formData.gender.toUpperCase() : null,
            currSemester: null, // Don't send semester in update (it has separate endpoint)
        };

        try {
            const baseUrl = STUDENT_ENDPOINT.endsWith("/")
                ? STUDENT_ENDPOINT
                : `${STUDENT_ENDPOINT}/`;
            const response = await fetch(`${baseUrl}${username}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                showToast("PROFILE_SYNCHRONIZED_SUCCESSFULLY", "success");
                // Refresh the data after successful update
                const refreshedData = await response.json();
                setFormData((prev) => ({
                    ...prev,
                    name: refreshedData.name || "",
                    studentID: refreshedData.studentID || "",
                    email: refreshedData.email || "",
                    phone: refreshedData.phone || "",
                    address: refreshedData.address || "",
                    department: refreshedData.department || "CSE",
                    gender: refreshedData.gender || "MALE",
                    currSemester: refreshedData.currSemester,
                }));
            } else {
                const errorData = await response.json().catch(() => ({}));
                showToast(
                    errorData.message || "UPDATE_REJECTED: VALIDATION_ERROR",
                    "error",
                );
            }
        } catch (err) {
            console.error("UPDATE_ERROR:", err);
            showToast("COMMUNICATION_LINK_FAILURE", "error");
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
        <div className="max-w-4xl mx-auto p-6 ">
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={hideToast}
                />
            )}

            <div className="mb-10 border-b border-white/5 pb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">
                        {formData.name || "UNNAMED_ENTITY"}
                    </h1>
                </div>
                <div className="text-right">
                    <div className="text-[10px] font-mono text-ui-accent uppercase opacity-60">
                        Student ID
                    </div>
                    <div className="text-lg font-bold text-white">
                        {formData.studentID || "PENDING"}
                    </div>
                </div>
            </div>

            <form
                onSubmit={handleUpdate}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
                <div className="space-y-6">
                    <h2 className="text-[11px] font-bold text-ui-accent uppercase tracking-[0.2em] mb-4">
                        Personal Information
                    </h2>

                    <div className="space-y-2">
                        <label className="text-[10px] font-mono text-content-secondary uppercase">
                            Full Name
                        </label>
                        <input
                            name="name"
                            value={formData.name || ""}
                            onChange={handleChange}
                            className="w-full bg-ui-surface/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-ui-accent/50 transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-mono text-content-secondary uppercase">
                                Student ID
                            </label>
                            <input
                                name="studentID"
                                value={formData.studentID || ""}
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
                                value={formData.department || "CSE"}
                                onChange={handleChange}
                                className="w-full bg-ui-surface/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-ui-accent/50 appearance-none cursor-pointer"
                            >
                                {["CSE", "EEE", "ME", "FDAE"].map((dept) => (
                                    <option
                                        key={dept}
                                        value={dept}
                                        className="bg-ui-surface text-white"
                                    >
                                        {dept}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-[11px] font-bold text-ui-accent uppercase tracking-[0.2em] mb-4">
                        Contact & Academic
                    </h2>

                    <div className="space-y-2">
                        <label className="text-[10px] font-mono text-content-secondary uppercase">
                            Email Address
                        </label>
                        <input
                            name="email"
                            type="email"
                            value={formData.email || ""}
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
                                type="text"
                                disabled
                                value={
                                    formData.currSemester
                                        ? `${formData.currSemester.semesterNo} (Batch: ${formData.currSemester.batch})`
                                        : "NOT ASSIGNED"
                                }
                                className="w-full bg-ui-surface/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/70 outline-none cursor-not-allowed"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-mono text-content-secondary uppercase">
                                Gender
                            </label>
                            <select
                                name="gender"
                                value={formData.gender || "MALE"}
                                onChange={handleChange}
                                className="w-full bg-ui-surface/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-ui-accent/50 appearance-none cursor-pointer"
                            >
                                {["MALE", "FEMALE", "OTHER"].map((g) => (
                                    <option
                                        key={g}
                                        value={g}
                                        className="bg-ui-surface text-white"
                                    >
                                        {g}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-mono text-content-secondary uppercase">
                            Phone
                        </label>
                        <input
                            name="phone"
                            value={formData.phone || ""}
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
                            value={formData.address || ""}
                            onChange={handleChange}
                            className="w-full bg-ui-surface/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-ui-accent/50 resize-none"
                        />
                    </div>
                </div>

                <div className="md:col-span-2 pt-6 border-t border-white/5 mt-4 flex">
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
                            : "SAVE PROFILE CHANGES"}
                    </button>
                </div>
            </form>

            {formData.id && (
                <div className="mt-4">
                    <UserAttendanceStats userId={formData.id} />
                </div>
            )}
        </div>
    );
};

export default StudentProfile;
