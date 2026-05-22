"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const TOTAL_FRAMES = 240;
const LOOKAHEAD = 50;
const LOOKBEHIND = 25;
const INITIAL_LOAD_COUNT = 15;

// Path generator corresponding to the current public/scroll assets
const getImagePath = (index: number) =>
    `/scroll/ezgif-frame-${index.toString().padStart(3, "0")}.png`;

export function useImageSequence(currentFrame: number) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [loadProgress, setLoadProgress] = useState(0);

    // LRU mechanism: Using a Map to keep references to loaded images
    const imageCache = useRef<Map<number, HTMLImageElement>>(new Map());

    // Initial load effect
    useEffect(() => {
        let loadedCount = 0;
        const initialAmount = Math.min(INITIAL_LOAD_COUNT, TOTAL_FRAMES);

        const checkInitialLoadComplete = () => {
            loadedCount++;
            setLoadProgress((loadedCount / initialAmount) * 100);
            if (loadedCount >= initialAmount) {
                setIsLoaded(true);
            }
        };

        for (let i = 1; i <= initialAmount; i++) {
            const img = new Image();
            img.src = getImagePath(i);
            img.onload = checkInitialLoadComplete;
            img.onerror = checkInitialLoadComplete; // Proceed even on error to prevent hang
            imageCache.current.set(i, img);
        }
    }, []);

    // Preloading effect responsive to currentFrame
    useEffect(() => {
        if (!isLoaded) return;

        // Define the active window we want to keep in memory
        const windowStart = Math.max(1, Math.round(currentFrame) - LOOKBEHIND);
        const windowEnd = Math.min(TOTAL_FRAMES, Math.round(currentFrame) + LOOKAHEAD);

        // 1. Preload what is missing in the window
        for (let i = windowStart; i <= windowEnd; i++) {
            if (!imageCache.current.has(i)) {
                const img = new Image();
                img.src = getImagePath(i);
                // We do not wait for onload here, we just fire off the fetch and store the reference
                imageCache.current.set(i, img);
            }
        }

        // 2. Discard frames significantly outside the window to assist memory 
        // without causing constant re-fetching during minor scroll adjustments.
        const EVICTION_THRESHOLD = 20; 
        for (const key of imageCache.current.keys()) {
            if (key < (windowStart - EVICTION_THRESHOLD) || key > (windowEnd + EVICTION_THRESHOLD)) {
                const oldImg = imageCache.current.get(key);
                if (oldImg) {
                    oldImg.src = "";
                    oldImg.onload = null;
                    oldImg.onerror = null;
                }
                imageCache.current.delete(key);
            }
        }
    }, [currentFrame, isLoaded]);

    const getImage = useCallback((index: number) => imageCache.current.get(index) || null, []);

    return {
        isLoaded,
        loadProgress,
        getImage
    };
}
