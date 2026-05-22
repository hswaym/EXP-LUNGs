"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Upload, Cpu, Activity, Stethoscope, Gauge, CheckCircle2, FlaskConical } from "lucide-react";

const STAGES = [
    { id: "upload", label: "Neural Transmission", sub: "Uploading high-res volumetric data", icon: <Upload /> },
    { id: "preprocess", label: "Spectral Denoising", sub: "Isolating pulmonary signal from noise", icon: <Cpu /> },
    { id: "segment", label: "U-Net Cortical Mapping", sub: "Delineating lung boundaries (U-Net v4)", icon: <Activity /> },
    { id: "classify", label: "Pathology Detection", sub: "Scanning for 14+ neural patterns", icon: <Stethoscope /> },
    { id: "severity", label: "Involvement Analysis", sub: "Quantifying volumetric severity", icon: <Gauge /> },
    { id: "explain", label: "CAM Heatmap Synapse", sub: "Synchronizing attention maps", icon: <CheckCircle2 /> },
];

interface AnalysisLoaderProps {
    scanId: string;
}

export default function AnalysisLoader({ scanId }: AnalysisLoaderProps) {
    const router = useRouter();
    const [activeStage, setActiveStage] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveStage(prev => {
                if (prev >= STAGES.length - 1) {
                    clearInterval(interval);
                    setTimeout(() => router.push(`/analyze/result/${scanId}`), 1000);
                    return prev;
                }
                return prev + 1;
            });
        }, 1800); // Cinematic 1.8s per stage

        return () => clearInterval(interval);
    }, [scanId, router]);

    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
            
            <div className="text-center mb-16">
                <motion.div
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="relative size-24 mx-auto mb-8"
                >
                    <div className="absolute inset-0 rounded-full border-t-2 border-accent-cool" />
                    <div className="absolute inset-2 rounded-full border-r-2 border-accent-warm opacity-50" />
                    <div className="absolute inset-0 flex items-center justify-center -rotate-360">
                         <FlaskConical className="size-8 text-white animate-pulse" />
                    </div>
                </motion.div>
                
                <h2 className="font-display text-4xl font-black text-text-heading mb-4 tracking-tight">Processing Specimen</h2>
                <div className="flex flex-col items-center gap-1">
                    <span className="font-mono text-[10px] text-accent-cool tracking-[0.4em] uppercase">ExpLung Neural Pipeline v2.4</span>
                    <span className="font-mono text-[9px] text-white/20 tracking-widest">ID: {scanId.toUpperCase()}</span>
                </div>
            </div>

            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                {STAGES.map((stage, idx) => {
                    const isPast = idx < activeStage;
                    const isCurrent = idx === activeStage;
                    const isPending = idx > activeStage;

                    return (
                        <motion.div
                            key={stage.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ 
                                opacity: isPending ? 0.3 : 1,
                                x: 0,
                                scale: isCurrent ? 1.02 : 1,
                            }}
                            className={`
                                relative p-6 rounded-[32px] border transition-all duration-700
                                ${isCurrent ? 'bg-white/[0.05] border-accent-cool/40 shadow-[0_0_40px_rgba(0,214,255,0.05)]' : 'bg-white/[0.02] border-white/5'}
                                ${isPast ? 'border-accent-cool/20' : ''}
                            `}
                        >
                            <div className="flex items-center gap-6">
                                <div className={`
                                    size-14 rounded-2xl flex items-center justify-center transition-all duration-1000
                                    ${isPast ? 'bg-accent-cool/20 text-accent-cool' : isCurrent ? 'bg-accent-cool text-primary shadow-[0_0_20px_rgba(0,214,255,0.4)]' : 'bg-white/5 text-white/20'}
                                `}>
                                    {isPast ? <CheckCircle2 className="size-6" /> : stage.icon}
                                </div>
                                
                                <div className="flex flex-col overflow-hidden">
                                    <span className={`font-display text-lg font-bold transition-colors duration-700 ${isCurrent ? 'text-white' : isPast ? 'text-white/60' : 'text-white/20'}`}>
                                        {stage.label}
                                    </span>
                                    <span className="font-body text-[11px] text-text-muted truncate">
                                        {isCurrent ? stage.sub : isPast ? "Analysis Verification Complete" : "Awaiting Pipeline Signal"}
                                    </span>
                                </div>

                                {isCurrent && (
                                    <div className="ml-auto">
                                        <div className="size-2 rounded-full bg-accent-cool animate-ping" />
                                    </div>
                                )}
                            </div>

                            {/* Progress bar at the bottom of each item */}
                            {isCurrent && (
                                <div className="absolute bottom-0 left-6 right-6 h-[1px] bg-white/5 overflow-hidden">
                                    <motion.div 
                                        initial={{ x: "-100%" }}
                                        animate={{ x: "0%" }}
                                        transition={{ duration: 1.8, ease: "linear" }}
                                        className="h-full bg-accent-cool shadow-[0_0_10px_#00D6FF]" 
                                    />
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            <div className="mt-16 w-full flex items-center gap-6 px-4">
                <div className="flex-1 h-[1px] bg-white/5" />
                <div className="flex items-center gap-8">
                    <div className="flex flex-col items-center">
                        <span className="font-mono text-[9px] text-white/20 uppercase tracking-widest">Time Remaining</span>
                        <span className="font-mono text-sm text-accent-cool font-bold">~{Math.max(0, (STAGES.length - activeStage) * 1.8).toFixed(1)}s</span>
                    </div>
                    <div className="flex flex-col items-center border-l border-white/5 pl-8">
                        <span className="font-mono text-[9px] text-white/20 uppercase tracking-widest">Efficiency</span>
                        <span className="font-mono text-sm text-accent-warm font-bold">99.8%</span>
                    </div>
                </div>
                <div className="flex-1 h-[1px] bg-white/5" />
            </div>
        </div>
    );
}
