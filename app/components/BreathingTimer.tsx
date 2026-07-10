"use client";

import { useState } from "react";
import { PATTERNS, DURATIONS, type BreathingPattern, type Duration } from "@/lib/breathing-patterns";
import { useBreathingTimer } from "@/lib/useTimer";
import BreathingCircle from "./BreathingCircle";

export default function BreathingTimer() {
  const [pattern, setPattern] = useState<BreathingPattern>(PATTERNS[0]);
  const [duration, setDuration] = useState<Duration>(DURATIONS[2]); // 5 min default
  const [settingsOpen, setSettingsOpen] = useState(false);

  const timer = useBreathingTimer(pattern, duration.seconds);
  const totalProgress = timer.totalElapsed / timer.totalSeconds;
  const isRunning = timer.state === "running";
  const isCompleted = timer.state === "completed";

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-2 sm:py-6">
      {/* Current Config Summary — always visible, clickable to expand settings */}
      <button
        onClick={() => !isRunning && setSettingsOpen((v) => !v)}
        disabled={isRunning}
        className={`w-full mb-2 sm:mb-4 p-2 sm:p-3 rounded-xl flex items-center justify-between transition-colors ${
          isRunning
            ? "bg-gray-100 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 cursor-not-allowed opacity-60"
            : "bg-white/60 dark:bg-brand-900/40 border border-brand-200 dark:border-brand-800 hover:border-brand-400"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${isRunning ? "bg-gray-400" : "bg-brand-500"}`} />
          <div className="text-left">
            <div className="text-sm font-semibold text-brand-800 dark:text-brand-200">
              {pattern.name} <span className="text-brand-500 font-normal">·</span> <span className="text-xs text-brand-600 dark:text-brand-400 font-normal">{duration.label}</span>
            </div>
          </div>
        </div>
        <div className="text-brand-500 transition-transform" style={{ transform: settingsOpen ? "rotate(180deg)" : "none" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {/* Collapsible Settings Panel */}
      {settingsOpen && (
        <div className={`mb-6 p-4 rounded-xl space-y-5 animate-in fade-in transition-colors ${
          isRunning
            ? "bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700 opacity-60 pointer-events-none"
            : "bg-white dark:bg-brand-900/30 border border-brand-200 dark:border-brand-800"
        }`}>
          {isRunning && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 -mt-2">
              <span>🔒</span>
              <span>Settings are locked while the session is running</span>
            </div>
          )}
          {/* Pattern Selector */}
          <div>
            <label className="block text-sm font-medium text-brand-700 dark:text-brand-300 mb-2">
              Breathing Pattern
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PATTERNS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPattern(p)}
                  className={`text-left p-3 rounded-lg border transition-all ${
                    pattern.id === p.id
                      ? "border-brand-500 bg-brand-50 dark:bg-brand-900/50 ring-2 ring-brand-400"
                      : "border-brand-200 dark:border-brand-800 hover:border-brand-400"
                  }`}
                >
                  <div className="font-semibold text-sm">{p.name}</div>
                  <div className="text-xs text-brand-600 dark:text-brand-400 mt-1">
                    {p.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Duration Selector */}
          <div>
            <label className="block text-sm font-medium text-brand-700 dark:text-brand-300 mb-2 text-center">
              Session Length
            </label>
            <div className="flex justify-center gap-2 flex-wrap">
              {DURATIONS.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDuration(d)}
                  className={`px-4 py-2 rounded-full font-medium transition-all text-sm ${
                    duration.id === d.id
                      ? "bg-brand-500 text-white"
                      : "bg-brand-100 text-brand-700 hover:bg-brand-200 dark:bg-brand-800 dark:text-brand-200"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Timer Display — Visual Center */}
      <div className="flex flex-col items-center justify-center my-3 sm:my-6">
        <BreathingCircle
          phase={timer.currentPhase}
          state={timer.state}
          progress={timer.phaseProgress}
          size={220}
        />
        <div className="mt-3 sm:mt-6 text-center">
          <div className="text-xl sm:text-3xl font-bold text-brand-700 dark:text-brand-300">
            {timer.currentPhaseLabel}
          </div>
          <div className="text-4xl sm:text-6xl font-mono font-bold text-brand-900 dark:text-brand-100 mt-1 sm:mt-2 tabular-nums">
            {Math.ceil(timer.secondsLeftInPhase)}
          </div>
        </div>
      </div>

      {/* Primary Control — Visual Center of Attention */}
      <div className="flex flex-col items-center gap-3 mb-3 sm:mb-6">
        {timer.state !== "running" ? (
          <button
            onClick={timer.start}
            disabled={isCompleted}
            className="w-full max-w-xs px-8 py-4 bg-brand-500 hover:bg-brand-600 text-white text-lg font-bold rounded-full shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            {isCompleted ? "✓ Session Complete" : "▶ Start Breathing"}
          </button>
        ) : (
          <button
            onClick={timer.pause}
            className="w-full max-w-xs px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white text-lg font-bold rounded-full shadow-xl transition-all active:scale-95"
          >
            ⏸ Pause
          </button>
        )}

        {/* Secondary control — Reset (only when not idle) */}
        {timer.state !== "idle" && (
          <button
            onClick={timer.reset}
            className="text-sm text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-200 underline transition-colors"
          >
            ↻ Reset
          </button>
        )}
      </div>

      {/* Progress (only when running or completed) */}
      {timer.state !== "idle" && (
        <div className="mb-6">
          <div className="flex justify-between text-xs text-brand-600 dark:text-brand-400 mb-2">
            <span>Cycle {timer.cycleCount + 1} / {timer.totalCycles}</span>
            <span className="font-mono tabular-nums">
              {Math.floor(timer.totalElapsed / 60)}:
              {String(Math.floor(timer.totalElapsed % 60)).padStart(2, "0")} /{" "}
              {Math.floor(timer.totalSeconds / 60)}:
              {String(timer.totalSeconds % 60).padStart(2, "0")}
            </span>
          </div>
          <div className="w-full bg-brand-100 dark:bg-brand-900 rounded-full h-2 overflow-hidden">
            <div
              className="bg-brand-500 h-full transition-all duration-200"
              style={{ width: `${totalProgress * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Completion message */}
      {isCompleted && (
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl text-center">
          <div className="text-2xl mb-2">🌿</div>
          <div className="font-semibold text-green-800 dark:text-green-200">
            Session Complete
          </div>
          <div className="text-sm text-green-700 dark:text-green-300 mt-1">
            You completed {timer.cycleCount} cycles. Notice how you feel.
          </div>
        </div>
      )}
    </div>
  );
}
