"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { APPLE_SPRING } from "@/components/Typography";

interface FloatingStatCardProps {
    title: string;
    stat: string;
    description: string;
    delay?: number;
    icon?: ReactNode;
}

export default function FloatingStatCard({ title, stat, description, delay = 0, icon }: FloatingStatCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 40, filter: "blur(8px)", scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
            viewport={{ once: false, margin: "-10% 0px -10% 0px" }}
            transition={{ duration: 1.0, ease: APPLE_SPRING, delay }}
            className="card-glass relative w-full max-w-[320px] rounded-xl p-8 flex flex-col gap-4 overflow-hidden group hover:border-[rgba(255,107,53,0.40)] transition-colors duration-500"
        >
            {/* Defined in styles but reinforcing here as per PCE top-border spec */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-accent-cool to-transparent opacity-40 group-hover:opacity-100 transition-opacity" />

            <div className="flex items-center gap-3">
                {icon && <div className="text-accent-cool w-5 h-5">{icon}</div>}
                <h4 className="font-mono text-[10px] uppercase tracking-[0.1em] text-[rgba(255,255,255,0.40)]">
                    {title}
                </h4>
            </div>

            <div className="flex flex-col gap-1">
                <span className="font-display text-[42px] font-bold text-gradient-heading tracking-tight leading-[1.1]">
                    {stat}
                </span>
                <p className="font-body text-[14px] text-[rgba(255,255,255,0.60)] leading-relaxed mt-2">
                    {description}
                </p>
            </div>

            <div className="absolute inset-0 bg-gradient-to-b from-accent-cool/0 to-accent-cool/0 group-hover:from-accent-cool/[0.03] transition-all duration-500 pointer-events-none" />
        </motion.div>
    );
}
