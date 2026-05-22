"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { supabase } from "@/lib/supabase";

export interface AnalysisResult {
    scan_id: string;
    status: "processing" | "complete" | "error";
    modality: string;
    condition?: string;
    confidence?: number;
    severity_score?: number;
    severity_label?: string;
    left_lung_involvement?: number;
    right_lung_involvement?: number;
    total_involvement?: number;
    grad_cam_url?: string;
    segmented_url?: string;
    original_url?: string;
    mesh_url?: string;
    clinical_insight?: string;
    ai_visit_suggestion?: string;
    ai_medication_suggestion?: string;
    clinician_notes?: string;
    processing_time_ms?: number;
    patient_name?: string;
    patient_age?: number;
    patient_gender?: string;
    clinical_history?: string;
    error?: string;
}

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8005";

export function useAnalysisPolling(scanId: string | null) {
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        if (!scanId) return;

        const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8005";
        let pollInterval: NodeJS.Timeout | undefined = undefined;
        let realtimeChannel: any = null;

        const fetchResult = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                const token = session?.access_token;
                const headers: Record<string, string> = {};
                if (token) {
                    headers["Authorization"] = `Bearer ${token}`;
                }
                const response = await axios.get(`${API_BASE}/api/result/${scanId}`, { headers });
                const data = response.data;

                if (data.status === "complete") {
                    setResult(data);
                    setIsComplete(true);
                    if (pollInterval) clearInterval(pollInterval);
                } else if (data.status === "error") {
                    setError(data.error || "Analysis failed");
                    if (pollInterval) clearInterval(pollInterval);
                } else {
                    setResult(data);
                }
            } catch (err) {
                console.error("Polling error:", err);
                const errorResponse = err as { response?: { status?: number } };
                if (errorResponse.response?.status === 404) {
                    setError("Scan not found");
                    if (pollInterval) clearInterval(pollInterval);
                }
            }
        };

        // 1. Initial HTTP query to fetch the immediate state
        fetchResult();

        // 2. Set up fallback polling loop (runs in parallel as a backup)
        pollInterval = setInterval(fetchResult, 2000);

        // 3. Set up Supabase Realtime Subscription for sub-second database push updates
        try {
            const isOffline = typeof window !== "undefined" && localStorage.getItem("explung-offline-mode") === "true";
            if (!isOffline) {
                realtimeChannel = supabase
                    .channel(`scan_detail_${scanId}`)
                    .on(
                        "postgres_changes",
                        {
                            event: "*",
                            schema: "public",
                            table: "scans",
                            filter: `scan_id=eq.${scanId}`
                        },
                        (payload) => {
                            console.log("[Realtime] Detailed scan event received:", payload.eventType, payload.new);
                            const updatedScan = payload.new as AnalysisResult;
                            if (updatedScan) {
                                setResult(updatedScan);
                                if (updatedScan.status === "complete") {
                                    setIsComplete(true);
                                    if (pollInterval) clearInterval(pollInterval);
                                } else if (updatedScan.status === "error") {
                                    setError(updatedScan.error || "Analysis failed");
                                    if (pollInterval) clearInterval(pollInterval);
                                }
                            }
                        }
                    )
                    .subscribe();
            }
        } catch (rtErr) {
            console.warn("[Realtime] Failed to subscribe to scan status changes:", rtErr);
        }

        // 4. Clean up channel connection and polling thread on unmount
        return () => {
            if (pollInterval) clearInterval(pollInterval);
            if (realtimeChannel) {
                try {
                    supabase.removeChannel(realtimeChannel);
                } catch (rmErr) {
                    console.warn("[Realtime] Failed to remove channel:", rmErr);
                }
            }
        };
    }, [scanId]);

    return { result, error, isComplete };
}
