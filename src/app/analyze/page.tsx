"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import ImageUploader from "@/components/analyze/ImageUploader";
import AnalysisLoader from "@/components/analyze/AnalysisLoader";
import DiagnosisSidebar from "@/components/analyze/DiagnosisSidebar";
import NeuralStatusBar from "@/components/analyze/NeuralStatusBar";
import LivingBackground from "@/components/LivingBackground";
import LaunchCanvas from "@/components/LaunchCanvas";
import { useAuth } from "@/context/AuthContext";

export default function AnalyzePage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [scanId, setScanId] = useState<string | null>(null);

    // Lifted patient metadata state
    const [patientName, setPatientName] = useState("");
    const [patientAge, setPatientAge] = useState("");
    const [patientGender, setPatientGender] = useState("Male");
    const [clinicalHistory, setClinicalHistory] = useState("");

    if (authLoading) {
        return (
            <div className="min-h-screen bg-primary flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-accent-cool border-t-transparent animate-spin" />
            </div>
        );
    }

    if (!user) {
        if (typeof window !== "undefined") {
            router.push("/login");
        }
        return null;
    }

    return (
        <main className="h-screen bg-primary flex flex-col overflow-hidden selection:bg-accent-cool/30 relative">
            {/* Cinematic Background to match Home Page */}
            <LivingBackground isAlive={true}>
                <LaunchCanvas 
                    onSequenceComplete={() => {}} 
                    prefersReducedMotion={true} 
                />
            </LivingBackground>
            
            <div className="flex-1 flex overflow-hidden pt-[64px] relative z-10">
                {/* Sidebar (Diagnostic Metadata) */}
                <AnimatePresence mode="wait">
                    {!scanId && (
                        <motion.div
                            initial={{ opacity: 0, x: -80, filter: "blur(20px)" }}
                            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                            exit={{ opacity: 0, x: -80, filter: "blur(20px)" }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            className="hidden lg:block h-full shrink-0"
                        >
                            <DiagnosisSidebar 
                                patientName={patientName}
                                setPatientName={setPatientName}
                                patientAge={patientAge}
                                setPatientAge={setPatientAge}
                                patientGender={patientGender}
                                setPatientGender={setPatientGender}
                                clinicalHistory={clinicalHistory}
                                setClinicalHistory={setClinicalHistory}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main Interaction Area */}
                <div className="flex-1 relative flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto z-10 p-8 md:p-12 flex flex-col items-center justify-center">
                        <AnimatePresence mode="wait">
                            {!scanId ? (
                                <motion.div
                                    key="upload-phase"
                                    initial={{ opacity: 0, scale: 0.98, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 1.05, filter: "blur(20px)" }}
                                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                    className="w-full max-w-5xl"
                                >
                                    <div className="text-center mb-16 px-4">
                                        <motion.span 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                            className="inline-block font-mono text-[10px] uppercase tracking-[0.4em] text-accent-cool mb-6 px-4 py-1.5 rounded-full border border-accent-cool/20 bg-accent-cool/5"
                                        >
                                            Diagnostic Node 01
                                        </motion.span>
                                        <h1 className="font-display text-5xl md:text-7xl font-black text-text-heading mb-6 tracking-tight leading-[1.1] text-gradient-heading">
                                            EXPLung Hub. <br/> <span className="text-white/40">Neural Diagnostic Scan.</span>
                                        </h1>
                                        <p className="max-w-xl mx-auto font-body text-xl text-text-subheading font-medium leading-relaxed opacity-60">
                                            Experience professional-grade pulmonary analysis powered by deep learning.
                                        </p>
                                    </div>
                                    
                                    <ImageUploader 
                                        onUploadComplete={(id) => setScanId(id)} 
                                        patientName={patientName}
                                        patientAge={patientAge}
                                        patientGender={patientGender}
                                        clinicalHistory={clinicalHistory}
                                    />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="loading-phase"
                                    initial={{ opacity: 0, scale: 1.1, filter: "blur(40px)" }}
                                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                                    className="w-full"
                                >
                                    <AnalysisLoader scanId={scanId} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Security Footer Notice */}
                    {!scanId && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 }}
                            className="p-8 text-center z-10 shrink-0"
                        >
                            <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/20">
                                SYSTEM SECURED VIA AES-256 ENCRYPTION // HIPAA COMPLIANT ENVIRONMENT
                            </p>
                        </motion.div>
                    )}
                </div>
            </div>

            <NeuralStatusBar />
        </main>
    );
}
