"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function BronchialDiagram() {
    const containerRef = useRef<HTMLDivElement>(null);

    // Track scroll specifically for the component's visibility timeline
    // The path draws itself as the user scrolls over this section
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "center center"],
    });

    // Grow path from 0 to 1 based on scroll
    const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);
    // Fade in the glow as it draws
    const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.2, 0.8, 1]);

    return (
        <motion.div
            ref={containerRef}
            style={{ opacity }}
            className="w-full flex items-center justify-center py-10"
        >
            <svg
                width="100%"
                height="auto"
                viewBox="0 0 600 400"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-[0_0_25px_rgba(0,214,255,0.25)] max-w-[600px]"
            >
                {/* 
          Architectural Generation Diagram 
          Trachea (Gen 0) -> Primary Bronchi (Gen 1) -> Lobar (Gen 2) -> Segmental (Gen 3) 
        */}

                {/* Generation 0: Trachea */}
                <motion.path
                    d="M 300 20 L 300 120"
                    stroke="#00D6FF"
                    strokeWidth="12"
                    strokeLinecap="round"
                    style={{ pathLength }}
                />

                {/* Generation 1: Primary Bronchi */}
                <motion.path
                    d="M 300 120 L 180 200"
                    stroke="#00D6FF"
                    strokeWidth="10"
                    strokeLinecap="round"
                    style={{ pathLength }}
                />
                <motion.path
                    d="M 300 120 L 420 200"
                    stroke="#00D6FF"
                    strokeWidth="10"
                    strokeLinecap="round"
                    style={{ pathLength }}
                />

                {/* Generation 2: Lobar Bronchi (Left Lung has 2, Right Lung has 3) */}
                {/* Left (patient left = right side of screen) */}
                <motion.path d="M 420 200 L 480 270" stroke="rgba(255,255,255,0.9)" strokeWidth="6" strokeLinecap="round" style={{ pathLength }} />
                <motion.path d="M 420 200 L 460 290" stroke="rgba(255,255,255,0.9)" strokeWidth="6" strokeLinecap="round" style={{ pathLength }} />

                {/* Right (patient right = left side of screen) */}
                <motion.path d="M 180 200 L 120 270" stroke="rgba(255,255,255,0.9)" strokeWidth="6" strokeLinecap="round" style={{ pathLength }} />
                <motion.path d="M 180 200 L 140 290" stroke="rgba(255,255,255,0.9)" strokeWidth="6" strokeLinecap="round" style={{ pathLength }} />
                <motion.path d="M 180 200 L 190 280" stroke="rgba(255,255,255,0.9)" strokeWidth="6" strokeLinecap="round" style={{ pathLength }} />

                {/* Generation 3: Segmental Bronchioles */}
                <motion.path d="M 120 270 L 80 340" stroke="rgba(255,255,255,0.6)" strokeWidth="3" strokeLinecap="round" style={{ pathLength }} />
                <motion.path d="M 120 270 L 110 350" stroke="rgba(255,255,255,0.6)" strokeWidth="3" strokeLinecap="round" style={{ pathLength }} />
                <motion.path d="M 140 290 L 150 360" stroke="rgba(255,255,255,0.6)" strokeWidth="3" strokeLinecap="round" style={{ pathLength }} />
                <motion.path d="M 190 280 L 220 350" stroke="rgba(255,255,255,0.6)" strokeWidth="3" strokeLinecap="round" style={{ pathLength }} />

                <motion.path d="M 480 270 L 520 340" stroke="rgba(255,255,255,0.6)" strokeWidth="3" strokeLinecap="round" style={{ pathLength }} />
                <motion.path d="M 480 270 L 490 350" stroke="rgba(255,255,255,0.6)" strokeWidth="3" strokeLinecap="round" style={{ pathLength }} />
                <motion.path d="M 460 290 L 450 360" stroke="rgba(255,255,255,0.6)" strokeWidth="3" strokeLinecap="round" style={{ pathLength }} />
            </svg>
        </motion.div>
    );
}
