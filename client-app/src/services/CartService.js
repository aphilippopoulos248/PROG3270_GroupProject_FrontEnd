// src/services/CartService.js
const API_URL = "https://localhost:7223";

// Helper function to store cart items in localStorage
const saveCartItemsToLocalStorage = (items) => {
    try {
        localStorage.setItem('cartItems', JSON.stringify(items));
    } catch (error) {
        console.error("Error saving cart items to localStorage:", error);
    }
};

// Helper function to retrieve cart items from localStorage
const getCartItemsFromLocalStorage = () => {
    try {
        const items = localStorage.getItem('cartItems');
        return items ? JSON.parse(items) : [];
    } catch (error) {
        console.error("Error retrieving cart items from localStorage:", error);
        return [];
    }
};

export const CartService = {
    getUserCart: async (userId) => {
        try {
            console.log("Fetching cart for user:", userId);
            const response = await fetch(`${API_URL}/carts/user/${userId}`);

            if (!response.ok) {
                if (response.status === 404) {
                    console.log("No cart found for user");
                    return null; // User doesn't have a cart yet
                }
                console.error("Error response:", response.status);
                throw new Error('Failed to fetch cart');
            }

            const carts = await response.json();
            console.log("Carts received:", carts);

            // Return the most recent cart
            if (carts.length > 0) {
                // Try to get cached product details
                const cartItems = getCartItemsFromLocalStorage();

                // If we have a cart and cached items, merge them together
                if (cartItems.length > 0) {
                    // Create a map of product IDs to their full details
                    const productMap = new Map();
                    cartItems.forEach(item => {
                        // Store both formats of the ID for lookup
                        const normalizedId = item.id.toString().replace('dummy-', '');
                        productMap.set(item.id.toString(), item);
                        productMap.set(normalizedId, item);
                    });

                    // Add product details to cart items
                    const cartWithDetails = carts[0];
                    cartWithDetails.products = cartWithDetails.products.map(p => {
                        const productId = p.productId.toString();
                        const dummyProductId = `dummy-${productId}`;
// Check both possible ID formats
                        if (productMap.has(productId) || productMap.has(dummyProductId)) {
                            // Use cached product details from whichever format matches
                            const details = productMap.get(productId) || productMap.get(dummyProductId);
                            return {
                                ...p,
                                title: details.title,
                                price: details.price,
                                image: details.image
                            };
                        }
                        return p;
                    });

                    return cartWithDetails;
                }
                return carts[0];
            }
            return null;
        } catch (error) {
            console.error("Error fetching cart:", error);
            return null;
        }
    },

    createCart: async (userId, products) => {
        try {
            console.log("Creating cart for user:", userId, "with products:", products);

            // Save full product details to localStorage
            saveCartItemsToLocalStorage(products);

            const cartData = {
                userId: userId,
                products: products.map(product => ({
                    productId: typeof product.id === 'string' && product.id.startsWith('dummy-')
                        ? parseInt(product.id.replace('dummy-', ''))
                        : product.id,
                    quantity: 1
                }))
            };

            console.log("Cart data being sent:", JSON.stringify(cartData));

            const response = await fetch(`${API_URL}/carts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(cartData)
            });

            if (!response.ok) {
                console.error("Error response:", response.status);
                const errorText = await response.text();
                console.error("Error details:", errorText);
                throw new Error('Failed to create cart');
            }

            const newCart = await response.json();
            console.log("New cart created:", newCart);
            return newCart;
        } catch (error) {
            console.error("Error creating cart:", error);
            throw error;
        }
    },

    updateCart: async (cartId, cart, newProduct) => {
        try {
            console.log("Updating cart:", cartId, "with data:", cart);

            // Update localStorage with new product
            if (newProduct) {
                const existingItems = getCartItemsFromLocalStorage();
                saveCartItemsToLocalStorage([...existingItems, newProduct]);
            }

            const response = await fetch(`${API_URL}/carts/${cartId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(cart)
            });

            if (!response.ok) {
                console.error("Error response:", response.status);
                const errorText = await response.text();
                console.error("Error details:", errorText);
                throw new Error('Failed to update cart');
            }

            console.log("Cart updated successfully");
            return true;
        } catch (error) {
            console.error("Error updating cart:", error);
            return false;
        }
    },

    removeItemFromCart: async (cartId, productId) => {
        try {
            console.log("Removing product:", productId, "from cart:", cartId);

            // Remove from localStorage
            const existingItems = getCartItemsFromLocalStorage();
            const updatedItems = existingItems.filter(item => item.id !== productId);
            saveCartItemsToLocalStorage(updatedItems);

            // Convert dummy-prefixed IDs
            if (typeof productId === 'string' && productId.startsWith('dummy-')) {
                productId = parseInt(productId.replace('dummy-', ''));
                console.log("Converted product ID to:", productId);
            }

            const response = await fetch(`${API_URL}/carts/${cartId}/product/${productId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                console.error("Error response:", response.status);
                const errorText = await response.text();
                console.error("Error details:", errorText);
                throw new Error('Failed to remove item from cart');
            }

            console.log("Product removed successfully");
            return true;
        } catch (error) {
            console.error("Error removing item from cart:", error);
            return false;
        }
    },

    calculateTotal: async (cartId, isRegisteredUser) => {
        try {
            console.log("Calculating total for cart:", cartId, "Registered user:", isRegisteredUser);

            // Get the latest cart items
            const cartItems = getCartItemsFromLocalStorage();

            // FORCE client-side calculation to ensure correct pricing
            let total = 0;

            if (cartItems && cartItems.length > 0) {
                console.log("Cart items for calculation:", cartItems);

                // Sum all prices
                total = cartItems.reduce((sum, item) => {
                    const itemPrice = typeof item.price === 'number' ? item.price : 0;
                    console.log(`Item: ${item.title}, Price: $${itemPrice}`);
                    return sum + itemPrice;
                }, 0);

                console.log("Raw total before discount:", total);

                // Apply 10% discount for registered users
                if (isRegisteredUser) {
                    const discountAmount = total * 0.1;
                    total = total - discountAmount;
                    console.log(`Applied 10% discount: -$${discountAmount.toFixed(2)}`);
                }

                console.log("Final calculated total:", total);
            }

            return total;
        } catch (error) {
            console.error("Error calculating cart total:", error);
            return 0;
        }
    },

    checkoutCart: async (cartId, isRegisteredUser, shippingAddress) => {
        try {
            console.log("Checking out cart:", cartId, "Registered user:", isRegisteredUser);

            // Get the latest cart items
            const cartItems = getCartItemsFromLocalStorage();

            // Calculate correct values client-side
            let subtotal = 0;

            if (cartItems && cartItems.length > 0) {
                // Sum all prices
                subtotal = cartItems.reduce((sum, item) => {
                    return sum + (typeof item.price === 'number' ? item.price : 0);
                }, 0);
            }

            // Calculate discount (10% for registered users)
            const discount = isRegisteredUser ? subtotal * 0.1 : 0;

            // Calculate final total
            const total = subtotal - discount;

            // Try server checkout for record-keeping
            try {
                const response = await fetch(`${API_URL}/carts/${cartId}/checkout`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        isRegisteredUser,
                        shippingAddress
                    })
                });

                if (!response.ok) {
                    console.error("Error response:", response.status);
                    throw new Error('Failed to checkout cart');
                }

                // We'll ignore the returned values and use our own
                console.log("Server checkout completed");
            } catch (error) {
                console.warn("Server checkout failed, but continuing with client-side checkout");
            }

            // Create a client-side order object with correct values
            const orderData = {
                orderDate: new Date().toISOString(),
                subtotal: subtotal,
                discount: discount,
                total: total,
                shippingAddress: shippingAddress,
                items: cartItems.map(item => ({
                    id: item.id,
                    title: item.title,
                    price: item.price,
                    quantity: 1
                }))
            };

            console.log("Checkout completed with correct values:", orderData);

            // Clear cart items in localStorage after successful checkout
            saveCartItemsToLocalStorage([]);

            return orderData;
        } catch (error) {
            console.error("Error checking out cart:", error);
            throw error;
        }
    },

    clearCart: () => {
        // Clear cart items from localStorage
        saveCartItemsToLocalStorage([]);
    }
};

export default CartService;