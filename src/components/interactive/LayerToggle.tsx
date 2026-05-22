"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { APPLE_SPRING } from "@/components/Typography";

const LAYERS = [
    { id: "lobes", label: "Lobes", color: "#F0E6D3", desc: "The primary organ divisions filtering air." },
    { id: "bronchi", label: "Bronchi", color: "#00D6FF", desc: "The branching airway network." },
    { id: "arteries", label: "Arteries", color: "#1E40AF", desc: "Deoxygenated blood arriving for gas exchange." },
    { id: "veins", label: "Veins", color: "#DC143C", desc: "Oxygen-rich blood returning to scale." },
    { id: "lymphatics", label: "Lymphatics", color: "#00FF88", desc: "Immune system drainage and filtering." },
    { id: "nerves", label: "Nerves", color: "#FBBF24", desc: "Autonomic control of airway dilation." },
];

export default function LayerToggle() {
    const [activeLayer, setActiveLayer] = useState<string | null>(null);

    return (
        <div className="card-glass w-full max-w-[400px] p-6 md:p-8 rounded-2xl flex flex-col gap-6 backdrop-blur-3xl">
            <div className="flex justify-between items-center z-10">
                <h3 className="font-display text-[20px] font-semibold text-white">
                    Isolation Matrix
                </h3>
                <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-accent-cool border border-accent-cool/30 px-2 py-1 rounded-sm">
                    Select View
                </span>
            </div>

            <div className="grid grid-cols-2 gap-3 z-10">
                {LAYERS.map((layer) => {
                    const isActive = activeLayer === layer.id;

                    return (
                        <button
                            key={layer.id}
                            onClick={() => setActiveLayer(isActive ? null : layer.id)}
                            className="relative p-3 rounded-xl border transition-all duration-300 overflow-hidden group text-left flex items-center gap-3 backdrop-blur-sm"
                            style={{
                                borderColor: isActive ? layer.color : "rgba(255,255,255,0.08)",
                                backgroundColor: isActive ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.2)"
                            }}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="layer-glow"
                                    className="absolute inset-0 z-0 mix-blend-screen"
                                    style={{ backgroundColor: `${layer.color}15` }}
                                    transition={{ ease: APPLE_SPRING, duration: 0.8 }}
                                />
                            )}

                            <div
                                className="relative z-10 w-3 h-3 rounded-full border border-white/20 transition-all duration-500 shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                                style={{
                                    backgroundColor: isActive ? layer.color : "transparent",
                                    borderColor: isActive ? "transparent" : "rgba(255,255,255,0.2)",
                                    boxShadow: isActive ? `0 0 12px ${layer.color}` : "none"
                                }}
                            />
                            <span className={`relative z-10 font-mono text-[11px] uppercase tracking-widest transition-colors duration-300 ${isActive ? "text-white" : "text-white/40 group-hover:text-white/70"}`}>
                                {layer.label}
                            </span>
                        </button>
                    );
                })}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeLayer || "empty"}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.3 }}
                    className="relative z-10 min-h-[40px]"
                >
                    {activeLayer ? (
                        <p className="font-body text-[13px] text-white/70 pt-4 border-t border-white/10">
                            <span className="font-semibold text-white/90 mr-2">System Active:</span>
                            {LAYERS.find(l => l.id === activeLayer)?.desc}
                        </p>
                    ) : (
                        <p className="font-body text-[13px] text-white/30 pt-4 border-t border-white/10 italic">
                            Canvas sequence synced to global scroll.
                        </p>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
