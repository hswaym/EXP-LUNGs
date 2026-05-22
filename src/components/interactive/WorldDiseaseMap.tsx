"use client";

import { motion } from "framer-motion";

const HOTSPOTS = [
    { name: "China (High Smog/COPD)", cx: 70, cy: 30, color: "#FF3B3B", size: 6 },
    { name: "India (Air Quality Crisis)", cx: 65, cy: 45, color: "#DC143C", size: 8 },
    { name: "USA (Asthma Prevelance)", cx: 20, cy: 35, color: "#FFB800", size: 4 },
    { name: "Eastern Europe (Smoking)", cx: 55, cy: 25, color: "#FF3B3B", size: 5 },
    { name: "Sub-Saharan Africa (Pneumonia)", cx: 52, cy: 55, color: "#DC143C", size: 7 },
];

export default function WorldDiseaseMap() {
    return (
        <div className="relative w-full max-w-[800px] aspect-[4/3] md:aspect-[2/1] mx-auto opacity-90 drop-shadow-[0_0_15px_rgba(220,20,60,0.1)] card-glass rounded-xl overflow-hidden p-6 md:p-8">
            <h3 className="font-display text-[18px] font-medium text-white/90 mb-4 absolute top-6 left-6 z-10">
                Global Respiratory Burden Hotspots
            </h3>

            <svg
                viewBox="0 0 100 60"
                className="w-full h-full mt-4"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Extremely Simplified Abstract World Map Base for minimalist medical aesthetic */}
                <path
                    d="M 10 10 Q 20 5 30 15 T 40 30 Q 30 45 20 40 T 10 10 M 45 5 Q 60 5 70 20 T 90 25 Q 70 40 60 45 T 45 5 M 48 20 Q 55 35 52 45 T 40 40"
                    fill="rgba(255,255,255,0.02)"
                    stroke="rgba(255,255,255,0.10)"
                    strokeWidth="0.5"
                />

                {HOTSPOTS.map((spot, idx) => (
                    <g key={spot.name}>
                        {/* Pulse Ring */}
                        <motion.circle
                            cx={spot.cx}
                            cy={spot.cy}
                            r={spot.size * 0.4}
                            fill="none"
                            stroke={spot.color}
                            strokeWidth="0.5"
                            initial={{ scale: 1, opacity: 0.8 }}
                            animate={{ scale: 4, opacity: 0 }}
                            transition={{
                                duration: 2.5,
                                repeat: Infinity,
                                delay: idx * 0.4,
                                ease: "easeOut"
                            }}
                        />
                        {/* Solid Core Element */}
                        <circle
                            cx={spot.cx}
                            cy={spot.cy}
                            r={spot.size * 0.25}
                            fill={spot.color}
                            className="drop-shadow-[0_0_8px_currentColor]"
                        />
                    </g>
                ))}
            </svg>

            {/* Legend */}
            <div className="absolute bottom-6 left-6 flex flex-wrap gap-4 text-[10px] font-mono uppercase tracking-widest text-[rgba(255,255,255,0.4)]">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#DC143C]"></span> Critical
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#FF3B3B]"></span> Severe
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#FFB800]"></span> Warning
                </div>
            </div>
        </div>
    );
}
