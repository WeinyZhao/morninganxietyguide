/**
 * audio.ts — Web Audio API phase cues
 *
 * Generates soft sine-wave tones with smooth envelopes to cue phase changes
 * (inhale / hold / exhale / hold-empty). No external audio files needed.
 *
 * Design choices:
 *  - Default MUTED — users opt in via the 🔔 button. Reasons:
 *    1. Mobile autoplay restrictions require user gesture anyway
 *    2. Sudden sound on page load would be jarring
 *    3. Users in shared spaces (offices, libraries) shouldn't have to scramble
 *  - Soft sine wave + envelope (10ms attack, 200ms release) — no click/pop
 *  - Light volume (0.15) — noticeable but not startling
 *  - Per-phase frequencies create a melodic arc: low → high → mid → low
 *
 * Browser support: All modern browsers. Safari requires AudioContext to be
 * resumed after user interaction; we handle that in `ensureContextRunning()`.
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

const SOUND_DURATION_SEC = 0.18; // ~180ms per cue (short enough to not feel laggy)
const PEAK_VOLUME = 0.15; // soft

/**
 * Module-level state. AudioContext is created lazily on first user interaction
 * (Safari/iOS require this — see `ensureContextRunning`).
 */
let audioContext: AudioContext | null = null;
let masterGain: GainNode | null = null;
let muted = true; // Default muted — user must opt in

/**
 * Lazy AudioContext creation. Returns null if Web Audio is unavailable
 * (e.g., very old browser, server-side rendering, security restrictions).
 */
function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (audioContext) return audioContext;

  try {
    const Ctor: typeof AudioContext | undefined =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;

    audioContext = new Ctor();
    masterGain = audioContext.createGain();
    masterGain.gain.value = 1;
    masterGain.connect(audioContext.destination);
    return audioContext;
  } catch (err) {
    // Some browsers (Safari privacy mode) throw on construction. Fail silently.
    console.warn("Web Audio unavailable:", err);
    return null;
  }
}

/**
 * Ensure the AudioContext is running. Required on Safari/iOS where the
 * context starts in 'suspended' state until a user gesture occurs.
 */
export function ensureContextRunning(): void {
  const ctx = getContext();
  if (ctx && ctx.state === "suspended") {
    void ctx.resume();
  }
}

/**
 * Play a soft sine-wave tone at the given frequency. Uses an envelope
 * (10ms attack, 200ms release) to avoid the click/pop that raw OscillatorNode
 * start/stop produces.
 *
 * Returns true if played, false if skipped (no context or muted).
 */
function playTone(frequency: number): boolean {
  const ctx = getContext();
  if (!ctx || !masterGain || muted) return false;

  try {
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = "sine";
    osc.frequency.setValueAtTime(frequency, now);
    // Subtle pitch glide (~30ms) makes the cue feel less "buzzy"
    osc.frequency.exponentialRampToValueAtTime(frequency * 0.98, now + SOUND_DURATION_SEC);

    // Envelope: fast attack to avoid click, exponential release to feel natural
    env.gain.setValueAtTime(0, now);
    env.gain.linearRampToValueAtTime(PEAK_VOLUME, now + 0.01); // 10ms attack
    env.gain.exponentialRampToValueAtTime(0.001, now + SOUND_DURATION_SEC); // release

    osc.connect(env);
    env.connect(masterGain);

    osc.start(now);
    osc.stop(now + SOUND_DURATION_SEC + 0.05);
  } catch (err) {
    // Should never happen, but don't break the timer if audio glitches
    console.warn("Failed to play tone:", err);
  }
  return true;
}

/**
 * Play the cue sound for a given phase. Safe to call even if muted —
 * silently no-ops when audio is disabled.
 */
export function playPhaseCue(phase: Phase): void {
  const frequency = PHASE_FREQUENCIES[phase];
  if (frequency) playTone(frequency);
}

/**
 * Play a short "start session" cue — three ascending tones (C5 → E5 → A5)
 * signaling that the timer has started. Helps confirm audio is working
 * AND gives the user a moment to settle in.
 */
export function playSessionStartCue(): void {
  if (muted) return;
  const ctx = getContext();
  if (!ctx) return;

  const tones = [523.25, 659.25, 783.99]; // C5, E5, G5 — rising triad
  tones.forEach((freq, i) => {
    setTimeout(() => playTone(freq), i * 90);
  });
}

/**
 * Mute / unmute audio. Returns the new muted state.
 */
export function setMuted(value: boolean): boolean {
  ensureContextRunning();
  muted = value;
  return muted;
}

/**
 * Get current muted state.
 */
export function isMuted(): boolean {
  return muted;
}

/**
 * Toggle muted state and return the new value. Plays a confirmation cue
 * when unmuting so the user gets immediate feedback.
 */
export function toggleMute(): boolean {
  muted = !muted;
  if (!muted) {
    ensureContextRunning();
    // Play a brief confirmation cue so the user knows audio is on
    setTimeout(() => playTone(659.25), 0); // E5
  }
  return muted;
}