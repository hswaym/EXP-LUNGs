"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase, triggerMockAuthChange } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Mail, ChevronRight, Sparkles, ShieldAlert, Play, Settings } from "lucide-react";

export default function LoginPage() {
  const { signInWithGoogle, user } = useAuth();
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isFirebaseUnconfigured, setIsFirebaseUnconfigured] = useState(false);

  // Redirect if already logged in
  if (user) {
    router.push("/");
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    setIsFirebaseUnconfigured(false);

    try {
      if (isRegister) {
        // Sign Up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        });
        if (error) throw error;
        
        if (typeof window !== 'undefined' && localStorage.getItem('explung-offline-mode') === 'true') {
          setSuccessMsg("Offline Mode Activated: Simulating diagnostic gateway console... Redirecting...");
          setTimeout(() => {
            router.push("/");
          }, 1500);
        } else {
          setSuccessMsg("Check your email for the confirmation link!");
          setLoading(false);
        }
      } else {
        // Sign In
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        if (typeof window !== 'undefined' && localStorage.getItem('explung-offline-mode') === 'true') {
          setSuccessMsg("Offline Mode Activated: Simulating diagnostic gateway console... Redirecting...");
          setTimeout(() => {
            router.push("/");
          }, 1500);
        } else {
          router.push("/");
        }
      }
    } catch (err: any) {
      const errMsg = err.message || "An unexpected error occurred.";
      if (errMsg.includes("Failed to fetch") || !window.navigator.onLine) {
        console.warn("[Login Page] Offline fallback activated on catch.");
        
        const cleanEmail = email || 'admin@skillgap.edu';
        const userId = "mock-uid-" + cleanEmail.replace(/[^a-zA-Z0-9]/g, "_");
        const payload = {
          sub: userId,
          email: cleanEmail,
          exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
          role: "authenticated"
        };
        const payloadB64 = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
        const mockToken = `mockheader.${payloadB64}.mocksignature`;
        const mockUser = {
          id: userId,
          email: cleanEmail,
          created_at: new Date().toISOString(),
          app_metadata: { provider: 'email' },
          user_metadata: {},
          aud: 'authenticated',
          role: 'authenticated',
        };
        const mockSession = {
          access_token: mockToken,
          token_type: 'bearer',
          expires_in: 3600,
          refresh_token: 'mock-refresh-token',
          user: mockUser,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
        };
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('explung-mock-session', JSON.stringify(mockSession));
          localStorage.setItem('explung-offline-mode', 'true');
        }
        
        triggerMockAuthChange('SIGNED_IN', mockSession);
        
        setSuccessMsg("Offline Mode Activated: Simulating diagnostic gateway console... Redirecting...");
        setTimeout(() => {
          router.push("/");
        }, 1500);
      } else {
        if (
          errMsg.includes("auth/invalid-api-key") || 
          errMsg.includes("auth/api-key-not-found") ||
          errMsg.includes("invalid-api-key") ||
          errMsg.includes("mock-api-key") ||
          errMsg.includes("API key") ||
          errMsg.includes("Firebase:")
        ) {
          setIsFirebaseUnconfigured(true);
          setErrorMsg("Firebase Auth Link Pending: The cloud authentication provider requires a valid custom Web API Key & Project ID configuration.");
        } else {
          setErrorMsg(errMsg);
        }
        setLoading(false);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    setIsFirebaseUnconfigured(false);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error("[Login] Google Sign-in error:", err);
      const msg = err.message || "";
      if (
        msg.includes("auth/invalid-api-key") || 
        msg.includes("auth/api-key-not-found") ||
        msg.includes("invalid-api-key") ||
        msg.includes("mock-api-key") ||
        msg.includes("API key") ||
        msg.includes("Firebase:")
      ) {
        setIsFirebaseUnconfigured(true);
        setErrorMsg("Firebase Auth Link Pending: The cloud authentication provider requires a valid custom Web API Key & Project ID configuration.");
      } else {
        setErrorMsg(msg || "Failed to authenticate via Google. Please check your network or try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSandboxBypass = () => {
    setLoading(true);
    setErrorMsg("");
    
    const cleanEmail = email || 'sandbox-specialist@explung.med';
    const userId = "mock-uid-" + cleanEmail.replace(/[^a-zA-Z0-9]/g, "_");
    const payload = {
      sub: userId,
      email: cleanEmail,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
      role: "authenticated"
    };
    const payloadB64 = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    const mockToken = `mockheader.${payloadB64}.mocksignature`;
    const mockUser = {
      id: userId,
      email: cleanEmail,
      created_at: new Date().toISOString(),
      app_metadata: { provider: 'email' },
      user_metadata: {
        name: "Sandbox Specialist",
        avatar_url: ""
      },
      aud: 'authenticated',
      role: 'authenticated',
    };
    const mockSession = {
      access_token: mockToken,
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'mock-refresh-token',
      user: mockUser,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    };
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('explung-mock-session', JSON.stringify(mockSession));
      localStorage.setItem('explung-offline-mode', 'true');
    }
    
    triggerMockAuthChange('SIGNED_IN', mockSession);
    
    setSuccessMsg("Sandbox Bypass Activated: Simulating diagnostic gateway console... Redirecting...");
    setTimeout(() => {
      router.push("/");
    }, 1500);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 overflow-hidden bg-[#0a0f1d]">
      {/* Decorative Cinematic Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-accent-cool/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#7209b7]/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />

      {/* Futuristic Medical Hexagonal Matrix Mesh (CSS Grid Overlay) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-[450px] z-10"
      >
        {/* Logo and Tagline */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent-cool/20 bg-accent-cool/5 text-accent-cool text-[11px] uppercase tracking-widest font-semibold mb-3"
          >
            <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '8s' }} />
            <span>Diagnostic Gateway</span>
          </motion.div>
          <h1 className="text-3xl font-brand tracking-widest text-white uppercase mb-1 drop-shadow-[0_0_12px_rgba(255,255,255,0.1)]">
            EXPLUNG
          </h1>
          <p className="text-xs font-body text-[rgba(255,255,255,0.50)] uppercase tracking-[0.08em]">
            Neural Pulmonary Diagnosis Hub
          </p>
        </div>

        {/* Auth Glass Card */}
        <div className="relative border border-[rgba(255,255,255,0.08)] bg-[rgba(15,23,42,0.65)] backdrop-blur-xl p-8 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
          {/* Form Tabs */}
          <div className="grid grid-cols-2 gap-2 border-b border-[rgba(255,255,255,0.08)] pb-4 mb-6">
            <button
              onClick={() => {
                setIsRegister(false);
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className={`text-center py-2 text-xs font-body uppercase tracking-wider font-semibold transition-all duration-300 ${
                !isRegister
                  ? "text-white border-b-2 border-accent-cool"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setIsRegister(true);
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className={`text-center py-2 text-xs font-body uppercase tracking-wider font-semibold transition-all duration-300 ${
                isRegister
                  ? "text-white border-b-2 border-accent-cool"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Register
            </button>
          </div>

          {/* Form Action */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@hospital.org"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(10,15,30,0.8)] text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-accent-cool focus:ring-1 focus:ring-accent-cool transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(10,15,30,0.8)] text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-accent-cool focus:ring-1 focus:ring-accent-cool transition-all"
                />
              </div>
            </div>

            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl border ${
                  isFirebaseUnconfigured 
                    ? "border-accent-warm/30 bg-accent-warm/5 text-accent-warm" 
                    : "border-red-500/20 bg-red-500/5 text-red-400"
                } text-xs space-y-3`}
              >
                <div className="flex items-start gap-2.5">
                  <ShieldAlert className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <span className="font-semibold block mb-1 uppercase tracking-widest text-[9px] font-mono">
                      {isFirebaseUnconfigured ? "Cloud Node Link Pending" : "Authentication Alert"}
                    </span>
                    {errorMsg}
                  </div>
                </div>

                {isFirebaseUnconfigured && (
                  <div className="pt-3 border-t border-accent-warm/10 space-y-2">
                    <p className="text-[10px] text-gray-400 leading-normal">
                      The active Firebase Client SDK is currently in unconfigured mock mode. 
                      You can instantly bypass this gate to use the high-fidelity offline sandbox simulator, or configure live credentials in the setup panel.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleSandboxBypass}
                        className="flex-1 py-2 px-3 rounded-lg bg-gradient-to-r from-accent-cool to-[#0096c7] hover:brightness-110 active:scale-[0.98] text-white font-semibold text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all shadow-[0_0_15px_rgba(0,180,216,0.2)] cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-white animate-pulse" />
                        <span>Bypass to Sandbox</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => router.push("/setup")}
                        className="py-2 px-3 rounded-lg border border-white/10 hover:bg-white/5 active:scale-[0.98] text-white font-semibold text-[10px] uppercase tracking-widest flex items-center justify-center gap-1 transition-all cursor-pointer"
                      >
                        <Settings className="w-3 h-3" />
                        <span>Configure Cloud</span>
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {successMsg && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-3 rounded-lg border border-green-500/20 bg-green-500/5 text-green-400 text-xs"
              >
                {successMsg}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-accent-cool to-[#0096c7] hover:brightness-110 active:scale-[0.99] text-white font-semibold text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-all duration-200"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isRegister ? "Create Account" : "Access Console"}</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex py-4 items-center">
            <div className="flex-grow border-t border-[rgba(255,255,255,0.08)]"></div>
            <span className="flex-shrink mx-4 text-[10px] text-gray-500 uppercase tracking-widest font-semibold">
              Or
            </span>
            <div className="flex-grow border-t border-[rgba(255,255,255,0.08)]"></div>
          </div>

          {/* Google Login Button */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full py-3 rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] active:scale-[0.99] text-white font-semibold text-xs uppercase tracking-widest flex items-center justify-center gap-3 cursor-pointer transition-all duration-200"
          >
            {/* Real SVG Google Icon */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.2-5.136 4.2-3.666 0-6.643-2.977-6.643-6.643s2.977-6.643 6.643-6.643c1.69 0 3.228.636 4.41 1.768l3.14-3.14C19.066 1.737 15.84 0 12.24 0 5.48 0 0 5.48 0 12.24s5.48 12.24 12.24 12.24c6.64 0 11.2-4.67 11.2-11.4 0-.773-.082-1.528-.2-2.285h-11z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
