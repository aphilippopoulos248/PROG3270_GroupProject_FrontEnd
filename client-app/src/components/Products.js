// src/components/Products.js
import React, { useEffect, useState } from "react";
import "../styles/Products.css";
import bannerImage from "../assets/vibe-stitch.png";
import { Link } from "react-router-dom";
import dummyProducts from "../test/dummyProducts";

function Products({ addToCart }) {
    const [products, setProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("all");

    // Categories for our products.
    const categoryLabels = [
        "all",
        "women's clothing",
        "men's clothing",
        "shoes",
        "sunglasses",
        "fragrance"
    ];

    // Map API categories to our navbar categories.
    const categoryMap = {
        "women's clothing": "women's clothing",
        "womens-dresses": "women's clothing",
        "men's clothing": "men's clothing",
        "mens-shirts": "men's clothing",
        "mens-shoes": "shoes",
        "sunglasses": "sunglasses",
        "fragrances": "fragrance",
        "fragrance": "fragrance"
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Example: Fetch products from a fake API endpoint.
                const fakeRes = await fetch("https://localhost:7223/api/products");
                const fakeData = await fakeRes.json();

                // Filter fakestoreapi products by category.
                const filteredFakeProducts = fakeData
                    .filter((item) =>
                        ["women's clothing", "men's clothing", "fragrance"].includes(item.category)
                    )
                    .map((item) => ({
                        ...item,
                        category: categoryMap[item.category] || item.category,
                        // Feel free to adjust based on our API data.
                        id: item.id
                    }))
                    // Filter out products with undefined/null IDs
                    .filter(item => item.id !== undefined && item.id !== null);

                // Fetches dummy products from dummyjson.com.
                const dummyCategories = [
                    "womens-dresses",
                    "mens-shirts",
                    "mens-shoes",
                    "sunglasses",
                    "fragrances"
                ];

                const dummyFetches = await Promise.all(
                    dummyCategories.map((cat) =>
                        fetch(`https://dummyjson.com/products/category/${cat}?limit=50`).then((res) =>
                            res.json()
                        )
                    )
                );

                const dummyData = dummyFetches.flatMap((res, i) =>
                    res.products
                        .filter(item => item.id) // Ensure item has a valid ID
                        .map((item) => ({
                            id: `dummy-${item.id}`, // Prefix id to differentiate dummy products.
                            title: item.title || "Untitled Product",
                            description: item.description || "No description available",
                            price: typeof item.price === 'number' ? item.price : 0,
                            image: item.thumbnail || "https://via.placeholder.com/150",
                            category: categoryMap[dummyCategories[i]] || "Uncategorized"
                        }))
                );

                // This combines both product sets.
                const combined = [...filteredFakeProducts, ...dummyData];

                // Final validation to ensure all products have the required fields
                const validProducts = combined.filter(product =>
                    product &&
                    product.id !== undefined &&
                    product.id !== null &&
                    product.title &&
                    product.price !== undefined
                );

                console.log(`Filtered out ${combined.length - validProducts.length} invalid products`);
                setProducts(validProducts);
            } catch (error) {
                console.error("Error fetching products:", error);
                // This is a fallback to the local dummy data if API calls fail:
                // Also filter the dummy products to ensure they have valid IDs
                const validDummyProducts = dummyProducts.filter(product =>
                    product && product.id !== undefined && product.id !== null
                );
                setProducts(validDummyProducts);
            }
        };

        fetchProducts();
    }, []);

    // Rest of the component remains the same...

    // Filters products by selected category.
    const filteredProducts =
        selectedCategory === "all"
            ? products
            : products.filter((product) => product.category === selectedCategory);

    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
    };

    return (
        // JSX remains unchanged
        <div className="products-page">
            {/* Header Image */}
            <div
                className="hero"
                style={{
                    backgroundImage: `url(${bannerImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    width: "100%",
                    minHeight: "300px",
                    color: "#fff",
                    textAlign: "center",
                    padding: "80px 20px",
                    borderRadius: "12px",
                    marginBottom: "30px",
                    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.3)"
                }}
            ></div>

            {/* Categories */}
            <nav className="category-navbar">
                {categoryLabels.map((cat) => (
                    <a
                        key={cat}
                        href="#"
                        className={selectedCategory === cat ? "active" : ""}
                        onClick={(e) => {
                            e.preventDefault();
                            handleCategoryClick(cat);
                        }}
                    >
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </a>
                ))}
            </nav>

            {/* Product Cards */}
            <div className="products-grid">
                {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                        <div className="product-card" key={product.id}>
                            {/* Link to product details */}
                            <Link to={`/product/${product.id}`} className="product-link">
                                <img
                                    src={product.image}
                                    alt={product.title}
                                    className="product-image"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://via.placeholder.com/150'
                                    }}
                                />
                                <div className="product-info">
                                    <h2 className="product-title">{product.title}</h2>
                                    <p className="product-price">
                                        ${typeof product.price === 'number' ? product.price.toFixed(2) : '0.00'}
                                    </p>
                                </div>
                            </Link>
                            {/* The "Add to Cart" button */}
                            <button
                                className="buy-button"
                                onClick={(e) => {
                                    // Prevents the click from triggering the Link navigation.
                                    e.stopPropagation();
                                    e.preventDefault();
                                    addToCart(product);
                                }}
                            >
                                Add to Cart
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="no-products">
                        <p>No products available</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Products;