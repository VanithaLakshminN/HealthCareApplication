"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Mode = "login" | "register" | "otp";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", otp: "" });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleLogin = async () => {
    setLoading(true); setError("");
    const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: form.email, password: form.password }) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error);
    router.push("/home");
  };

  const handleRegister = async () => {
    setLoading(true); setError("");
    const res = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: form.name, email: form.email, password: form.password }) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error);
    setSuccess("OTP sent to your email!");
    setMode("otp");
  };

  const handleVerifyOTP = async () => {
    setLoading(true); setError("");
    const res = await fetch("/api/auth/verify-otp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: form.email, otp: form.otp }) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error);
    setSuccess("Email verified! Please login.");
    setMode("login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-zinc-950 to-zinc-900 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="bg-blue-600 rounded-xl p-3"><Heart className="w-7 h-7 text-white" /></div>
          <span className="text-2xl font-bold text-white">HealthCare Pro</span>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
          {/* Tabs */}
          {mode !== "otp" && (
            <div className="flex bg-zinc-800 rounded-xl p-1 mb-6">
              {(["login", "register"] as Mode[]).map((m) => (
                <button key={m} onClick={() => { setMode(m); setError(""); setSuccess(""); }}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${mode === m ? "bg-blue-600 text-white" : "text-zinc-400 hover:text-white"}`}>
                  {m}
                </button>
              ))}
            </div>
          )}

          {mode === "otp" && <h2 className="text-xl font-bold text-white mb-2">Verify Email</h2>}

          {error && <p className="text-red-400 text-sm mb-4 bg-red-950 border border-red-800 rounded-lg px-3 py-2">{error}</p>}
          {success && <p className="text-green-400 text-sm mb-4 bg-green-950 border border-green-800 rounded-lg px-3 py-2">{success}</p>}

          <AnimatePresence mode="wait">
            <motion.div key={mode} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">

              {mode === "register" && (
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Full Name"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-blue-500" />
                </div>
              )}

              {mode !== "otp" && (
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="Email address" type="email"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-blue-500" />
                </div>
              )}

              {mode !== "otp" && (
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="Password" type={showPass ? "text" : "password"}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-blue-500" />
                  <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              )}

              {mode === "otp" && (
                <div>
                  <p className="text-zinc-400 text-sm mb-3">Enter the 6-digit OTP sent to <span className="text-white">{form.email}</span></p>
                  <input value={form.otp} onChange={(e) => set("otp", e.target.value)} placeholder="000000" maxLength={6}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-2xl text-center tracking-[1rem] text-white placeholder-zinc-600 outline-none focus:border-blue-500" />
                </div>
              )}

              <button onClick={mode === "login" ? handleLogin : mode === "register" ? handleRegister : handleVerifyOTP}
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl text-white font-semibold transition-colors">
                {loading ? "Please wait..." : mode === "login" ? "Sign In" : mode === "register" ? "Create Account" : "Verify OTP"}
              </button>

              {mode === "otp" && (
                <button onClick={() => setMode("register")} className="w-full text-sm text-zinc-400 hover:text-white transition-colors">
                  ← Back to Register
                </button>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
