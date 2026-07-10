export type Phase = "inhale" | "hold-in" | "exhale" | "hold-out";

export interface BreathingPattern {
  id: string;
  name: string;
  description: string;
  steps: Array<{ phase: Phase; seconds: number; label: string }>;
  cycleSeconds: number;
}

export const PATTERNS: BreathingPattern[] = [
  {
    id: "box",
    name: "Box Breathing (4-4-4-4)",
    description: "Equal 4-second phases. Used by Navy SEALs for stress control.",
    steps: [
      { phase: "inhale", seconds: 4, label: "Inhale" },
      { phase: "hold-in", seconds: 4, label: "Hold" },
      { phase: "exhale", seconds: 4, label: "Exhale" },
      { phase: "hold-out", seconds: 4, label: "Hold" },
    ],
    cycleSeconds: 16,
  },
  {
    id: "4-7-8",
    name: "4-7-8 Breathing",
    description: "Dr. Andrew Weil's relaxing breath. Great for falling asleep.",
    steps: [
      { phase: "inhale", seconds: 4, label: "Inhale" },
      { phase: "hold-in", seconds: 7, label: "Hold" },
      { phase: "exhale", seconds: 8, label: "Exhale" },
    ],
    cycleSeconds: 19,
  },
  {
    id: "calm",
    name: "Calm Breathing (5-2-7)",
    description: "Slow exhale to activate your parasympathetic nervous system.",
    steps: [
      { phase: "inhale", seconds: 5, label: "Inhale" },
      { phase: "hold-in", seconds: 2, label: "Hold" },
      { phase: "exhale", seconds: 7, label: "Exhale" },
    ],
    cycleSeconds: 14,
  },
  {
    id: "energize",
    name: "Energizing Breath (6-0-2)",
    description: "Quick exhale to wake up. Good for morning use.",
    steps: [
      { phase: "inhale", seconds: 6, label: "Inhale" },
      { phase: "exhale", seconds: 2, label: "Exhale" },
    ],
    cycleSeconds: 8,
  },
];

export const DURATIONS = [
  { id: "1m", label: "1 min", seconds: 60 },
  { id: "3m", label: "3 min", seconds: 180 },
  { id: "5m", label: "5 min", seconds: 300 },
  { id: "10m", label: "10 min", seconds: 600 },
];

export type Duration = (typeof DURATIONS)[number];
