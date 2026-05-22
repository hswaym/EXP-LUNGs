"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { UploadCloud, FileImage, ShieldCheck, Zap, Brain, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { uploadScan } from "@/lib/api";

interface ImageUploaderProps {
    onUploadComplete: (scanId: string) => void;
    patientName?: string;
    patientAge?: string;
    patientGender?: string;
    clinicalHistory?: string;
}

export default function ImageUploader({ 
    onUploadComplete,
    patientName = "",
    patientAge = "",
    patientGender = "Male",
    clinicalHistory = ""
}: ImageUploaderProps) {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setError(null);
        if (acceptedFiles.length > 0) {
            const selected = acceptedFiles[0];
            if (selected.size > 50 * 1024 * 1024) {
                setError("File exceeds 50MB limit.");
                return;
            }
            setFile(selected);
            setPreviewUrl(URL.createObjectURL(selected));
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/jpeg': ['.jpeg', '.jpg'],
            'image/png': ['.png'],
            'application/dicom': ['.dcm'],
            'application/octet-stream': ['.dcm']
        },
        maxFiles: 1
    });

    const handleAnalyze = async () => {
        if (!file) return;
        setIsUploading(true);
        setError(null);

        try {
            const scanId = await uploadScan(file, {
                patientName,
                patientAge,
                patientGender,
                clinicalHistory
            });
            onUploadComplete(scanId);
        } catch (err) {
            const errorResponse = err as { response?: { data?: { detail?: string } }; message?: string };
            setError(errorResponse.response?.data?.detail || errorResponse.message || "Failed to reach the analysis server.");
            setIsUploading(false);
        }
    };

    const removeFile = (e: React.MouseEvent) => {
        e.stopPropagation();
        setFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
    };

    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="mb-6 flex items-center gap-3 bg-accent-crimson/10 border border-accent-crimson/20 text-accent-crimson px-6 py-4 rounded-2xl w-full text-sm font-medium backdrop-blur-xl"
                    >
                        <ShieldCheck className="w-5 h-5" />
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>

            <div {...getRootProps()} className="w-full group outline-none">
                <motion.div
                    whileHover={{ scale: file ? 1 : 1.01 }}
                    whileTap={{ scale: file ? 1 : 0.99 }}
                    className={`
                        relative overflow-hidden w-full rounded-[40px] border-2 border-dashed transition-all duration-500 min-h-[400px] flex flex-col items-center justify-center p-12
                        ${isDragActive ? "border-accent-cool bg-accent-cool/5" : "border-white/10 hover:border-accent-cool/40 bg-white/[0.02]"}
                        ${file ? "border-solid border-white/5 bg-white/[0.01]" : ""}
                    `}
                >
                    <input {...getInputProps()} />
                    
                    {/* Animated Background Glow */}
                    <div className="absolute inset-0 pointer-events-none opacity-20 bg-radial-gradient from-accent-cool/10 to-transparent blur-3xl group-hover:opacity-30 transition-opacity duration-1000" />

                    <AnimatePresence mode="wait">
                        {!file ? (
                            <motion.div
                                key="upload-prompt"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex flex-col items-center text-center gap-6 relative z-10"
                            >
                                <div className="size-24 rounded-full bg-accent-cool/10 flex items-center justify-center mb-4 relative">
                                    <div className="absolute inset-0 rounded-full border border-accent-cool/30 animate-[ping_3s_infinite]" />
                                    <UploadCloud className="size-10 text-accent-cool" />
                                </div>
                                <h3 className="font-display text-4xl font-bold text-text-heading tracking-tight">Upload Scan</h3>
                                <p className="font-body text-text-muted text-lg max-w-md leading-relaxed">
                                    Drag and drop DICOM, JPG, or PNG files for <span className="text-accent-cool font-semibold underline decoration-accent-cool/30 underline-offset-4">Real-Time Neural Detection</span>.
                                </p>
                                
                                <div className="mt-8 flex gap-8">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="size-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-accent-warm shadow-inner">
                                            <Zap className="size-5 fill-accent-warm" />
                                        </div>
                                        <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-text-label">High Speed</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="size-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-accent-cool shadow-inner">
                                            <Brain className="size-5" />
                                        </div>
                                        <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-text-label">Neural Engine</span>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="file-preview"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="w-full max-w-2xl bg-white/[0.03] backdrop-blur-3xl p-6 rounded-[32px] border border-white/10 flex items-center justify-between shadow-2xl relative z-10"
                            >
                                <div className="flex items-center gap-6">
                                    <div className="size-24 rounded-2xl overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center group/preview">
                                        {previewUrl && !file.name.endsWith('.dcm') ? (
                                            <Image src={previewUrl} alt="Preview" fill className="object-cover group-hover/preview:scale-110 transition-transform duration-700" unoptimized />
                                        ) : (
                                            <FileImage className="size-10 text-white/20" />
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <h4 className="font-display text-xl font-semibold text-text-heading truncate max-w-[200px] md:max-w-md">
                                            {file.name}
                                        </h4>
                                        <div className="flex items-center gap-3">
                                            <span className="font-mono text-[10px] text-text-muted uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-md">
                                                {(file.size / (1024 * 1024)).toFixed(2)} MB
                                            </span>
                                            <span className="font-mono text-[10px] px-3 py-0.5 rounded-full bg-accent-cool/20 text-accent-cool font-black tracking-widest border border-accent-cool/30">
                                                {file.name.toLowerCase().endsWith('.dcm') ? 'CT-SCAN' : 'X-RAY'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={removeFile}
                                    disabled={isUploading}
                                    className="size-12 flex items-center justify-center rounded-2xl hover:bg-accent-crimson/10 text-white/20 hover:text-accent-crimson transition-all"
                                >
                                    <X className="size-6" />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>

            <AnimatePresence>
                {file && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                        className="w-full mt-10"
                    >
                        <button
                            onClick={handleAnalyze}
                            disabled={isUploading}
                            className={`w-full py-5 rounded-2xl font-display text-xl font-bold tracking-tight shadow-xl transition-all duration-500 overflow-hidden relative group
                                ${isUploading ? 'bg-white/5 cursor-not-allowed opacity-50' : 'bg-accent-cool hover:bg-accent-cool/90 hover:shadow-[0_0_40px_rgba(0,214,255,0.3)] hover:-translate-y-1'}`}
                        >
                            <span className="relative z-10 flex items-center justify-center gap-3">
                                {isUploading ? (
                                    <>
                                        <div className="size-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                        Neural Engine Initializing...
                                    </>
                                ) : (
                                    <>
                                        <Check className="size-5" />
                                        Initialize Deep Analysis
                                    </>
                                )}
                            </span>
                            {!isUploading && (
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                            )}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
