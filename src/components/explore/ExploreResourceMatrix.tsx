"use client";

import { motion } from "framer-motion";
import { 
    Search, Layers, Activity, Waves, Skull, Grid, Maximize, 
    Waypoints, Droplets, Globe, ArrowDownToLine, Zap, Wind, FlaskConical 
} from "lucide-react";

interface ResourceCard {
    title: string;
    stat: string;
    desc: string;
    icon: React.ElementType;
    color: string;
    glowColor: string;
}

const cards: ResourceCard[] = [
    {
        title: "Architectural Atlas",
        stat: "23 Generations",
        desc: "Micro-mapping of the bronchial tree from trachea to terminal bronchioles.",
        icon: Search,
        color: "text-accent-warm",
        glowColor: "rgba(255,107,0,0.4)"
    },
    {
        title: "Live Physiology",
        stat: "Real-time",
        desc: "Dynamic circulatory flow simulators and oxygenation efficiency modeling.",
        icon: Activity,
        color: "text-accent-cool",
        glowColor: "rgba(0,195,255,0.4)"
    },
    {
        title: "Disease Progression",
        stat: "AI Prediction",
        desc: "Witness cellular transformation through COPD, Asthma, and Lung Cancer datasets.",
        icon: Layers,
        color: "text-white",
        glowColor: "rgba(255,255,255,0.2)"
    },
    {
        title: "Flow-Volume (Healthy)",
        stat: "Normal PEF",
        desc: "Optimal pulmonary mechanics representing standard elastic recoil curves.",
        icon: Waves,
        color: "text-status-healthy",
        glowColor: "rgba(0,204,106,0.4)"
    },
    {
        title: "Flow-Volume (Obstructive)",
        stat: "FEV1/FVC < 0.7",
        desc: "Small airway collapse simulation typical of emphysema and chronic bronchitis.",
        icon: Zap,
        color: "text-accent-warm",
        glowColor: "rgba(255,107,0,0.4)"
    },
    {
        title: "Flow-Volume (Restrictive)",
        stat: "TLC Reduced",
        desc: "Fibrotic interstitial modeling showing high flow rates at low lung volumes.",
        icon: ArrowDownToLine,
        color: "text-status-unhealthy",
        glowColor: "rgba(255,59,48,0.4)"
    },
    {
        title: "Flow-Volume (Asthmatic)",
        stat: "Reactive",
        desc: "Dynamic narrowing simulation showing acute bronchodilator response response.",
        icon: Wind,
        color: "text-accent-cool",
        glowColor: "rgba(0,195,255,0.4)"
    },
    {
        title: "Carcinogen Simulator",
        stat: "Toxicology",
        desc: "Molecular tracking of industrial pollutants and micro-particulates on DNA repair.",
        icon: Skull,
        color: "text-accent-warm",
        glowColor: "rgba(255,107,0,0.4)"
    },
    {
        title: "Isolation Matrix",
        stat: "Pathogen AI",
        desc: "Containment modeling for airborne dispersal and optimized quarantine protocols.",
        icon: Grid,
        color: "text-accent-cobalt",
        glowColor: "rgba(0,112,255,0.4)"
    },
    {
        title: "Surface Area",
        stat: "70-100m²",
        desc: "Mathematical projection of the alveolar-capillary interface scaling.",
        icon: Maximize,
        color: "text-accent-cool",
        glowColor: "rgba(0,195,255,0.4)"
    },
    {
        title: "Capillary Network",
        stat: "280 Billion",
        desc: "Microvascular mapping of the low-pressure pulmonary circulation circuit.",
        icon: Waypoints,
        color: "text-accent-warm",
        glowColor: "rgba(255,107,0,0.4)"
    },
    {
        title: "Daily Fluid",
        stat: "500ml/day",
        desc: "Real-time lymphatics tracking and edematous warning signal monitoring.",
        icon: Droplets,
        color: "text-accent-cobalt",
        glowColor: "rgba(0,112,255,0.4)"
    },
    {
        title: "Respiratory Burden",
        stat: "Global GIS",
        desc: "Heatmaps of chronic disease prevalence correlated with real-time air quality.",
        icon: Globe,
        color: "text-accent-cool",
        glowColor: "rgba(0,195,255,0.4)"
    },
    {
        title: "Molecular Gas Diffusion",
        stat: "O2/CO2 Transit",
        desc: "Simulation of gas transit across the blood-gas barrier at the alveolar level.",
        icon: FlaskConical,
        color: "text-accent-cobalt",
        glowColor: "rgba(0,112,255,0.4)"
    }
];

export default function ExploreResourceMatrix() {
    return (
        <section className="w-full max-w-[1400px] mx-auto px-6 py-32">
            <div className="text-center mb-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6"
                >
                    <span className="text-accent-warm font-mono text-[12px] uppercase tracking-[0.3em]">
                        Diagnostic Repository
                    </span>
                </motion.div>
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-[42px] md:text-[56px] font-bold text-white mb-6 tracking-tight"
                >
                    Technical Infrastructure
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="text-white/50 text-[18px] max-w-[650px] mx-auto leading-relaxed"
                >
                    Every layer of the EXPLung engine is built on validated clinical parameters and high-fidelity physiological modeling.
                </motion.p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {cards.map((card, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ y: -10, scale: 1.02 }}
                        whileTap={{ scale: 0.98, background: "rgba(255,255,255,0.05)" }}
                        className="group relative bg-[#0A0A0A] border border-white/5 rounded-[32px] p-8 overflow-hidden transition-all duration-300 pointer-events-auto cursor-pointer"
                    >
                        {/* Hover/Touch Glow Overlay */}
                        <div 
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-500 ease-out"
                            style={{ background: `radial-gradient(circle at center, ${card.glowColor} 0%, transparent 70%)` }}
                        />
                        
                        {/* Interactive Border */}
                        <div className="absolute inset-0 rounded-[32px] border border-white/0 group-hover:border-white/10 group-active:border-white/20 transition-colors duration-500" />

                        <div className="relative z-10">
                            <div className="flex items-start justify-between mb-8">
                                <div className={`p-4 rounded-2xl bg-white/5 border border-white/10 group-hover:border-white/20 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 ${card.color}`}>
                                    <card.icon className="w-8 h-8" />
                                </div>
                                <div className="text-right">
                                    <span className="block text-white/30 font-mono text-[10px] uppercase tracking-widest mb-1">Status</span>
                                    <span className={`block font-mono text-[13px] font-bold ${card.color}`}>ONLINE</span>
                                </div>
                            </div>
                            
                            <h3 className="text-white text-[22px] font-bold mb-2 tracking-tight">
                                {card.title}
                            </h3>
                            <div className="flex items-baseline gap-2 mb-4">
                                <span className={`text-[12px] font-mono uppercase tracking-widest ${card.color}`}>Data:</span>
                                <span className="text-white/90 text-[14px] font-mono font-black">{card.stat}</span>
                            </div>
                            
                            <p className="text-white/40 text-[14px] leading-relaxed font-medium group-hover:text-white/60 transition-colors">
                                {card.desc}
                            </p>
                        </div>

                        {/* Animated Ambient Line */}
                        <div className="absolute bottom-0 left-0 w-full h-[2px] overflow-hidden">
                            <motion.div 
                                className={`h-full w-1/3 bg-gradient-to-r from-transparent via-current to-transparent ${card.color}`}
                                animate={{ x: ["-100%", "300%"] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            />
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
