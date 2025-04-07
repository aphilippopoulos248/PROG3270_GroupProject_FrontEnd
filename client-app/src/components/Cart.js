import React, { useState } from "react";
import "../styles/Cart.css";
import CartService from "../services/CartService";

const Cart = ({ cartItems, removeFromCart, cartId, userId, isRegisteredUser, updateCartItems }) => {
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(null);
    const [checkingOut, setCheckingOut] = useState(false);
    const [shippingAddress, setShippingAddress] = useState("");
    const [orderComplete, setOrderComplete] = useState(false);
    const [orderDetails, setOrderDetails] = useState(null);


    const formatPrice = (price) => {
        return typeof price === 'number' ? price.toFixed(2) : '0.00';
    };

    const handleRemoveItem = async (item) => {
        if (!cartId) return;

        setLoading(true);
        const success = await CartService.removeItemFromCart(cartId, item.id);
        if (success) {
            // This updates the parent's state, but we need to also update our local view
            removeFromCart(item.id);

            // Immediately update the cart items displayed in this component
            const updatedItems = cartItems.filter(cartItem => cartItem.id !== item.id);
            updateCartItems(updatedItems);
        }
        setLoading(false);
    };

    const calculateTotal = async () => {
        if (!cartId) return;

        setLoading(true);
        const total = await CartService.calculateTotal(cartId, isRegisteredUser);
        setTotal(total);
        setLoading(false);
    };

    const startCheckout = () => {
        setCheckingOut(true);
        calculateTotal();
    };

    const handleCheckout = async () => {
        if (!cartId) return;

        setLoading(true);
        try {
            const order = await CartService.checkoutCart(cartId, isRegisteredUser, shippingAddress);
            setOrderDetails(order);
            setOrderComplete(true);
            updateCartItems([]); // Clear cart after successful checkout
        } catch (error) {
            console.error("Checkout failed:", error);
            alert("Checkout failed. Please try again.");
        }
        setLoading(false);
    };

    // If order is complete, show order confirmation
    if (orderComplete) {
        return (
            <div className="cart">
                <h2>Order Confirmed!</h2>
                <div className="order-details">
                    <p><strong>Order Date:</strong> {new Date(orderDetails.orderDate).toLocaleString()}</p>
                    <p><strong>Subtotal:</strong> ${formatPrice(orderDetails.subtotal)}</p>
                    {orderDetails.discount > 0 && (
                        <p><strong>Discount:</strong> ${formatPrice(orderDetails.discount)}</p>
                    )}
                    <p><strong>Total:</strong> ${formatPrice(orderDetails.total)}</p>
                    <p><strong>Shipping Address:</strong> {shippingAddress}</p>
                </div>
                <button onClick={() => setOrderComplete(false)}>Continue Shopping</button>
            </div>
        );
    }

    // If in checkout process, show shipping form
    if (checkingOut) {
        return (
            <div className="cart checkout-form">
                <h2>Checkout</h2>
                {total !== null && (
                    <div className="total-section">
                        <p><strong>Total:</strong> ${formatPrice(total)}</p>
                        {isRegisteredUser && <p className="discount-note">Members get 10% discount!</p>}
                    </div>
                )}
                <div className="form-group">
                    <label htmlFor="shipping-address">Shipping Address:</label>
                    <textarea
                        id="shipping-address"
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        required
                    />
                </div>
                <div className="checkout-buttons">
                    <button
                        onClick={() => setCheckingOut(false)}
                        className="back-button"
                        disabled={loading}
                    >
                        Back to Cart
                    </button>
                    <button
                        onClick={handleCheckout}
                        disabled={loading || !shippingAddress.trim()}
                        className="checkout-button"
                    >
                        {loading ? "Processing..." : "Complete Order"}
                    </button>
                </div>
            </div>
        );
    }

    // Regular cart view
    return (
        <div className="cart">
            <h2>Your Shopping Cart</h2>
            {cartItems.length === 0 ? (
                <p>No items in the cart.</p>
            ) : (
                <>
                    <ul className="cart-items">
                        {cartItems.map((item) => (
                            <li key={item.id} className="cart-item">
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="cart-image"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://via.placeholder.com/150'
                                    }}
                                />
                                <div className="cart-details">
                                    <h4>{item.title || `Product ${item.id}`}</h4>
                                    <p>${formatPrice(item.price)}</p>
                                </div>
                                <button
                                    onClick={() => handleRemoveItem(item)}
                                    disabled={loading}
                                    className="remove-button"
                                >
                                    Remove
                                </button>
                            </li>
                        ))}
                    </ul>
                    <div className="cart-footer">
                        <button
                            onClick={calculateTotal}
                            className="calculate-total-button"
                            disabled={loading}
                        >
                            {loading ? "Calculating..." : "Calculate Total"}
                        </button>
                        {total !== null && <p className="cart-total">Total: ${formatPrice(total)}</p>}
                        <button
                            onClick={startCheckout}
                            className="checkout-button"
                            disabled={loading}
                        >
                            Proceed to Checkout
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default Cart;