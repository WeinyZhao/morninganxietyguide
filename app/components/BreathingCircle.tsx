"use client";

import type { Phase } from "@/lib/breathing-patterns";

interface Props {
  phase: Phase;
  state: "idle" | "running" | "paused" | "completed";
  progress: number;
  size?: number;
}

const PHASE_COLORS: Record<Phase, string> = {
  inhale: "bg-inhale",
  "hold-in": "bg-hold",
  exhale: "bg-exhale",
  "hold-out": "bg-hold",
};

const PHASE_SCALE: Record<Phase, string> = {
  inhale: "circle-inhale",
  "hold-in": "circle-hold",
  exhale: "circle-exhale",
  "hold-out": "circle-hold",
};

export default function BreathingCircle({
  phase,
  state,
  progress,
  size = 280,
}: Props) {
  const colorClass = state === "idle" ? "bg-brand-300/40" : PHASE_COLORS[phase];
  const scaleClass = state === "idle" ? "circle-idle" : PHASE_SCALE[phase];

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* Outer ring */}
      <div
        className="absolute rounded-full border-2 border-brand-200/40"
        style={{ width: size, height: size }}
      />
      {/* Animated circle */}
      <div
        className={`circle-phase ${scaleClass} ${colorClass} rounded-full shadow-2xl flex items-center justify-center`}
        style={{
          width: size * 0.7,
          height: size * 0.7,
        }}
      >
        {/* Progress ring */}
        {state === "running" && (
          <svg
            className="absolute"
            width={size * 0.7}
            height={size * 0.7}
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="48"
              fill="none"
              stroke="white"
              strokeOpacity="0.3"
              strokeWidth="2"
            />
            <circle
              cx="50"
              cy="50"
              r="48"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeDasharray={`${2 * Math.PI * 48}`}
              strokeDashoffset={`${2 * Math.PI * 48 * (1 - progress)}`}
              transform="rotate(-90 50 50)"
              style={{ transition: "stroke-dashoffset 100ms linear" }}
            />
          </svg>
        )}
      </div>
    </div>
  );
}
