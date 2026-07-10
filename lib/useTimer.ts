"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { BreathingPattern, Phase } from "./breathing-patterns";

export type TimerState = "idle" | "running" | "paused" | "completed";

export interface TimerStatus {
  state: TimerState;
  currentPhaseIndex: number;
  currentPhase: Phase;
  currentPhaseLabel: string;
  currentPhaseSeconds: number;
  secondsLeftInPhase: number;
  cycleCount: number;
  totalSecondsElapsed: number;
  totalCycles: number;
}

export function useBreathingTimer(
  pattern: BreathingPattern,
  totalSeconds: number,
) {
  const [state, setState] = useState<TimerState>("idle");
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [phaseElapsed, setPhaseElapsed] = useState(0);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [cycles, setCycles] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const totalCycles = Math.floor(totalSeconds / pattern.cycleSeconds);

  const currentStep = pattern.steps[phaseIndex];

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    stop();
    setState("idle");
    setPhaseIndex(0);
    setPhaseElapsed(0);
    setTotalElapsed(0);
    setCycles(0);
  }, [stop]);

  const start = useCallback(() => {
    if (state === "running") return;
    setState("running");
  }, [state]);

  const pause = useCallback(() => {
    if (state !== "running") return;
    setState("paused");
  }, [state]);

  // Main tick
  useEffect(() => {
    if (state !== "running") return;

    intervalRef.current = setInterval(() => {
      setPhaseElapsed((prev) => {
        const newElapsed = prev + 0.1;
        if (newElapsed >= currentStep.seconds) {
          // Move to next phase
          setPhaseIndex((idx) => {
            const next = (idx + 1) % pattern.steps.length;
            if (next === 0) {
              setCycles((c) => c + 1);
            }
            return next;
          });
          return 0;
        }
        return newElapsed;
      });
      setTotalElapsed((t) => {
        const next = t + 0.1;
        if (next >= totalSeconds) {
          setState("completed");
          return totalSeconds;
        }
        return next;
      });
    }, 100);

    return () => stop();
  }, [state, currentStep, pattern.steps.length, totalSeconds, stop]);

  // Reset on pattern change
  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pattern.id, totalSeconds]);

  return {
    state,
    currentPhase: currentStep.phase,
    currentPhaseLabel: currentStep.label,
    currentPhaseSeconds: currentStep.seconds,
    secondsLeftInPhase: Math.max(0, currentStep.seconds - phaseElapsed),
    phaseProgress: Math.min(1, phaseElapsed / currentStep.seconds),
    cycleCount: cycles,
    totalCycles,
    totalElapsed,
    totalSeconds,
    start,
    pause,
    reset,
  };
}
