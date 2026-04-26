import React, { useState, useEffect } from "react";
import { login } from "../services/authService";
import { getToken } from "../services/tokenService";
import { useNavigate } from "react-router-dom";

const LoginForm = () => {
    const navigate = useNavigate();

    const [user, setUser] = useState("");
    const [pass, setPass] = useState("");
    const [msg, setMsg] = useState("");

    useEffect(() => {
        const token = getToken();

        if (token) {
            navigate("/home");
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await login(user, pass);
            if (res.status === 200) {
                setMsg("Login success");
                navigate("/home");
            }
        } catch (error) {
            setMsg("Login failed!");
        }
    };

    return (
        /* 1. Updated container colors for light surface */
        <div className="flex flex-col font-sans bg-ui-surface border-ui-neutral text-content-primary max-w-[400px] h-[400px] border rounded-3xl shadow-soft">
            <main className="flex-1 flex items-center justify-center px-6">
                <form
                    onSubmit={handleSubmit}
                    className="w-full max-w-sm space-y-10"
                >
                    <h1 className="font-bold text-4xl text-content-primary">
                        Login
                    </h1>

                    <div className="space-y-5">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Username"
                                value={user}
                                onChange={(e) => setUser(e.target.value)}
                                /* 2. Changed border and text colors for high visibility on light bg */
                                className="w-full bg-transparent border-b border-ui-secondary/30 py-3 focus:outline-none focus:border-ui-accent transition-all placeholder:text-content-muted text-content-primary"
                                required
                            />
                        </div>

                        <div className="relative">
                            <input
                                type="password"
                                placeholder="Password"
                                value={pass}
                                onChange={(e) => setPass(e.target.value)}
                                /* 3. Synchronized password input colors */
                                className="w-full bg-transparent border-b border-ui-secondary/30 py-3 focus:outline-none focus:border-ui-accent transition-all placeholder:text-content-muted text-content-primary"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        /* 4. Swapped to Accent color for a professional "Action" button */
                        className="w-full bg-ui-accent text-white py-4 rounded-2xl font-bold hover:brightness-110 active:scale-[0.98] transition-all shadow-md"
                    >
                        Continue
                    </button>

                    <p className="text-center text-sm text-content-secondary">
                        {msg === "" ? "Login to continue" : msg}
                    </p>
                </form>
            </main>
        </div>
    );
};

export default LoginForm;
