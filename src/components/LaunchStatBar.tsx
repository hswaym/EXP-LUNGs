"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, animate } from "framer-motion";

interface StatProps {
    value: number;
    suffix: string;
    label: string;
    delay: number;
    show: boolean;
}

function StatItem({ value, suffix, label, delay, show }: StatProps) {
    const [display, setDisplay] = useState(0);
    const count = useMotionValue(0);

    useEffect(() => {
        if (!show) return;
        const controls = animate(count, value, {
            duration: 2,
            delay: delay,
            ease: "easeOut",
            onUpdate: (latest) => setDisplay(Math.floor(latest))
        });
        return controls.stop;
    }, [show, value, delay, count]);

    return (
        <div className="flex flex-col items-center">
            <span className="font-mono font-bold text-[40px] md:text-[48px] bg-gradient-to-br from-accent-warm to-[#FF8C61] bg-clip-text text-transparent">
                {display.toLocaleString()}{suffix}
            </span>
            <span className="font-mono text-[12px] font-semibold tracking-[0.2em] text-black/40 uppercase mt-3 text-center">
                {label}
            </span>
        </div>
    );
}

export default function LaunchStatBar({ show }: { show: boolean }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={show ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 1.0, ease: "easeOut" }}
            className="w-full max-w-[880px] mx-auto mt-20 bg-white/60 backdrop-blur-xl border border-black/5 rounded-[24px] px-12 py-10 mb-32 pointer-events-auto shadow-[0_8px_32px_rgba(0,0,0,0.03)]"
        >
            <div className="flex flex-col md:flex-row justify-between items-center gap-10 md:gap-6">
                <StatItem show={show} value={300} suffix="M" label="Alveoli per lung" delay={1.1} />
                <div className="hidden md:block w-[1px] h-16 bg-black/10" />
                <StatItem show={show} value={1500} suffix="mi" label="Airways total" delay={1.2} />
                <div className="hidden md:block w-[1px] h-16 bg-black/10" />
                <StatItem show={show} value={23} suffix="" label="Bronchial generations" delay={1.3} />
                <div className="hidden md:block w-[1px] h-16 bg-black/10" />
                <StatItem show={show} value={480} suffix="M" label="COPD cases worldwide" delay={1.4} />
            </div>
        </motion.div>
    );
}
