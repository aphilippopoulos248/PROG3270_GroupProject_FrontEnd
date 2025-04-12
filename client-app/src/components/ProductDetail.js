import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../styles/ProductDetail.css";

const ProductDetail = ({ addToCart, loading }) => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [addedToCart, setAddedToCart] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Dummy reviews
    const [reviews, setReviews] = useState([
        "⭐️⭐️⭐️⭐️⭐️ - Great quality and comfortable fit!",
        "⭐️⭐️⭐️⭐️⭐ - Love the design, but runs a bit small.",
        "⭐️⭐️⭐️⭐⭐ - Good value for the price."
    ]);

    // Track new review text
    const [newReview, setNewReview] = useState("");

    useEffect(() => {
        const fetchProduct = async () => {
            setIsLoading(true);
            setError(null);

            try {
                // Detect
                const isDummy = id.startsWith("dummy-");
                const realId = isDummy ? id.replace("dummy-", "") : id;

                // Build the endpoint
                const url = isDummy
                    ? `https://dummyjson.com/products/${realId}`
                    : `https://localhost:7223/api/products/${realId}`;

                console.log("Fetching product from:", url);
                const res = await fetch(url);

                if (!res.ok) {
                    throw new Error(`Failed to fetch product: ${res.status}`);
                }

                const data = await res.json();
                console.log("Product data received:", data);

                // Normalize the data with price handling
                const formatted = {
                    id: id,
                    title: data.title || "Unknown Product",
                    description: data.description || "No description available",
                    price: typeof data.price === 'number' ? data.price : 0,
                    image: isDummy ? data.thumbnail : (data.image || "https://via.placeholder.com/150"),
                    category: data.category || "Uncategorized"
                };

                setProduct(formatted);
            } catch (error) {
                console.error("Error fetching product detail:", error);
                setError(error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProduct();
        setAddedToCart(false);
    }, [id]);

    // Add new review to the list
    const handleAddReview = () => {
        if (newReview.trim()) {
            setReviews([...reviews, "⭐️⭐️⭐️⭐️⭐️ - " + newReview.trim()]);
            setNewReview("");
        }
    };

    const handleAddToCart = () => {
        if (product) {
            addToCart(product);
            setAddedToCart(true);

            // Reset the "Added" message after 3 seconds
            setTimeout(() => {
                setAddedToCart(false);
            }, 3000);
        }
    };

    if (isLoading) return <p className="loading-message">Loading product...</p>;
    if (error) return <p className="error-message">Error: {error}</p>;
    if (!product) return <p className="not-found-message">Product not found</p>;

    // Format price safely
    const displayPrice = typeof product.price === 'number' ?
        `$${product.price.toFixed(2)}` : '$0.00';

    return (
        <div className="product-detail">
            {/* Left Column: image + reviews */}
            <div className="left-column">
                <img
                    src={product.image}
                    alt={product.title}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/150'
                    }}
                />

                <div className="reviews-section">
                    <h3>Customer Reviews</h3>
                    <ul>
                        {reviews.map((review, idx) => (
                            <li key={idx}>{review}</li>
                        ))}
                    </ul>

                    {/* Textbox for new reviews */}
                    <div className="add-review">
                        <textarea
                            placeholder="Write a review..."
                            value={newReview}
                            onChange={(e) => setNewReview(e.target.value)}
                        />
                        <button onClick={handleAddReview}>Submit Review</button>
                    </div>
                </div>
            </div>

            {/* Right Column: product info */}
            <div className="right-column">
                <h2>{product.title}</h2>
                <p className="price">{displayPrice}</p>
                <p>{product.description}</p>
                <button
                    className="add-to-cart-btn"
                    onClick={handleAddToCart}
                    disabled={loading || addedToCart}
                >
                    {loading ? "Adding..." : addedToCart ? "Added to Cart!" : "Add to Cart"}
                </button>
            </div>
        </div>
    );
};

export default ProductDetail;