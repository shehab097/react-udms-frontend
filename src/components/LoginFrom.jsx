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
            console.log(token);
            navigate("/home");
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await login(user, pass);
            console.log(res)
            if (res.status === 200) {
                console.log("Login success");
                setMsg("Login success");
                // console.log(res.data);
                navigate("/home")
            }
        } catch (error) {
            setMsg("Login failed!");
            console.log(error);
        }
    };

    return (
        // Changed bg-ui-background to a standard dark slate if your config isn't set
        <div className="flex flex-col font-sans text-white max-w-[400px] h-[400px] border rounded-3xl">
            {/* Centered Form */}
            <main className="flex-1 flex items-center justify-center px-6">
                <form
                    onSubmit={handleSubmit}
                    className="w-full max-w-sm space-y-10"
                >
                    <h1 className="font-bold text-4xl">Login</h1>

                    <div className="space-y-5">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Username"
                                value={user}
                                onChange={(e) => setUser(e.target.value)}
                                // Key changes: placeholder-white and placeholder-opacity-100
                                className="w-full bg-transparent border-b border-white/20 py-3 focus:outline-none focus:border-white transition-all placeholder:text-white placeholder:opacity-100 text-white"
                                required
                            />
                        </div>

                        <div className="relative">
                            <input
                                type="password"
                                placeholder="Password"
                                value={pass}
                                onChange={(e) => setPass(e.target.value)}
                                className="w-full bg-transparent border-b border-white/20 py-3 focus:outline-none focus:border-white transition-all placeholder:text-white placeholder:opacity-100 text-white"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-white text-black py-4 rounded-2xl font-bold hover:bg-opacity-90 active:scale-[0.98] transition-all shadow-lg"
                    >
                        Continue
                    </button>

                    <p className="text-center text-sm text-white/30">
                        {msg == "" ? "Login to continue" : msg}
                    </p>
                </form>
            </main>
        </div>
    );
};

export default LoginForm;
