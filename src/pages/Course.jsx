import React, { useState, useEffect, useCallback } from "react";
import { getRole, getToken } from "../services/tokenService";
import { COURSES_ENDPOINT, TEACHER_ENDPOINT } from "../config/config";
import Toast from "../components/Toast";
import Loading from "../components/Loading";

const Course = () => {
    // State Management
    const [courses, setCourses] = useState([]);
    const [allTeachers, setAllTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [assigningId, setAssigningId] = useState(null);

    // 🍞 Toast State
    const [toast, setToast] = useState({
        show: false,
        message: "",
        type: "error",
        key: 0,
    });

    // Departments matching Backend Enum
    const departments = ["CSE", "EEE", "TE", "ME", "IPE"];

    // Modal & Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [formData, setFormData] = useState({
        courseCode: "",
        courseName: "",
        courseSemester: 1,
        courseCredit: 3.0,
        courseDepartment: departments[0],
        teacherId: "",
    });

    const userRole = getRole();
    const isAdmin = userRole === "ADMIN";

    // 📣 Toast Trigger
    const showToast = useCallback((message, type = "error") => {
        setToast({ show: true, message, type, key: Date.now() });
    }, []);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        const token = getToken();
        const headers = { Authorization: `Bearer ${token}` };
        try {
            const [courseRes, teacherRes] = await Promise.all([
                fetch(COURSES_ENDPOINT, { headers }),
                fetch(TEACHER_ENDPOINT, { headers }),
            ]);

            if (courseRes.ok && teacherRes.ok) {
                setCourses(await courseRes.json());
                setAllTeachers(await teacherRes.json());
            } else {
                showToast("SYNC_ERROR: Registry connection unstable", "error");
            }
        } catch (err) {
            showToast("CONN_ERROR: Backend core offline", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = getToken();
        const method = editingCourse ? "PUT" : "POST";
        const url = editingCourse
            ? `${COURSES_ENDPOINT}/${editingCourse.id}`
            : COURSES_ENDPOINT;

        const payload = {
            ...formData,
            teacher: formData.teacherId
                ? { id: parseInt(formData.teacherId) }
                : null,
        };

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                showToast(
                    editingCourse
                        ? "Module updated successfully"
                        : "New module registered",
                    "success",
                );
                fetchInitialData();
                closeModal();
            } else {
                showToast("SYSTEM_REJECTION: Data update failed", "error");
            }
        } catch (err) {
            showToast("FATAL_ERROR: Update sequence interrupted", "error");
        }
    };

    const handleQuickAssign = async (courseId, teacherUsername) => {
        const token = getToken();
        try {
            const response = await fetch(
                `${COURSES_ENDPOINT}/${courseId}/assign/${teacherUsername}`,
                {
                    method: "PUT",
                    headers: { Authorization: `Bearer ${token}` },
                },
            );

            if (response.ok) {
                showToast("Faculty lead assigned successfully", "success");
                setAssigningId(null);
                fetchInitialData();
            } else {
                showToast(
                    "ASSIGNMENT_REJECTED: Check faculty availability",
                    "error",
                );
            }
        } catch (err) {
            showToast("ASSIGNMENT_ERROR: Connection lost", "error");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("CONFIRMATION: Purge course from registry?"))
            return;
        const token = getToken();
        try {
            const response = await fetch(`${COURSES_ENDPOINT}/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                showToast("Module purged from database", "success");
                fetchInitialData();
            } else {
                showToast("DELETE_REJECTED: Entry is protected", "error");
            }
        } catch (err) {
            showToast("DELETE_ERROR: Fatal system interrupt", "error");
        }
    };

    const openModal = (course = null) => {
        if (course) {
            setEditingCourse(course);
            setFormData({
                ...course,
                teacherId: course.teacher ? course.teacher.id : "",
            });
        } else {
            setEditingCourse(null);
            setFormData({
                courseCode: "",
                courseName: "",
                courseSemester: 1,
                courseCredit: 3.0,
                courseDepartment: departments[0],
                teacherId: "",
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCourse(null);
    };

    const filteredCourses = courses.filter(
        (c) =>
            c.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.courseCode?.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    if (loading)
        return (
            <div className="flex items-center gap-3 text-ui-accent font-mono animate-pulse">
                <Loading />
            </div>
        );

    return (
        <div className="w-full space-y-6">
            {/* 🍞 THE TOAST */}
            {toast.show && (
                <Toast
                    key={toast.key}
                    message={toast.message}
                    type={toast.type}
                    onClose={() =>
                        setToast((prev) => ({ ...prev, show: false }))
                    }
                />
            )}

            {/* Action Bar */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div className="flex gap-4 w-full md:w-auto">
                    <div className="w-full md:w-64">
                        <label className="block text-[10px] font-mono text-ui-highlight uppercase tracking-[0.2em] mb-1.5 ml-1">
                            Search
                        </label>
                        <input
                            type="text"
                            placeholder="Code or Title..."
                            className="w-full bg-ui-surface border border-ui-neutral rounded-lg px-4 py-2 text-sm focus:border-ui-accent outline-none text-content-primary transition-colors"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {/* Only Admins can see the New Course button */}
                    {isAdmin && (
                        <button
                            onClick={() => openModal()}
                            className="bg-ui-accent hover:brightness-110 min-w-[80px] text-ui-background text-[11px] font-bold px-6 h-[38px] rounded-lg transition-colors self-end shadow-sm"
                        >
                            + ADD
                        </button>
                    )}
                </div>
            </div>

            {/* Registry Table */}
            <div className="overflow-x-auto rounded-lg border border-ui-neutral bg-ui-surface shadow-sm">
                <table className="w-full text-left border-collapse min-w-[900px]">
                    <thead>
                        <tr className="border-b border-ui-neutral bg-ui-background font-mono text-[10px] text-ui-secondary uppercase tracking-widest">
                            <th className="p-4 font-semibold">ID_Code</th>
                            <th className="p-4 font-semibold">Title</th>
                            <th className="p-4 text-center font-semibold w-24">
                                Semester
                            </th>
                            <th className="p-4 text-center font-semibold w-24">
                                Credits
                            </th>
                            <th className="p-4 w-32 font-semibold">Dept</th>
                            <th className="p-4 font-semibold">
                                Course Teacher
                            </th>
                            {/* Actions column only for Admins */}
                            {isAdmin && (
                                <th className="p-4 text-center w-36 font-semibold">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-ui-neutral text-sm">
                        {filteredCourses.map((c) => (
                            <tr
                                key={c.id}
                                className="hover:bg-ui-background group transition-colors"
                            >
                                <td className="p-4 font-mono text-ui-accent font-bold">
                                    {c.courseCode}
                                </td>
                                <td className="p-4 font-medium text-content-primary">
                                    {c.courseName}
                                </td>
                                <td className="p-4 text-center text-content-secondary">
                                    S-{c.courseSemester}
                                </td>
                                <td className="p-4 text-center font-mono text-ui-highlight">
                                    {c.courseCredit.toFixed(1)}
                                </td>
                                <td className="p-4">
                                    <span className="text-[10px] px-2 py-0.5 rounded bg-ui-accent/10 border border-ui-accent/20 text-ui-accent font-bold uppercase">
                                        {c.courseDepartment}
                                    </span>
                                </td>

                                <td className="p-4 min-w-[200px]">
                                    {assigningId === c.id && isAdmin ? (
                                        <div className="flex items-center gap-2">
                                            <select
                                                className="bg-ui-background border border-ui-neutral rounded p-1 text-[11px] text-content-primary outline-none w-full focus:border-ui-accent"
                                                onChange={(e) =>
                                                    handleQuickAssign(
                                                        c.id,
                                                        e.target.value,
                                                    )
                                                }
                                                defaultValue=""
                                            >
                                                <option value="" disabled>
                                                    Select Staff...
                                                </option>
                                                {allTeachers.map((t) => (
                                                    <option
                                                        key={t.id}
                                                        value={t.username}
                                                    >
                                                        {t.name} (@{t.username})
                                                    </option>
                                                ))}
                                            </select>
                                            <button
                                                onClick={() =>
                                                    setAssigningId(null)
                                                }
                                                className="text-[11px] text-content-muted hover:text-ui-secondary uppercase font-mono transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between gap-2">
                                            <span
                                                className={
                                                    c.teacher
                                                        ? "text-content-primary"
                                                        : "text-content-muted italic text-xs font-mono"
                                                }
                                            >
                                                {c.teacher
                                                    ? `${c.teacher.name}`
                                                    : "UNASSIGNED"}
                                            </span>
                                            {/* Quick assign button hidden for Students/Teachers */}
                                            {isAdmin && (
                                                <button
                                                    onClick={() =>
                                                        setAssigningId(c.id)
                                                    }
                                                    className="opacity-0 group-hover:opacity-100 text-[9px] font-bold text-ui-highlight border border-ui-highlight rounded px-2 py-1 hover:bg-ui-highlight hover:text-ui-surface transition-all"
                                                >
                                                    {c.teacher
                                                        ? "CHANGE"
                                                        : "ASSIGN"}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </td>

                                {isAdmin && (
                                    <td className="p-4">
                                        <div className="flex justify-center gap-4">
                                            <button
                                                onClick={() => openModal(c)}
                                                className="text-ui-highlight hover:brightness-110 text-[11px] font-bold"
                                            >
                                                EDIT
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDelete(c.id)
                                                }
                                                className="text-ui-secondary hover:brightness-110 text-[11px] font-bold"
                                            >
                                                DEL
                                            </button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal - only accessible to Admins (though UI blocks it elsewhere too) */}
            {isModalOpen && isAdmin && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-ui-surface border border-ui-neutral p-8 rounded-lg w-full max-w-md shadow-lg">
                        <header className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-lg font-bold text-content-primary uppercase tracking-tighter">
                                    {editingCourse
                                        ? "Update Module"
                                        : "Register Module"}
                                </h2>
                                <p className="text-[9px] font-mono text-content-muted uppercase tracking-[0.2em]">
                                    Curriculum_Entry
                                </p>
                            </div>
                            <button
                                onClick={closeModal}
                                className="text-content-muted hover:text-ui-accent transition-colors"
                            >
                                ✕
                            </button>
                        </header>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-mono text-ui-highlight uppercase mb-1 ml-1 tracking-wider">
                                        Code
                                    </label>
                                    <input
                                        required
                                        className="w-full bg-ui-background border border-ui-neutral rounded px-3 py-2 text-sm text-content-primary focus:border-ui-accent outline-none transition-colors"
                                        value={formData.courseCode}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                courseCode: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-mono text-ui-highlight uppercase mb-1 ml-1 tracking-wider">
                                        Dept
                                    </label>
                                    <select
                                        className="w-full bg-ui-background border border-ui-neutral rounded px-3 py-2 text-sm text-content-primary focus:border-ui-accent outline-none transition-colors"
                                        value={formData.courseDepartment}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                courseDepartment:
                                                    e.target.value,
                                            })
                                        }
                                    >
                                        {departments.map((dept) => (
                                            <option key={dept} value={dept}>
                                                {dept}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-mono text-ui-highlight uppercase mb-1 ml-1 tracking-wider">
                                    Course_Title
                                </label>
                                <input
                                    required
                                    className="w-full bg-ui-background border border-ui-neutral rounded px-3 py-2 text-sm text-content-primary focus:border-ui-accent outline-none transition-colors"
                                    value={formData.courseName}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            courseName: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-mono text-ui-highlight uppercase mb-1 ml-1 tracking-wider">
                                        Semester
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full bg-ui-background border border-ui-neutral rounded px-3 py-2 text-sm text-content-primary focus:border-ui-accent outline-none transition-colors"
                                        value={formData.courseSemester}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                courseSemester:
                                                    parseInt(e.target.value) ||
                                                    1,
                                            })
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-mono text-ui-highlight uppercase mb-1 ml-1 tracking-wider">
                                        Credits
                                    </label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        required
                                        className="w-full bg-ui-background border border-ui-neutral rounded px-3 py-2 text-sm text-content-primary focus:border-ui-accent outline-none transition-colors"
                                        value={formData.courseCredit}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                courseCredit:
                                                    parseFloat(
                                                        e.target.value,
                                                    ) || 0,
                                            })
                                        }
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-mono text-ui-highlight uppercase mb-1 ml-1 tracking-wider">
                                    Faculty_Association
                                </label>
                                <select
                                    className="w-full bg-ui-background border border-ui-neutral rounded px-3 py-2 text-sm text-content-primary focus:border-ui-accent outline-none transition-colors"
                                    value={formData.teacherId}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            teacherId: e.target.value,
                                        })
                                    }
                                >
                                    <option value="">Leave Unassigned</option>
                                    {allTeachers.map((t) => (
                                        <option key={t.id} value={t.id}>
                                            {t.name} (@{t.username})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-2.5 text-sm text-content-secondary font-medium bg-ui-background border border-ui-neutral rounded hover:brightness-95 transition-colors"
                                >
                                    CANCEL
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2.5 bg-ui-accent rounded text-sm text-ui-background font-bold hover:brightness-110 transition-colors shadow-sm"
                                >
                                    SAVE CHANGES
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Course;
