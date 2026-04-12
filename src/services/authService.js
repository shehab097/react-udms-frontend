import { LOGIN_ENDPOINT } from "../config/config";

export async function login(username, password) {
    const response = await fetch(`${LOGIN_ENDPOINT}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username: username,
            password: password,
        }),

        
    });

    const data = await response.json();
    console.log(response)

    // save token if login success
    if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        localStorage.setItem("username", data.username);
    }

    return {
        status: response.status,
        data: data,
    };
}
