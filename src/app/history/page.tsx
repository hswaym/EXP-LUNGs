"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Clock, ShieldAlert, ChevronRight, Database, ShieldCheck, Trash2, RefreshCw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import LivingBackground from "@/components/LivingBackground";
import LaunchCanvas from "@/components/LaunchCanvas";
import NeuralStatusBar from "@/components/analyze/NeuralStatusBar";

interface ScanRecord {
    scan_id: string;
    condition?: string;
    severity_label?: string;
    severity_score?: number;
    total_involvement?: number;
    processing_time_ms?: number;
    modality?: string;
    status?: "processing" | "complete" | "error";
    created_at?: string;
    patient_name?: string;
    patient_age?: number;
    patient_gender?: string;
    clinical_history?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8005";

const severityColor: Record<string, { text: string, bg: string, border: string, glow: string }> = {
    "Normal": { 
        text: "text-emerald-400", 
        bg: "bg-emerald-500/5", 
        border: "border-emerald-500/20",
        glow: "shadow-[0_0_15px_rgba(16,185,129,0.1)]"
    },
    "Mild": { 
        text: "text-amber-400", 
        bg: "bg-amber-500/5", 
        border: "border-amber-500/20",
        glow: "shadow-[0_0_15px_rgba(245,158,11,0.1)]"
    },
    "Moderate": { 
        text: "text-orange-400", 
        bg: "bg-orange-500/5", 
        border: "border-orange-500/20",
        glow: "shadow-[0_0_15px_rgba(249,115,22,0.1)]"
    },
    "Severe": { 
        text: "text-red-400", 
        bg: "bg-red-500/5", 
        border: "border-red-500/20",
        glow: "shadow-[0_0_15px_rgba(239,68,68,0.15)]"
    },
};

export default function HistoryPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [scans, setScans] = useState<ScanRecord[]>([]);
    const [source, setSource] = useState<string>("session");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.push("/login");
            return;
        }

        let realtimeChannel: any = null;

        // 1. Fetch initial history
        const fetchHistory = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                const token = session?.access_token;
                const headers: HeadersInit = {};
                if (token) {
                    headers["Authorization"] = `Bearer ${token}`;
                }

                const response = await fetch(`${API_BASE}/api/history`, { headers });
                if (!response.ok) {
                    throw new Error("Failed to fetch historical database scans");
                }
                const data = await response.json();
                setScans(data.scans || []);
                setSource(data.source || "session");
            } catch (err) {
                console.error("[History] Error loading scans:", err);
                setError("Could not connect to the neural analysis server.");
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();

        // 2. Subscribe to Supabase Realtime changes scoped strictly to the current user's UUID
        try {
            const isOffline = typeof window !== "undefined" && localStorage.getItem("explung-offline-mode") === "true";
            if (!isOffline && user?.id) {
                realtimeChannel = supabase
                    .channel("scans_history_sync")
                    .on(
                        "postgres_changes",
                        {
                            event: "*",
                            schema: "public",
                            table: "scans",
                            filter: `user_id=eq.${user.id}`
                        },
                        (payload) => {
                            console.log("[Realtime History Sync] Event received:", payload.eventType, payload);
                            
                            if (payload.eventType === "INSERT") {
                                const newRecord = payload.new as ScanRecord;
                                setScans((prev) => {
                                    if (prev.some((s) => s.scan_id === newRecord.scan_id)) return prev;
                                    return [newRecord, ...prev];
                                });
                            } else if (payload.eventType === "UPDATE") {
                                const updatedRecord = payload.new as ScanRecord;
                                setScans((prev) => 
                                    prev.map((s) => s.scan_id === updatedRecord.scan_id ? { ...s, ...updatedRecord } : s)
                                );
                            } else if (payload.eventType === "DELETE") {
                                const deletedRecord = payload.old as { scan_id: string };
                                setScans((prev) => prev.filter((s) => s.scan_id !== deletedRecord.scan_id));
                            }
                        }
                    )
                    .subscribe();
            }
        } catch (rtErr) {
            console.warn("[Realtime History] Subscription failed:", rtErr);
        }

        return () => {
            if (realtimeChannel) {
                try {
                    supabase.removeChannel(realtimeChannel);
                } catch (rmErr) {
                    console.warn("[Realtime History] Failed to remove channel:", rmErr);
                }
            }
        };
    }, [user, authLoading]);

    if (authLoading || (!user && !loading)) {
        return (
            <div className="min-h-screen bg-primary flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-accent-cool border-t-transparent animate-spin" />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-primary flex flex-col relative overflow-x-hidden selection:bg-accent-cool/30">
            {/* Immersive Cinematic Background */}
            <LivingBackground isAlive={true}>
                <LaunchCanvas 
                    onSequenceComplete={() => {}} 
                    prefersReducedMotion={true} 
                />
            </LivingBackground>

            <div className="flex-1 w-full max-w-5xl mx-auto pt-24 pb-24 px-4 md:px-8 relative z-10">
                {/* Header Panel with Medical Brand Accent lines */}
                <div className="flex flex-col md:flex-row md:items-end md:justify-between border-b border-white/5 pb-6 mb-8 gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Database className="w-4 h-4 text-accent-cool" />
                            <span className="font-mono text-xs uppercase tracking-widest text-accent-cool">
                                {source === "database" ? "Persistent Cloud Database" : "In-Memory Session Database"}
                            </span>
                        </div>
                        <h1 className="font-display text-4xl font-semibold text-white">Diagnostic Scan History</h1>
                        <p className="font-body text-sm text-white/50 mt-1">
                            Real-time database log of pulmonary neural diagnostics scoped to your active node.
                        </p>
                    </div>
                    <button
                        onClick={() => router.push("/analyze")}
                        className="self-start px-5 py-2.5 rounded-xl bg-accent-cool hover:bg-accent-cool/90 hover:shadow-[0_0_30px_rgba(0,214,255,0.2)] text-primary font-display text-xs uppercase tracking-widest font-bold transition-all duration-300 flex items-center gap-2 cursor-pointer"
                    >
                        <span>New Diagnostics</span>
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                {/* States */}
                {loading && (
                    <div className="flex justify-center py-24">
                        <RefreshCw className="w-8 h-8 text-accent-cool animate-spin" />
                    </div>
                )}

                {error && (
                    <div className="bg-accent-crimson/10 border border-accent-crimson/20 rounded-2xl p-6 text-center text-accent-crimson font-medium text-sm backdrop-blur-xl animate-pulse">
                        {error}
                    </div>
                )}

                {!loading && !error && scans.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-32 text-center bg-white/[0.01] border border-white/5 rounded-3xl p-8 backdrop-blur-xl">
                        <Activity className="w-12 h-12 text-white/20 mb-4 animate-pulse" />
                        <h2 className="font-display text-lg font-bold text-white uppercase tracking-wider">No scans archived</h2>
                        <p className="font-body text-xs text-white/40 max-w-sm mt-2 leading-relaxed">
                            Upload a chest X-ray in the Diagnostic AI workspace to register your first record.
                        </p>
                    </div>
                )}

                {/* Scan Grid */}
                {!loading && scans.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <AnimatePresence mode="popLayout">
                            {scans.map((scan, idx) => {
                                const sev = scan.severity_label || "Normal";
                                const sevStyle = severityColor[sev] || {
                                    text: "text-white/40",
                                    bg: "bg-white/5",
                                    border: "border-white/10",
                                    glow: ""
                                };

                                return (
                                    <motion.div
                                        key={scan.scan_id}
                                        initial={{ opacity: 0, y: 20, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                                        transition={{ duration: 0.4, delay: idx * 0.03, ease: "easeOut" }}
                                        onClick={() => router.push(`/analyze/result/${scan.scan_id}`)}
                                        className={`bg-white/[0.02] border border-white/5 hover:border-accent-cool/30 p-5 rounded-2xl cursor-pointer backdrop-blur-xl transition-all duration-300 group hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] ${sevStyle.glow}`}
                                    >
                                        {/* Card Top Row */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <span className="font-mono text-[9px] uppercase tracking-widest text-accent-cool group-hover:text-white transition-colors">
                                                    {scan.modality || "X-RAY"}
                                                </span>
                                                <p className="font-mono text-[10px] text-white/20 group-hover:text-white/40 transition-colors truncate max-w-[180px] mt-0.5">
                                                    {scan.scan_id.toUpperCase()}
                                                </p>
                                            </div>
                                            <span className={`px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest font-semibold rounded-lg border ${sevStyle.text} ${sevStyle.bg} ${sevStyle.border}`}>
                                                {scan.status === "processing" ? "Analyzing..." : sev}
                                            </span>
                                        </div>

                                        {/* Condition */}
                                        <div className="flex items-center gap-2 mb-4">
                                            <ShieldCheck className="w-4 h-4 text-white/30 group-hover:text-accent-cool transition-colors" />
                                            <span className="font-display text-lg font-bold text-white/90 group-hover:text-white transition-colors">
                                                {scan.status === "processing" ? "Neural Engine Computing..." : (scan.condition || "—")}
                                            </span>
                                        </div>

                                        {/* Patient Demographics */}
                                        {scan.patient_name ? (
                                            <div className="mb-4 px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/5 group-hover:border-accent-cool/20 transition-all duration-300 flex items-center justify-between gap-4">
                                                <div className="flex flex-col gap-0.5 truncate">
                                                    <span className="font-mono text-[8px] uppercase tracking-widest text-white/30 block">Patient Record</span>
                                                    <span className="text-xs font-bold text-white/80 group-hover:text-white transition-colors truncate">
                                                        {scan.patient_name}
                                                    </span>
                                                </div>
                                                {(scan.patient_age !== undefined || scan.patient_gender) && (
                                                    <div className="text-right shrink-0">
                                                        <span className="font-mono text-[8px] uppercase tracking-widest text-white/30 block">Age / Sex</span>
                                                        <span className="font-mono text-[10px] text-accent-cool font-bold">
                                                            {scan.patient_age ? `${scan.patient_age}y` : "—"} / {scan.patient_gender ? (scan.patient_gender.charAt(0).toUpperCase()) : "—"}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="mb-4 px-3.5 py-2.5 rounded-xl bg-white/[0.01] border border-white/[0.02] flex items-center justify-between">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="font-mono text-[8px] uppercase tracking-widest text-white/20 block">Patient Record</span>
                                                    <span className="text-xs font-medium text-white/30 italic">Anonymous Record</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Stats Row */}
                                        <div className="flex gap-6 pt-4 border-t border-white/5">
                                            <div>
                                                <span className="font-mono text-[9px] uppercase tracking-widest text-white/30 block">Severity</span>
                                                <span className="font-display text-sm font-semibold text-white/80 group-hover:text-white transition-colors">
                                                    {scan.status === "processing" ? (
                                                        <span className="animate-pulse">...</span>
                                                    ) : (
                                                        `${scan.severity_score ?? "—"}/100`
                                                    )}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="font-mono text-[9px] uppercase tracking-widest text-white/30 block">Involvement</span>
                                                <span className="font-display text-sm font-semibold text-white/80 group-hover:text-white transition-colors">
                                                    {scan.status === "processing" ? (
                                                        <span className="animate-pulse">...</span>
                                                    ) : (
                                                        `${scan.total_involvement ?? "—"}%`
                                                    )}
                                                </span>
                                            </div>
                                            <div className="ml-auto flex items-center gap-1.5 text-white/20 group-hover:text-white/40 transition-colors">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span className="font-mono text-[9px]">
                                                    {scan.status === "processing" ? (
                                                        <span className="flex items-center gap-1">
                                                            <RefreshCw className="w-2.5 h-2.5 animate-spin" /> Live
                                                        </span>
                                                    ) : scan.processing_time_ms ? (
                                                        `${(scan.processing_time_ms / 1000).toFixed(1)}s`
                                                    ) : (
                                                        "—"
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Glowing System Status Bar at the bottom */}
            <NeuralStatusBar />
        </main>
    );
}
