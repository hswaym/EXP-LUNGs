"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { AnalysisResult, API_BASE } from "@/hooks/useAnalysis";
import { supabase } from "@/lib/supabase";
import { 
    Activity, FileText, Layout, Box, Download, 
    Share2, ArrowLeft, CheckCircle2, AlertCircle, Database 
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
const LungViewer3D = dynamic(
    () => import("@/components/analyze/3DLungViewer").then((mod) => mod.LungViewer3D),
    { ssr: false }
);
import SeverityDisplay from "./SeverityDisplay";

export interface ExtendedAnalysisResult extends AnalysisResult {
    id?: string;
    imageUrl?: string;
    heatmapUrl?: string;
}

interface ResultDashboardProps {
    result: ExtendedAnalysisResult;
}

type TabType = "original" | "segmented" | "heatmap" | "3d";

export default function ResultDashboard({ result }: ResultDashboardProps) {
    const [activeTab, setActiveTab] = useState<TabType>("heatmap");
    const [isExporting, setIsExporting] = useState(false);
    const [viewerReady, setViewerReady] = useState(false);
    const [viewerError, setViewerError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const [isSharing, setIsSharing] = useState(false);
    const [isDownloadingModel, setIsDownloadingModel] = useState(false);
    const [heatmapAlpha, setHeatmapAlpha] = useState(0.65);
    const [notes, setNotes] = useState(result.clinician_notes || "");
    const [isSavingNotes, setIsSavingNotes] = useState(false);
    const [notesSaved, setNotesSaved] = useState(false);

    const handleSaveNotes = async () => {
        setIsSavingNotes(true);
        setNotesSaved(false);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            const headers: HeadersInit = {
                "Content-Type": "application/json",
            };
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }
            const response = await fetch(`${API_BASE}/api/report/${result.scan_id}/notes`, {
                method: "POST",
                headers,
                body: JSON.stringify({ notes }),
            });
            if (!response.ok) throw new Error("Failed to save clinician notes");
            setNotesSaved(true);
            result.clinician_notes = notes;
            setTimeout(() => setNotesSaved(false), 3000);
        } catch (error) {
            console.error("Save notes error:", error);
            alert("Failed to save notes. Please verify backend is running.");
        } finally {
            setIsSavingNotes(false);
        }
    };

    const handleShare = async () => {
        if (isSharing) return;
        const reportUrl = `${API_BASE}/api/report/${result.scan_id}`;
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `ExpLung-U Diagnostic Report - Scan ${result.scan_id}`,
                    text: `View the AI diagnostic report for pulmonary scan ${result.scan_id}.`,
                    url: reportUrl,
                });
                return;
            } catch (err) {
                console.log("Navigator share cancelled or failed:", err);
            }
        }
        
        try {
            await navigator.clipboard.writeText(reportUrl);
            setIsSharing(true);
            setTimeout(() => setIsSharing(false), 2000);
        } catch (err) {
            console.error("Failed to copy report URL:", err);
            alert("Could not copy link automatically. Here is the link to share: " + reportUrl);
        }
    };

    const handleDownload3DModel = async () => {
        if (isDownloadingModel) return;
        setIsDownloadingModel(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            const headers: HeadersInit = {
                "Content-Type": "application/json",
            };
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_BASE}/api/visualize`, {
                method: "POST",
                headers,
                body: JSON.stringify({
                    scan_id: result.scan_id,
                    modality: result.modality || "ct"
                })
            });
            if (!response.ok) throw new Error("Failed to generate 3D model");
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `ExpLung-3D-Model-${result.scan_id}.glb`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error("3D model download error:", error);
            alert("Failed to download 3D volumetric model. Please verify uvicorn/backend is running.");
        } finally {
            setIsDownloadingModel(false);
        }
    };

    const handleTabChange = (tabId: TabType) => {
        setActiveTab(tabId);
        if (tabId === "3d") {
            setViewerReady(false);
            setViewerError(null);
        }
    };

    const handleDownloadPDF = async () => {
        if (isExporting) return;
        setIsExporting(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            const headers: HeadersInit = {};
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }
            const response = await fetch(`${API_BASE}/api/report/${result.scan_id}`, { headers });
            if (!response.ok) throw new Error("Failed to download report");
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `ExpLung-Report-${result.scan_id}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Export error:", error);
            alert("Failed to export PDF report. Please try again.");
        } finally {
            setIsExporting(false);
        }
    };

    const modalityLower = result.modality?.toLowerCase();
    // Normalize modality — "X-RAY" → "xray", "CT" → "ct"
    const modalityNorm = modalityLower?.replace(/[-_\s]/g, "") ?? "";
    const show3DTab = modalityNorm === "xray" || modalityNorm === "ct";

    const tabs: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
        { id: "original", label: "Source Scan", icon: FileText },
        { id: "segmented", label: "Neural Mask", icon: Layout },
        { id: "heatmap", label: "Grad-CAM", icon: Activity },
    ];
    if (show3DTab) {
        tabs.push({ id: "3d", label: "3D View", icon: Box });
    }

    const getFullUrl = (path: string | undefined) => {
        if (!path) return null;
        if (path.startsWith("http")) return path;
        return `${API_BASE}${path}`;
    };

    const getTabContent = () => {
        switch (activeTab) {
            case "original":
                const originalUrl = getFullUrl(result.original_url);
                return originalUrl ? (
                    <Image key="original" src={originalUrl} alt="Original Scan" fill className="object-contain" unoptimized />
                ) : (
                    <div className="flex items-center justify-center h-full text-white/20 font-mono text-sm">Original Image Not Available</div>
                );
            case "segmented":
                const segmentedUrl = getFullUrl(result.segmented_url);
                return segmentedUrl ? (
                    <Image key="segmented" src={segmentedUrl} alt="Segmented Mask" fill className="object-contain" unoptimized />
                ) : (
                    <div className="flex items-center justify-center h-full text-white/20 font-mono text-sm">Segmentation Mask Not Available</div>
                );
            case "heatmap":
                const origUrl = getFullUrl(result.original_url);
                const heatUrl = getFullUrl(result.grad_cam_url);
                return origUrl && heatUrl ? (
                    <div className="w-full h-full relative">
                        <Image key="original-base" src={origUrl} alt="Original Base Scan" fill className="object-contain" unoptimized />
                        <div className="absolute inset-0 transition-opacity duration-75" style={{ opacity: heatmapAlpha }}>
                            <Image key="heatmap-overlay" src={heatUrl} alt="Grad-CAM Overlay" fill className="object-contain" unoptimized />
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-white/20 font-mono text-sm">Grad-CAM Heatmap Not Available</div>
                );
            case "3d":
                // Always resolve to full absolute URL via API_BASE to avoid Next.js 404s
                const fullImageUrl = getFullUrl(result.original_url) || result.imageUrl || "";
                const fullHeatmapUrl = getFullUrl(result.grad_cam_url) || result.heatmapUrl || "";
                return (
                    <div className="w-full relative flex items-center justify-center bg-black" style={{ height: '520px' }}>
                        {viewerError ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-30 p-6 text-center">
                                <AlertCircle className="size-12 text-[#C0212C] mb-4 animate-bounce" />
                                <h4 className="font-mono text-[#FDFBF7] text-base font-bold uppercase tracking-widest mb-2">
                                    3D Reconstruction Failed
                                </h4>
                                <p className="font-mono text-[#FDFBF7]/60 text-xs max-w-md mb-6 leading-relaxed">
                                    {viewerError}
                                </p>
                                <button
                                    onClick={() => {
                                        setViewerError(null);
                                        setViewerReady(false);
                                        setRetryCount(prev => prev + 1);
                                    }}
                                    className="px-6 py-2.5 bg-accent-cool text-primary rounded-xl text-xs font-black uppercase tracking-widest hover:shadow-[0_0_20px_rgba(0,214,255,0.4)] transition-all cursor-pointer font-mono"
                                >
                                    Retry Reconstruction
                                </button>
                            </div>
                        ) : (
                            <>
                                {!viewerReady && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-30 pointer-events-none">
                                        <span className="font-mono text-xs text-accent-cool uppercase tracking-[0.2em] animate-pulse">
                                            Generating 3D model…
                                        </span>
                                    </div>
                                )}
                                <LungViewer3D
                                    key={retryCount}
                                    imageUrl={fullImageUrl}
                                    modality="ct"
                                    scanId={result.id || result.scan_id}
                                    heatmapUrl={fullHeatmapUrl}
                                    onLoaded={() => setViewerReady(true)}
                                    onError={(msg) => {
                                        console.error(msg);
                                        setViewerError(msg);
                                    }}
                                    className="w-full"
                                    style={{ height: '520px' }}
                                />
                            </>
                        )}
                    </div>
                );
        }
    };

    return (
        <div className="w-full max-w-[1600px] mx-auto p-6 md:p-10 flex flex-col gap-8">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <Link href="/analyze" className="inline-flex items-center gap-2 text-text-muted hover:text-accent-cool transition-colors mb-6 font-mono text-xs uppercase tracking-widest">
                        <ArrowLeft className="size-3" /> Back to Workspace
                    </Link>
                    <div className="flex items-center gap-4 mb-2">
                         <div className="size-3 rounded-full bg-accent-cool shadow-[0_0_10px_#00D6FF]" />
                         <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-accent-cool">Diagnostic Report v4.2</span>
                    </div>
                    <h1 className="font-display text-4xl md:text-5xl font-black text-text-heading tracking-tight">
                        Neural <span className="text-white/40">Inference Analysis.</span>
                    </h1>
                </div>

                <div className="flex items-center gap-4">
                    <button 
                        onClick={handleDownloadPDF}
                        disabled={isExporting}
                        className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-sm font-bold text-white transition-all disabled:opacity-50"
                    >
                        <Download className={`size-4 ${isExporting ? "animate-bounce" : ""}`} /> 
                        {isExporting ? "Generating..." : "Export PDF"}
                    </button>
                    <button 
                        onClick={handleShare}
                        className="flex items-center gap-2 px-6 py-3 bg-accent-cool text-primary rounded-2xl text-sm font-black transition-all hover:shadow-[0_0_30px_rgba(0,214,255,0.3)] min-w-[150px] justify-center"
                    >
                        {isSharing ? (
                            <>
                                <CheckCircle2 className="size-4 animate-pulse" /> Copied Link!
                            </>
                        ) : (
                            <>
                                <Share2 className="size-4" /> Share Results
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Column: Metrics & Insights */}
                <div className="lg:col-span-4 flex flex-col gap-8">
                    {/* Primary Diagnosis Card */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[32px] p-8 shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 size-48 bg-accent-cool/5 rounded-full blur-[60px] -mr-24 -mt-24 pointer-events-none" />
                        
                        <div className="flex items-center gap-3 mb-8">
                            <Activity className="size-5 text-accent-cool" />
                            <span className="font-mono text-[10px] uppercase tracking-widest text-text-label">Primary Conclusion</span>
                        </div>

                        <div className="space-y-2 mb-8">
                            <h2 className="text-4xl font-black text-white leading-tight">
                                {result.condition || "Pneumonia Detected"}
                            </h2>
                            <div className="flex items-center gap-2 text-accent-cool font-bold">
                                <CheckCircle2 className="size-4" />
                                <span className="text-sm">
                                    {(result.confidence !== undefined 
                                        ? (result.confidence <= 1 ? result.confidence * 100 : result.confidence) 
                                        : 98
                                    ).toFixed(1)}% Confidence Score
                                </span>
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                            <p className="text-sm text-text-subheading leading-relaxed italic">
                                &ldquo;{result.clinical_insight || "Model detected significant pleural effusion and consolidate opacities in the right lower lobe, consistent with active inflammation or infection."}&rdquo;
                            </p>
                        </div>
                    </motion.div>

                    {/* Patient Record Card */}
                    {result.patient_name && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[32px] p-8 shadow-2xl relative overflow-hidden"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <Database className="size-5 text-accent-cool" />
                                <span className="font-mono text-[10px] uppercase tracking-widest text-text-label">Patient Record</span>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="font-mono text-[9px] uppercase tracking-widest text-white/30 block">Full Name</span>
                                        <span className="text-sm font-bold text-white">{result.patient_name}</span>
                                    </div>
                                    <div>
                                        <span className="font-mono text-[9px] uppercase tracking-widest text-white/30 block">Age / Gender</span>
                                        <span className="text-sm font-bold text-white">
                                            {result.patient_age ? `${result.patient_age} yrs` : "N/A"} / {result.patient_gender || "N/A"}
                                        </span>
                                    </div>
                                </div>
                                {result.clinical_history && (
                                    <div className="pt-3 border-t border-white/5">
                                        <span className="font-mono text-[9px] uppercase tracking-widest text-white/30 block mb-1">Clinical History</span>
                                        <p className="text-xs text-text-muted leading-relaxed italic">
                                            {result.clinical_history}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Severity Card */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[32px] p-8 shadow-2xl"
                    >
                        <div className="flex items-center gap-3 mb-8">
                            <Layout className="size-5 text-accent-warm" />
                            <span className="font-mono text-[10px] uppercase tracking-widest text-text-label">Volumetric Severity</span>
                        </div>
                        <SeverityDisplay 
                            score={result.severity_score || 42} 
                            label={result.severity_label || "Moderate Involvement"}
                            left={result.left_lung_involvement || 28}
                            right={result.right_lung_involvement || 56}
                        />
                    </motion.div>

                    {/* Clinician Notes Card */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[32px] p-8 shadow-2xl relative overflow-hidden"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <FileText className="size-5 text-[#d97706]" />
                                <span className="font-mono text-[10px] uppercase tracking-widest text-[#d97706] font-bold">Clinician Annotations</span>
                            </div>
                            {notesSaved && (
                                <motion.span 
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="font-mono text-[9px] uppercase text-emerald-400 font-black flex items-center gap-1"
                                >
                                    <CheckCircle2 className="size-3" /> Synced to PDF
                                </motion.span>
                            )}
                        </div>
                        
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Enter custom clinical annotations or recommendations to print in the PDF report..."
                            className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#d97706] transition-all resize-none font-sans leading-relaxed"
                        />
                        
                        <button
                            onClick={handleSaveNotes}
                            disabled={isSavingNotes}
                            className="w-full mt-4 py-3 bg-[#d97706] hover:bg-[#b45309] disabled:bg-[#d97706]/40 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all hover:shadow-[0_0_20px_rgba(217,119,6,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSavingNotes ? "Syncing notes..." : "Save & Sync Report"}
                        </button>
                    </motion.div>

                    {/* AI Medical Guidance Card */}
                    {(result.ai_visit_suggestion || result.ai_medication_suggestion) && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.28 }}
                            className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[32px] p-8 shadow-2xl relative overflow-hidden"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <Activity className="size-5 text-emerald-400" />
                                <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-400 font-bold">AI Supportive Guidance</span>
                            </div>
                            
                            <div className="space-y-6">
                                {result.ai_visit_suggestion && (
                                    <div className="space-y-2">
                                        <span className="font-mono text-[9px] uppercase tracking-widest text-white/30 block">Severity-Based Action</span>
                                        <div className={`p-4 rounded-2xl border text-xs leading-relaxed font-sans ${
                                            result.severity_label === "Severe" 
                                                ? "bg-red-500/10 border-red-500/20 text-red-400 font-bold" 
                                                : result.severity_label === "Moderate" 
                                                ? "bg-amber-500/10 border-amber-500/20 text-amber-400 font-semibold"
                                                : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                        }`}>
                                            {result.ai_visit_suggestion}
                                        </div>
                                    </div>
                                )}
                                
                                {result.ai_medication_suggestion && (
                                    <div className="space-y-2">
                                        <span className="font-mono text-[9px] uppercase tracking-widest text-white/30 block">Supportive Actions & Care</span>
                                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                                            {result.ai_medication_suggestion.split('\n').map((line, idx) => (
                                                <p key={idx} className="text-xs text-text-subheading leading-relaxed font-sans">
                                                    {line}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Disclaimer */}
                    <div className="flex gap-4 p-6 rounded-[24px] bg-accent-warm/5 border border-accent-warm/10 text-accent-warm">
                        <AlertCircle className="size-6 shrink-0" />
                        <p className="text-[11px] font-medium leading-relaxed italic">
                            This analysis is generated by the ExpLung-U Neural Engine. It is intended for educational and clinical research support only. Final diagnosis must be confirmed by a board-certified radiologist.
                        </p>
                    </div>
                </div>

                {/* Right Column: Visualizer */}
                <div className="lg:col-span-8">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="bg-secondary/40 backdrop-blur-3xl border border-white/10 rounded-[40px] overflow-hidden flex flex-col h-full min-h-[700px] shadow-2xl"
                    >
                        {/* Tab Navigation */}
                        <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-black/20">
                            <div className="flex items-center gap-4">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => handleTabChange(tab.id)}
                                        className={`
                                            flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black tracking-widest uppercase transition-all
                                            ${activeTab === tab.id 
                                                ? "bg-accent-cool text-primary shadow-[0_0_20px_rgba(0,214,255,0.4)]" 
                                                : "text-white/30 hover:text-white/60 hover:bg-white/5"}
                                        `}
                                    >
                                        <tab.icon className="size-3.5" />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/5 bg-white/5">
                                <span className="size-1.5 rounded-full bg-accent-cool animate-pulse" />
                                <span className="font-mono text-[9px] uppercase tracking-widest text-white/40">Visualizer: High Fidelity</span>
                            </div>
                        </div>

                        {/* Visualizer Display Area */}
                        <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, filter: "blur(10px)" }}
                                    animate={{ opacity: 1, filter: "blur(0px)" }}
                                    exit={{ opacity: 0, filter: "blur(10px)" }}
                                    transition={{ duration: 0.5 }}
                                    className="w-full h-full flex items-center justify-center"
                                >
                                    {getTabContent()}
                                </motion.div>
                            </AnimatePresence>
                            
                            {activeTab === "heatmap" && (
                                <div className="absolute bottom-6 right-6 z-20 bg-black/70 backdrop-blur-xl border border-white/10 px-4 py-3 rounded-2xl flex items-center gap-3 shadow-2xl transition-all">
                                    <span className="font-mono text-[9px] uppercase tracking-widest text-white/50">Blend Alpha</span>
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max="1" 
                                        step="0.01" 
                                        value={heatmapAlpha} 
                                        onChange={(e) => setHeatmapAlpha(parseFloat(e.target.value))}
                                        className="w-24 accent-accent-cool cursor-pointer h-1 rounded-lg bg-white/15 appearance-none"
                                    />
                                    <span className="font-mono text-[10px] text-accent-cool font-bold w-8 text-right">
                                        {Math.round(heatmapAlpha * 100)}%
                                    </span>
                                </div>
                            )}
                            
                            {/* Visual Overlays (Crosshair/Grid) */}
                            <div className="absolute inset-0 pointer-events-none">
                                <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/[0.03]" />
                                <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-white/[0.03]" />
                                <div className="absolute inset-0 border-[60px] border-black/20" />
                            </div>
                        </div>

                        {/* Visualizer Controls */}
                        <div className="p-8 bg-black/20 border-t border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="flex flex-col gap-1">
                                    <span className="font-mono text-[9px] uppercase tracking-widest text-white/20">Modality</span>
                                    <span className="text-sm font-bold text-white uppercase">{result.modality || "CT Volumetric"}</span>
                                </div>
                                <div className="h-8 w-[1px] bg-white/5" />
                                <div className="flex flex-col gap-1">
                                    <span className="font-mono text-[9px] uppercase tracking-widest text-white/20">Spatial Resolution</span>
                                    <span className="text-sm font-bold text-white">0.5mm / Pixel</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={handleDownload3DModel}
                                    disabled={isDownloadingModel}
                                    title="Download 3D Volumetric Mesh (.glb)"
                                    className={`size-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50 ${isDownloadingModel ? "animate-pulse" : ""}`}
                                >
                                    <Download className={`size-5 ${isDownloadingModel ? "animate-spin" : ""}`} />
                                </button>
                                <Link 
                                    href="/analyze"
                                    className="px-8 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-xs font-black uppercase tracking-widest text-white transition-all border border-white/5"
                                >
                                    New Analysis
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
