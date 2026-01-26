"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import "./globals.css";

export default function Home() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const createSession = async () => {
    setLoading(true);
    const sessionCode = Math.floor(100 + Math.random() * 900).toString();
    const editorId = crypto.randomUUID();

    const { data, error } = await supabase
      .from("sessions")
      .insert({
        code: sessionCode,
        editor_id: editorId,
        html: "<div class='hero'>\n  <h1>Live Build</h1>\n  <p>Start coding here...</p>\n</div>",
        css: ".hero {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  height: 100vh;\n  font-family: sans-serif;\n  background: linear-gradient(to bottom, #0f172a, #020617);\n  color: white;\n}",
        js: "console.log('Ready to collaborate');",
      })
      .select()
      .single();

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    localStorage.setItem("editor_id", editorId);
    window.location.href = `/session/${data.code}`;
  };

  const joinSession = () => {
    if (code.length !== 3) return;
    window.location.href = `/session/${code}`;
  };

  return (
    <div className="relative min-h-screen bg-[#020617] flex flex-col items-center justify-center overflow-hidden selection:bg-blue-500/30">
      
      {/* BACKGROUND DECORATION: The "Pro" Look */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-600/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 pointer-events-none" />
      </div>

      <main className="relative z-10 w-full max-w-xl px-6">
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-medium mb-4 animate-fade-in">
            ✨ Now with Real-time Syncing
          </div>
          <h1 className="text-6xl font-extrabold tracking-tighter text-white sm:text-7xl">
            Build in <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">Public.</span>
          </h1>
          <p className="text-slate-400 text-lg">
            Collaborative code playground for fast-moving developers.
          </p>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl space-y-8">
          
          {/* Create Section */}
          <div>
            <button
              onClick={createSession}
              disabled={loading}
              className="group relative w-full flex items-center justify-center gap-3 bg-white text-black font-bold py-4 rounded-2xl hover:bg-slate-200 transition-all active:scale-[0.98]"
            >
              {loading ? "Initializing..." : "Launch New Workspace"}
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>

          <div className="relative flex items-center">
            <div className="flex-grow border-t border-white/5"></div>
            <span className="px-4 text-xs font-medium text-slate-500 uppercase tracking-widest">or join active</span>
            <div className="flex-grow border-t border-white/5"></div>
          </div>

          {/* Join Section */}
          <div className="flex gap-3">
            <input
              type="text"
              maxLength={3}
              placeholder="000"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-1/3 bg-white/5 border border-white/10 rounded-2xl px-4 text-center text-2xl font-mono focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition-all text-white"
            />
            <button
              onClick={joinSession}
              className="flex-grow bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all border border-white/10"
            >
              Join
            </button>
          </div>
        </div>

        <p className="mt-8 text-center text-slate-500 text-sm">
          No signups. No friction. Pure code.
        </p>
      </main>
    </div>
  );
}
