"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import BreathingParticles from "./interactive/BreathingParticles";

interface LivingBackgroundProps {
    children: ReactNode;
    isAlive: boolean; // True when intro animation completes
}

export default function LivingBackground({ children, isAlive }: LivingBackgroundProps) {
    return (
        <div className="fixed inset-0 w-full h-full overflow-hidden bg-primary z-0 pointer-events-none">
            {/* The pulsing container */}
            <motion.div
                animate={
                    isAlive
                        ? { scale: [1.0, 1.015, 1.0] }
                        : { scale: 1.0 }
                }
                transition={{
                    duration: 4,
                    ease: "easeInOut",
                    repeat: Infinity,
                }}
                className="absolute inset-0 w-full h-full"
            >
                {/* The LaunchCanvas Sequence */}
                {children}

                {/* Internal Glow Pulse */}
                <motion.div
                    animate={
                        isAlive
                            ? { opacity: [0.85, 1.0, 0.85] }
                            : { opacity: 0 }
                    }
                    transition={{
                        duration: 4,
                        ease: "easeInOut",
                        repeat: Infinity,
                    }}
                    className="absolute inset-0 w-full h-full mix-blend-screen"
                    style={{
                        background: "radial-gradient(circle at 45% 45%, rgba(255,107,53,0.15) 0%, transparent 60%)"
                    }}
                />
            </motion.div>

            {/* Particle System - Runs continuously but subtle */}
            <div className="absolute inset-0 z-10 opacity-20 mix-blend-screen">
                <BreathingParticles className="opacity-100" />
            </div>

            {/* Shadow Vignette (adds depth and focus) */}
            <div 
                className="absolute inset-0 z-20 pointer-events-none"
                style={{
                    background: "radial-gradient(circle at center, transparent 30%, rgba(5,5,5,0.85) 100%)"
                }}
            />
        </div>
    );
}
