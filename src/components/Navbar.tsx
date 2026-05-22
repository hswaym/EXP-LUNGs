"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Home, Compass, History, Activity, LogIn, LogOut } from "lucide-react";

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const { user, signOut } = useAuth();
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { href: "/", label: "Home", icon: Home },
        { href: "/explore", label: "Explore", icon: Compass },
        { href: "/history", label: "History", icon: History },
        { href: "/analyze", label: "AI Tool", icon: Activity, isHighlight: true }
    ];

    return (
        <motion.nav
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 flex items-center justify-between px-6 md:px-12 ${
                isScrolled 
                    ? "h-[50px] bg-[#050505]/90 backdrop-blur-md border-b border-[rgba(255,255,255,0.08)] shadow-[0_4px_30px_rgba(0,0,0,0.5)]" 
                    : "h-[64px] bg-transparent border-b border-transparent"
            }`}
        >
            {/* Logo */}
            <Link
                href="/"
                className="flex items-center gap-2 text-[16px] font-brand tracking-[0.15em] text-white uppercase hover:text-accent-cool transition-all duration-300 drop-shadow-[0_0_8px_rgba(0,180,216,0.3)]"
            >
                <span className="text-xl">🫁</span>
                <span className="hidden sm:inline">EXPLung</span>
            </Link>
            
            {/* Main Links */}
            <div className="flex gap-4 md:gap-8 items-center">
                {navLinks.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`relative text-[11px] font-body tracking-[0.1em] uppercase font-semibold transition-all duration-300 flex items-center gap-1.5 px-3 py-1.5 rounded-md ${
                                isActive
                                    ? "text-white bg-white/5 shadow-[0_0_15px_rgba(0,180,216,0.1)] border border-[rgba(255,255,255,0.08)]"
                                    : "text-white/60 hover:text-white"
                            }`}
                        >
                            {link.isHighlight && (
                                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-accent-cool" : "bg-accent-cool animate-pulse"}`} />
                            )}
                            <span>{link.label}</span>
                            
                            {/* Neon Indicator Pill */}
                            {isActive && (
                                <motion.div
                                    layoutId="activeNavIndicator"
                                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent-cool shadow-[0_0_8px_rgba(0,180,216,0.8)]"
                                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                />
                            )}
                        </Link>
                    );
                })}

                <div className="h-4 w-[1px] bg-[rgba(255,255,255,0.15)] mx-1" />

                {/* Setup & Account Status */}
                <div className="flex items-center gap-3">
                    <Link
                        href="/setup"
                        className={`text-[10px] font-body tracking-[0.08em] border px-3 py-1.5 rounded-md transition-colors uppercase font-semibold cursor-pointer ${
                            pathname === "/setup"
                                ? "text-accent-cool border-accent-cool bg-accent-cool/5"
                                : "text-white/60 border-white/10 hover:border-white/20 hover:text-white"
                        }`}
                    >
                        Setup
                    </Link>

                    {user ? (
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-mono text-gray-500 max-w-[120px] truncate hidden md:inline-block">
                                {user.email}
                            </span>
                            <button
                                onClick={signOut}
                                className="text-[10px] font-body tracking-[0.08em] text-accent-cool border border-accent-cool/30 hover:border-accent-cool hover:bg-accent-cool/10 px-3 py-1.5 rounded-md transition-colors uppercase font-semibold cursor-pointer flex items-center gap-1 animate-pulse hover:animate-none"
                                style={{ animationDuration: '4s' }}
                            >
                                <LogOut className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Log Out</span>
                            </button>
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            className="text-[10px] font-body tracking-[0.08em] text-white bg-accent-cool/20 border border-accent-cool/40 hover:bg-accent-cool px-3 py-1.5 rounded-md transition-all duration-300 uppercase font-semibold cursor-pointer flex items-center gap-1"
                        >
                            <LogIn className="w-3.5 h-3.5" />
                            <span>Log In</span>
                        </Link>
                    )}
                </div>
            </div>
        </motion.nav>
    );
}
