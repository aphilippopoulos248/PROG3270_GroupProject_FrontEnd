// src/components/TestingButton.js
import React from 'react';
import { useNavigate } from "react-router-dom";

// Remove this in the final build, this is a test implement.
const TestingButton = () => {
    const navigate = useNavigate();
  
    const handleClick = () => {
      navigate("/home");
    };

  return (
    <button
      onClick={handleClick}
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '50px',
        height: '50px',
        backgroundColor: 'transparent',
        border: 'none',
        opacity: 1,
        cursor: 'pointer',
        zIndex: 9999,
      }}
      aria-label="Test Button"
    >
      <span className="sr-only">Test</span>
    </button>
  );
};

export default TestingButton;
