"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";

interface AnimatedCounterProps {
    value: number;
    label: string;
    suffix?: string;
    duration?: number;
}

export default function AnimatedCounter({ value, label, suffix = "", duration = 2.5 }: AnimatedCounterProps) {
    const ref = useRef<HTMLDivElement>(null);

    // Trigger exactly once when it scrolls into the viewport
    const isInView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });

    const [count, setCount] = useState(0);

    useEffect(() => {
        if (isInView) {
            let startTime: number | null = null;
            let animationFrame: number;

            const animate = (time: number) => {
                if (!startTime) startTime = time;
                const rawProgress = (time - startTime) / (duration * 1000);
                const progress = Math.min(rawProgress, 1);

                // easeOutQuart for a dramatic, cinematic deceleration
                const easeProgress = 1 - Math.pow(1 - progress, 4);

                setCount(Math.floor(easeProgress * value));

                if (progress < 1) {
                    animationFrame = requestAnimationFrame(animate);
                }
            };

            animationFrame = requestAnimationFrame(animate);

            return () => cancelAnimationFrame(animationFrame);
        }
    }, [isInView, value, duration]);

    const formattedCount = count.toLocaleString("en-US");

    return (
        <div ref={ref} className="flex flex-col items-center justify-center p-6 group cursor-default">
            <div className="relative">
                <motion.span
                    initial={{ opacity: 0, y: 30, filter: "blur(4px)" }}
                    animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
                    transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }} // APPLE_SPRING equivalent
                    className="font-display text-[64px] md:text-[80px] font-bold text-gradient-heading tracking-tighter leading-none block"
                >
                    {formattedCount}
                    <span className="text-[32px] md:text-[40px] text-white/50 font-medium ml-2">
                        {suffix}
                    </span>
                </motion.span>

                {/* Subtle hover/in-view glow */}
                <div className="absolute inset-0 bg-accent-warm/10 blur-[50px] z-[-1] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            </div>

            <motion.p
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 1.0, delay: 0.4 }}
                className="font-mono text-[13px] md:text-[15px] uppercase tracking-[0.2em] text-[#00D6FF] mt-6 font-semibold text-center"
            >
                {label}
            </motion.p>
        </div>
    );
}
