"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    Activity, ShieldCheck, Twitter,
    Linkedin, Github, ArrowUpRight,
    Terminal, X
} from "lucide-react";

const footerData = {
    // Platform
    "Neural Atlas": {
        title: "Neural Atlas Protocol",
        subtitle: "Volumetric 3D Reconstructor & Segmentation Node",
        details: "Voxel-level 3D thoracic modeling leveraging convolutional U-Net architectures to isolate, align, and reconstruct pulmonary tissue layers at 0.8mm voxel resolution.",
        metric: "98.4% mIoU",
        metricLabel: "Segmentation Accuracy"
    },
    "Diagnostic AI": {
        title: "Diagnostic Classification Engine",
        subtitle: "Multi-Label Pathology Classification Pipeline",
        details: "High-resolution convolutional classification networks designed to screen chest radiographs instantly for COVID-19, Pneumonia, and normal findings.",
        metric: "150k+ Scans",
        metricLabel: "Training Library size"
    },
    "Surgical Specs": {
        title: "Surgical Boundaries Spec",
        subtitle: "Clinical Operation Boundary Outlines",
        details: "Dynamic export system for 3D visual contours (.glb models) mapping exact pulmonary lobes, tissue densities, and segmented volumetric boundaries.",
        metric: "< 800ms",
        metricLabel: "Mesh Synthesis Latency"
    },
    "Security": {
        title: "Clinical Encryption Shield",
        subtitle: "Zero-Knowledge Clinical Protocol",
        details: "Complete compliance framework. Transmitted scan files are assigned unique dynamic UUID tags and encrypted using AES-GCM-256 before analysis passes.",
        metric: "AES-256",
        metricLabel: "Encryption Layer"
    },
    // Company
    "About Lab": {
        title: "EXPLung Pulmonary Lab",
        subtitle: "Computer Vision & Thoracic Informatics research",
        details: "A state-of-the-art medical research laboratory dedicated to producing diagnostic visual networks and advanced clinical user environments.",
        metric: "VIT, Pune",
        metricLabel: "Affiliated Node"
    },
    "Science": {
        title: "Clinical Validation Science",
        subtitle: "Peer-Reviewed Medical AI Validation",
        details: "Developed in strict accordance with radiological consortia guidelines. Validation cohorts show extreme resilience against scan anomalies and patient movement artifacts.",
        metric: "97.8%",
        metricLabel: "System Sensitivity"
    },
    "Careers": {
        title: "Pulmonary Lab Careers",
        subtitle: "Join the Neural Engineering Team",
        details: "Seeking brilliant minds in Computer Vision, Medical Physics, and Next-Generation Medical UI. Positions open at our main research campus in Pune.",
        metric: "2 Positions",
        metricLabel: "Active Openings"
    },
    "Contact": {
        title: "Lab Registry Directory",
        subtitle: "Contact System Architects",
        details: "Initiate professional consortia partnerships, request custom local server weights deployments, or troubleshoot database configurations.",
        metric: "Active",
        metricLabel: "Inquiry Response Feed"
    },
    // Open Source
    "Documentation": {
        title: "Developer Manual",
        subtitle: "API Integration & Local Setup Guides",
        details: "Step-by-step developer resources, including Next.js app router details, transparent Supabase database patch adapters, and FastAPI routing.",
        metric: "v1.4.2",
        metricLabel: "Current Release Version"
    },
    "API Reference": {
        title: "Swagger API Terminal",
        subtitle: "REST API Endpoint Specifications",
        details: "Standardized FastAPI swagger endpoint structures. Supports third-party PACS client telemetry and real-time JSON polling loops.",
        metric: "Active",
        metricLabel: "Swagger Docs Portal"
    },
    "U-Net Code": {
        title: "Open Source Model Core",
        subtitle: "U-Net Segmentation Python Scripts",
        details: "Open-source PyTorch code for raw thoracic segment mapping and lung boundary outline detection, located in our `/backend/services` module.",
        metric: "PyTorch",
        metricLabel: "Model Framework"
    },
    "Model weights": {
        title: "Model Weight Serializations",
        subtitle: "Optimized ONNX Inference Weights",
        details: "Direct serialized weight assets optimized to run zero-latency browser diagnostics using ONNX Web Runtime engines.",
        metric: "128MB",
        metricLabel: "Quantized Float16 size"
    },
    // Bottom Bar
    "Privacy": {
        title: "Clinical Data Privacy Agreement",
        subtitle: "Zero Patient Info Collection Policy",
        details: "We store absolute zero patient identifiers. Uploaded imagery is processed completely inside sandboxed processing instances to guarantee confidentiality.",
        metric: "100%",
        metricLabel: "Anonymity Guaranteed"
    },
    "Terms": {
        title: "Medical AI Terms of Use",
        subtitle: "Diagnostic Decision Support Standard",
        details: "EXPLung AI acts solely as an auxiliary radiological decision-support pipeline. All insights require validation by a certified medical specialist.",
        metric: "FDA Class II",
        metricLabel: "Intended Guidance Tier"
    },
    "HIPAA Compliant": {
        title: "HIPAA Clinical Standard",
        subtitle: "Clinical Data Protection Architecture",
        details: "Fully insulated web structure built around zero-knowledge user access tokens. Guaranteed protection of critical health information logs.",
        metric: "Compliant",
        metricLabel: "Regulatory Rating"
    },
    "Encryption Active": {
        title: "Telemetry Encryption Grid",
        subtitle: "End-to-End Database Sync Protection",
        details: "All real-time communications are isolated using client bearer keys and transport encrypted using state-of-the-art TLS 1.3 tunnels.",
        metric: "TLS 1.3",
        metricLabel: "Security Cipher Suite"
    },
    "Status": {
        title: "Cloud Network Node Live Status",
        subtitle: "Firebase Cloud Auth & Supabase Synced",
        details: "The pulmonary cloud pipeline is active. Authentic Google Sign-In, Email authorization, and Supabase Real-time websockets are fully synchronized.",
        metric: "99.99%",
        metricLabel: "Telemetry Uptime"
    },
    "Status Progress": {
        title: "Establishing Pipeline Connection",
        subtitle: "System Nodes Initializing...",
        details: "The pulmonary cloud pipeline is establishing handshakes with Firebase Cloud Auth and syncing local Supabase database schemas. Handshakes are under progress.",
        metric: "Synchronizing",
        metricLabel: "Connection Phase"
    },
    // Extra elements made touchable
    "Headquarters": {
        title: "Consortium Headquarters Node",
        subtitle: "Pune Pulmonary Engineering Lab",
        details: "Operating from the Vishwakarma Institute of Technology (VIT), Pune. The lab hosts visual server arrays and local training pipelines for high-precision U-Net model checkpoints.",
        metric: "VIT, Pune",
        metricLabel: "Affiliated Node"
    },
    "Brand Details": {
        title: "EXPLung Architectural Vision",
        subtitle: "Thoracic Imaging Core",
        details: "To synthesize clinical radiology workflows with real-time client-side interactive models. The U-Net segmentation core delivers unparalleled diagnostic transparency.",
        metric: "Active Atlas",
        metricLabel: "System Status"
    },
    "GDPR Compliance": {
        title: "GDPR & Data Protection Agreement",
        subtitle: "Zero-Knowledge Clinical Protocol",
        details: "All telemetry, search history, and lung scans uploaded are encrypted via client-side keys and kept completely isolated. We adhere strictly to GDPR standard HIPAA protection guidelines.",
        metric: "Compliant",
        metricLabel: "Insulation Level"
    },
    "Licensure & Copyright": {
        title: "Copyright & Intellectual Property Node",
        subtitle: "Clinical Reciprocity Licensure",
        details: "All visual assets, model weight serializations, and diagnostic shaders are developed by the EXPLung team. Code licensed under Open-Source Medical reciprocal guidelines.",
        metric: "VIT Pune, 2026",
        metricLabel: "Copyright Registration"
    },
    "Platform Suite": {
        title: "Inference & Analysis Suite",
        subtitle: "Pulmonary Neural Nodes",
        details: "The complete system array combining volumetric shaders, radiographic classification, surgical boundary generation, and clinical telemetry transport.",
        metric: "4 Components",
        metricLabel: "System Stack"
    },
    "Lab Consortium": {
        title: "Informatics & Medical Science Consortium",
        subtitle: "Pulmonary Lab Infrastructure",
        details: "A dedicated group of computer vision engineers, medical physics advisors, and academic collaborators based in Pune, India.",
        metric: "VIT, Pune",
        metricLabel: "Principal Affiliation"
    },
    "Open Source Initiative": {
        title: "Open Medical Research Initiative",
        subtitle: "Shared Diagnostic intelligence",
        details: "Transparency is critical for clinical confidence. Our core U-Net segmentation routines and browser-quantized ONNX model weights are fully open-source.",
        metric: "MIT / CC-BY",
        metricLabel: "Licensure Framework"
    },
    "Newsletter Pipeline": {
        title: "Clinical Dispatch & Communications",
        subtitle: "Informatics Dispatch Node",
        details: "Direct communication channel distributing new model weights, security updates, clinical validation studies, and database sync options.",
        metric: "Monthly",
        metricLabel: "Frequency"
    }
};

