"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useImageSequence } from "@/hooks/useImageSequence";
import { motion, useMotionValue, animate } from "framer-motion";

const TOTAL_FRAMES = 240;

interface LaunchCanvasProps {
    onSequenceComplete: () => void;
    prefersReducedMotion: boolean | null;
}

export default function LaunchCanvas({ onSequenceComplete, prefersReducedMotion }: LaunchCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [activePreloadFrame, setActivePreloadFrame] = useState(1);
    const [showSkip, setShowSkip] = useState(false);
    
    // Using Framer Motion's high-performance primitive for the frame decimal
    const frameIndex = useMotionValue(1);

    const { isLoaded, loadProgress, getImage } = useImageSequence(activePreloadFrame);

    const draw = useCallback((currentFrame: number, currentOpacity: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d", { alpha: false });
        if (!ctx) return;

        const img = getImage(Math.round(currentFrame));

        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();

        const rectWidth = rect.width || window.innerWidth;
        const rectHeight = rect.height || window.innerHeight;

        if (canvas.width !== Math.floor(rectWidth * dpr) || canvas.height !== Math.floor(rectHeight * dpr)) {
            canvas.width = Math.floor(rectWidth * dpr);
            canvas.height = Math.floor(rectHeight * dpr);
            ctx.scale(dpr, dpr);
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
        }

        ctx.fillStyle = "#050505";
        ctx.fillRect(0, 0, Math.floor(rectWidth * dpr), Math.floor(rectHeight * dpr));

        if (img) {
            ctx.globalAlpha = currentOpacity;
            const ratio = Math.max(rectWidth / img.width, rectHeight / img.height);
            const centerShift_x = (rectWidth - img.width * ratio) / 2;
            const centerShift_y = (rectHeight - img.height * ratio) / 2;

            ctx.drawImage(
                img,
                0, 0, img.width, img.height,
                centerShift_x, centerShift_y, img.width * ratio, img.height * ratio
            );
            ctx.globalAlpha = 1.0;
        }
    }, [getImage]);

    useEffect(() => {
        if (!isLoaded) return;

        let animationFrameId: number;
        let pOpacity = 0;
        
        const renderLoop = () => {
             draw(frameIndex.get(), pOpacity);
             animationFrameId = requestAnimationFrame(renderLoop);
        };
        renderLoop();

        // 1. Fade In Sequence (0 - 1.5s)
        const fadeControls = animate(0, 1, {
            duration: 1.5,
            ease: "linear",
            onUpdate: (v) => { pOpacity = v; }
        });

        const showSkipTimer = setTimeout(() => setShowSkip(true), 1500);

        // 2. Playback Sequence (1.5s - 7.0s) -> 5.5s duration
        const playControls = animate(1, TOTAL_FRAMES, {
            delay: 1.5,
            duration: 5.5,
            ease: [0.16, 1, 0.3, 1], // ease-out-expo
            onUpdate: (latest) => {
                frameIndex.set(latest);
                setActivePreloadFrame(Math.round(latest));
            },
            onComplete: () => {
                setShowSkip(false);
                setTimeout(onSequenceComplete, 1000); // Wait the 1.0s lock (7.0 - 8.0s) before signalling complete
            }
        });

        // Fast forward for reduced motion
        if (prefersReducedMotion) {
            // Use requestAnimationFrame to defer state updates and avoid cascading render warnings
            requestAnimationFrame(() => {
                fadeControls.stop();
                playControls.stop();
                pOpacity = 1;
                frameIndex.set(TOTAL_FRAMES);
                draw(TOTAL_FRAMES, 1);
                onSequenceComplete();
            });
        }

        return () => {
            cancelAnimationFrame(animationFrameId);
            fadeControls.stop();
            playControls.stop();
            clearTimeout(showSkipTimer);
        };
    }, [isLoaded, prefersReducedMotion, frameIndex, draw, onSequenceComplete]);

    const handleSkip = () => {
        onSequenceComplete();
    };

    return (
        <>
            {!isLoaded && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary flex-col gap-4">
                    <div className="w-64 h-1 bg-black/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-accent-cool transition-all duration-300 ease-out"
                            style={{ width: `${loadProgress}%` }}
                        />
                    </div>
                    <p className="text-text-muted text-sm font-mono uppercase tracking-widest">
                        Initializing Sequence... {Math.round(loadProgress)}%
                    </p>
                </div>
            )}

            <canvas
                ref={canvasRef}
                className="w-full h-full object-cover pointer-events-none"
            />
            
            {showSkip && !prefersReducedMotion && (
                <motion.button 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleSkip}
                    className="absolute bottom-8 right-8 px-4 py-2 text-[12px] text-black/30 hover:text-black/60 transition-colors uppercase font-mono tracking-widest z-50 cursor-pointer pointer-events-auto"
                >
                    Skip Intro
                </motion.button>
            )}
        </>
    );
}
