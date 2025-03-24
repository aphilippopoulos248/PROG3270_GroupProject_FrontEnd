import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import "./App.css";
import AppContent from "./AppContent";

function App() {
    return (
        <div className="App">
            <Router>
                <AppContent />
            </Router>
        </div>
    );
}

export default App;
