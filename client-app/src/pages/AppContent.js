// AppContent.js
import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./Home";
import About from "../components/About";
import Login from "../components/Login";
import Products from "../components/Products";
import Navbar from "../components/Navbar";
//import ProductDetail from "../components/ProductDetail";
import TestingButton from "../components/TestingButton";

function AppContent() {
    const location = useLocation();
    const isLoginPage = location.pathname === "/";

    return (
        <main>
            {/* If not on the login page, show Navbar */}
            {!isLoginPage && <Navbar />}

            {/* Routes */}
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/home" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/products" element={<Products />} />
                {/*<Route path="/product/:id" element={<ProductDetail />} />*/}
            </Routes>

            {/* This guy puts a button on the login page to skip to the main. Be sure to delete this in the final build. */}
            {isLoginPage && <TestingButton />}
            </main>
    );
}

export default AppContent;