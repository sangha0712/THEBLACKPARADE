// Web Audio API Utilities for Cyberpunk Sound Effects

// Singleton AudioContext to prevent running out of hardware contexts (limit is usually 6)
let audioCtx: AudioContext | null = null;

const getAudioContext = () => {
    if (!audioCtx) {
        // Support standard AudioContext and Webkit prefix (Safari)
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
            audioCtx = new AudioContext();
        } else {
            console.warn("Web Audio API is not supported in this browser.");
        }
    }
    return audioCtx;
};

/**
 * Initialize audio context immediately on user interaction.
 * FIX: This handles the Browser Autoplay Policy. 
 * Browsers block audio if the context is not resumed during a user gesture (click/keydown).
 * We call this immediately in the event handler, before any async operations (like API calls).
 */
export const initAudio = async () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
        try {
            await ctx.resume();
        } catch (err) {
            console.error("Audio resume failed:", err);
        }
    }
};

// "Threatening/Dangerous" Error Sound
// Updated: Tries to play '/errorsound.mp3' first. Fallback to Industrial/Buzz if missing.
export const playErrorSound = () => {
    // 1. Try to play the file from the public directory
    const audio = new Audio('/errorsound.mp3');
    audio.volume = 1.0; 
    
    // 2. Handle errors (File not found, autoplay blocked, format issues)
    audio.play().catch((err) => {
        // Fallback: Original Industrial Buzz Logic
        const ctx = getAudioContext();
        if (!ctx) return;

        // Safety check: try to resume if suspended, though initAudio should have handled it.
        if (ctx.state === 'suspended') ctx.resume().catch(() => {});

        const t = ctx.currentTime;
        
        // Oscillator 1: Low Square wave for a harsh, digital "wrong" sound
        const osc1 = ctx.createOscillator();
        osc1.type = 'square';
        osc1.frequency.setValueAtTime(110, t); // Low A2
        osc1.frequency.exponentialRampToValueAtTime(55, t + 0.3); // Drop octave quickly

        // Oscillator 2: Sawtooth wave for grit, slightly detuned
        const osc2 = ctx.createOscillator();
        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(115, t); // Detuned from 110Hz to create roughness (beating)
        osc2.frequency.exponentialRampToValueAtTime(58, t + 0.3);

        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        // Lowpass filter to dampen the high end slightly, making it feel "heavier"
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, t);
        filter.frequency.linearRampToValueAtTime(100, t + 0.3);

        // Aggressive Volume Envelope
        gain.gain.setValueAtTime(0.4, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

        // Connections
        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        // Play
        osc1.start(t);
        osc2.start(t);
        
        // Stop
        osc1.stop(t + 0.4);
        osc2.stop(t + 0.4);
    });
};

// High-pitched "Beep" warning for Security Clearance Access Denied
export const playAccessDeniedBeep = () => {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') ctx.resume().catch(() => {});

    const t = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Square wave for sharp digital beep
    osc.type = 'square';
    osc.frequency.setValueAtTime(1200, t); // 1200Hz High pitch
    
    // Short, sharp envelope
    gain.gain.setValueAtTime(0.1, t);
    gain.gain.linearRampToValueAtTime(0.1, t + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.2);
};

export const playSirenSound = () => {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') ctx.resume().catch(() => {});

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    // Square wave for alarm/siren
    osc.type = 'square';
    
    const now = ctx.currentTime;
    const duration = 2.0;

    // Siren modulation (Low-High-Low)
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.linearRampToValueAtTime(1200, now + 0.5);
    osc.frequency.linearRampToValueAtTime(600, now + 1.0);
    osc.frequency.linearRampToValueAtTime(1200, now + 1.5);
    osc.frequency.linearRampToValueAtTime(100, now + 2.0); // Power down at end

    // Volume envelope
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 1.5);
    gain.gain.linearRampToValueAtTime(0, now + duration);

    osc.start();
    osc.stop(now + duration);
};

export const playDeathNoise = () => {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') ctx.resume().catch(() => {});

    // Create 2 seconds of white noise
    const bufferSize = ctx.sampleRate * 2.0;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // Create a filter to make it sound a bit more "static-y" (Highpass)
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 100;

    const gain = ctx.createGain();
    
    const now = ctx.currentTime;
    // Fade in
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.5, now + 0.1);
    // Fade out
    gain.gain.exponentialRampToValueAtTime(0.01, now + 2.0);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
};