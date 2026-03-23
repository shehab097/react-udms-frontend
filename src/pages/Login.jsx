import React, { useEffect } from "react";
import Navbar from "../components/Navbar";
import AccountForm from "../components/LoginFrom";
import { getToken } from "../services/tokenService";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginFrom";

function Login() {
    const navigate = useNavigate();

    useEffect(() => {
        const token = getToken();

        if (token) {
            console.log(token);
            navigate("/home");
        }
    }, [navigate]);

    return (
        <div className="flex flex-col min-h-screen bg-ui-background">
            <Navbar />

            <main className="flex-1 flex items-center justify-center w-full">
                <div className="w-full max-w-md px-4">
                    <LoginForm />
                </div>
            </main>
        </div>
    );
}

export default Login;
