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
  onPhaseChange?: (phase: Phase) => void,
  onBeat?: () => void,
) {
  const [state, setState] = useState<TimerState>("idle");
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [phaseElapsed, setPhaseElapsed] = useState(0);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [cycles, setCycles] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const totalCycles = Math.floor(totalSeconds / pattern.cycleSeconds);

  const currentStep = pattern.steps[phaseIndex];

  // Keep latest callbacks in refs so the tick effect doesn't re-subscribe
  // on every render (which would reset the interval and skip cues/beats).
  const onPhaseChangeRef = useRef(onPhaseChange);
  useEffect(() => {
    onPhaseChangeRef.current = onPhaseChange;
  }, [onPhaseChange]);

  const onBeatRef = useRef(onBeat);
  useEffect(() => {
    onBeatRef.current = onBeat;
  }, [onBeat]);

  // Track which integer seconds we've already fired beats for this phase,
  // so we don't double-fire if the interval drifts.
  const beatSecondsFiredRef = useRef<Set<number>>(new Set());

  // Reset the beat-fired set whenever we change phase
  useEffect(() => {
    beatSecondsFiredRef.current.clear();
  }, [phaseIndex]);

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
            // Fire phase-change cue after index updates so the audio engine
            // plays the NEW phase sound (not the previous one).
            // We schedule it via the ref to avoid a stale-closure issue.
            const newPhase = pattern.steps[next].phase;
            if (onPhaseChangeRef.current) {
              // Defer to next microtask so React state has settled
              queueMicrotask(() => onPhaseChangeRef.current?.(newPhase));
            }
            if (next === 0) {
              setCycles((c) => c + 1);
            }
            return next;
          });
          return 0;
        }

        // BEAT LOGIC: fire on each whole second boundary.
        // Weiny wants heartbeat-like continuity — beat keeps going even in
        // the last second of a phase (will overlap slightly with next phase
        // cue, which adds a nice "accent" beat on phase transitions).
        // The current beat-second is floor(newElapsed).
        const currentSecond = Math.floor(newElapsed);
        if (
          onBeatRef.current &&
          currentSecond >= 1 && // skip the 0-second mark (that's when phase cue plays)
          !beatSecondsFiredRef.current.has(currentSecond)
        ) {
          beatSecondsFiredRef.current.add(currentSecond);
          queueMicrotask(() => onBeatRef.current?.());
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
