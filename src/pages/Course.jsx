import React, { useState, useEffect } from "react";
import { getToken } from "../services/tokenService";

const Course = () => {
    // State Management
    const [courses, setCourses] = useState([]);
    const [allTeachers, setAllTeachers] = useState([]); // Loaded for the assignment dropdowns
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [assigningId, setAssigningId] = useState(null); // Controls inline teacher selection

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

    useEffect(() => {
        fetchInitialData();
    }, []);

    // Parallel fetch for Courses and Teachers
    const fetchInitialData = async () => {
        const token = getToken();
        const headers = { Authorization: `Bearer ${token}` };
        try {
            const [courseRes, teacherRes] = await Promise.all([
                fetch("http://localhost:8080/course", { headers }),
                fetch("http://localhost:8080/teacher", { headers }),
            ]);

            if (courseRes.ok && teacherRes.ok) {
                setCourses(await courseRes.json());
                setAllTeachers(await teacherRes.json());
            } else {
                setError("SYNC_ERROR: Registry connection unstable.");
            }
        } catch (err) {
            setError("CONN_ERROR: Backend core offline.");
        } finally {
            setLoading(false);
        }
    };

    // --- CRUD OPERATIONS ---

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = getToken();
        const method = editingCourse ? "PUT" : "POST";
        const url = editingCourse
            ? `http://localhost:8080/course/${editingCourse.id}`
            : "http://localhost:8080/course";

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
                fetchInitialData();
                closeModal();
            }
        } catch (err) {
            alert("SYSTEM_REJECTION: Data update failed.");
        }
    };

    // Quick Inline Assignment Logic
    const handleQuickAssign = async (courseId, teacherUsername) => {
        const token = getToken();
        try {
            const response = await fetch(
                `http://localhost:8080/course/${courseId}/assign/${teacherUsername}`,
                {
                    method: "PUT",
                    headers: { Authorization: `Bearer ${token}` },
                },
            );

            if (response.ok) {
                setAssigningId(null);
                fetchInitialData();
            }
        } catch (err) {
            alert("ASSIGNMENT_ERROR");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("CONFIRMATION: Purge course from registry?"))
            return;
        const token = getToken();
        try {
            const response = await fetch(`http://localhost:8080/course/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) fetchInitialData();
        } catch (err) {
            alert("DELETE_REJECTED");
        }
    };

    // --- MODAL HELPERS ---

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
            <div className="p-10 text-ui-accent font-mono text-xs animate-pulse">
                INIT_DATABASE_SCAN...
            </div>
        );

    return (
        <div className="w-full space-y-6 animate-in fade-in duration-500">
            {/* Action Bar */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div className="flex gap-4 w-full md:w-auto">
                    <div className="w-full md:w-64">
                        <label className="block text-[10px] font-mono text-ui-highlight uppercase mb-1.5 ml-1">
                            Search_Curriculum
                        </label>
                        <input
                            type="text"
                            placeholder="Code or Title..."
                            className="w-full bg-ui-surface/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-ui-accent outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="bg-ui-accent hover:brightness-110 text-white text-[11px] font-bold px-6 h-[40px] rounded-xl transition-all self-end shadow-lg shadow-ui-accent/20"
                    >
                        + NEW_COURSE
                    </button>
                </div>
            </div>

            {/* Registry Table */}
            <div className="overflow-x-auto rounded-2xl border border-white/5 bg-ui-surface/20 backdrop-blur-md shadow-2xl">
                <table className="w-full text-left border-collapse min-w-[900px]">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/5 font-mono text-[10px] text-ui-highlight uppercase tracking-widest">
                            <th className="p-4">ID_Code</th>
                            <th className="p-4">Module_Title</th>
                            <th className="p-4 text-center w-24">Sem</th>
                            <th className="p-4 text-center w-24">Credits</th>
                            <th className="p-4 w-32">Dept</th>
                            <th className="p-4">Faculty_Lead</th>
                            <th className="p-4 text-center w-36">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                        {filteredCourses.map((c) => (
                            <tr
                                key={c.id}
                                className="hover:bg-white/[0.03] transition-colors group"
                            >
                                <td className="p-4 font-mono text-ui-accent font-bold">
                                    {c.courseCode}
                                </td>
                                <td className="p-4 font-semibold text-content-primary">
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

                                {/* Merged Teacher Logic: Static display OR Dropdown */}
                                <td className="p-4 min-w-[200px]">
                                    {assigningId === c.id ? (
                                        <div className="flex items-center gap-2 animate-in zoom-in-95 duration-200">
                                            <select
                                                className="bg-ui-background border border-ui-accent/50 rounded-lg p-1.5 text-[11px] text-white outline-none w-full"
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
                                                className="text-[9px] text-ui-secondary hover:text-white uppercase font-mono"
                                            >
                                                [X]
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between gap-2">
                                            <span
                                                className={
                                                    c.teacher
                                                        ? "text-content-primary"
                                                        : "text-white/20 italic text-xs font-mono"
                                                }
                                            >
                                                {c.teacher
                                                    ? `${c.teacher.name}`
                                                    : "UNASSIGNED"}
                                            </span>
                                            <button
                                                onClick={() =>
                                                    setAssigningId(c.id)
                                                }
                                                className="opacity-0 group-hover:opacity-100 text-[9px] font-bold text-ui-highlight border border-ui-highlight/30 px-2 py-1 rounded-md hover:bg-ui-highlight/10 transition-all"
                                            >
                                                {c.teacher
                                                    ? "CHANGE"
                                                    : "ASSIGN"}
                                            </button>
                                        </div>
                                    )}
                                </td>

                                <td className="p-4">
                                    <div className="flex justify-center gap-4">
                                        <button
                                            onClick={() => openModal(c)}
                                            className="text-ui-highlight hover:underline text-[11px] font-bold"
                                        >
                                            EDIT
                                        </button>
                                        <button
                                            onClick={() => handleDelete(c.id)}
                                            className="text-ui-secondary/60 hover:text-ui-secondary text-[11px] font-bold"
                                        >
                                            DEL
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Full CRUD Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-ui-background border border-white/10 p-8 rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300">
                        <header className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-lg font-bold text-white uppercase tracking-tighter">
                                    {editingCourse
                                        ? "Update_Module"
                                        : "Register_Module"}
                                </h2>
                                <p className="text-[9px] font-mono text-ui-highlight uppercase tracking-[0.2em]">
                                    Curriculum_Entry_v4.0.3
                                </p>
                            </div>
                            <span className="text-[10px] font-mono text-ui-accent bg-ui-accent/10 px-3 py-1 rounded-full border border-ui-accent/20">
                                {editingCourse
                                    ? `ID_${editingCourse.id}`
                                    : "NEW"}
                            </span>
                        </header>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-mono text-ui-highlight uppercase mb-1 ml-1">
                                        Code
                                    </label>
                                    <input
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-ui-accent outline-none"
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
                                    <label className="block text-[10px] font-mono text-ui-highlight uppercase mb-1 ml-1">
                                        Dept
                                    </label>
                                    <select
                                        className="w-full bg-ui-surface border border-white/10 rounded-xl p-3 text-sm text-white focus:border-ui-accent outline-none"
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
                                <label className="block text-[10px] font-mono text-ui-highlight uppercase mb-1 ml-1">
                                    Course_Title
                                </label>
                                <input
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-ui-accent outline-none"
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
                                    <label className="block text-[10px] font-mono text-ui-highlight uppercase mb-1 ml-1">
                                        Semester
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-ui-accent outline-none"
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
                                    <label className="block text-[10px] font-mono text-ui-highlight uppercase mb-1 ml-1">
                                        Credits
                                    </label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-ui-accent outline-none"
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
                                <label className="block text-[10px] font-mono text-ui-highlight uppercase mb-1 ml-1">
                                    Faculty_Association
                                </label>
                                <select
                                    className="w-full bg-ui-surface border border-white/10 rounded-xl p-3 text-sm text-white focus:border-ui-accent outline-none"
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

                            <div className="flex gap-4 pt-6">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-3 text-[10px] text-ui-secondary font-black border border-white/5 rounded-xl hover:bg-white/5 transition-all"
                                >
                                    CANCEL
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-ui-accent rounded-xl text-[10px] text-white font-black hover:brightness-110 shadow-lg shadow-ui-accent/20 transition-all"
                                >
                                    SAVE_CHANGES
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
