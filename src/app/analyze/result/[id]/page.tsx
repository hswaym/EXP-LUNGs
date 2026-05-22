"use client";

import { use } from "react";
import { useAnalysisPolling, API_BASE } from "@/hooks/useAnalysis";
import ResultDashboard from "@/components/analyze/ResultDashboard";
import NeuralStatusBar from "@/components/analyze/NeuralStatusBar";
import LivingBackground from "@/components/LivingBackground";
import LaunchCanvas from "@/components/LaunchCanvas";
import { motion, AnimatePresence } from "framer-motion";
import { FlaskConical, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function AnalysisResultPage({ params }: PageProps) {
    const { id: scanId } = use(params);
    const { result, error, isComplete } = useAnalysisPolling(scanId);

    return (
        <main className="h-screen bg-primary flex flex-col overflow-hidden selection:bg-accent-cool/30 relative">
            {/* Cinematic Background to match Home Page */}
            <LivingBackground isAlive={true}>
                <LaunchCanvas 
                    onSequenceComplete={() => {}} 
                    prefersReducedMotion={true} 
                />
            </LivingBackground>
            
            <div className="flex-1 flex flex-col overflow-hidden pt-[64px] relative z-10">
                <div className="flex-1 overflow-y-auto z-10 custom-scrollbar relative">

                    <AnimatePresence mode="wait">
                        {error ? (
                            <motion.div 
                                key="error"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="h-full flex flex-col items-center justify-center p-8 text-center gap-6"
                            >
                                <div className="size-20 rounded-full bg-accent-crimson/10 flex items-center justify-center border border-accent-crimson/20">
                                    <AlertTriangle className="size-10 text-accent-crimson" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-black text-white tracking-tight">Analysis Interrupted</h2>
                                    <p className="text-text-muted max-w-md mx-auto">{error}</p>
                                </div>
                                <Link 
                                    href="/analyze"
                                    className="px-8 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-xs font-black uppercase tracking-widest text-white transition-all border border-white/5"
                                >
                                    Return to Workspace
                                </Link>
                            </motion.div>
                        ) : !result || !isComplete ? (
                            <motion.div 
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="h-full flex flex-col items-center justify-center p-8 text-center gap-10"
                            >
                                <div className="relative size-32">
                                    <motion.div 
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-0 rounded-full border-t-2 border-accent-cool shadow-[0_0_20px_rgba(0,214,255,0.2)]" 
                                    />
                                    <motion.div 
                                        animate={{ rotate: -360 }}
                                        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-4 rounded-full border-b-2 border-accent-warm opacity-30" 
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <FlaskConical className="size-10 text-white animate-pulse" />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h2 className="text-3xl font-black text-white tracking-tight">Finalizing Synthesis</h2>
                                    <div className="flex flex-col items-center gap-1">
                                        <span className="font-mono text-[10px] text-accent-cool tracking-[0.4em] uppercase">Aggregating Neural Results</span>
                                        <span className="font-mono text-[9px] text-white/20 tracking-widest uppercase">Scan Reference: {scanId.toUpperCase()}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="result"
                                initial={{ opacity: 0, filter: "blur(20px)" }}
                                animate={{ opacity: 1, filter: "blur(0px)" }}
                                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                            >
                                <ResultDashboard 
                                    result={{
                                        ...result,
                                        id: result.scan_id,
                                        imageUrl: result.original_url ? `${API_BASE}${result.original_url}` : "",
                                        heatmapUrl: result.grad_cam_url ? `${API_BASE}${result.grad_cam_url}` : "",
                                    }} 
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <NeuralStatusBar />
        </main>
    );
}
