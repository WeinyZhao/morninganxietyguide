/**
 * audio.ts — Web Audio API phase cues (iOS Safari-safe version)
 *
 * KEY FIX vs original:
 *   iOS Safari requires that AudioContext be created AND resumed SYNCHRONOUSLY
 *   inside a user gesture handler (click, touch). Anything async (Promise,
 *   setTimeout, microtask) breaks the gesture chain and audio goes silent.
 *
 *   Previous code had two problems:
 *     1. AudioContext was created inside getContext() which was called from
 *        ensureContextRunning() — the resume() Promise was a microtask away
 *        from the user gesture, so iOS considered it out-of-gesture.
 *     2. playSessionStartCue() and toggleMute() used setTimeout to schedule
 *        tones — setTimeout breaks the user-gesture context completely on iOS.
 *
 *   New approach:
 *     1. initAudio() is called SYNCHRONOUSLY from a click handler
 *     2. All tone scheduling uses ctx.currentTime (Audio API's internal clock),
 *        not setTimeout. osc.start(time) where time is in the future works
 *        fine and stays within the gesture's "trust window" (~1-2 sec).
 *     3. playTone() is exported so React can call it directly if needed.
 */

import type { Phase } from "./breathing-patterns";

/**
 * Frequency map (in Hz, equal-tempered, A4 = 440 Hz reference).
 *
 * Musical arc: the inhale rises, hold sustains higher, exhale descends,
 * hold-empty rests in the low register. This creates a familiar
 * inhale-up / exhale-down pattern that matches body intuition.
 */
const PHASE_FREQUENCIES: Record<Phase, number> = {
  inhale: 523.25, // C5     — rises with the breath
  "hold-in": 659.25, // E5   — bright sustain
  exhale: 440.0, // A4      — drops with the breath
  "hold-out": 293.66, // D4  — rest in the low register
};

const SOUND_DURATION_SEC = 0.18; // ~180ms per cue
const PEAK_VOLUME = 0.18; // soft but audible on phone speakers

/**
 * Module-level state. AudioContext is created lazily but MUST be initialized
 * inside a user gesture — see `initAudio()`.
 */
let audioContext: AudioContext | null = null;
let masterGain: GainNode | null = null;
let muted = true; // Default muted — user must opt in

/**
 * Initialize the AudioContext SYNCHRONOUSLY inside a user-gesture handler.
 *
 * iOS Safari rule (as of iOS 17): AudioContext can be created in a user
 * gesture, and resume() must be called synchronously (no awaiting Promises
 * in the same microtask). We return a Promise so callers can chain any
 * post-init setup, but the resume() call itself is synchronous.
 *
 * Returns true if audio is ready, false if Web Audio is unavailable.
 */
export function initAudio(): boolean {
  if (typeof window === "undefined") return false;

  // If already initialized and running, nothing to do
  if (audioContext && audioContext.state === "running") return true;

  try {
    if (!audioContext) {
      // Create context — must happen inside user gesture
      const Ctor: typeof AudioContext | undefined =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctor) return false;

      audioContext = new Ctor();
      masterGain = audioContext.createGain();
      masterGain.gain.value = 1;
      masterGain.connect(audioContext.destination);
    }

    // Resume synchronously — required by Safari/iOS
    if (audioContext.state === "suspended") {
      void audioContext.resume(); // The void ignores the Promise but the
                                   // call itself is synchronous, which is what
                                   // Safari checks for.
    }

    return audioContext.state === "running";
  } catch (err) {
    console.warn("Web Audio init failed:", err);
    return false;
  }
}

/**
 * Schedule a soft sine-wave tone at the given frequency.
 * Uses ctx.currentTime for scheduling (NOT setTimeout) so the call
 * stays within iOS Safari's gesture trust window.
 *
 * Returns true if scheduled, false if skipped.
 */
function scheduleTone(frequency: number, startOffset = 0): boolean {
  if (!audioContext || !masterGain || muted) return false;

  try {
    const now = audioContext.currentTime + startOffset;
    const osc = audioContext.createOscillator();
    const env = audioContext.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(frequency, now);
    // Subtle pitch glide makes the cue feel less "buzzy"
    osc.frequency.exponentialRampToValueAtTime(
      frequency * 0.98,
      now + SOUND_DURATION_SEC
    );

    // Envelope: fast attack (10ms) to avoid click, exponential release
    env.gain.setValueAtTime(0, now);
    env.gain.linearRampToValueAtTime(PEAK_VOLUME, now + 0.01);
    env.gain.exponentialRampToValueAtTime(0.001, now + SOUND_DURATION_SEC);

    osc.connect(env);
    env.connect(masterGain);

    osc.start(now);
    osc.stop(now + SOUND_DURATION_SEC + 0.05);
    return true;
  } catch (err) {
    console.warn("Failed to schedule tone:", err);
    return false;
  }
}

/**
 * Play the cue sound for a given phase. Safe to call when muted (no-op).
 */
export function playPhaseCue(phase: Phase): void {
  if (muted) return;
  const frequency = PHASE_FREQUENCIES[phase];
  if (frequency) scheduleTone(frequency);
}

/**
 * Play a "start session" cue — three ascending tones (C5 → E5 → G5).
 * All tones scheduled via ctx.currentTime, NOT setTimeout, so they
 * stay in iOS Safari's gesture trust window.
 *
 * Safe to call when muted (no-op).
 */
export function playSessionStartCue(): void {
  if (muted) return;
  const tones = [523.25, 659.25, 783.99]; // C5, E5, G5
  tones.forEach((freq, i) => {
    scheduleTone(freq, i * 0.09); // 90ms spacing via currentTime offset
  });
}

/**
 * Play a single confirmation tone. Useful for UI feedback (e.g., when
 * toggling mute on). Caller must invoke from within a user gesture.
 */
export function playConfirmationTone(): void {
  if (muted) return;
  scheduleTone(659.25); // E5
}

/**
 * Mute / unmute audio. Caller should also call initAudio() first
 * (typically inside the same click handler that calls this).
 */
export function setMuted(value: boolean): void {
  muted = value;
}

/**
 * Get current muted state.
 */
export function isMuted(): boolean {
  return muted;
}

/**
 * Check if AudioContext is ready (exists and running).
 * Useful for showing a "tap to enable audio" hint if needed.
 */
export function isAudioReady(): boolean {
  return audioContext !== null && audioContext.state === "running";
}