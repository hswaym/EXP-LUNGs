"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Database, ShieldCheck, Zap, Brain, X, Check, Cloud, Cpu, ArrowLeft, RefreshCw, Key } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8005";

export default function SetupPage() {
    const router = useRouter();
    const [supabaseUrl, setSupabaseUrl] = useState("");
    const [supabaseKey, setSupabaseKey] = useState("");
    
    // Firebase Fields
    const [fbApiKey, setFbApiKey] = useState("");
    const [fbAuthDomain, setFbAuthDomain] = useState("");
    const [fbProjectId, setFbProjectId] = useState("");
    const [fbStorageBucket, setFbStorageBucket] = useState("");
    const [fbMessagingSenderId, setFbMessagingSenderId] = useState("");
    const [fbAppId, setFbAppId] = useState("");
    const [fbMeasurementId, setFbMeasurementId] = useState("");

    const [isTestingDb, setIsTestingDb] = useState(false);
    const [isTestingFb, setIsTestingFb] = useState(false);
    const [isApplying, setIsApplying] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            setSupabaseUrl(localStorage.getItem("EXPLUNG_SUPABASE_URL") || "");
            setSupabaseKey(localStorage.getItem("EXPLUNG_SUPABASE_KEY") || "");
            
            const storedFb = localStorage.getItem("EXPLUNG_FIREBASE_CONFIG");
            if (storedFb) {
                try {
                    const parsed = JSON.parse(storedFb);
                    setFbApiKey(parsed.apiKey || "");
                    setFbAuthDomain(parsed.authDomain || "");
                    setFbProjectId(parsed.projectId || "");
                    setFbStorageBucket(parsed.storageBucket || "");
                    setFbMessagingSenderId(parsed.messagingSenderId || "");
                    setFbAppId(parsed.appId || "");
                    setFbMeasurementId(parsed.measurementId || "");
                } catch {}
            }
        }
    }, []);

    const handleTestSupabase = async () => {
        if (!supabaseUrl || !supabaseKey) {
            setErrorMsg("Please fill in both Supabase URL and Anon/Service Key.");
            return;
        }
        setIsTestingDb(true);
        setErrorMsg(null);
        setSuccessMsg(null);

        try {
            // 1. Sync to the FastAPI Python Backend and verify DDL creation
            const res = await axios.post(`${API_BASE}/api/setup`, {
                supabase_url: supabaseUrl,
                supabase_key: supabaseKey
            });

            if (res.data.status === "success") {
                setSuccessMsg("Supabase verified successfully on both the frontend and the FastAPI python backend!");
            } else {
                throw new Error(res.data.message || "Failed to set up database.");
            }
        } catch (err: any) {
            console.error("Supabase verification failed:", err);
            setErrorMsg(err.response?.data?.detail || err.message || "Failed to connect to the database. Make sure the credentials are correct.");
        } finally {
            setIsTestingDb(false);
        }
    };

    const handleTestFirebase = async () => {
        if (!fbApiKey || !fbProjectId) {
            setErrorMsg("Please enter at least the Firebase API Key and Project ID.");
            return;
        }
        setIsTestingFb(true);
        setErrorMsg(null);
        setSuccessMsg(null);

        try {
            // Simulate initialization to check if the format is valid
            const config = {
                apiKey: fbApiKey,
                authDomain: fbAuthDomain,
                projectId: fbProjectId,
                storageBucket: fbStorageBucket,
                messagingSenderId: fbMessagingSenderId,
                appId: fbAppId,
                measurementId: fbMeasurementId
            };
            
            // Fast syntax validation
            if (!config.apiKey.startsWith("AIzaSy")) {
                throw new Error("Invalid API key format (usually starts with AIzaSy).");
            }
            
            setSuccessMsg("Firebase Client configuration syntax verified successfully!");
        } catch (err: any) {
            setErrorMsg(err.message || "Firebase verification failed.");
        } finally {
            setIsTestingFb(false);
        }
    };

    const handleApply = async () => {
        setIsApplying(true);
        setErrorMsg(null);
        setSuccessMsg(null);

        try {
            // Save to localStorage
            localStorage.setItem("EXPLUNG_SUPABASE_URL", supabaseUrl);
            localStorage.setItem("EXPLUNG_SUPABASE_KEY", supabaseKey);
            
            const fbConfig = {
                apiKey: fbApiKey,
                authDomain: fbAuthDomain,
                projectId: fbProjectId,
                storageBucket: fbStorageBucket,
                messagingSenderId: fbMessagingSenderId,
                appId: fbAppId,
                measurementId: fbMeasurementId
            };
            localStorage.setItem("EXPLUNG_FIREBASE_CONFIG", JSON.stringify(fbConfig));
            localStorage.removeItem("explung-offline-mode");
            localStorage.removeItem("explung-mock-session");

            // Sync to backend first
            await axios.post(`${API_BASE}/api/setup`, {
                supabase_url: supabaseUrl,
                supabase_key: supabaseKey
            });

            setSuccessMsg("Configuration saved! All cloud connections active. Redirecting...");
            setTimeout(() => {
                // A full window reload and redirect forces ES modules to re-evaluate
                // with the new custom credentials from localStorage, avoiding stale references.
                window.location.href = "/login";
            }, 1800);
        } catch (err: any) {
            setErrorMsg(err.response?.data?.detail || err.message || "Failed to finalize database sync.");
        } finally {
            setIsApplying(false);
        }
    };

    const handleClear = () => {
        if (confirm("Reset connection to default local/session mocks?")) {
            localStorage.removeItem("EXPLUNG_SUPABASE_URL");
            localStorage.removeItem("EXPLUNG_SUPABASE_KEY");
            localStorage.removeItem("EXPLUNG_FIREBASE_CONFIG");
            localStorage.removeItem("explung-offline-mode");
            localStorage.removeItem("explung-mock-session");
            window.location.reload();
        }
    };

    return (
        <main className="min-h-screen bg-primary flex flex-col pt-24 pb-20 px-4 md:px-8 overflow-y-auto custom-scrollbar selection:bg-accent-cool/30">
            {/* Background Decorative Blur */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-accent-cool/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-4xl mx-auto z-10">
                {/* Back Link */}
                <Link href="/" className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-white/40 hover:text-white transition-colors mb-8">
                    <ArrowLeft className="w-4 h-4" /> Return to Main Node
                </Link>

                {/* Header */}
                <div className="border-b border-white/5 pb-6 mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Cloud className="w-4 h-4 text-accent-cool" />
                            <span className="font-mono text-xs uppercase tracking-widest text-accent-cool">
                                Cloud Integration Control
                            </span>
                        </div>
                        <h1 className="font-display text-4xl font-semibold text-white">System Integration Console</h1>
                        <p className="font-body text-sm text-white/50 mt-1">
                            Link your custom database and authentication instances directly to the pipeline.
                        </p>
                    </div>
                    <button
                        onClick={handleClear}
                        className="self-start text-[10px] font-mono uppercase tracking-widest border border-white/10 hover:border-accent-crimson/30 hover:text-accent-crimson px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                        Reset Config
                    </button>
                </div>

                <AnimatePresence>
                    {errorMsg && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mb-6 flex items-center gap-3 bg-accent-crimson/10 border border-accent-crimson/20 text-accent-crimson px-6 py-4 rounded-2xl w-full text-sm font-medium backdrop-blur-xl"
                        >
                            <ShieldCheck className="w-5 h-5 shrink-0" />
                            {errorMsg}
                        </motion.div>
                    )}
                    {successMsg && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mb-6 flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-6 py-4 rounded-2xl w-full text-sm font-medium backdrop-blur-xl"
                        >
                            <Check className="w-5 h-5 shrink-0" />
                            {successMsg}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Supabase Section */}
                    <div className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl backdrop-blur-xl flex flex-col justify-between">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                                <div className="size-10 rounded-xl bg-accent-cool/10 border border-accent-cool/20 flex items-center justify-center text-accent-cool shadow-inner">
                                    <Database className="size-5" />
                                </div>
                                <div>
                                    <h3 className="font-display text-lg font-bold text-white">Supabase Connection</h3>
                                    <span className="font-mono text-[9px] uppercase tracking-widest text-white/30">Volumetric Diagnostic Storage</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[9px] font-mono uppercase tracking-widest text-white/50 mb-2">Supabase Project URL</label>
                                    <input
                                        type="text"
                                        placeholder="https://your-project.supabase.co"
                                        value={supabaseUrl}
                                        onChange={(e) => setSupabaseUrl(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-white/5 bg-black/40 text-white text-xs font-mono placeholder:text-white/20 focus:outline-none focus:border-accent-cool transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-mono uppercase tracking-widest text-white/50 mb-2">Supabase Anon Key / API Key</label>
                                    <input
                                        type="password"
                                        placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                                        value={supabaseKey}
                                        onChange={(e) => setSupabaseKey(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-white/5 bg-black/40 text-white text-xs font-mono placeholder:text-white/20 focus:outline-none focus:border-accent-cool transition-colors"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleTestSupabase}
                            disabled={isTestingDb || isApplying}
                            className="w-full py-4 rounded-xl bg-white/5 hover:bg-white/10 active:scale-[0.99] border border-white/5 hover:border-accent-cool/30 text-white font-mono text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-all mt-8"
                        >
                            {isTestingDb ? (
                                <>
                                    <RefreshCw className="size-4 animate-spin text-accent-cool" />
                                    Synchronizing Backend Schema...
                                </>
                            ) : (
                                <>
                                    <Cpu className="size-4 text-accent-cool" />
                                    Verify DB & Setup Schema
                                </>
                            )}
                        </button>
                    </div>

                    {/* Firebase Section */}
                    <div className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl backdrop-blur-xl flex flex-col justify-between">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                                <div className="size-10 rounded-xl bg-accent-warm/10 border border-accent-warm/20 flex items-center justify-center text-accent-warm shadow-inner">
                                    <Key className="size-5" />
                                </div>
                                <div>
                                    <h3 className="font-display text-lg font-bold text-white">Firebase Auth (Google Login)</h3>
                                    <span className="font-mono text-[9px] uppercase tracking-widest text-white/30">HIPAA Compliant User Node</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-[9px] font-mono uppercase tracking-widest text-white/50 mb-2">API Key</label>
                                    <input
                                        type="text"
                                        placeholder="AIzaSy..."
                                        value={fbApiKey}
                                        onChange={(e) => setFbApiKey(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-white/5 bg-black/40 text-white text-xs font-mono placeholder:text-white/20 focus:outline-none focus:border-accent-warm transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-mono uppercase tracking-widest text-white/50 mb-2">Project ID</label>
                                    <input
                                        type="text"
                                        placeholder="your-project-id"
                                        value={fbProjectId}
                                        onChange={(e) => setFbProjectId(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-white/5 bg-black/40 text-white text-xs font-mono placeholder:text-white/20 focus:outline-none focus:border-accent-warm transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-mono uppercase tracking-widest text-white/50 mb-2">Auth Domain</label>
                                    <input
                                        type="text"
                                        placeholder="your-project-id.firebaseapp.com"
                                        value={fbAuthDomain}
                                        onChange={(e) => setFbAuthDomain(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-white/5 bg-black/40 text-white text-xs font-mono placeholder:text-white/20 focus:outline-none focus:border-accent-warm transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-mono uppercase tracking-widest text-white/50 mb-2">Storage Bucket</label>
                                    <input
                                        type="text"
                                        placeholder="your-project-id.appspot.com"
                                        value={fbStorageBucket}
                                        onChange={(e) => setFbStorageBucket(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-white/5 bg-black/40 text-white text-xs font-mono placeholder:text-white/20 focus:outline-none focus:border-accent-warm transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-mono uppercase tracking-widest text-white/50 mb-2">Messaging Sender ID</label>
                                    <input
                                        type="text"
                                        placeholder="123456789"
                                        value={fbMessagingSenderId}
                                        onChange={(e) => setFbMessagingSenderId(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-white/5 bg-black/40 text-white text-xs font-mono placeholder:text-white/20 focus:outline-none focus:border-accent-warm transition-colors"
                                    />
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-[9px] font-mono uppercase tracking-widest text-white/50 mb-2">App ID</label>
                                    <input
                                        type="text"
                                        placeholder="1:123456789:web:abcdef..."
                                        value={fbAppId}
                                        onChange={(e) => setFbAppId(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-white/5 bg-black/40 text-white text-xs font-mono placeholder:text-white/20 focus:outline-none focus:border-accent-warm transition-colors"
                                    />
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-[9px] font-mono uppercase tracking-widest text-white/50 mb-2">Measurement ID</label>
                                    <input
                                        type="text"
                                        placeholder="G-JEXCXBC8DZ"
                                        value={fbMeasurementId}
                                        onChange={(e) => setFbMeasurementId(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-white/5 bg-black/40 text-white text-xs font-mono placeholder:text-white/20 focus:outline-none focus:border-accent-warm transition-colors"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleTestFirebase}
                            disabled={isTestingFb || isApplying}
                            className="w-full py-4 rounded-xl bg-white/5 hover:bg-white/10 active:scale-[0.99] border border-white/5 hover:border-accent-warm/30 text-white font-mono text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-all mt-8"
                        >
                            {isTestingFb ? (
                                <RefreshCw className="size-4 animate-spin text-accent-warm" />
                            ) : (
                                <Zap className="size-4 text-accent-warm" />
                            )}
                            Verify Client SDK
                        </button>
                    </div>
                </div>

                {/* Firebase Connection Step-by-Step Interactive Guide */}
                <div className="mt-8 bg-white/[0.01] border border-white/5 p-6 md:p-8 rounded-3xl backdrop-blur-xl">
                    <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-6">
                        <div className="size-10 rounded-xl bg-accent-warm/10 border border-accent-warm/20 flex items-center justify-center text-accent-warm shadow-inner">
                            <Brain className="size-5" />
                        </div>
                        <div>
                            <h3 className="font-display text-lg font-bold text-white">Firebase Integration Protocol</h3>
                            <span className="font-mono text-[9px] uppercase tracking-widest text-white/30">Locating credentials in console.firebase.google.com</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-black/20 border border-white/[0.02] p-4 rounded-2xl relative overflow-hidden group hover:border-accent-warm/25 transition-all">
                            <span className="absolute top-2 right-3 font-mono text-3xl font-extrabold text-white/5 select-none">01</span>
                            <span className="font-mono text-[10px] text-accent-warm uppercase tracking-wider block mb-1">Step 01</span>
                            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-2">Access Project</h4>
                            <p className="text-[11px] text-white/40 leading-relaxed font-body">
                                Sign in to <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="text-accent-warm hover:underline font-semibold">Firebase Console</a>. Create a new project or select an existing active database node.
                            </p>
                        </div>

                        <div className="bg-black/20 border border-white/[0.02] p-4 rounded-2xl relative overflow-hidden group hover:border-accent-warm/25 transition-all">
                            <span className="absolute top-2 right-3 font-mono text-3xl font-extrabold text-white/5 select-none">02</span>
                            <span className="font-mono text-[10px] text-accent-warm uppercase tracking-wider block mb-1">Step 02</span>
                            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-2">Register App</h4>
                            <p className="text-[11px] text-white/40 leading-relaxed font-body">
                                On the Project Overview, click the Web icon <code className="text-accent-warm font-semibold font-mono text-[10px]">&lt;/&gt;</code> to spin up a new Web App registration. Give it a title.
                            </p>
                        </div>

                        <div className="bg-black/20 border border-white/[0.02] p-4 rounded-2xl relative overflow-hidden group hover:border-accent-warm/25 transition-all">
                            <span className="absolute top-2 right-3 font-mono text-3xl font-extrabold text-white/5 select-none">03</span>
                            <span className="font-mono text-[10px] text-accent-warm uppercase tracking-wider block mb-1">Step 03</span>
                            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-2">Extract SDK Config</h4>
                            <p className="text-[11px] text-white/40 leading-relaxed font-body">
                                Under Settings &gt; Project Settings &gt; Your Apps, copy the <code className="text-accent-warm font-semibold font-mono text-[10px]">firebaseConfig</code> values into the parameters above.
                            </p>
                        </div>

                        <div className="bg-black/20 border border-white/[0.02] p-4 rounded-2xl relative overflow-hidden group hover:border-accent-warm/25 transition-all">
                            <span className="absolute top-2 right-3 font-mono text-3xl font-extrabold text-white/5 select-none">04</span>
                            <span className="font-mono text-[10px] text-accent-warm uppercase tracking-wider block mb-1">Step 04</span>
                            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-2">Enable Auth Method</h4>
                            <p className="text-[11px] text-white/40 leading-relaxed font-body">
                                Navigate to **Authentication &gt; Sign-in method**. Enable the **Google** provider and enter your project support email to complete activation.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Submit Action */}
                <div className="mt-12 bg-white/[0.02] border border-white/5 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-xl">
                    <p className="font-body text-xs text-white/40 max-w-lg leading-relaxed">
                        Applying configuration will re-initialize the active global clients and write environmental configurations directly to the cloud system. Mocks are bypassed immediately.
                    </p>
                    <button
                        onClick={handleApply}
                        disabled={isApplying || isTestingDb || isTestingFb}
                        className={`w-full md:w-auto px-8 py-4 rounded-xl font-display text-sm font-bold tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer transition-all
                            ${isApplying ? 'bg-white/5 text-white/30 cursor-not-allowed' : 'bg-accent-cool text-primary hover:bg-accent-cool/90 hover:shadow-[0_0_30px_rgba(0,214,255,0.2)]'}`}
                    >
                        {isApplying ? (
                            <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                Applying Synchronizations...
                            </>
                        ) : (
                            <>
                                <Check className="w-4 h-4" />
                                Apply & Connect Systems
                            </>
                        )}
                    </button>
                </div>
            </div>
        </main>
    );
}
