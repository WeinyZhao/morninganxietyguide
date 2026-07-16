"use client";

import type { Phase } from "@/lib/breathing-patterns";

interface Props {
  phase: Phase;
  state: "idle" | "running" | "paused" | "completed";
  progress: number;        // 0→1 within current phase
  stepSeconds: number;     // duration of the current phase step (used for animation timing reference)
  size?: number;
}

const SCALE_MIN = 0.60;  // smallest exhale size
const SCALE_MAX = 1.00;  // full inhale size

/** Linear interpolation helper */
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

/** Per-phase scale targets at progress=1 */
const SCALE_TARGET: Record<Phase, number> = {
  inhale:    SCALE_MAX,
  "hold-in": SCALE_MAX,
  exhale:    SCALE_MIN,
  "hold-out": SCALE_MIN,
};

/** Per-phase CSS color variable value (RGB tuple as string) */
const COLOR_MAP: Record<Phase, string> = {
  inhale:    "var(--breath-inhale)",
  "hold-in": "var(--breath-hold)",
  exhale:    "var(--breath-exhale)",
  "hold-out": "var(--breath-hold)",
};

export default function BreathingCircle({
  phase,
  state,
  progress,
  stepSeconds = 4,
  size = 280,
}: Props) {
  const isIdle = state === "idle";

  // Compute real-time scale from progress
  const scale = isIdle
    ? SCALE_MIN + (SCALE_MAX - SCALE_MIN) * 0.25  // idle: slightly contracted
    : lerp(
        // Starting scale is the *previous* phase's target, landing at current phase's target
        SCALE_TARGET[phase === "inhale" ? "hold-out" : phase === "exhale" ? "hold-in" : phase],
        SCALE_TARGET[phase],
        progress
      );

  // Color for the outer glow ring
  const glowColor = isIdle ? "var(--breath-idle)" : COLOR_MAP[phase];

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* Outer decorative ring */}
      <div
        className="absolute rounded-full border-2 border-brand-200/40 dark:border-brand-700/30"
        style={{ width: size, height: size }}
      />

      {/* Soft outer glow / halo — scales with breathing */}
      <div
        className="absolute rounded-full circle-glow"
        style={{
          width: size * 0.72,
          height: size * 0.72,
          opacity: isIdle ? 0.3 : 0.9,
          transform: `scale(${scale * 1.28})`,
          background: `radial-gradient(circle, rgba(${glowColor.replace(/var\\(--breath-(\\w+)\\)/, (_, k) => {
            // resolve CSS var to its rgb value for the glow gradient
            const varMap: Record<string, string> = {
              inhale:   "56 189 248",
              hold:     "14 165 233",
              exhale:   "6 182 212",
              idle:     "148 163 184",
            };
            return varMap[k] ?? "148 163 184";
          })}, 0.40) 0%, rgba(${glowColor.replace(/var\\(--breath-(\\w+)\\)/, (_, k) => {
            const varMap: Record<string, string> = {
              inhale:   "56 189 248",
              hold:     "14 165 233",
              exhale:   "6 182 212",
              idle:     "148 163 184",
            };
            return varMap[k] ?? "148 163 184";
          })}, 0.10) 55%, transparent 75%)`,
          transition: "transform 0.15s cubic-bezier(0.4,0,0.2,1), opacity 1.2s ease",
        }}
      />

      {/* Animated breathing ball */}
      <div
        className="circle-phase rounded-full shadow-2xl flex items-center justify-center"
        style={{
          width: size * 0.7,
          height: size * 0.7,
          // Pass scale via CSS variable — CSS transition handles smoothness
          ["--breath-scale" as string]: scale,
          ["--breath-color" as string]: isIdle ? "var(--breath-idle)" : COLOR_MAP[phase],
          // Subtle inner highlight
          background: isIdle
            ? `rgba(var(--breath-idle), 0.70)`
            : undefined,
          boxShadow: isIdle
            ? undefined
            : `0 0 ${Math.round(size * 0.12 * scale)}px rgba(${glowColor.replace(/var\\(--breath-(\\w+)\\)/, (_, k) => {
              const varMap: Record<string, string> = {
                inhale:   "56 189 248",
                hold:     "14 165 233",
                exhale:   "6 182 212",
                idle:     "148 163 184",
              };
              return varMap[k] ?? "148 163 184";
            })}, ${0.35 * scale}), inset 0 -8px 24px rgba(0,0,0,0.15), inset 0 8px 24px rgba(255,255,255,0.15)`,
        }}
      >
        {/* Progress ring overlay */}
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
              strokeOpacity="0.25"
              strokeWidth="1.5"
            />
            <circle
              cx="50"
              cy="50"
              r="48"
              fill="none"
              stroke="white"
              strokeOpacity="0.70"
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
