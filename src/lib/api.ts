import { supabase } from "./supabase";

export interface AnalysisResponse {
    scan_id: string;
    status: string;
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
    processing_time_ms?: number;
    patient_name?: string;
    patient_age?: number;
    patient_gender?: string;
    clinical_history?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 
    (typeof window !== 'undefined' 
        ? `${window.location.protocol}//${window.location.hostname}:8005` 
        : "http://localhost:8005");

export const uploadScan = async (
    file: File,
    metadata?: {
        patientName?: string;
        patientAge?: string;
        patientGender?: string;
        clinicalHistory?: string;
    }
): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    if (metadata) {
        if (metadata.patientName) formData.append("patient_name", metadata.patientName);
        if (metadata.patientAge) formData.append("patient_age", metadata.patientAge);
        if (metadata.patientGender) formData.append("patient_gender", metadata.patientGender);
        if (metadata.clinicalHistory) formData.append("clinical_history", metadata.clinicalHistory);
    }

    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    const headers: HeadersInit = {};
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}/api/analyze`, {
        method: "POST",
        body: formData,
        headers,
    });

    if (!res.ok) {
        let err = await res.text();
        try { err = JSON.parse(err).detail || err; } catch {}
        throw new Error(err || "Upload failed");
    }

    const data = await res.json();
    return data.scan_id; // returns scan-1234
};

export const fetchResult = async (scanId: string): Promise<AnalysisResponse> => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    const headers: HeadersInit = {};
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}/api/result/${scanId}`, { headers });
    
    if (!res.ok) {
        throw new Error("Failed to fetch result");
    }
    
    return res.json();
};
