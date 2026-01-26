"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Editor from "@monaco-editor/react";
import { useParams } from "next/navigation";
import { useRef } from "react";

export default function SessionPage() {
  const params = useParams();
  const code = params.code as string;
// Use handleCodeChange for editor onChange
  const [html, setHtml] = useState("");
const [css, setCss] = useState("");
const saveTimeout = useRef<NodeJS.Timeout | null>(null);

// This function is called whenever html, css, or js changes (and user is admin)
const handleCodeChange = (type: "html" | "css" | "js", value: string) => {
    if (!canEdit || !sessionId) return;

    // update state
    if (type === "html") setHtml(value);
    if (type === "css") setCss(value);
    if (type === "js") setJs(value);

    // debounce save
    if (saveTimeout.current) clearTimeout(saveTimeout.current);

    saveTimeout.current = setTimeout(async () => {
        await supabase
            .from("sessions")
            .update({ html, css, js })
            .eq("id", sessionId);
    }, 300); // save 300ms after last change
};
  const [js, setJs] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [canEdit, setCanEdit] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const [activeTab, setActiveTab] = useState<"html" | "css" | "js">("html");
  const [copied, setCopied] = useState(false);

  // Load session from Supabase
  useEffect(() => {
    if (!code) return;

    const loadSession = async () => {
      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .eq("code", code)
        .single();

      if (error || !data) {
        alert("Session not found");
        return;
      }

      setSessionId(data.id);
      setHtml(data.html || "");
      setCss(data.css || "");
      setJs(data.js || "");

      const myEditorId = localStorage.getItem("editor_id");
      setCanEdit(myEditorId === data.editor_id);
      setLoaded(true);
    };

    loadSession();
  }, [code]);

  // Live updates for all viewers
  useEffect(() => {
  if (!loaded) return;

  const channel = supabase
    .channel(`live-session-${code}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "sessions",
        filter: `code=eq.${code}`,
      },
      (payload) => {
        const newData = payload.new;
        const myEditorId = localStorage.getItem("editor_id");
        if (myEditorId !== newData.editor_id) {
          setHtml(newData.html || "");
          setCss(newData.css || "");
          setJs(newData.js || "");
        }
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}, [loaded, code]);


  // Auto save for admin
  useEffect(() => {
    if (!canEdit || !sessionId) return;

    const handler = setInterval(() => {
      supabase
        .from("sessions")
        .update({ html, css, js })
        .eq("id", sessionId);
    }, 500); // save every 0.5s

    return () => clearInterval(handler);
  }, [html, css, js, canEdit, sessionId]);

  // Copy active tab code
  const copyCode = () => {
    let codeToCopy = "";
    if (activeTab === "html") codeToCopy = html;
    if (activeTab === "css") codeToCopy = css;
    if (activeTab === "js") codeToCopy = js;

    navigator.clipboard.writeText(codeToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Live preview
  const preview = `
    <html>
      <head>
        <style>${css}</style>
      </head>
      <body>
        ${html}
        <script>${js}<\/script>
      </body>
    </html>
  `;

  return (
    <div className="session-container">
      <h2>Session Code: {code}</h2>
      {canEdit ? (
        <p className="mode">🟢 Admin mode</p>
      ) : (
        <p className="mode">🔒 View only mode</p>
      )}

      <div className="editor-preview-container">
        {/* LEFT: Editor section */}
        <div className="editor-section">
          {/* Copy Button */}
          <div className="copy-container">
            <button className="copy-btn" onClick={copyCode}>
              Copy {activeTab.toUpperCase()} Code
            </button>
            {copied && <span className="copied-text">Copied!</span>}
          </div>

          {/* Tabs */}
          <div className="tab-bar">
            {["html", "css", "js"].map((tab) => (
              <div
                key={tab}
                className={`tab ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab as "html" | "css" | "js")}
              >
                {tab.toUpperCase()}
              </div>
            ))}
          </div>

          {/* Editors */}
          <div className="editor-container">
            {activeTab === "html" && (
              <Editor
  height="300px"
  language="html"
  value={html}
  onChange={(v) => handleCodeChange("html", v || "")}
  options={{ readOnly: !canEdit, minimap: { enabled: false } }}
/>
            )}
            {activeTab === "css" && (
              <Editor
  height="300px"
  language="css"
  value={css}
  onChange={(v) => handleCodeChange("css", v || "")}
  options={{ readOnly: !canEdit, minimap: { enabled: false } }}
/>
            )}
            {activeTab === "js" && (
             <Editor
  height="300px"
  language="javascript"
  value={js}
  onChange={(v) => handleCodeChange("js", v || "")}
  options={{ readOnly: !canEdit, minimap: { enabled: false } }}
/>
            )}
          </div>
        </div>

        {/* RIGHT: Live preview */}
        <iframe srcDoc={preview} className="preview-frame" />
      </div>

      {/* CSS */}
      <style jsx>{`
        .session-container {
          padding: 20px;
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        }

        .mode {
          margin-bottom: 10px;
          font-weight: bold;
        }

        .editor-preview-container {
          display: flex;
          gap: 10px;
          margin-top: 10px;
        }

        .editor-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          border: 1px solid #ccc;
          border-radius: 5px;
          overflow: hidden;
          background: #1e1e1e;
        }

        .copy-container {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding: 5px 10px;
          background: #2d2d2d;
          border-bottom: 1px solid #444;
        }

        .copy-btn {
          background: #007acc;
          color: #fff;
          padding: 5px 10px;
          border: none;
          border-radius: 3px;
          cursor: pointer;
          font-weight: bold;
          transition: all 0.2s;
        }

        .copy-btn:hover {
          background: #005a9e;
        }

        .copied-text {
          margin-left: 10px;
          color: #0f0;
          font-weight: bold;
        }

        .tab-bar {
          display: flex;
          background: #2d2d2d;
          border-bottom: 1px solid #444;
        }

        .tab {
          flex: 1;
          padding: 10px;
          text-align: center;
          cursor: pointer;
          color: #ccc;
          font-weight: bold;
          transition: all 0.2s;
        }

        .tab:hover {
          background: #3c3c3c;
        }

        .tab.active {
          background: #007acc;
          color: #fff;
        }

        .editor-container {
          flex: 1;
        }

        .preview-frame {
          flex: 1;
          border: 1px solid #ccc;
          border-radius: 5px;
          min-height: 480px;
        }

        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  );
}
