"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { APPLE_SPRING } from "@/components/Typography";
import { AlertTriangle, Wind, Flame, ShieldAlert, ActivitySquare } from "lucide-react";

const DISEASES = [
    {
        name: "COPD",
        riskLevel: "Critical",
        color: "#DC143C", // Crimson
        stats: "3.2M deaths/yr",
        icon: <Wind className="w-5 h-5" />,
        mechanism: "Chronic inflammation destroys the elastic fibers of the bronchioles and alveolar walls. As the lungs lose their recoil, airways collapse during exhalation, trapping dead air and preventing fresh oxygen intake.",
        triggers: ["Tobacco Smoke", "Indoor Air Pollution", "Occupational Dust"]
    },
    {
        name: "Asthma",
        riskLevel: "Moderate to Severe",
        color: "#FFB800", // Warning yellow
        stats: "262M affected",
        icon: <ActivitySquare className="w-5 h-5" />,
        mechanism: "An extreme immune response causes rapid inflammation of the mucosal lining, hypersecretion of thick mucus, and violent spasms of the smooth airway muscles, effectively strangling the bronchiole tubes.",
        triggers: ["Allergens", "Cold Air", "Exercise", "Infections"]
    },
    {
        name: "Pneumonia",
        riskLevel: "Severe",
        color: "#FF3B3B", // Red
        stats: "2.5M deaths/yr",
        icon: <Flame className="w-5 h-5" />,
        mechanism: "Pathogens breach the lung's defenses, attacking the alveoli directly. The immune system floods the microscopic air sacs with white blood cells, fluid, and pus, instantly halting all local gas exchange.",
        triggers: ["Bacterial Pathogens", "Viral Infections", "Aspiration"]
    },
    {
        name: "Lung Cancer",
        riskLevel: "Terminal",
        color: "#8B0000", // Dark Red
        stats: "1.8M deaths/yr",
        icon: <ShieldAlert className="w-5 h-5" />,
        mechanism: "Long-term exposure to carcinogens damages the DNA of the epithelial cells lining the bronchi. This triggers unchecked, malignant cellular division, forming tumors that physically obstruct airflow and spread rapidly.",
        triggers: ["Prolonged Smoking", "Radon Gas", "Asbestos Exposure"]
    },
    {
        name: "Pulmonary Fibrosis",
        riskLevel: "Critical",
        color: "#9370DB", // Purple
        stats: "Progressive Decline",
        icon: <AlertTriangle className="w-5 h-5" />,
        mechanism: "A relentless, irreversible scarring (fibrosis) of the delicate interstitial tissue between the alveoli. The lungs become incredibly stiff, thick, and physically unable to expand during inspiration.",
        triggers: ["Idiopathic", "Autoimmune", "Radiation", "Silica Dust"]
    }
];

export default function DiseaseCarousel() {
    const [activeIndex, setActiveIndex] = useState<number | null>(0);

    return (
        <div className="w-full flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory py-10 px-4 md:px-[10vw] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {DISEASES.map((disease, idx) => {
                const isActive = activeIndex === idx;

                return (
                    <motion.div
                        key={disease.name}
                        layout
                        onClick={() => setActiveIndex(isActive ? null : idx)}
                        transition={{ layout: { duration: 0.8, ease: APPLE_SPRING } }}
                        className={`card-glass cursor-pointer snap-center shrink-0 rounded-3xl overflow-hidden flex flex-col justify-between ${isActive ? "w-[340px] md:w-[500px]" : "w-[260px] md:w-[280px]"
                            }`}
                        style={{
                            backgroundColor: isActive ? 'rgba(253,251,247,0.95)' : 'rgba(255,255,255,0.60)',
                            borderTop: `2px solid ${isActive ? disease.color : 'rgba(0,0,0,0.05)'}`,
                            boxShadow: isActive ? `0 20px 40px -10px ${disease.color}30` : 'none'
                        }}
                    >
                        <motion.div layout className="p-6 md:p-8 flex flex-col gap-4">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <motion.div
                                        layout
                                        className="p-2 rounded-xl"
                                        style={{ backgroundColor: `${disease.color}20`, color: disease.color }}
                                    >
                                        {disease.icon}
                                    </motion.div>
                                    <motion.h3 layout className="font-display text-[24px] md:text-[28px] font-semibold text-black/90 tracking-tight">
                                        {disease.name}
                                    </motion.h3>
                                </div>
                                <motion.div
                                    layout
                                    className="px-3 py-1 pb-[6px] rounded-full text-[10px] uppercase font-mono tracking-widest border border-black/10 whitespace-nowrap"
                                    style={{ backgroundColor: `${disease.color}20`, color: disease.color }}
                                >
                                    {disease.riskLevel}
                                </motion.div>
                            </div>
                            
                            <motion.span layout className="font-mono text-[12px] md:text-[14px] text-black/50 border-l-2 pl-3" style={{ borderColor: disease.color }}>
                                {disease.stats}
                            </motion.span>
                        </motion.div>

                        <AnimatePresence mode="popLayout">
                            {isActive && (
                                <motion.div
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10, transition: { duration: 0.2 } }}
                                    transition={{ duration: 0.6, delay: 0.2 }}
                                    className="px-6 pb-6 md:px-8 md:pb-8 flex flex-col gap-6"
                                >
                                    <div className="space-y-2">
                                        <h4 className="font-mono text-[11px] uppercase tracking-widest text-accent-cool">Pathological Mechanism</h4>
                                        <p className="font-body text-[14px] md:text-[15px] text-[rgba(0,0,0,0.85)] leading-relaxed">
                                            {disease.mechanism}
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <h4 className="font-mono text-[11px] uppercase tracking-widest text-[#FF6B35]">Primary Triggers</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {disease.triggers.map((trigger, i) => (
                                                <span
                                                    key={i}
                                                    className="px-3 py-1.5 rounded-md bg-black/5 border border-black/10 text-[12px] font-body text-black/70"
                                                >
                                                    {trigger}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                );
            })}
        </div>
    );
}
