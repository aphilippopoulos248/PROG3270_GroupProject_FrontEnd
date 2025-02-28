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

    const createBubble = (container) => {
        const bubble = document.createElement("span");
        bubble.className = "bubble";

        const containerRect = container.getBoundingClientRect();
        const x = Math.random() * containerRect.width;
        const y = containerRect.height + 50;
        bubble.style.left = x + "px";
        bubble.style.top = y + "px";


        const size = 20 + Math.random() * 60;
        bubble.style.width = size + "px";
        bubble.style.height = size + "px";


        container.appendChild(bubble);


        setTimeout(() => {
            bubble.remove();
        }, 6000);
    };

    return null;
}

export default BubbleAnimation;
