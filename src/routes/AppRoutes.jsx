import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Logout from "../pages/Logout";
import Home from "../pages/Home";
import NotFound from "../pages/NotFound";
import AccessDenied from "../pages/AccessDenied";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Users from "../pages/Users";
import Teacher from "../pages/Teacher";
import Student from "../pages/Student";
import Admin from "../pages/Admin";
import Course from "../pages/Course";
import Notice from "../pages/Notice";
import StudentEnrolled from "../pages/StudentEnrolled";
import StudentProfile from "../pages/student/[username]";
import TeacherProfile from "../pages/teacher/[username]";
import AdminProfile from "../pages/admin/[username]";
// import NotFound from "../pages/NotFound";

export default function AppRoutes() {
    return (
        <Router>
            {/* basic theme */}
            <div className="">
                <Routes>
                    {/* Default */}
                    <Route path="/" element={<Login />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/logout" element={<Logout />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/dashboard" element={<Dashboard />} />

                    <Route path="/users" element={<Users />} />
                    <Route path="/teacher" element={<Teacher />} />
                    <Route path="/student" element={<Student />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/course" element={<Course />} />
                    <Route path="/notice" element={<Notice />} />
                    <Route
                        path="/studentenrolled"
                        element={<StudentEnrolled />}
                    />

                    {/*  */}
                    {/* Dynamic Profile Route */}
                    <Route
                        path="/student/:username"
                        element={<StudentProfile />}
                    />
                    <Route
                        path="teacher/:username"
                        element={<TeacherProfile />}
                    />
                    <Route
                        path="admin/:username"
                        element={<AdminProfile />}
                    />

                    <Route path="/accessdenied" element={<AccessDenied />} />

                    {/* <Route path="*" element={<NotFound />} /> */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </div>
        </Router>
    );
}
