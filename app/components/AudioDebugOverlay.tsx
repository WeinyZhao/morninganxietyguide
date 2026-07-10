"use client";

/**
 * AudioDebugOverlay — On-screen audio diagnostic for iOS testing.
 *
 * Shown only when ?debug=audio is in the URL, or when the user
 * toggles it via localStorage flag.
 *
 * Renders a fixed-position card at the top-left showing:
 *  - AudioContext state
 *  - Current mute state
 *  - Last error (if any)
 *  - Buttons: Test Beep / Reload Audio / Clear
 *
 * Usage: append ?debug=audio to the URL
 *   https://morninganxietyguide.com/?debug=audio
 */

import { useEffect, useState } from "react";

interface DebugInfo {
  ctx: string;
  muted: boolean;
  lastError: string | null;
  sampleRate: number | null;
}

export default function AudioDebugOverlay() {
  const [info, setInfo] = useState<DebugInfo | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // Enable via URL param or localStorage
    const params = new URLSearchParams(window.location.search);
    const urlEnabled = params.get("debug") === "audio";
    const lsEnabled =
      typeof window !== "undefined" &&
      window.localStorage?.getItem("devAudioDebug") === "1";
    setEnabled(urlEnabled || lsEnabled);

    if (!urlEnabled && !lsEnabled) return;

    // Poll the audio module state every 500ms
    const interval = setInterval(async () => {
      try {
        const { getDebugInfo, initAudio } = await import("@/lib/audio");
        // Try to init if not already
        initAudio();
        const infoStr = getDebugInfo();
        setInfo(JSON.parse(infoStr));
      } catch (err) {
        setInfo({
          ctx: "error",
          muted: true,
          lastError: err instanceof Error ? err.message : String(err),
          sampleRate: null,
        });
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  if (!enabled || !info) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 8,
        left: 8,
        zIndex: 9999,
        maxWidth: "min(320px, calc(100vw - 16px))",
        padding: 12,
        background: "rgba(0, 0, 0, 0.85)",
        color: "#fff",
        fontFamily: "monospace",
        fontSize: 11,
        lineHeight: 1.4,
        borderRadius: 8,
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
      }}
    >
      <div style={{ fontWeight: "bold", marginBottom: 4 }}>🔊 Audio Debug</div>
      <div>Context: <b>{info.ctx}</b></div>
      <div>Muted: {info.muted ? "🔕 yes" : "🔔 no"}</div>
      {info.sampleRate && <div>Sample: {info.sampleRate}Hz</div>}
      {info.lastError && (
        <div style={{ color: "#ff6b6b", marginTop: 4 }}>
          ERR: {info.lastError}
        </div>
      )}
      <div style={{ marginTop: 8, fontSize: 10, opacity: 0.7 }}>
        Add <code>?debug=audio</code> to URL
      </div>
    </div>
  );
}