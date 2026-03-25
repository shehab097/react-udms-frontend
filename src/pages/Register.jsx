import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { REGISTER_ENDPOINT } from "../config/config";

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        role: "STUDENT",
    });
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState("");

    useEffect(() => {}, [msg]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(REGISTER_ENDPOINT, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData), // Sends {username, password, role}
            });

            if (response.ok) {
                console.log("User registered successfully");
                // Redirect to login or show success message
                navigate("/login");
            } else {
                const errorData = await response.json();
                console.error("Registration failed:", errorData.message);
                setMsg(errorData.message);
            }
        } catch (error) {
            console.error("Network error:", error);
            setMsg("Network error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-ui-background flex flex-col font-sans text-content-primary">
            <Navbar />

            <main className="flex-1 flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-sm space-y-10">
                    <div className="space-y-2 text-center">
                        <h1 className="text-3xl font-bold font-rounded tracking-tight">
                            Create Account
                        </h1>
                        <p className="text-content-secondary text-sm">
                            Register a new user to the{" "}
                            <span className="text-ui-highlight">uDMS</span>{" "}
                            database.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <input
                                type="text"
                                name="username"
                                placeholder="Username"
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full bg-transparent border-b border-ui-surface py-3 focus:outline-none focus:border-ui-accent transition-colors placeholder:text-white/40 text-white"
                                required
                            />

                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full bg-transparent border-b border-ui-surface py-3 focus:outline-none focus:border-ui-accent transition-colors placeholder:text-white/40 text-white"
                                required
                            />

                            <div className="pt-2">
                                <label className="text-[10px] uppercase tracking-widest text-ui-accent font-bold mb-2 block">
                                    Assign System Role
                                </label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="w-full bg-ui-surface border border-white/5 text-content-primary rounded-xl py-3 px-4 focus:outline-none focus:border-ui-accent transition-all cursor-pointer"
                                >
                                    <option value="STUDENT">STUDENT</option>
                                    <option value="TEACHER">TEACHER</option>
                                    <option value="ADMIN" disabled={true} >ADMIN</option>
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-ui-accent text-white py-4 rounded-2xl font-bold font-rounded transition-all shadow-lg shadow-ui-accent/20 ${
                                loading
                                    ? "opacity-50 cursor-not-allowed"
                                    : "hover:brightness-110 active:scale-[0.98]"
                            }`}
                        >
                            {loading
                                ? "Processing..."
                                : "Complete Registration"}
                        </button>
                    </form>

                    <p className="text-center text-sm text-red-600 font-mono tracking-tighter">
                        {msg}
                    </p>
                </div>
            </main>
        </div>
    );
};

export default Register;
