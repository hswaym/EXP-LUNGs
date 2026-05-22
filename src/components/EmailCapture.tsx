"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function EmailCapture() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setStatus("submitting");
        // Simulate API call
        setTimeout(() => setStatus("success"), 800);
    };

    return (
        <div className="w-full max-w-[560px] mx-auto mt-12 mb-4 flex flex-col items-center">
            {status === "success" ? (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center gap-2 h-[52px] justify-center"
                >
                    <div className="flex items-center gap-2 text-black/80 text-[18px] font-medium">
                        ✓ You&apos;re on the list.
                    </div>
                    <span className="text-black/50 text-[14px]">
                        We&apos;ll notify you the moment Lung Atlas launches.
                    </span>
                </motion.div>
            ) : (
                <motion.form
                    onSubmit={handleSubmit}
                    className="flex flex-col md:flex-row gap-4 items-center justify-center w-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        className="w-full md:w-[380px] h-[64px] bg-white/80 backdrop-blur-md border border-black/5 rounded-[12px] px-6 text-black/90 text-[18px] placeholder:text-black/30 focus:outline-none focus:border-accent-warm focus:ring-[4px] focus:ring-accent-warm/10 shadow-[0_4px_24px_rgba(0,0,0,0.02)] transition-all duration-200"
                        required
                        disabled={status === "submitting"}
                    />
                    <button
                        type="submit"
                        disabled={status === "submitting"}
                        className="w-full md:w-[200px] h-[64px] rounded-[12px] bg-gradient-to-br from-accent-warm to-accent-cool text-white font-semibold text-[16px] hover:opacity-95 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(232,90,42,0.25)] active:translate-y-0 transition-all duration-300 flex items-center justify-center cursor-pointer"
                    >
                        {status === "submitting" ? "Submitting..." : "Notify Me"}
                    </button>
                </motion.form>
            )}

            <span className="text-black/30 text-[13px] text-center mt-8 font-medium">
                No spam. Launch notification only. Unsubscribe anytime.
            </span>
        </div>
    );
}
