"use client";

import { motion } from "framer-motion";

interface SeverityDisplayProps {
    score: number; // 0 to 100
    label: string;
    left: number;
    right: number;
}

export default function SeverityDisplay({ score, label, left, right }: SeverityDisplayProps) {
    const getSeverityColor = (s: number) => {
        if (s < 30) return "#00FF88"; // Healthy green
        if (s < 70) return "#FFB800"; // Caution amber
        return "#FF3B3B"; // Pathology red
    };

    const color = getSeverityColor(score);

    return (
        <div className="space-y-8">
            <div className="flex flex-col items-center text-center">
                <div className="relative size-40 mb-4">
                    {/* Background Ring */}
                    <svg className="size-full -rotate-90">
                        <circle
                            cx="80" cy="80" r="70"
                            fill="transparent"
                            stroke="rgba(255,255,255,0.05)"
                            strokeWidth="12"
                        />
                        <motion.circle
                            cx="80" cy="80" r="70"
                            fill="transparent"
                            stroke={color}
                            strokeWidth="12"
                            strokeDasharray="440"
                            initial={{ strokeDashoffset: 440 }}
                            animate={{ strokeDashoffset: 440 - (440 * score) / 100 }}
                            transition={{ duration: 2, ease: "easeOut" }}
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-black text-white">{score}%</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Involvement</span>
                    </div>
                    {/* Outer Glow */}
                    <div className="absolute inset-4 rounded-full blur-2xl opacity-20 pointer-events-none" style={{ backgroundColor: color }} />
                </div>
                <h4 className="font-display text-2xl font-bold" style={{ color }}>{label}</h4>
            </div>

            <div className="grid grid-cols-2 gap-6 w-full">
                <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-text-label">Left Lung</span>
                        <span className="text-lg font-mono font-bold text-white">{left}%</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${left}%` }}
                            transition={{ duration: 1.5, delay: 0.5 }}
                            className="h-full bg-accent-cool"
                        />
                    </div>
                </div>
                <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-text-label">Right Lung</span>
                        <span className="text-lg font-mono font-bold text-white">{right}%</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${right}%` }}
                            transition={{ duration: 1.5, delay: 0.7 }}
                            className="h-full bg-accent-warm"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
