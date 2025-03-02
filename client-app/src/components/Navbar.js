import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.svg"; //path if we need a logo
import "../styles/Navbar.css";

function Navbar() {
    return (
        <nav className="navbar-container">
            <div className="navbar-logo">
                {/*<img src={logo} alt="Site Logo" />*/}
                <span className="navbar-title">Store</span>
            </div>
            <ul className="navbar-links">
                {/* Links */}
                <li>
                    <Link to="/home" className="nav-link">Home</Link>
                </li>
                <li>
                    <Link to="/about" className="nav-link">About</Link>
                </li>
                <li>
                    <Link to="/login" className="nav-link">Login</Link>
                </li>
                <li>
                    <Link to="/products" className="nav-link">Products</Link>
                </li>
            </ul>
        </nav>
    );
}

export default Navbar;
