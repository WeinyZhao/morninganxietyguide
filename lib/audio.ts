/**
 * audio.ts — Phase cue audio with iOS Safari compatibility
 *
 * History:
 *  - v1 (commit b37ed4a): Pure Web Audio API. Worked on macOS but silent on iPhone.
 *  - v2 (current): Dual-path audio:
 *      1. Web Audio API (preferred — cleaner envelopes)
 *      2. HTMLAudioElement fallback (more reliable on iOS Safari)
 *
 * Why dual path?
 *   iOS Safari has multiple quirks with Web Audio API:
 *     - User gesture window is ~1 second (very strict)
 *     - AudioContext can silently fail if created outside gesture
 *     - WebKit bug: in some iOS versions, AudioContext.state goes
 *       'suspended' on tab background then never resumes
 *   HTMLAudioElement with a data:URL or short blob is more reliable on iOS
 *   because it can be triggered from <audio>.play() which has simpler rules.
 *
 * Debug overlay (DEV_AUDIO_DEBUG=true):
 *   - Shows on-screen AudioContext state + last error
 *   - Toggle via window.localStorage.devAudioDebug = '1'
 */

import type { Phase } from "./breathing-patterns";

const PHASE_FREQUENCIES: Record<Phase, number> = {
  inhale: 523.25, // C5
  "hold-in": 659.25, // E5
  exhale: 440.0, // A4
  "hold-out": 293.66, // D4
};

const SOUND_DURATION_SEC = 0.18;
const PEAK_VOLUME = 0.18;
const BEAT_VOLUME = 0.054; // 30% of peak — background-level "tick"
const BEAT_FREQUENCY = 220; // A3 — deeper than phase cues, distinguishable

let audioContext: AudioContext | null = null;
let masterGain: GainNode | null = null;
let muted = true;
let lastError: string | null = null;

/**
 * Debug overlay — renders state into a fixed-position div so the user
 * (or Weiny testing on iPhone) can see what's happening.
 */
function debugLog(msg: string, error?: unknown) {
  if (typeof window === "undefined") return;
  if (error) {
    lastError = error instanceof Error ? error.message : String(error);
    console.warn("[audio]", msg, error);
  } else {
    console.log("[audio]", msg);
  }
  // Update on-screen debug element if it exists
  const el = document.getElementById("audio-debug");
  if (el) {
    el.textContent = `${msg}${error ? `\nERR: ${lastError}` : ""}`;
  }
}

/**
 * Initialize Web Audio context. Called from user-gesture handler.
 * Returns true if audio is ready, false otherwise.
 */
export function initAudio(): boolean {
  if (typeof window === "undefined") return false;

  if (audioContext && audioContext.state === "running") return true;

  try {
    if (!audioContext) {
      const Ctor: typeof AudioContext | undefined =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctor) {
        debugLog("Web Audio not supported");
        return false;
      }

      audioContext = new Ctor();
      masterGain = audioContext.createGain();
      masterGain.gain.value = 1;
      masterGain.connect(audioContext.destination);
      debugLog(`AudioContext created, state=${audioContext.state}`);
    }

    if (audioContext.state === "suspended") {
      void audioContext.resume();
      debugLog(`AudioContext resume() called, state=${audioContext.state}`);
    }

    return audioContext.state === "running";
  } catch (err) {
    debugLog("Web Audio init failed", err);
    return false;
  }
}

/**
 * Schedule a Web Audio tone. Returns true if scheduled.
 */
function scheduleTone(frequency: number, startOffset = 0): boolean {
  if (!audioContext || !masterGain || muted) return false;

  try {
    const now = audioContext.currentTime + startOffset;
    const osc = audioContext.createOscillator();
    const env = audioContext.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(frequency, now);
    osc.frequency.exponentialRampToValueAtTime(
      frequency * 0.98,
      now + SOUND_DURATION_SEC
    );

    env.gain.setValueAtTime(0, now);
    env.gain.linearRampToValueAtTime(PEAK_VOLUME, now + 0.01);
    env.gain.exponentialRampToValueAtTime(0.001, now + SOUND_DURATION_SEC);

    osc.connect(env);
    env.connect(masterGain);

    osc.start(now);
    osc.stop(now + SOUND_DURATION_SEC + 0.05);
    return true;
  } catch (err) {
    debugLog("Failed to schedule tone", err);
    return false;
  }
}

/**
 * FALLBACK: Play a beep using HTMLAudioElement + generated WAV blob.
 * This is more reliable on iOS Safari than Web Audio API.
 *
 * The WAV is a tiny PCM file with the requested frequency. Generated
 * on the fly so we don't ship an audio asset.
 */
