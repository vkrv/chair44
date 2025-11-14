/**
 * Sound effects utility using Web Audio API
 * Generates simple, pleasant tones for game feedback
 */

let audioContext: AudioContext | null = null;

/**
 * Initialize audio context (lazy initialization)
 */
function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

/**
 * Play a success sound - pleasant ascending tone
 */
export function playSuccessSound(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Create oscillator for the tone
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Configure success sound - ascending tones
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(523.25, now); // C5
    oscillator.frequency.setValueAtTime(659.25, now + 0.1); // E5

    // Volume envelope - quick fade in and out
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.15, now + 0.01);
    gainNode.gain.linearRampToValueAtTime(0.1, now + 0.1);
    gainNode.gain.linearRampToValueAtTime(0, now + 0.25);

    // Play sound
    oscillator.start(now);
    oscillator.stop(now + 0.25);
  } catch (error) {
    console.warn("Could not play success sound:", error);
  }
}

/**
 * Play an error sound - descending tone
 */
export function playErrorSound(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Create oscillator for the tone
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Configure error sound - descending tone
    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(392, now); // G4
    oscillator.frequency.linearRampToValueAtTime(196, now + 0.3); // G3

    // Volume envelope - gentle fade
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.1, now + 0.01);
    gainNode.gain.linearRampToValueAtTime(0.05, now + 0.15);
    gainNode.gain.linearRampToValueAtTime(0, now + 0.3);

    // Play sound
    oscillator.start(now);
    oscillator.stop(now + 0.3);
  } catch (error) {
    console.warn("Could not play error sound:", error);
  }
}

/**
 * Play a click sound - very subtle
 */
export function playClickSound(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Create oscillator for the tone
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Configure click sound - very short high tone
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(800, now);

    // Very short and quiet
    gainNode.gain.setValueAtTime(0.05, now);
    gainNode.gain.linearRampToValueAtTime(0, now + 0.05);

    // Play sound
    oscillator.start(now);
    oscillator.stop(now + 0.05);
  } catch (error) {
    console.warn("Could not play click sound:", error);
  }
}

