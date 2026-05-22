"use client";

import { motion } from "framer-motion";
import { User, Clipboard, Database, ShieldCheck, Heart } from "lucide-react";

interface DiagnosisSidebarProps {
    patientName: string;
    setPatientName: (val: string) => void;
    patientAge: string;
    setPatientAge: (val: string) => void;
    patientGender: string;
    setPatientGender: (val: string) => void;
    clinicalHistory: string;
    setClinicalHistory: (val: string) => void;
}

export default function DiagnosisSidebar({
    patientName,
    setPatientName,
    patientAge,
    setPatientAge,
    patientGender,
    setPatientGender,
    clinicalHistory,
    setClinicalHistory
}: DiagnosisSidebarProps) {
    return (
        <aside className="w-80 h-full bg-secondary/30 backdrop-blur-xl border-r border-white/5 flex flex-col p-6 overflow-y-auto custom-scrollbar">
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-1">
                    <Database className="w-4 h-4 text-accent-cool" />
                    <span className="font-mono text-[10px] uppercase tracking-widest text-text-label">Patient Metadata</span>
                </div>
                <h3 className="font-display text-xl font-bold text-text-heading">Neural Record</h3>
            </div>

            <div className="space-y-6">
                {/* Form Group */}
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted ml-1">Full Name</label>
                        <div className="relative group">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-accent-cool transition-colors" />
                            <input 
                                type="text" 
                                placeholder="e.g. John Doe"
                                value={patientName}
                                onChange={(e) => setPatientName(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent-cool/20 focus:border-accent-cool/50 transition-all placeholder:text-white/10"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted ml-1">Age</label>
                            <input 
                                type="number" 
                                placeholder="--"
                                value={patientAge}
                                onChange={(e) => setPatientAge(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent-cool/20 focus:border-accent-cool/50 transition-all placeholder:text-white/10"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted ml-1">Gender</label>
                            <div className="relative">
                                <select 
                                    value={patientGender}
                                    onChange={(e) => setPatientGender(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent-cool/20 focus:border-accent-cool/50 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="Male" className="bg-primary text-text-heading">Male</option>
                                    <option value="Female" className="bg-primary text-text-heading">Female</option>
                                    <option value="Other" className="bg-primary text-text-heading">Other</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted ml-1">Clinical History</label>
                        <div className="relative group">
                            <Clipboard className="absolute left-3 top-3 w-4 h-4 text-white/20 group-focus-within:text-accent-cool transition-colors" />
                            <textarea 
                                rows={4}
                                placeholder="Previous conditions, symptoms, etc."
                                value={clinicalHistory}
                                onChange={(e) => setClinicalHistory(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent-cool/20 focus:border-accent-cool/50 transition-all placeholder:text-white/10 resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Compliance Badge */}
                <div className="mt-auto pt-8 border-t border-white/5">
                    <div className="card-glass p-4 rounded-2xl flex items-center gap-4 border border-white/5 bg-white/[0.02]">
                        <div className="size-10 rounded-full bg-accent-cool/10 flex items-center justify-center">
                            <ShieldCheck className="w-5 h-5 text-accent-cool" />
                        </div>
                        <div>
                            <span className="block text-[10px] font-bold uppercase tracking-widest text-accent-cool">HIPAA Secure</span>
                            <span className="block text-[11px] text-text-muted">End-to-End Encryption</span>
                        </div>
                    </div>
                </div>

                {/* Vital Signs Mock */}
                <div className="bg-white/[0.01] rounded-2xl p-4 border border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-text-label">System Vitals</span>
                        <div className="size-2 rounded-full bg-accent-cool animate-pulse" />
                    </div>
                    <div className="flex items-center gap-3">
                        <Heart className="w-4 h-4 text-accent-crimson" />
                        <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                                animate={{ width: ["20%", "60%", "40%", "80%", "30%"] }} 
                                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                className="h-full bg-accent-crimson" 
                            />
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
