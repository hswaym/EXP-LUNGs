"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { APPLE_SPRING } from "@/components/Typography";

const DATA_POINTS = [
    { id: 'TLC', x: 20, y: 150, label: "Total Lung Capacity", desc: "Volume of air in lungs after maximal inspiration (~6.0L). Represents the absolute limit of the container." },
    { id: 'PEF', x: 80, y: 30, label: "Peak Expiratory Flow", desc: "Maximum flow rate achieved during a wildly forced expiration maneuver. Drops sharply in obstructive diseases like COPD." },
    { id: 'FEV1', x: 140, y: 70, label: "FEV1", desc: "Forced Expiratory Volume in 1 second. The golden metric for diagnosing asthma and tracing lung function decline." },
    { id: 'RV', x: 260, y: 150, label: "Residual Volume", desc: "Volume remaining in the lungs even after maximum expiration (~1.2L). Prevents alveolar collapse." },
    { id: 'PIF', x: 150, y: 260, label: "Peak Inspiratory Flow", desc: "Maximum flow rate during forced inspiration. Usually symmetric and dependent on pure muscular effort." },
];

export default function SpirometrySimulator() {
    const [activePoint, setActivePoint] = useState<string | null>(null);

    // SVG Flow-Volume Loop Path (Exhale up, Inhale down)
    const pathData = "M 20 150 C 20 40, 60 30, 80 30 C 120 30, 200 120, 260 150 C 260 250, 180 260, 150 260 C 100 260, 20 200, 20 150 Z";

    return (
        <div className="relative w-full max-w-[600px] aspect-square mx-auto card-glass rounded-2xl p-8 flex flex-col items-center justify-center">
            <div className="absolute top-8 left-8 right-8 flex justify-between items-start">
                <h3 className="font-display text-[20px] font-medium text-white/95">
                    Flow-Volume Loop (Healthy)
                </h3>
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#00D6FF] border border-[#00D6FF]/20 px-3 py-1 rounded-full">
                    Interactive
                </span>
            </div>

            <div className="relative w-full aspect-square md:h-[350px] mt-12 flex items-center justify-center">
                {/* Graph Axes */}
                <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/10" />
                <div className="absolute top-0 bottom-0 left-[20%] w-[1px] bg-white/10" />

                {/* Labels for Axes */}
                <span className="absolute left-[20%] -ml-2 -top-6 font-mono text-[10px] text-white/40 rotate-90 origin-left">Flow (L/s) Exhale +</span>
                <span className="absolute left-[20%] -ml-2 -bottom-4 font-mono text-[10px] text-white/40 rotate-90 origin-left">Inhale -</span>
                <span className="absolute right-0 top-1/2 mt-2 font-mono text-[10px] text-white/40">Volume (L)</span>

                <svg viewBox="0 0 300 300" className="w-[85%] h-[85%] overflow-visible drop-shadow-[0_0_15px_rgba(0,214,255,0.2)] ml-4">
                    {/* Main Loop Path */}
                    <motion.path
                        d={pathData}
                        fill="rgba(0,214,255,0.1)"
                        stroke="#00D6FF"
                        strokeWidth="3"
                        strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        whileInView={{ pathLength: 1, opacity: 1 }}
                        viewport={{ once: false, margin: "-10% 0px -10% 0px" }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                    />

                    {/* Interactive Data Points */}
                    {DATA_POINTS.map((pt) => {
                        const isActive = activePoint === pt.id;
                        return (
                            <g
                                key={pt.id}
                                className="cursor-pointer"
                                shadow-sm
                                onMouseEnter={() => setActivePoint(pt.id)}
                                onMouseLeave={() => setActivePoint(null)}
                            >
                                {/* Hit area */}
                                <circle cx={pt.x} cy={pt.y} r={20} fill="transparent" />

                                {/* Visual point */}
                                <circle
                                    cx={pt.x}
                                    cy={pt.y}
                                    r={8}
                                    fill={isActive ? "#E85A2A" : "#0A0A0C"}
                                    stroke={isActive ? "#E85A2A" : "#00D6FF"}
                                    strokeWidth="2"
                                    className="transition-colors duration-300"
                                />
                                <text
                                    x={pt.x}
                                    y={pt.y - 15}
                                    fill={isActive ? "white" : "rgba(255,255,255,0.6)"}
                                    fontSize="12"
                                    fontWeight="bold"
                                    textAnchor="middle"
                                    className="font-mono transition-all duration-300"
                                >
                                    {pt.id}
                                </text>
                            </g>
                        );
                    })}
                </svg>

                {/* Dynamic Tooltip */}
                <AnimatePresence>
                    {activePoint && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2, ease: APPLE_SPRING }}
                            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90%] card-glass rounded-xl p-5 border border-accent-warm/20 bg-black/80 backdrop-blur-xl z-20 drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                        >
                            <h4 className="font-display text-[16px] font-semibold text-accent-warm mb-1">
                                {DATA_POINTS.find(p => p.id === activePoint)?.label}
                            </h4>
                            <p className="font-body text-[13px] text-white/80 leading-relaxed">
                                {DATA_POINTS.find(p => p.id === activePoint)?.desc}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
