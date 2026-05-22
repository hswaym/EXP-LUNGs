"use client";

import { motion, useScroll, useVelocity, useSpring, useTransform, useAnimationFrame, useMotionValue } from "framer-motion";
import { useRef } from "react";

export default function CirculatoryFlow() {
    const containerRef = useRef<HTMLDivElement>(null);

    // Global scroll context to capture scrolling velocity
    const { scrollY } = useScroll();
    const scrollVelocity = useVelocity(scrollY);
    const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });

    // Transform the raw velocity into a speed multiplier.
    const velocityFactor = useTransform(smoothVelocity, [-1000, 0, 1000], [5, 0, 5], { clamp: false });

    // Component visibility context
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "center center"],
    });
    const opacity = useTransform(scrollYProgress, [0, 0.4, 1], [0, 0.5, 1]);

    // Accumulator for the dash offset to create an endless flowing river of blood
    const pathOffset = useMotionValue(0);

    useAnimationFrame(() => {
        // Base resting flow speed is 0.5
        // Add the absolute velocity multiplier so scrolling (up or down) speeds up the flow
        const speed = 0.5 + Math.abs(velocityFactor.get());
        pathOffset.set(pathOffset.get() - speed);
    });

    return (
        <motion.div ref={containerRef} style={{ opacity }} className="w-full flex items-center justify-center py-10">
            <svg width="100%" height="auto" viewBox="0 0 600 400" fill="none" className="drop-shadow-[0_0_20px_rgba(220,20,60,0.3)] max-w-[600px]">

                {/* 
          Pulmonary Artery Network 
          (Carries deoxygenated blood FROM heart strictly TO the lungs - hence BLUE aesthetically in medical diagrams) 
        */}
                <motion.path
                    d="M 300 250 Q 200 150 100 200 T 50 100" // Flowing OUT to left lung fringes
                    stroke="#1E40AF" // var(--color-accent-cobalt)
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray="20 15"
                    style={{ strokeDashoffset: pathOffset }}
                    className="opacity-80 drop-shadow-[0_0_8px_rgba(30,64,175,0.8)]"
                />
                <motion.path
                    d="M 300 250 Q 400 150 500 200 T 550 100" // Flowing OUT to right lung fringes
                    stroke="#1E40AF"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray="20 15"
                    style={{ strokeDashoffset: pathOffset }}
                    className="opacity-80 drop-shadow-[0_0_8px_rgba(30,64,175,0.8)]"
                />

                {/* 
          Pulmonary Vein Network
          (Carries oxygenated blood fully saturated FROM lungs strictly TO heart - hence RED) 
        */}
                <motion.path
                    d="M 80 80 Q 150 150 250 220" // Flowing IN from left lung back to center
                    stroke="#DC143C" // var(--color-accent-crimson)
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray="15 10"
                    // Transform so the offset runs in the opposite visual direction on the SVG path coordinates
                    style={{ strokeDashoffset: useTransform(pathOffset, v => -v) }}
                    className="opacity-90 drop-shadow-[0_0_8px_rgba(220,20,60,0.8)]"
                />
                <motion.path
                    d="M 520 80 Q 450 150 350 220" // Flowing IN from right lung back to center
                    stroke="#DC143C"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray="15 10"
                    style={{ strokeDashoffset: useTransform(pathOffset, v => -v) }}
                    className="opacity-90 drop-shadow-[0_0_8px_rgba(220,20,60,0.8)]"
                />

            </svg>
        </motion.div>
    );
}