function playBeepBlob(frequency: number): boolean {
  if (typeof window === "undefined") return false;

  try {
    const sampleRate = 22050;
    const duration = 0.12; // shorter than Web Audio to feel snappy
    const numSamples = Math.floor(sampleRate * duration);
    const bytesPerSample = 2;
    const blockAlign = bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = numSamples * bytesPerSample;

    // WAV header (44 bytes) + PCM data
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    // "RIFF" header
    writeString(view, 0, "RIFF");
    view.setUint32(4, 36 + dataSize, true);
    writeString(view, 8, "WAVE");
    writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, 16, true); // bits per sample
    writeString(view, 36, "data");
    view.setUint32(40, dataSize, true);

    // PCM samples — sine wave with envelope
    const amplitude = 0.18 * 32767;
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      // Apply attack/release envelope
      let envelope: number;
      if (t < 0.01) {
        envelope = t / 0.01; // 10ms attack
      } else if (t > duration - 0.05) {
        envelope = (duration - t) / 0.05; // 50ms release
      } else {
        envelope = 1;
      }
      const sample = Math.sin(2 * Math.PI * frequency * t) * amplitude * envelope;
      view.setInt16(44 + i * 2, sample, true);
    }

    const blob = new Blob([buffer], { type: "audio/wav" });
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.volume = 1;
    const playPromise = audio.play();
    if (playPromise) {
      playPromise.catch((err) => {
        debugLog("Audio.play() failed", err);
      });
    }
    // Cleanup URL after playback
    audio.onended = () => {
      URL.revokeObjectURL(url);
    };
    return true;
  } catch (err) {
    debugLog("Fallback beep failed", err);
    return false;
  }
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

/**
 * Play phase cue. Tries Web Audio first, falls back to HTMLAudioElement.
 */
export function playPhaseCue(phase: Phase): void {
  if (muted) return;
  const frequency = PHASE_FREQUENCIES[phase];
  if (!frequency) return;

  // Try Web Audio first
  if (!scheduleTone(frequency)) {
    debugLog("Web Audio failed, using HTMLAudioElement fallback");
    playBeepBlob(frequency);
  }
}

/**
 * Play session start cue — three ascending tones.
 */
export function playSessionStartCue(): void {
  if (muted) return;
  const tones = [523.25, 659.25, 783.99]; // C5, E5, G5
  tones.forEach((freq, i) => {
    // Try Web Audio scheduling
    if (!scheduleTone(freq, i * 0.09)) {
      // Fallback: schedule HTMLAudioElement with setTimeout
      // (less reliable on iOS but still works for start cue)
      setTimeout(() => playBeepBlob(freq), i * 90);
    }
  });
}

/**
 * Play single confirmation tone.
 */
export function playConfirmationTone(): void {
  if (muted) return;
  if (!scheduleTone(659.25)) {
    playBeepBlob(659.25);
  }
}

/**
 * Play a soft beat tick. Lower volume + lower frequency than phase cues
 * so it's distinguishable and doesn't fatigue the listener.
 * Used for "every second" metronome ticks when user wants guided timing
 * without looking at the screen (e.g., commuting with eyes closed).
 */
export function playBeat(): void {
  if (muted) return;
  // Try Web Audio first with low volume
  if (audioContext && masterGain) {
    try {
      const now = audioContext.currentTime;
      const osc = audioContext.createOscillator();
      const env = audioContext.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(BEAT_FREQUENCY, now);

      // Very short envelope — softer than phase cues (5ms attack, 80ms release)
      env.gain.setValueAtTime(0, now);
      env.gain.linearRampToValueAtTime(BEAT_VOLUME, now + 0.005);
      env.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(env);
      env.connect(masterGain);

      osc.start(now);
      osc.stop(now + 0.1);
      return;
    } catch (err) {
      debugLog("Beat (Web Audio) failed", err);
      // Fall through to fallback
    }
  }
  // Fallback: shorter WAV blob
  playBeepBlob(BEAT_FREQUENCY);
}

/**
 * Mute / unmute.
 */
export function setMuted(value: boolean): void {
  muted = value;
  debugLog(`Muted=${muted}, AudioContext=${audioContext?.state ?? "none"}`);
}

/**
 * Get current muted state.
 */
export function isMuted(): boolean {
  return muted;
}

/**
 * Check if audio is ready.
 */
export function isAudioReady(): boolean {
  return audioContext !== null && audioContext.state === "running";
}

/**
 * Get debug info for the on-screen overlay.
 */
export function getDebugInfo(): string {
  return JSON.stringify(
    {
      ctx: audioContext?.state ?? "none",
      muted,
      lastError,
      sampleRate: audioContext?.sampleRate ?? null,
    },
    null,
    2
  );
}