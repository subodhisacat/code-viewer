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
        css: "h1 { color: blue; }",
        js: "console.log('hello')",
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
    <div style={{ padding: 40 }}>
      <h1>Live Code Session</h1>

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
  );
}
