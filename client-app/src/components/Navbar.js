import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Navbar.css";
import Cart from "./Cart";

function Navbar({ cartItems, removeFromCart, cartId, userId, isRegisteredUser, updateCartItems, onLogout }) {
    const [showCart, setShowCart] = useState(false);
    const navigate = useNavigate();

    const toggleCart = () => {
        console.log("Toggle cart clicked, current state:", showCart);
        setShowCart(!showCart);
    };

    const handleLogout = () => {
        onLogout();
    };

    return (
        <nav className="navbar-container">
            <div className="navbar-logo">
                <span className="navbar-title">VibeStitch</span>
            </div>
            <ul className="navbar-links">
                <li>
                    <Link to="/products" className="nav-link">
                        Products
                    </Link>
                </li>
                <li>
                    <Link to="/about" className="nav-link">
                        About
                    </Link>
                </li>
                {userId ? (
                    <>
                        <li>
                            <button onClick={handleLogout} className="nav-link">
                                Logout
                            </button>
                        </li>
                    </>
                ) : (
                    <li>
                        <Link to="/login" className="nav-link">
                            Login
                        </Link>
                    </li>
                )}
                <li className="cart-container">
                    <button className="nav-link cart-toggle-button" onClick={toggleCart}>
                        Cart ({cartItems.length})
                    </button>

                    {showCart && (
                        <div className="cart-dropdown">
                            <Cart
                                cartItems={cartItems}
                                removeFromCart={removeFromCart}
                                cartId={cartId}
                                userId={userId}
                                isRegisteredUser={isRegisteredUser}
                                updateCartItems={updateCartItems}
                            />
                        </div>
                    )}
                </li>
            </ul>
        </nav>
    );
}

export default Navbar;