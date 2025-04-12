import React, { useState } from "react";
import "../styles/Login.css";
import BubbleAnimation from "./BubbleAnimation";
import { useNavigate } from 'react-router-dom';

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();

        const loginData = {
            Username: username,
            Password: password
        };

        try {
            setLoading(true);
            setError(null);

            const response = await fetch("https://localhost:7223/api/members/authenticate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(loginData)
            });

            if (!response.ok) {
                throw new Error("Invalid username or password.");
            }

            const member = await response.json();
            console.log("Member authenticated:", member);

            // Store user ID in localStorage for persistence
            localStorage.setItem("memberID", member.memberID);

            alert("Login successful!");
            navigate("/home", { state: { memberID: member.memberID } });

            setUsername("");
            setPassword("");
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            {/* Bubbles animation */}
            <div className="bubble-container">
                <BubbleAnimation />
            </div>

            {/* Login form */}
            <form onSubmit={handleSubmit}>
                <h3>Log In</h3>
                {error && <p className="error-message">{error}</p>}
                <div>
                    <label htmlFor="username">Username:</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="login-button"
                    disabled={loading}
                >
                    {loading ? "Logging In..." : "Log In"}
                </button>
            </form>
        </div>
    );
}

export default Login;