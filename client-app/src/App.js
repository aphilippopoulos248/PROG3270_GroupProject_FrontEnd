import React from "react";
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom"; // Import Link here
import logo from "./logo.svg";
import "./App.css";
import Home from "./Home"; // Make sure these components are created
import About from "./About";

function App() {
    // State to store weather data
    const [weatherData, setWeatherData] = useState([]);

    // Fetch weather forecast data from the API when the component mounts
    useEffect(() => {
        // Replace with your backend API URL (the route to the GetWeatherForecast endpoint)
        fetch("https://localhost:7223/weatherforecast")
            .then((response) => response.json()) // Parse the response as JSON
            .then((data) => setWeatherData(data)) // Set the data to the state
            .catch((error) => console.error("Error fetching weather data:", error)); // Handle errors
    }, []); // Empty dependency array ensures this effect runs once when the component mounts

    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <p>Our Group Project</p>
                <p>Created by Alexander, Chanelle, and Kenan</p>
            </header>
            <main>
                <Router>
                    {/* Navigation Links */}
                    <nav>
                        <Link to="/" className="App-link">
                            Home
                        </Link>{" "}
                        |{" "}
                        <Link to="/about" className="App-link">
                            About
                        </Link>
                    </nav>
                    {/* Define Routes */}
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/about" element={<About />} />
                    </Routes>
                </Router>
                <div>
                    <h1>Weather Forecast</h1>
                    <ul>
                        {/* Iterate over the weather data and display each forecast */}
                        {weatherData.map((forecast, index) => (
                            <li key={index}>
                                <p>Date: {forecast.date}</p>
                                <p>Temperature: {forecast.temperatureC}�C / {forecast.temperatureF}�F</p>
                                <p>Summary: {forecast.summary}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </main>
        </div>
    );
}

export default App;