export default function Footer() {
    const [activeTerminal, setActiveTerminal] = useState<{
        title: string;
        subtitle: string;
        details: string;
        metric?: string;
        metricLabel?: string;
    } | null>(null);

    // Live status indicator transition simulation
    const [systemStatus, setSystemStatus] = useState<"progress" | "live">("progress");

    useEffect(() => {
        const timer = setTimeout(() => {
            setSystemStatus("live");
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <footer className="relative bg-black/80 backdrop-blur-3xl border-t border-white/10 pt-20 pb-10 overflow-hidden">
            {/* Background Accent */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[300px] bg-accent-cool/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="container mx-auto px-6 max-w-[1400px] relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-20">

                    {/* Brand Column */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="flex flex-col gap-4">
                            <Link href="/" className="group flex items-center gap-3 w-fit">
                                <div className="size-10 rounded-xl bg-accent-cool flex items-center justify-center shadow-[0_0_20px_rgba(0,214,255,0.4)] transition-transform group-hover:scale-110">
                                    <Activity className="size-5 text-primary stroke-[3]" />
                                </div>
                                <span className="font-display text-2xl font-black tracking-tighter text-white">
                                    EXPLung <span className="text-accent-cool">PULMONARY.</span>
                                </span>
                            </Link>

                            <button
                                onClick={() => {
                                    const data = footerData["Brand Details" as keyof typeof footerData];
                                    if (data) setActiveTerminal(data);
                                }}
                                className="text-sm text-text-muted hover:text-white hover:border-white/20 transition-all border border-transparent rounded-xl p-3 bg-white/[0.01] hover:bg-white/[0.03] text-left focus:outline-none leading-relaxed max-w-sm group cursor-pointer"
                            >
                                Advancing thoracic medicine through <span className="text-accent-cool font-bold group-hover:underline">hyper-precision AI</span>. Our neural atlas provides clinicians with real-time volumetric insights for complex diagnostic support.
                            </button>
                        </div>

                        <div className="flex items-center gap-6">
                            <button
                                onClick={() => {
                                    const data = footerData["Headquarters" as keyof typeof footerData];
                                    if (data) setActiveTerminal(data);
                                }}
                                className="flex flex-col gap-1 items-start text-left focus:outline-none cursor-pointer group p-1.5 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
                            >
                                <span className="font-mono text-[9px] uppercase tracking-widest text-white/40 group-hover:text-accent-cool transition-colors">Headquarters</span>
                                <span className="text-xs font-bold text-white uppercase group-hover:underline">VIT, Pune</span>
                            </button>

                            <div className="w-[1px] h-8 bg-white/10 animate-pulse" />

                            <button 
                                onClick={() => {
                                    const key = systemStatus === "progress" ? "Status Progress" : "Status";
                                    const data = footerData[key as keyof typeof footerData];
                                    if (data) setActiveTerminal(data);
                                }}
                                className="flex flex-col gap-1 items-start group text-left focus:outline-none cursor-pointer p-1.5 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
                            >
                                <span className="font-mono text-[9px] uppercase tracking-widest text-white/40 group-hover:text-accent-cool transition-colors">Status</span>
                                <div className="flex items-center gap-2">
                                    <div className={`size-1.5 rounded-full ${systemStatus === 'live' ? 'bg-emerald-500 shadow-[0_0_8px_#10B981]' : 'bg-amber-500 shadow-[0_0_8px_#F59E0B]'} animate-pulse`} />
                                    <span className={`text-xs font-bold ${systemStatus === 'live' ? 'text-accent-cool' : 'text-amber-500'} uppercase tracking-wider group-hover:underline`}>
                                        {systemStatus === "live" ? "Is Live" : "Under Progress"}
                                    </span>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Links Grid */}
                    <div className="lg:col-span-5 grid grid-cols-2 md:grid-cols-3 gap-8">
                        <div className="space-y-6">
                            <button
                                onClick={() => {
                                    const data = footerData["Platform Suite" as keyof typeof footerData];
                                    if (data) setActiveTerminal(data);
                                }}
                                className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent-cool font-black hover:text-white transition-colors cursor-pointer text-left focus:outline-none group"
                            >
                                <span className="group-hover:underline">Platform</span>
                            </button>
                            <ul className="space-y-4">
                                {["Neural Atlas", "Diagnostic AI", "Surgical Specs", "Security"].map((item) => (
                                    <li key={item}>
                                        <button
                                            onClick={() => {
                                                const data = footerData[item as keyof typeof footerData];
                                                if (data) setActiveTerminal(data);
                                            }}
                                            className="text-sm text-text-muted hover:text-white hover:underline transition-all cursor-pointer text-left focus:outline-none"
                                        >
                                            {item}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="space-y-6">
                            <button
                                onClick={() => {
                                    const data = footerData["Lab Consortium" as keyof typeof footerData];
                                    if (data) setActiveTerminal(data);
                                }}
                                className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent-cool font-black hover:text-white transition-colors cursor-pointer text-left focus:outline-none group"
                            >
                                <span className="group-hover:underline">Company</span>
                            </button>
                            <ul className="space-y-4">
                                {["About Lab", "Science", "Careers", "Contact"].map((item) => (
                                    <li key={item}>
                                        <button
                                            onClick={() => {
                                                const data = footerData[item as keyof typeof footerData];
                                                if (data) setActiveTerminal(data);
                                            }}
                                            className="text-sm text-text-muted hover:text-white hover:underline transition-all cursor-pointer text-left focus:outline-none"
                                        >
                                            {item}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="space-y-6">
                            <button
                                onClick={() => {
                                    const data = footerData["Open Source Initiative" as keyof typeof footerData];
                                    if (data) setActiveTerminal(data);
                                }}
                                className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent-cool font-black hover:text-white transition-colors cursor-pointer text-left focus:outline-none group"
                            >
                                <span className="group-hover:underline">Open Source</span>
                            </button>
                            <ul className="space-y-4">
                                {["Documentation", "API Reference", "U-Net Code", "Model weights"].map((item) => (
                                    <li key={item}>
                                        <button
                                            onClick={() => {
                                                const data = footerData[item as keyof typeof footerData];
                                                if (data) setActiveTerminal(data);
                                            }}
                                            className="text-sm text-text-muted hover:text-white hover:underline transition-all cursor-pointer text-left focus:outline-none"
                                        >
                                            {item}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Subscription Column */}
                    <div className="lg:col-span-3 space-y-6">
                        <button
                            onClick={() => {
                                const data = footerData["Newsletter Pipeline" as keyof typeof footerData];
                                if (data) setActiveTerminal(data);
                            }}
                            className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent-cool font-black hover:text-white transition-colors cursor-pointer text-left focus:outline-none group"
                        >
                            <span className="group-hover:underline">Research Newsletter</span>
                        </button>
                        <div className="relative group">
                            <input
                                type="email"
                                placeholder="Medical ID or Email"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-accent-cool/50 transition-all"
                            />
                            <button 
                                onClick={() => {
                                    setActiveTerminal({
                                        title: "Clinical Newsletter Registry",
                                        subtitle: "Medical Informatics Dispatch",
                                        details: "Your medical credential or email has been queued for HIPAA-compliant clinical dispatch registrations. New model checkpoint releases will synchronize to your inbox.",
                                        metric: "Queued",
                                        metricLabel: "Subscription Status"
                                    });
                                }}
                                className="absolute right-2 top-2 size-10 rounded-xl bg-accent-cool flex items-center justify-center text-primary hover:bg-white transition-all cursor-pointer shadow-[0_0_10px_rgba(0,214,255,0.3)] hover:shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                            >
                                <ArrowUpRight className="size-4" />
                            </button>
                        </div>
                        <button
                            onClick={() => {
                                const data = footerData["GDPR Compliance" as keyof typeof footerData];
                                if (data) setActiveTerminal(data);
                            }}
                            className="text-[10px] text-white/30 hover:text-white/70 transition-colors leading-relaxed italic text-left focus:outline-none cursor-pointer"
                        >
                            By joining, you agree to our <span className="underline font-semibold">GDPR & HIPAA data processing policies</span>. Professional use only.
                        </button>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex flex-wrap items-center justify-center gap-6">
                        <button
                            onClick={() => {
                                const data = footerData["HIPAA Compliant" as keyof typeof footerData];
                                if (data) setActiveTerminal(data);
                            }}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-accent-cool/40 transition-all text-left focus:outline-none cursor-pointer hover:bg-white/[0.08]"
                        >
                            <ShieldCheck className="size-3.5 text-accent-cool" />
                            <span className="text-[10px] font-bold text-white tracking-widest uppercase">HIPAA Compliant</span>
                        </button>
                        <button
                            onClick={() => {
                                const data = footerData["Encryption Active" as keyof typeof footerData];
                                if (data) setActiveTerminal(data);
                            }}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-accent-warm/40 transition-all text-left focus:outline-none cursor-pointer hover:bg-white/[0.08]"
                        >
                            <Terminal className="size-3.5 text-accent-warm" />
                            <span className="text-[10px] font-bold text-white tracking-widest uppercase">Encryption Active</span>
                        </button>
                    </div>

                    <div className="flex items-center gap-8 text-[11px] font-mono uppercase tracking-[0.2em] text-white/45">
                        {["Privacy", "Terms", "Security"].map((item) => (
                            <button
                                key={item}
                                onClick={() => {
                                    const data = footerData[item as keyof typeof footerData];
                                    if (data) setActiveTerminal(data);
                                }}
                                className="hover:text-white hover:underline transition-all cursor-pointer focus:outline-none"
                            >
                                {item}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-6">
                        {[
                            { Icon: Twitter, name: "Twitter Telemetry Feed" },
                            { Icon: Linkedin, name: "LinkedIn Clinical Network" },
                            { Icon: Github, name: "GitHub Open Repository" }
                        ].map(({ Icon, name }, i) => (
                            <button 
                                key={i}
                                onClick={() => {
                                    setActiveTerminal({
                                        title: name,
                                        subtitle: "Research Communications Node",
                                        details: `Synchronize with our development community on social telemetry feeds for immediate updates regarding thoracic visual informatics and new model weights release notifications.`,
                                        metric: "Connected",
                                        metricLabel: "Status"
                                    });
                                }}
                                className="text-white/45 hover:text-accent-cool transition-all cursor-pointer focus:outline-none hover:scale-110"
                            >
                                <Icon className="size-4" />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <button
                        onClick={() => {
                            const data = footerData["Licensure & Copyright" as keyof typeof footerData];
                            if (data) setActiveTerminal(data);
                        }}
                        className="text-[10px] text-white/20 hover:text-white/60 transition-all font-mono uppercase tracking-[0.4em] focus:outline-none cursor-pointer p-2 rounded-lg hover:bg-white/[0.02]"
                    >
                        &copy; {new Date().getFullYear()} EXPLung Pulmonary AI Lab. All rights reserved. <span className="underline">Precision in every breath.</span>
                    </button>
                </div>
            </div>

            {/* Terminal specs overlay card */}
            <AnimatePresence>
                {activeTerminal && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 30, scale: 0.95 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="fixed bottom-6 right-6 z-50 w-full max-w-[420px] p-6 border border-accent-cool/30 bg-[#070c19]/95 backdrop-blur-2xl rounded-2xl shadow-[0_0_50px_rgba(0,214,255,0.15)] flex flex-col gap-4 text-white"
                    >
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <div className="flex items-center gap-2">
                                <div className="size-2 rounded-full bg-accent-cool animate-ping" />
                                <span className="font-mono text-[9px] uppercase tracking-wider text-accent-cool">
                                    Clinical Terminal Telemetry
                                </span>
                            </div>
                            <button
                                onClick={() => setActiveTerminal(null)}
                                className="text-white/40 hover:text-white transition-colors focus:outline-none cursor-pointer"
                            >
                                <X className="size-4" />
                            </button>
                        </div>
                        
                        <div>
                            <span className="font-mono text-[10px] uppercase text-white/40 tracking-widest block mb-1">
                                {activeTerminal.subtitle}
                            </span>
                            <h3 className="font-display text-lg font-extrabold tracking-wide uppercase text-white">
                                {activeTerminal.title}
                            </h3>
                            <p className="text-xs text-white/60 font-body leading-relaxed mt-2">
                                {activeTerminal.details}
                            </p>
                        </div>

                        {activeTerminal.metric && (
                            <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 px-4 py-3 rounded-xl mt-1">
                                <span className="font-mono text-[9px] uppercase tracking-wider text-white/40">
                                    {activeTerminal.metricLabel}
                                </span>
                                <span className="font-mono text-xs font-bold text-accent-cool">
                                    {activeTerminal.metric}
                                </span>
                            </div>
                        )}
                        
                        {activeTerminal.title.includes("API Reference") && (
                            <a
                                href="http://localhost:8005/docs"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-2.5 bg-accent-cool/10 hover:bg-accent-cool/20 border border-accent-cool/30 rounded-xl text-center font-mono text-[10px] uppercase tracking-widest text-accent-cool hover:text-white transition-all mt-2 cursor-pointer shadow-[0_0_15px_rgba(0,214,255,0.1)] hover:shadow-[0_0_20px_rgba(0,214,255,0.3)]"
                            >
                                Launch API Swagger Terminal
                            </a>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </footer>
    );
}
