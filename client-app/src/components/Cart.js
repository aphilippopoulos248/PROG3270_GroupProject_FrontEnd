import React, { useState, useEffect } from "react";
import "../styles/Cart.css";
import CartService from "../services/CartService";

const Cart = ({ cartItems, removeFromCart, cartId, userId, isRegisteredUser, updateCartItems }) => {
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(null);
    const [checkingOut, setCheckingOut] = useState(false);
    const [shippingAddress, setShippingAddress] = useState("");
    const [orderComplete, setOrderComplete] = useState(false);
    const [orderDetails, setOrderDetails] = useState(null);
    const [currentDateTime, setCurrentDateTime] = useState("");

    // New credit card form fields
    const [cardholderName, setCardholderName] = useState("");
    const [cardholderSurname, setCardholderSurname] = useState("");
    const [cardNumber, setCardNumber] = useState("");
    const [cardExpiry, setCardExpiry] = useState("");
    const [cardCvv, setCvv] = useState("");

    // Update current date time with the exact format required
    useEffect(() => {
        updateDateTime();
        // Update the time every minute
        const interval = setInterval(updateDateTime, 60000);
        return () => clearInterval(interval);
    }, []);

    const updateDateTime = () => {
        const now = new Date();
        const year = now.getUTCFullYear();
        const month = String(now.getUTCMonth() + 1).padStart(2, '0');
        const day = String(now.getUTCDate()).padStart(2, '0');
        const hours = String(now.getUTCHours()).padStart(2, '0');
        const minutes = String(now.getUTCMinutes()).padStart(2, '0');
        const seconds = String(now.getUTCSeconds()).padStart(2, '0');

        const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        setCurrentDateTime(formattedDate);
    };

    // Validate numeric input for card fields
    const handleNumericInput = (e, setter, maxLength = null) => {
        const value = e.target.value.replace(/[^\d]/g, '');
        if (maxLength && value.length > maxLength) {
            return;
        }
        setter(value);
    };

    // Format credit card number with spaces
    const formatCardNumber = (value) => {
        const numbers = value.replace(/\s/g, '');
        const groups = [];
        for (let i = 0; i < numbers.length; i += 4) {
            groups.push(numbers.slice(i, i + 4));
        }
        return groups.join(' ');
    };

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
        updateDateTime(); // Update time when checkout begins
    };

    const handleCheckout = async () => {
        if (!cartId) return;

        setLoading(true);
        try {
            // Include card information with checkout
            const checkoutData = {
                isRegisteredUser,
                shippingAddress,
                paymentDetails: {
                    cardholderName,
                    cardholderSurname,
                    cardNumber,
                    cardExpiry,
                    cardCvv
                }
            };

            const order = await CartService.checkoutCart(cartId, isRegisteredUser, shippingAddress);

            // Store payment details in order confirmation
            order.paymentDetails = {
                cardholderName,
                cardholderSurname,
                // Mask card number for security - only show last 4 digits
                cardNumber: `xxxx-xxxx-xxxx-${cardNumber.slice(-4)}`,
                cardExpiry
            };

            // Add order date/time
            order.orderDateTime = currentDateTime;

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
                    <p><strong>Order Date:</strong> {orderDetails.orderDateTime || new Date(orderDetails.orderDate).toLocaleString()}</p>
                    <p><strong>Subtotal:</strong> ${formatPrice(orderDetails.subtotal)}</p>
                    {orderDetails.discount > 0 && (
                        <p><strong>Discount:</strong> ${formatPrice(orderDetails.discount)}</p>
                    )}
                    <p><strong>Total:</strong> ${formatPrice(orderDetails.total)}</p>
                    <p><strong>Shipping Address:</strong> {shippingAddress}</p>
                    <p><strong>Payment Method:</strong> Credit Card ({orderDetails.paymentDetails.cardNumber})</p>
                    <p><strong>Card Holder:</strong> {orderDetails.paymentDetails.cardholderName} {orderDetails.paymentDetails.cardholderSurname}</p>
                </div>
                <button onClick={() => setOrderComplete(false)}>Continue Shopping</button>
            </div>
        );
    }

    // If in checkout process, show shipping and payment form
    if (checkingOut) {
        return (
            <div className="cart checkout-form">
                <h2>Checkout</h2>
                <div className="date-time-display">
                    <p><strong>Current Date and Time (UTC):</strong> {currentDateTime}</p>
                </div>

                {total !== null && (
                    <div className="total-section">
                        <p><strong>Total:</strong> ${formatPrice(total)}</p>
                        {isRegisteredUser && <p className="discount-note">Members get 10% discount!</p>}
                    </div>
                )}

                <div className="checkout-scroll-container">
                    {/* Shipping Information */}
                    <div className="form-section">
                        <h3>Shipping Information</h3>
                        <div className="form-group">
                            <label htmlFor="shipping-address">Shipping Address:</label>
                            <input
                                type="text"
                                id="shipping-address"
                                value={shippingAddress}
                                onChange={(e) => setShippingAddress(e.target.value)}
                                className="visible-text-input"
                                required
                            />
                        </div>
                    </div>

                    {/* Payment Information */}
                    <div className="form-section">
                        <h3>Payment Information</h3>
                        <div className="form-group">
                            <label htmlFor="cardholder-name">Cardholder Name:</label>
                            <input
                                type="text"
                                id="cardholder-name"
                                value={cardholderName}
                                onChange={(e) => setCardholderName(e.target.value)}
                                className="visible-text-input"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="cardholder-surname">Cardholder Surname:</label>
                            <input
                                type="text"
                                id="cardholder-surname"
                                value={cardholderSurname}
                                onChange={(e) => setCardholderSurname(e.target.value)}
                                className="visible-text-input"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="card-number">Card Number:</label>
                            <input
                                type="text"
                                inputMode="numeric"
                                id="card-number"
                                value={formatCardNumber(cardNumber)}
                                onChange={(e) => handleNumericInput(e, setCardNumber, 16)}
                                placeholder="1234 5678 9012 3456"
                                className="visible-text-input"
                                required
                                maxLength="19"
                            />
                        </div>
                        <div className="form-row">
                            <div className="form-group half">
                                <label htmlFor="card-expiry">Expiry Date:</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    id="card-expiry"
                                    value={cardExpiry}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/[^\d/]/g, '');
                                        if (value.length <= 5) {
                                            setCardExpiry(value);
                                        }
                                    }}
                                    placeholder="MM/YY"
                                    className="visible-text-input"
                                    required
                                    maxLength="5"
                                />
                            </div>
                            <div className="form-group half">
                                <label htmlFor="card-cvv">CVV:</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    id="card-cvv"
                                    value={cardCvv}
                                    onChange={(e) => handleNumericInput(e, setCvv, 4)}
                                    placeholder="123"
                                    className="visible-text-input"
                                    required
                                    maxLength="4"
                                />
                            </div>
                        </div>
                    </div>
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
                        disabled={loading || !shippingAddress.trim() ||
                            !cardholderName.trim() || !cardholderSurname.trim() ||
                            !cardNumber.trim() || !cardExpiry.trim() || !cardCvv.trim()}
                        className="checkout-button"
                    >
                        {loading ? "Processing..." : "Complete Order"}
                    </button>
                </div>
            </div>
        );
    }

    // Regular cart view code remains the same
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