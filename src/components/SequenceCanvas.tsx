"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useImageSequence } from "@/hooks/useImageSequence";

interface SequenceCanvasProps {
    prefersReducedMotion: boolean | null;
}

const TOTAL_FRAMES = 240;

export default function SequenceCanvas({ prefersReducedMotion }: SequenceCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // We separate the exact decimal frame (for 60fps lerping) from the integer frame (for asset preloading hooks)
    const [activePreloadFrame, setActivePreloadFrame] = useState(1);
    const currentFrameRef = useRef(1);
    const targetFrameRef = useRef(1);
    const lastDrawnFrameRef = useRef<number | null>(null);

    const { isLoaded, loadProgress, getImage } = useImageSequence(activePreloadFrame);

    // Native, highly-optimized scroll tracking to bypass Next.js hydration offset issues
    useEffect(() => {
        if (prefersReducedMotion) return;

        const handleScroll = () => {
            const scrollY = window.scrollY;
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

            // Prevent division by zero if DOM hasn't fully painted
            if (maxScroll <= 0) return;

            const scrollFraction = scrollY / maxScroll;
            const calculatedFrame = Math.max(1, Math.min(TOTAL_FRAMES, Math.round(scrollFraction * (TOTAL_FRAMES - 1)) + 1));

            targetFrameRef.current = calculatedFrame;
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();

        return () => window.removeEventListener("scroll", handleScroll);
    }, [prefersReducedMotion]);

    // Lifted drawing logic using pure refs to avoid dependency staleness
    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d", { alpha: false });
        if (!ctx) return;

        const frameIndex = Math.round(currentFrameRef.current);
        let img = getImage(frameIndex);

        // FALLBACK: If the current frame isn't loaded yet, try to draw the last successful frame 
        // to prevent "black spots" during rapid mobile scrolling.
        if (!img && lastDrawnFrameRef.current !== null) {
            img = getImage(lastDrawnFrameRef.current);
        }

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

        // Only clear and background fill if we absolutely have no image to show
        if (!img) {
            ctx.fillStyle = "#050505";
            ctx.fillRect(0, 0, Math.floor(rectWidth * dpr), Math.floor(rectHeight * dpr));
        }

        if (img) {
            // Use Math.max to simulate object-fit: cover, perfectly filling landscape viewports
            const ratio = Math.max(rectWidth / img.width, rectHeight / img.height);
            const centerShift_x = (rectWidth - img.width * ratio) / 2;
            const centerShift_y = (rectHeight - img.height * ratio) / 2;

            ctx.drawImage(
                img,
                0, 0, img.width, img.height,
                centerShift_x, centerShift_y, img.width * ratio, img.height * ratio
            );
            
            // Record this as a successful frame
            lastDrawnFrameRef.current = frameIndex;
        }
    }, [getImage]);

    // Animation Loop for smoothly lerping the frame at 60fps WITHOUT React renders
    useEffect(() => {
        let animationFrameId: number;

        const renderLoop = () => {
            if (prefersReducedMotion) {
                currentFrameRef.current = 144;
                setActivePreloadFrame(144);
            } else {
                const prev = currentFrameRef.current;
                const next = prev + (targetFrameRef.current - prev) * 0.12;
                currentFrameRef.current = Math.abs(targetFrameRef.current - next) < 0.01 ? targetFrameRef.current : next;

                // Only trigger a React state update if the actual integer changes
                const nextInt = Math.round(currentFrameRef.current);
                setActivePreloadFrame((currentValue) => {
                    return currentValue !== nextInt ? nextInt : currentValue;
                });
            }

            draw(); // Execute hardware-accelerated canvas draw loop
            animationFrameId = requestAnimationFrame(renderLoop);
        };

        renderLoop();

        return () => cancelAnimationFrame(animationFrameId);
    }, [prefersReducedMotion, draw]);

    return (
        <>
            {!isLoaded && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary flex-col gap-4">
                    <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-accent-cool transition-all duration-300 ease-out"
                            style={{ width: `${loadProgress}%` }}
                        />
                    </div>
                    <p className="text-text-muted text-sm font-mono uppercase tracking-widest">
                        Synthesizing Anatomy... {Math.round(loadProgress)}%
                    </p>
                </div>
            )}

            <canvas
                ref={canvasRef}
                className="fixed inset-0 w-full h-full object-cover pointer-events-none z-10 will-change-transform"
            />
        </>
    );
}
