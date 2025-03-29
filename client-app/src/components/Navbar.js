import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.svg"; //path if we need a logo
import "../styles/Navbar.css";
import Cart from "./Cart";

function Navbar({ cartItems, removeFromCart }) {
    const [showCart, setShowCart] = useState(false);
  
    const toggleCart = () => {
      setShowCart((prev) => !prev);
    };
  
    return (
      <nav className="navbar-container">
        <div className="navbar-logo">
                {/* <img src={logo} alt="Site Logo" /> */}
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
        <li>
          <Link to="/login" className="nav-link">
            Login
          </Link>
        </li>
        <li>
          {/* Cart Toggle Button */}
          <button className="nav-link cart-toggle-button" onClick={toggleCart}>
            Cart ({cartItems.length})
          </button>
        </li>
      </ul>
      {showCart && (
        <div className="cart-dropdown">
          <Cart cartItems={cartItems} removeFromCart={removeFromCart} />
        </div>
      )}
    </nav>
  );
}

export default Navbar;