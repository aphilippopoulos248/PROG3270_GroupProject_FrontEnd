import React, { useEffect } from "react";
import "../styles/BubbleAnimation.css";

function BubbleAnimation() {
    useEffect(() => {
        const container = document.querySelector(".bubble-container");
        if (!container) return;

        const intervalId = setInterval(() => {
            createBubble(container);
        }, 800);

        return () => clearInterval(intervalId);
    }, []);


    //Create bubbles for animation
    const createBubble = (container) => {
        const bubble = document.createElement("span");
        bubble.className = "bubble";

        const containerRect = container.getBoundingClientRect();
        const x = Math.random() * containerRect.width;
        const y = containerRect.height + 50;
        bubble.style.left = x + "px";
        bubble.style.top = y + "px";

        //Generate random size for bubble
        const size = 20 + Math.random() * 60;
        bubble.style.width = size + "px";
        bubble.style.height = size + "px";

        //Generate random animation duration
        container.appendChild(bubble);

        //Remove bubble after animation
        setTimeout(() => {
            bubble.remove();
        }, 6000);
    };

    return null;
}

export default BubbleAnimation;
