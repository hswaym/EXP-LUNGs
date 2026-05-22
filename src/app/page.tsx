"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LaunchCanvas from "@/components/LaunchCanvas";
import LivingBackground from "@/components/LivingBackground";
import EmailCapture from "@/components/EmailCapture";
import LaunchStatBar from "@/components/LaunchStatBar";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";

export default function LaunchPage() {
    const [isAlive, setIsAlive] = useState(false);
    const [statusText, setStatusText] = useState("System under progress");
    const [isStatusLive, setIsStatusLive] = useState(false);
    const [quoteIndex, setQuoteIndex] = useState(0);

    const quotes = [
        "Every breath is a miracle.\nRespect the machinery.",
        "300 Million Alveoli.\nProcessing 11,000 Liters of Air Daily.",
        "U-Net Volumetric Core.\nQuantized float16 browser diagnostics."
    ];
    
    // Wire into Framer Motion's reduced motion detector
    const prefersReducedMotion = useReducedMotion();

    const handleSequenceComplete = useCallback(() => {
        setIsAlive(true);
    }, []);

    useEffect(() => {
        if (isAlive) {
            const timer = setTimeout(() => {
                setStatusText("System is Live");
                setIsStatusLive(true);
            }, 1800);
            return () => clearTimeout(timer);
        }
    }, [isAlive]);

    return (
        <main className="relative min-h-screen w-full bg-primary overflow-x-hidden selection:bg-accent-warm/30">
            
            {/* The Living Background (z-0) */}
            <LivingBackground isAlive={isAlive}>
                <LaunchCanvas 
                    onSequenceComplete={handleSequenceComplete} 
                    prefersReducedMotion={prefersReducedMotion} 
                />
            </LivingBackground>

            {/* Content Overlay (z-30) */}
            <div className="relative z-30 w-full min-h-screen flex flex-col pointer-events-none">
                
                {/* Hero Section */}
                <AnimatePresence>
                    {isAlive && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1.2 }}
                            className="flex-1 w-full flex flex-col mt-40 md:mt-56 pointer-events-auto"
                        >
                            <div className="w-full text-center px-8 md:px-12">
                                <motion.span 
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                                    className={`block font-mono text-[11px] md:text-[13px] tracking-[0.4em] uppercase mb-8 transition-all duration-700 ${
                                        isStatusLive 
                                            ? "text-accent-cool font-bold drop-shadow-[0_0_10px_rgba(0,214,255,0.4)]" 
                                            : "text-amber-500 font-medium animate-pulse"
                                    }`}
                                >
                                    {statusText}
                                </motion.span>
                                
                                <motion.h1 
                                    initial={{ opacity: 0, filter: "blur(10px)", y: 20 }}
                                    animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                                    transition={{ duration: 1.2, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                                    className="font-display text-[56px] md:text-[112px] font-bold text-gradient-heading leading-[1.0] tracking-tight mb-10 mx-auto max-w-[1000px] text-shadow-smart"
                                >
                                    EXPLung <br/> PULMONARY AI
                                </motion.h1>

                                <motion.p 
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
                                    className="text-[18px] md:text-[24px] font-body text-white/60 max-w-[750px] mx-auto leading-relaxed mb-12"
                                >
                                    The world&apos;s most immersive digital repository of pulmonary anatomy and neural diagnostics.
                                </motion.p>
                            </div>

                            <EmailCapture />

                            <LaunchStatBar show={isAlive} />
                            
                            {/* Footer */}
                            <motion.footer 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 1, delay: 1.5 }}
                                className="w-full py-24 text-center mt-auto flex flex-col items-center justify-center"
                            >
                                <button
                                    onClick={() => {
                                        setQuoteIndex((prev) => (prev + 1) % quotes.length);
                                    }}
                                    className="group font-mono text-[11px] uppercase tracking-[0.3em] text-white/30 hover:text-accent-cool transition-all duration-300 leading-loose focus:outline-none cursor-pointer border border-transparent hover:border-white/10 hover:bg-white/[0.02] p-5 rounded-2xl max-w-md"
                                >
                                    {quotes[quoteIndex].split("\n").map((line, idx) => (
                                        <span key={idx} className="block">
                                            {line}
                                        </span>
                                    ))}
                                    <span className="block text-[8px] text-white/10 uppercase tracking-widest mt-3 transition-colors group-hover:text-accent-cool/55">
                                        [ Click to cycle telemetry specs ]
                                    </span>
                                </button>
                            </motion.footer>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
}
