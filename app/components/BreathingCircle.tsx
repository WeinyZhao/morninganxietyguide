"use client";

import type { Phase } from "@/lib/breathing-patterns";

interface Props {
  phase: Phase;
  state: "idle" | "running" | "paused" | "completed";
  progress: number;         // 0→1 within current phase
  stepSeconds?: number;
  size?: number;
}

const SCALE_MIN = 0.62;
const SCALE_MAX = 1.00;

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

// Hard-coded RGB tuples — avoids any CSS var substitution issues in JS
const PHASE_RGB: Record<Phase, [number, number, number]> = {
  inhale:    [125, 207, 255], // soft sky blue
  "hold-in": [56,  189, 248], // deeper sky
  exhale:    [52,  211, 209], // cyan-teal
  "hold-out": [56,  189, 248],
};

const IDLE_RGB: [number, number, number] = [110, 130, 160];

// Scale targets when progress = 1
const SCALE_TARGET: Record<Phase, number> = {
  inhale:    SCALE_MAX,
  "hold-in": SCALE_MAX,
  exhale:    SCALE_MIN,
  "hold-out": SCALE_MIN,
};

function rgba(r: number, g: number, b: number, a: number): string {
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export default function BreathingCircle({
  phase,
  state,
  progress,
  size = 280,
}: Props) {
  const isIdle = state === "idle";

  // Resolve RGB
  const [r, g, b] = isIdle ? IDLE_RGB : PHASE_RGB[phase];
  const prevPhase: Phase = phase === "inhale" ? "hold-out" : phase === "exhale" ? "hold-in" : phase;
  const [pr, pg, pb] = isIdle ? IDLE_RGB : PHASE_RGB[prevPhase];

  // Smooth scale: lerp from previous-phase target → current-phase target
  const scale = isIdle
    ? lerp(SCALE_MIN, SCALE_MAX, 0.25)
    : lerp(SCALE_TARGET[prevPhase], SCALE_TARGET[phase], progress);

  const glowSpread = Math.round(size * 0.22 * scale);

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* Decorative outer ring */}
      <div
        className="absolute rounded-full border-2 border-sky-200/50 dark:border-sky-700/30"
        style={{ width: size, height: size }}
      />

      {/* Outer glow halo — scales with breathing */}
      <div
        className="absolute rounded-full"
        style={{
          width:  size * 0.72,
          height: size * 0.72,
          transform: `scale(${scale * 1.30})`,
          background: `radial-gradient(circle, ${rgba(r, g, b, 0.45)} 0%, ${rgba(r, g, b, 0.15)} 50%, transparent 72%)`,
          transition: "transform 0.15s cubic-bezier(0.4,0,0.2,1), background 0.8s ease",
          opacity: isIdle ? 0.5 : 1,
        }}
      />

      {/* Inner breathing ball */}
      <div
        className="absolute rounded-full"
        style={{
          width:   size * 0.70,
          height:  size * 0.70,
          transform: `scale(${scale})`,
          background: isIdle
            ? rgba(...IDLE_RGB, 0.80)
            : `radial-gradient(circle at 35% 35%, ${rgba(Math.min(r+60,255), Math.min(g+40,255), Math.min(b+30,255), 0.95)}, ${rgba(r, g, b, 0.88)} 60%, ${rgba(Math.max(r-20,0), Math.max(g-20,0), Math.max(b-20,0), 0.95)})`,
          boxShadow: isIdle
            ? `0 0 20px ${rgba(...IDLE_RGB, 0.3)}`
            : `0 0 ${glowSpread}px ${rgba(r, g, b, 0.55)}, inset 0 -6px 18px rgba(0,0,0,0.12), inset 0 6px 18px rgba(255,255,255,0.18)`,
          transition: "transform 0.15s cubic-bezier(0.4,0,0.2,1), background 0.8s ease, box-shadow 0.8s ease",
        }}
      >
        {/* Progress ring */}
        {state === "running" && (
          <svg
            className="absolute inset-0"
            width={size * 0.70}
            height={size * 0.70}
            viewBox="0 0 100 100"
          >
            <circle
              cx="50" cy="50" r="48"
              fill="none"
              stroke="white"
              strokeOpacity="0.20"
              strokeWidth="1.5"
            />
            <circle
              cx="50" cy="50" r="48"
              fill="none"
              stroke="white"
              strokeOpacity="0.65"
              strokeWidth="2"
              strokeDasharray={`${2 * Math.PI * 48}`}
              strokeDashoffset={`${2 * Math.PI * 48 * (1 - progress)}`}
              transform="rotate(-90 50 50)"
              style={{ transition: "stroke-dashoffset 80ms linear" }}
            />
          </svg>
        )}
      </div>
    </div>
  );
}
