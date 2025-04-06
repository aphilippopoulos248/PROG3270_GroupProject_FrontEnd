import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Home from "./Home";
import About from "../components/About";
import Login from "../components/Login";
import Products from "../components/Products";
import Navbar from "../components/Navbar";
import ProductDetail from "../components/ProductDetail";
import TestingButton from "../components/TestingButton";
import CartService from "../services/CartService";

function AppContent() {
    const location = useLocation();
    const navigate = useNavigate();
    const isLoginPage = location.pathname === "/";

    // User state
    const [userId, setUserId] = useState(null);
    const [isRegisteredUser, setIsRegisteredUser] = useState(false);

    // Cart state
    const [cartItems, setCartItems] = useState([]);
    const [cartId, setCartId] = useState(null);
    const [loading, setLoading] = useState(false);

    // Get user ID either from location state or localStorage
    useEffect(() => {
        const memberID = location.state?.memberID || localStorage.getItem("memberID");
        if (memberID) {
            setUserId(Number(memberID));
            setIsRegisteredUser(true);
            localStorage.setItem("memberID", memberID);
        }
    }, [location.state]);

    // Fetch user's cart if they're logged in
    useEffect(() => {
        const fetchUserCart = async () => {
            if (!userId) return;

            setLoading(true);
            try {
                const cart = await CartService.getUserCart(userId);
                if (cart) {
                    setCartId(cart.id);

                    // Need to fetch product details for each product in cart
                    // For simplicity, we're assuming we already have the product details
                    // In a real application, you would need to fetch them from the API
                    const cartProducts = cart.products.map(p => ({
                        id: p.productId,
                        title: `Product ${p.productId}`,
                        price: 0, // This would come from your product API
                        image: 'https://via.placeholder.com/150',
                        quantity: p.quantity
                    }));

                    setCartItems(cartProducts);
                }
            } catch (error) {
                console.error("Error fetching user cart:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserCart();
    }, [userId]);

    const addToCart = async (product) => {
        setLoading(true);
        try {
            // If we don't have a cart yet, create one
            if (!cartId) {
                const newCart = await CartService.createCart(userId || 0, [product]);
                setCartId(newCart.id);
                setCartItems([product]);
            } else {
                // If we have a cart, update it
                const updatedCart = {
                    id: cartId,
                    userId: userId || 0,
                    date: new Date().toISOString(),
                    products: [...cartItems, product].map(p => ({
                        cartId: cartId,
                        productId: typeof p.id === 'string' && p.id.startsWith('dummy-')
                            ? parseInt(p.id.replace('dummy-', ''))
                            : p.id,
                        quantity: 1
                    }))
                };

                const success = await CartService.updateCart(cartId, updatedCart);
                if (success) {
                    setCartItems(prev => [...prev, product]);
                }
            }
        } catch (error) {
            console.error("Error adding to cart:", error);
            alert("Failed to add item to cart. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const removeFromCart = async (productId) => {
        if (!cartId) return;

        setLoading(true);
        try {
            const success = await CartService.removeItemFromCart(cartId, productId);
            if (success) {
                setCartItems(prev => prev.filter(item => item.id !== productId));
            }
        } catch (error) {
            console.error("Error removing item from cart:", error);
        } finally {
            setLoading(false);
        }
    };

    // Handle user logout
    const handleLogout = () => {
        setUserId(null);
        setIsRegisteredUser(false);
        setCartItems([]);
        setCartId(null);
        localStorage.removeItem("memberID");
        navigate("/");
    };

    return (
        <main>
            {/* If not on the login page, show Navbar */}
            {!isLoginPage && (
                <Navbar
                    cartItems={cartItems}
                    removeFromCart={removeFromCart}
                    cartId={cartId}
                    userId={userId}
                    isRegisteredUser={isRegisteredUser}
                    updateCartItems={setCartItems}
                    onLogout={handleLogout}
                />
            )}

            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/home" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route
                    path="/products"
                    element={<Products addToCart={addToCart} loading={loading} />}
                />
                <Route
                    path="/product/:id"
                    element={<ProductDetail addToCart={addToCart} loading={loading} />}
                />
            </Routes>

            {/* Testing button on login page */}
            {isLoginPage && <TestingButton />}
        </main>
    );
}

export default AppContent;