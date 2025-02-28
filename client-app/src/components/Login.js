import React from "react";
import "../styles/Login.css";
import BubbleAnimation from "./BubbleAnimation";

function Login() {
    return (
        <div className="login-page">
            {/* Bubbles anim */}
            <div className="bubble-container">
                <BubbleAnimation />
            </div>

            {/* Login form */}
            <form className="login-form">
                <h3>Login</h3>
                <label htmlFor="username">Username</label>
                <input type="text" placeholder="Email" id="username"/>
                <label htmlFor="password">Password</label>
                <input type="password" placeholder="Password" id="password"/>
                <button>Log In</button>
            </form>
        </div>
    );
}

export default Login;

