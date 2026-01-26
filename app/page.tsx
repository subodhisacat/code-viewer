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
        html: "<h1>Hello World</h1>",
        css: "h1 { color: #3b82f6; text-align: center; }",
        js: "console.log('Session initialized!');",
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
    if (code.length !== 3) {
      alert("Please enter a 3-digit code");
      return;
    }
    window.location.href = `/session/${code}`;
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-blue-500/30">
      {/* Navigation Header */}
      <nav className="border-b border-slate-800 bg-[#020617]/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">C</div>
            <span className="font-bold text-xl tracking-tight text-white">CodeViewer</span>
          </div>
          <button onClick={createSession} className="hidden md:block text-sm font-medium hover:text-blue-400 transition-colors">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-6 py-20 flex flex-col items-center">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight">
            Share Code <span className="text-blue-500">Live.</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto">
            A minimalist, real-time playground for HTML, CSS, and JS. 
            Create a session, share the code, and collaborate instantly.
          </p>
        </div>

        {/* Action Card */}
        <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
          <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl hover:border-blue-500/50 transition-all duration-300">
            <h3 className="text-xl font-bold text-white mb-2">New Environment</h3>
            <p className="text-slate-400 mb-6 text-sm">Start a fresh session with your own unique admin ID.</p>
            <button 
              onClick={createSession} 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
            >
              {loading ? "Initializing..." : "Create New Session"}
            </button>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl hover:border-emerald-500/50 transition-all duration-300">
            <h3 className="text-xl font-bold text-white mb-2">Join Session</h3>
            <p className="text-slate-400 mb-6 text-sm">Enter a 3-digit code to view a live broadcast.</p>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={3}
                placeholder="000"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-24 bg-slate-950 border border-slate-700 rounded-xl px-4 text-center text-xl font-mono focus:border-emerald-500 focus:outline-none transition-all"
              />
              <button 
                onClick={joinSession}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-emerald-600/20"
              >
                Join
              </button>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 text-center">
          <div>
            <div className="text-blue-500 mb-4 text-2xl font-bold">⚡ Real-time</div>
            <p className="text-sm text-slate-500">Built on Supabase Realtime for sub-100ms updates.</p>
          </div>
          <div>
            <div className="text-blue-500 mb-4 text-2xl font-bold">🛠️ Monaco Editor</div>
            <p className="text-sm text-slate-500">The same powerful engine that drives VS Code.</p>
          </div>
          <div>
            <div className="text-blue-500 mb-4 text-2xl font-bold">📱 Zero Setup</div>
            <p className="text-sm text-slate-500">No accounts needed. Just generate a code and go.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
