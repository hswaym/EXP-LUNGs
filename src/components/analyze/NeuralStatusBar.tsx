"use client";

import { Activity, Shield, Wifi, Cpu } from "lucide-react";

export default function NeuralStatusBar() {
    return (
        <footer className="h-10 bg-secondary/50 backdrop-blur-md border-t border-white/5 px-6 flex items-center justify-between shrink-0 z-50">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <div className="size-1.5 rounded-full bg-accent-cool animate-pulse" />
                    <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-accent-cool font-bold">Engine: Online</span>
                </div>
                <div className="h-3 w-[1px] bg-white/10" />
                <div className="flex items-center gap-2">
                    <Cpu className="size-3 text-text-muted" />
                    <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-muted">GPU Load: 12%</span>
                </div>
            </div>

            <div className="flex items-center gap-8">
                <div className="flex items-center gap-2">
                    <Wifi className="size-3 text-text-muted" />
                    <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-muted">Latency: 42ms</span>
                </div>
                <div className="flex items-center gap-2">
                    <Shield className="size-3 text-accent-cool/50" />
                    <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-muted">SSL Encrypted</span>
                </div>
                <div className="flex items-center gap-2 bg-accent-cool/10 px-3 py-1 rounded-full border border-accent-cool/20">
                    <Activity className="size-3 text-accent-cool" />
                    <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-accent-cool font-black">Ready for Analysis</span>
                </div>
            </div>
        </footer>
    );
}
