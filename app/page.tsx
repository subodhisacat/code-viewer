"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

import "./globals.css";

export default function Home() {
  const [code, setCode] = useState("");

  const createSession = async () => {
    const sessionCode = Math.floor(100 + Math.random() * 900).toString();
    const editorId = crypto.randomUUID();

    const { data, error } = await supabase
      .from("sessions")
      .insert({
        code: sessionCode,
        editor_id: editorId,
        html: "<h1>Hello World</h1>",
        css: "body { background:white; }",
        js: "",
      })
      .select()
      .single();

    if (error) {
      alert(error.message);
      return;
    }

    localStorage.setItem("editor_id", editorId);
    window.location.href = `/session/${data.code}`;
  };

  const joinSession = () => {
    if (code.length !== 3) {
      alert("Enter 3 digit code");
      return;
    }
    window.location.href = `/session/${code}`;
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh', 
      padding: 40 
    }}>
      {/* Main Content Area */}
      <div style={{ flex: 1 }}>
        <h1>Copy and Paste</h1>

        <button onClick={createSession}>Create Session</button>

        <hr />

        <input
          placeholder="Enter 3 digit code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <br /><br />

        <button onClick={joinSession}>Join Session</button>
      </div>

      {/* Footer Section */}
      <footer style={{ 
        textAlign: 'center', 
        padding: '20px 0', 
        marginTop: 'auto',
        borderTop: '1px solid #eaeaea'
      }}>
        <p>© {new Date().getFullYear()} subodhisacat</p>
      </footer>
    </div>
  );
}
