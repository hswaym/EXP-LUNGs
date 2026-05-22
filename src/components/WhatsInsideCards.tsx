"use client";

import { motion } from "framer-motion";
import { Search, Layers, Activity, Waves, Skull, Grid, Maximize, Waypoints, Droplets, Globe, ArrowDownToLine, Zap, Wind, FlaskConical } from "lucide-react";

interface WhatsInsideCardsProps {
    show: boolean;
}

export default function WhatsInsideCards({ show }: WhatsInsideCardsProps) {
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 1.2
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } }
    };

    const cards = [
        {
            title: "Architectural Atlas",
            desc: "Journey through every generation of the bronchial tree. Micro to macro anatomical mappings of the human lung.",
            icon: Search,
            color: "bg-accent-warm",
            glow: "group-hover:shadow-[0_0_30px_-5px_rgba(255,107,0,0.3)]",
            iconColor: "text-accent-warm"
        },
        {
            title: "Live Physiology",
            desc: "Interact with real-time spirometry and circulatory flow simulators. Visualize mechanical efficiency and oxygenation.",
            icon: Activity,
            color: "bg-accent-cool",
            glow: "group-hover:shadow-[0_0_30px_-5px_rgba(0,195,255,0.3)]",
            iconColor: "text-accent-cool"
        },
        {
            title: "Disease Progression",
            desc: "Visualize the terrifying reality of COPD, Asthma, and Lung Cancer. Witness cellular transformation through AI.",
            icon: Layers,
            color: "from-accent-warm to-accent-cool bg-gradient-to-r",
            glow: "group-hover:shadow-[0_0_30px_-5px_rgba(255,107,0,0.2)]",
            iconColor: "text-black"
        },
        {
            title: "Flow-Volume (Healthy)",
            desc: "Standard aerodynamic curve representing optimal pulmonary mechanics and elastic recoil.",
            icon: Waves,
            color: "bg-status-healthy",
            glow: "group-hover:shadow-[0_0_30px_-5px_rgba(0,204,106,0.3)]",
            iconColor: "text-status-healthy"
        },
        {
            title: "Flow-Volume (Obstructive)",
            desc: "Coved expiratory limb indicating small airway collapse typical of COPD or Asthma patterns.",
            icon: Zap,
            color: "bg-accent-warm",
            glow: "group-hover:shadow-[0_0_30px_-5px_rgba(255,107,0,0.3)]",
            iconColor: "text-accent-warm"
        },
        {
            title: "Flow-Volume (Restrictive)",
            desc: "Reduced lung volumes characteristic of fibrotic interstitial disease with high flow rates.",
            icon: ArrowDownToLine,
            color: "bg-status-unhealthy",
            glow: "group-hover:shadow-[0_0_30px_-5px_rgba(255,59,48,0.3)]",
            iconColor: "text-status-unhealthy"
        },
        {
            title: "Flow-Volume (Asthmatic)",
            desc: "Reactive airway modeling showing dynamic narrowing and bronchodilator response curves.",
            icon: Wind,
            color: "bg-accent-cool",
            glow: "group-hover:shadow-[0_0_30px_-5px_rgba(0,195,255,0.3)]",
            iconColor: "text-accent-cool"
        },
        {
            title: "Carcinogen Simulator",
            desc: "Trace the impact of industrial pollutants and micro-particulates on cellular DNA repair mechanisms.",
            icon: Skull,
            color: "bg-accent-warm",
            glow: "group-hover:shadow-[0_0_30px_-5px_rgba(255,107,0,0.3)]",
            iconColor: "text-accent-warm"
        },
        {
            title: "Isolation Matrix",
            desc: "AI-driven containment modeling for airborne pathogen dispersal and quarantine optimization.",
            icon: Grid,
            color: "bg-accent-cobalt",
            glow: "group-hover:shadow-[0_0_30px_-5px_rgba(0,112,255,0.3)]",
            iconColor: "text-accent-cobalt"
        },
        {
            title: "Surface Area Mapping",
            desc: "Mathematical projection of the 70sqm alveolar interface scaling under varying pressures.",
            icon: Maximize,
            color: "bg-accent-cool",
            glow: "group-hover:shadow-[0_0_30px_-5px_rgba(0,195,255,0.3)]",
            iconColor: "text-accent-cool"
        },
        {
            title: "Capillary Network",
            desc: "Dynamic mapping of the pulmonary microvasculature for gas exchange and perfusion analysis.",
            icon: Waypoints,
            color: "bg-accent-warm",
            glow: "group-hover:shadow-[0_0_30px_-5px_rgba(255,107,0,0.3)]",
            iconColor: "text-accent-warm"
        },
        {
            title: "Daily Fluid Balance",
            desc: "Real-time tracking of lung lymphatics and monitoring for edematous warning signs.",
            icon: Droplets,
            color: "bg-accent-cobalt",
            glow: "group-hover:shadow-[0_0_30px_-5px_rgba(0,112,255,0.3)]",
            iconColor: "text-accent-cobalt"
        },
        {
            title: "Respiratory Burden",
            desc: "Real-time heatmaps of chronic respiratory disease prevalence and air quality correlations.",
            icon: Globe,
            color: "bg-accent-cool",
            glow: "group-hover:shadow-[0_0_30px_-5px_rgba(0,195,255,0.3)]",
            iconColor: "text-accent-cool"
        },
        {
            title: "Molecular Gas Diffusion",
            desc: "Simulation of O2 and CO2 transit through the blood-gas barrier at the alveolar level.",
            icon: FlaskConical,
            color: "bg-accent-cobalt",
            glow: "group-hover:shadow-[0_0_30px_-5px_rgba(0,112,255,0.3)]",
            iconColor: "text-accent-cobalt"
        }
    ];

    return (
        <div className="w-full max-w-[1400px] mx-auto mb-32 px-6 pointer-events-auto">
            <motion.h3 
                initial={{ opacity: 0 }}
                animate={show ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 1, delay: 1.0 }}
                className="text-center font-mono text-[13px] font-semibold uppercase tracking-[0.2em] text-black/40 mb-16"
            >
                What&apos;s Inside
            </motion.h3>

            <motion.div 
                variants={container}
                initial="hidden"
                animate={show ? "show" : "hidden"}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
                {cards.map((card, index) => (
                    <motion.div 
                        key={index}
                        variants={item} 
                        whileHover={{ y: -10, scale: 1.02 }}
                        className={`group relative bg-white border border-black/10 rounded-[28px] p-9 overflow-hidden transition-all duration-500 ease-out ring-1 ring-white/30 ${card.glow}`}
                    >
                        {/* Backdrop Glow */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white via-white/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        
                        <div className={`absolute top-0 left-0 w-full h-[5px] ${card.color}`} />
                        
                        <div className="relative z-10">
                            <card.icon className={`w-8 h-8 ${card.iconColor} mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`} />
                            <h4 className="text-black text-[22px] font-black mb-4 tracking-tight leading-tight group-hover:text-black transition-colors duration-300">
                                {card.title}
                            </h4>
                            <p className="text-black/90 text-[15px] leading-relaxed font-semibold opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                                {card.desc}
                            </p>
                        </div>

                        {/* Hover Decorative Element */}
                        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-black/[0.02] rounded-full blur-2xl group-hover:bg-accent-cool/10 transition-colors duration-500" />
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}
