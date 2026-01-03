// Web Audio API Utilities for Cyberpunk Sound Effects

// Singleton AudioContext to prevent running out of hardware contexts (limit is usually 6)
let audioCtx: AudioContext | null = null;

const getAudioContext = () => {
    if (!audioCtx) {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
            audioCtx = new AudioContext();
        }
    }
    return audioCtx;
};

// Internal fallback: Synth sound for error
const playSynthError = () => {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Ensure context is running (it might be suspended by default)
    if (ctx.state === 'suspended') {
        ctx.resume();
    }

    // Create oscillator for the "beep"
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    // Glitchy Sawtooth wave for harsh error sound
    osc.type = 'sawtooth';
    
    // Pitch drop effect (800Hz -> 100Hz)
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.2);

    // Volume envelope
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc.start();
    osc.stop(now + 0.25);
};

export const playErrorSound = () => {
    // Safely encode the path to handle spaces and Korean characters
    // Browsers sometimes fail to parse unencoded Unicode/spaces in Audio constructor
    const safePath = encodeURI('/경고음 3.mp3');
    const audio = new Audio(safePath);
    audio.volume = 0.5;

    const playPromise = audio.play();

    if (playPromise !== undefined) {
        playPromise.catch((e) => {
            // Fallback to synth if file not found or playback failed (e.g., due to autoplay policy)
            console.warn("Failed to play MP3, using synth fallback. Error:", e);
            playSynthError();
        });
    }
};

export const playSirenSound = () => {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') ctx.resume();

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

    if (ctx.state === 'suspended') ctx.resume();

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