import React, { useEffect, useState } from "react";
import "../styles/Products.css";
import bannerImage from '../assets/vibe-stitch.png';
import {Link} from "react-router-dom";

function Products() {
    const [products, setProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("all");

    // Categories for our products
    const categoryLabels = [
        "all",
        "women's clothing",
        "men's clothing",
        "shoes",
        "sunglasses",
        "fragrance"
    ];

    // Map API categories to our navbar categories
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
                // Fetch API Data from fakestoreapi.com
                const fakeRes = await fetch("https://localhost:7223/api/products");
                const fakeData = await fakeRes.json();

                // Filter fakestoreapi products by category
                const filteredFakeProducts = fakeData
                    .filter(item =>
                        ["women's clothing", "men's clothing", "fragrance"].includes(item.category)
                    )
                    .map(item => ({
                        ...item,
                        category: categoryMap[item.category] || item.category
                    }));

                // fetch dummy products from dummyjson.com
                const dummyCategories = [
                    "womens-dresses",
                    "mens-shirts",
                    "mens-shoes",
                    "sunglasses",
                    "fragrances"
                ];

                const dummyFetches = await Promise.all(
                    dummyCategories.map((cat) =>
                        fetch(`https://dummyjson.com/products/category/${cat}?limit=50`)
                            .then((res) => res.json())
                    )
                );

                const dummyProducts = dummyFetches.flatMap((res, i) =>
                    res.products.map((item) => ({
                        id: `dummy-${item.id}`,
                        title: item.title,
                        description: item.description,
                        price: item.price,
                        image: item.thumbnail,
                        category: categoryMap[dummyCategories[i]]
                    }))
                );

                const combined = [...filteredFakeProducts, ...dummyProducts];
                setProducts(combined);
        };

        fetchProducts();
    }, []);

    // filter products by selected category
    const filteredProducts =
        selectedCategory === "all"
            ? products
            : products.filter((product) => product.category === selectedCategory);

    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
    };

    return (
        <div className="products-page">
            {/* Header Image*/}
            <div
                className="hero"
                style={{
                    backgroundImage: `url(${bannerImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    width: '100%',
                    minHeight: '300px',
                    color: '#fff',
                    textAlign: 'center',
                    padding: '80px 20px',
                    borderRadius: '12px',
                    marginBottom: '30px',
                    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)'
                }}
            >
            </div>

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
                        <Link to={`/product/${product.id}`} className="product-card">
                            <img src={product.image} alt={product.title} className="product-image" />
                            <div className="product-info">
                                <h2 className="product-title">{product.title}</h2>
                                <p className="product-price">${product.price}</p>
                                <button className="buy-button">Add to Cart</button>
                            </div>
                        </Link>
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