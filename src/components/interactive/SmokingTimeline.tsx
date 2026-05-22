"use client";

import { useState } from "react";

export default function SmokingTimeline() {
    const [years, setYears] = useState(0);

    // Map 0-40 years to a damage percentage 0-100
    const damagePercent = (years / 40) * 100;

    // Calculate colors based on damage
    // Healthy: #F0E6D3 (Ivory) -> Necrotic: #3A2A20 (Dark Brown) via opacity blends.

    return (
        <div className="card-glass w-full max-w-[600px] mx-auto p-10 rounded-2xl flex flex-col gap-10 relative overflow-hidden group">

            {/* Dynamic Background Overlay representing lung tissue state */}
            <div
                className="absolute inset-0 transition-opacity duration-300 pointer-events-none z-0 mix-blend-multiply"
                style={{
                    backgroundColor: '#3A2A20',
                    opacity: (damagePercent / 100) * 0.9
                }}
            />

            {/* Progressive Tar Spots (Blurry dark patches) */}
            <div
                className="absolute w-[200px] h-[200px] bg-black/80 rounded-full blur-[40px] top-[-50px] left-[-50px] transition-opacity duration-1000 z-0 pointer-events-none"
                style={{ opacity: years > 5 ? (years - 5) / 35 : 0 }}
            />
            <div
                className="absolute w-[300px] h-[300px] bg-black/90 rounded-full blur-[50px] bottom-[-100px] right-[-100px] transition-opacity duration-1000 z-0 pointer-events-none"
                style={{ opacity: years > 20 ? (years - 20) / 20 : 0 }}
            />
            <div
                className="absolute w-[150px] h-[150px] bg-[#1a0f0a]/80 rounded-full blur-[30px] top-[40%] right-[10%] transition-opacity duration-1000 z-0 pointer-events-none"
                style={{ opacity: years > 30 ? (years - 30) / 10 : 0 }}
            />

            {/* Content wrapper */}
            <div className="relative z-10 flex flex-col gap-3">
                <h3 className="font-display text-[24px] font-semibold text-white">Carcinogen Exposure Simulator</h3>
                <p className="font-body text-[14px] text-white/70 leading-relaxed max-w-[90%]">
                    Drag the slider to observe the progressive necrotic damage of a 1-pack-a-day habit on alveolar tissue over 40 years.
                </p>
            </div>

            <div className="relative z-10 flex flex-col items-center gap-6 mt-4">
                <div className="relative w-full h-[6px] bg-white/10 rounded-full">
                    {/* Active Track */}
                    <div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-accent-warm to-accent-crimson rounded-full"
                        style={{ width: `${damagePercent}%` }}
                    />
                    {/* Slider Input */}
                    <input
                        type="range"
                        min="0"
                        max="40"
                        value={years}
                        onChange={(e) => setYears(Number(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
                    />
                    {/* Custom Thumb Indicator */}
                    <div
                        className="absolute top-1/2 -mt-3 w-6 h-6 bg-white border-[3px] border-accent-warm rounded-full shadow-[0_0_20px_rgba(255,107,53,0.8)] pointer-events-none transition-transform group-hover:scale-110"
                        style={{ left: `calc(${damagePercent}% - 12px)` }}
                    />
                </div>

                <div className="flex justify-between w-full font-mono text-[11px] text-white/40 px-1 uppercase tracking-widest">
                    <span>Healthy</span>
                    <span>40 Years</span>
                </div>

                <div className="mt-6 flex flex-col items-center p-6 bg-black/40 rounded-xl border border-white/5 w-full backdrop-blur-md">
                    <span className="font-display text-[56px] font-bold text-gradient-heading leading-[1]">
                        {years} <span className="text-[20px] text-white/40 font-medium">Yrs</span>
                    </span>

                    <div className="mt-4 px-4 py-2 border border-white/10 rounded-full bg-white/5">
                        <span className="font-mono text-[12px] text-accent-warm uppercase tracking-[0.1em] font-semibold">
                            {years === 0 ? "Optimal Function" :
                                years < 10 ? "Chronic Inflammation" :
                                    years < 20 ? "Cilia Destruction" :
                                        years < 30 ? "Emphysema Onset" : "Severe Necrosis"}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
