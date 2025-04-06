import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../styles/ProductDetail.css";

const ProductDetail = ({ addToCart, loading }) => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [addedToCart, setAddedToCart] = useState(false);

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
            try {
                // Detect
                const isDummy = id.startsWith("dummy-");
                const realId = isDummy ? id.replace("dummy-", "") : id;

                // Build the endpoint
                const url = isDummy
                    ? `https://dummyjson.com/products/${realId}`
                    : `https://localhost:7223/api/products/${realId}`;

                const res = await fetch(url);
                const data = await res.json();

                // Normalize
                const formatted = {
                    id: id,
                    title: data.title,
                    description: data.description,
                    price: data.price,
                    image: isDummy ? data.thumbnail : data.image,
                    category: data.category
                };

                setProduct(formatted);
            } catch (error) {
                console.error("Error fetching product detail:", error);
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

    if (!product) return <p>Loading product...</p>;

    return (
        <div className="product-detail">
            {/* Left Column: image + reviews */}
            <div className="left-column">
                <img src={product.image} alt={product.title} />

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
                <p className="price">${product.price.toFixed(2)}</p>
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