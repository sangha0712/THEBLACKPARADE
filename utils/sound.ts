
// Web Audio API Utilities for Cyberpunk Sound Effects

// Singleton AudioContext
let audioCtx: AudioContext | null = null;
let ambienceNodes: { stop: () => void } | null = null;
let transitionLoopNodes: { stop: () => void } | null = null; // Re-introduced for Transition Loop

const getAudioContext = () => {
    if (!audioCtx) {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
            audioCtx = new AudioContext();
        }
    }
    return audioCtx;
};

export const initAudio = async () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
        try {
            await ctx.resume();
        } catch (err) {}
    }
};

// --- CORE UTILS: BUFFERS & NOISE ---

const createBuffer = (ctx: AudioContext, duration: number) => 
    ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);

const createWhiteNoise = (ctx: AudioContext, duration: number) => {
    const buffer = createBuffer(ctx, duration);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    return buffer;
};

// Pink Noise (Better for ambience/texture)
const createPinkNoise = (ctx: AudioContext, duration: number) => {
    const buffer = createBuffer(ctx, duration);
    const data = buffer.getChannelData(0);
    let b0=0, b1=0, b2=0, b3=0, b4=0, b5=0, b6=0;
    for (let i = 0; i < data.length; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        data[i] *= 0.11;
        b6 = white * 0.115926;
    }
    return buffer;
};

// --- AMBIENCE ---

export const startAmbience = () => {
    if (ambienceNodes) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    // Pink Noise Fan
    const buffer = createPinkNoise(ctx, 4.0); // 4 sec loop
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400; // Deep rumble

    const gain = ctx.createGain();
    gain.gain.value = 0.08;

    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    src.start();

    ambienceNodes = {
        stop: () => {
            gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
            setTimeout(() => {
                src.stop();
                src.disconnect();
                gain.disconnect();
            }, 600);
            ambienceNodes = null;
        }
    };
};

export const stopAmbience = () => {
    if (ambienceNodes) ambienceNodes.stop();
};

// --- UI SOUNDS (Minimal / Clean) ---

// [CHANGED] Digital Tick (Dry, Sharp Sine Chirp)
export const playDataBlip = () => {
    const ctx = getAudioContext();
    if (!ctx || ctx.state !== 'running') return;
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    // Very short, high-pitch Sine "Chirp" (3000Hz)
    osc.type = 'sine';
    osc.frequency.setValueAtTime(3000, t);
    
    gain.gain.setValueAtTime(0.05, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.05);
};

export const playHackingBlip = () => {
    // Replaced with filtered noise tick (More "textural")
    const ctx = getAudioContext();
    if (!ctx || ctx.state !== 'running') return;
    const t = ctx.currentTime;

    const buffer = createWhiteNoise(ctx, 0.05);
    const src = ctx.createBufferSource();
    src.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1000 + Math.random() * 2000, t); // Random pitch
    filter.Q.value = 10;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.05, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    src.start(t);
};

export const playErrorSound = () => {
    // Heavy mechanical latch fail
    const ctx = getAudioContext();
    if (!ctx) return;
    const t = ctx.currentTime;

    const buffer = createPinkNoise(ctx, 0.3);
    const src = ctx.createBufferSource();
    src.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(500, t);
    filter.frequency.exponentialRampToValueAtTime(50, t + 0.2); // "Thud"

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    src.start(t);
};

export const playAccessDeniedBeep = playErrorSound; // Re-use mechanical fail

// [CHANGED] Single Rising Tone + Bass Kick (No melody)
export const playAccessGranted = () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const t = ctx.currentTime;

    // 1. Base Kick
    const kickOsc = ctx.createOscillator();
    const kickGain = ctx.createGain();
    
    kickOsc.frequency.setValueAtTime(150, t);
    kickOsc.frequency.exponentialRampToValueAtTime(0.01, t + 0.5);
    
    kickGain.gain.setValueAtTime(0.5, t);
    kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    
    kickOsc.connect(kickGain);
    kickGain.connect(ctx.destination);
    kickOsc.start(t);
    kickOsc.stop(t + 0.5);

    // 2. Rising Tone (Swipe)
    const toneOsc = ctx.createOscillator();
    const toneGain = ctx.createGain();

    toneOsc.type = 'sine';
    toneOsc.frequency.setValueAtTime(400, t);
    toneOsc.frequency.linearRampToValueAtTime(1200, t + 0.3);

    toneGain.gain.setValueAtTime(0.1, t);
    toneGain.gain.linearRampToValueAtTime(0, t + 0.3);

    toneOsc.connect(toneGain);
    toneGain.connect(ctx.destination);
    toneOsc.start(t);
    toneOsc.stop(t + 0.3);
};

// [CHANGED] Heavy Bass Drop + High Pitch Ping
export const playAccessCompleted = () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const t = ctx.currentTime;

    // 1. Heavy Bass Drop
    const bassOsc = ctx.createOscillator();
    const bassGain = ctx.createGain();
    
    bassOsc.type = 'sine';
    bassOsc.frequency.setValueAtTime(100, t);
    bassOsc.frequency.exponentialRampToValueAtTime(30, t + 2.0); // Long drop
    
    bassGain.gain.setValueAtTime(0.8, t);
    bassGain.gain.exponentialRampToValueAtTime(0.001, t + 2.0);

    bassOsc.connect(bassGain);
    bassGain.connect(ctx.destination);
    bassOsc.start(t);
    bassOsc.stop(t + 2.0);

    // 2. High Pitch Ping
    const pingOsc = ctx.createOscillator();
    const pingGain = ctx.createGain();

    pingOsc.type = 'sine';
    pingOsc.frequency.setValueAtTime(2000, t);
    
    pingGain.gain.setValueAtTime(0.3, t);
    pingGain.gain.exponentialRampToValueAtTime(0.001, t + 1.0); // Clear ring

    pingOsc.connect(pingGain);
    pingGain.connect(ctx.destination);
    pingOsc.start(t);
    pingOsc.stop(t + 1.0);
};

// --- LOOP & MEDICAL ---

// [CHANGED] FM Synthesis Data Stream Sound
export const startTransitionLoop = () => {
    if (transitionLoopNodes) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    // FM Synthesis: Modulator -> Carrier Frequency
    const t = ctx.currentTime;

    // Carrier (The sound we hear)
    const carrier = ctx.createOscillator();
    carrier.type = 'square';
    carrier.frequency.value = 110; // Low base pitch

    // Modulator (Controls the carrier pitch rapidly)
    const modulator = ctx.createOscillator();
    modulator.type = 'sawtooth';
    modulator.frequency.value = 15; // 15Hz speed (Data processing speed "dodododo")

    const modGain = ctx.createGain();
    modGain.gain.value = 50; // Depth of modulation

    // Filter to dampen the harsh square wave
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.1, t);

    // Connections
    modulator.connect(modGain);
    modGain.connect(carrier.frequency); // FM Modulation
    carrier.connect(filter);
    filter.connect(masterGain);
    masterGain.connect(ctx.destination);

    carrier.start(t);
    modulator.start(t);

    transitionLoopNodes = {
        stop: () => {
            const stopTime = ctx.currentTime;
            masterGain.gain.linearRampToValueAtTime(0, stopTime + 0.2);
            setTimeout(() => {
                carrier.stop();
                modulator.stop();
                // Disconnect
                carrier.disconnect();
                modulator.disconnect();
                modGain.disconnect();
                filter.disconnect();
                masterGain.disconnect();
            }, 200);
            transitionLoopNodes = null;
        }
    };
};

export const stopTransitionLoop = () => {
    if (transitionLoopNodes) transitionLoopNodes.stop();
};

let monitorNodes: { stop: () => void } | null = null;
export const stopMonitorSound = () => {
    if (monitorNodes) { monitorNodes.stop(); monitorNodes = null; }
};

export const startHeartbeat = () => {
    stopMonitorSound();
    const ctx = getAudioContext();
    if (!ctx) return;

    // Use a filtered pulse for heartbeat, not sine
    const buffer = createPinkNoise(ctx, 0.1);
    
    const beat = () => {
        const t = ctx.currentTime;
        const src = ctx.createBufferSource();
        src.buffer = buffer;
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 150; // Thud
        
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.8, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

        src.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        src.start(t);
    };

    const id = setInterval(beat, 1500);
    monitorNodes = { stop: () => clearInterval(id) };
    beat();
};

export const startFlatline = () => {
    stopMonitorSound();
    const ctx = getAudioContext();
    if (!ctx) return;

    // Constant drone
    const buffer = createPinkNoise(ctx, 5.0);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 800; // Warning tone freq
    filter.Q.value = 20; // High Q makes noise sound like a tone

    const gain = ctx.createGain();
    gain.gain.value = 0.1;

    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    src.start();

    monitorNodes = { 
        stop: () => {
            gain.gain.setTargetAtTime(0, ctx.currentTime, 0.1);
            setTimeout(() => { src.stop(); src.disconnect(); }, 200);
        } 
    };
};

export const playDeathNoise = () => {
    // TV Static
    const ctx = getAudioContext();
    if (!ctx) return;
    const t = ctx.currentTime;

    const buffer = createWhiteNoise(ctx, 0.5);
    const src = ctx.createBufferSource();
    src.buffer = buffer;

    const gain = ctx.createGain();
    gain.gain.value = 0.2;

    src.connect(gain);
    gain.connect(ctx.destination);
    src.start(t);
};


// =========================================================================
// [RE-DESIGNED] ADVANCED HORROR SOUNDSCAPES
// =========================================================================

/**
 * 1. WATCHER PRESENCE (SOMEONE IS WATCHING YOU)
 * Concept: "Geiger Counter" + "Air Pressure Change"
 * Instead of a tone, we create random clicks and a low-frequency rumble that feels like
 * the room is closing in.
 */
export const playWatcherPresence = () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const t = ctx.currentTime;

    // Layer A: The Pressure (Sub-bass rumble)
    const rumbleBuff = createPinkNoise(ctx, 5.0);
    const rumbleSrc = ctx.createBufferSource();
    rumbleSrc.buffer = rumbleBuff;
    
    const rumbleFilter = ctx.createBiquadFilter();
    rumbleFilter.type = 'lowpass';
    rumbleFilter.frequency.value = 60; // Very low
    
    const rumbleGain = ctx.createGain();
    rumbleGain.gain.setValueAtTime(0, t);
    rumbleGain.gain.linearRampToValueAtTime(0.8, t + 2.0); // Slow build up
    rumbleGain.gain.linearRampToValueAtTime(0, t + 6.0);

    rumbleSrc.connect(rumbleFilter);
    rumbleFilter.connect(rumbleGain);
    rumbleGain.connect(ctx.destination);
    rumbleSrc.start(t);

    // Layer B: The Geiger Clicks (Random irregular ticks)
    // Creates a sense of radioactive/paranormal danger
    const clickBuff = createWhiteNoise(ctx, 0.01); // Tiny burst
    
    const playClick = (time: number) => {
        const src = ctx.createBufferSource();
        src.buffer = clickBuff;
        const gain = ctx.createGain();
        gain.gain.value = 0.1 + Math.random() * 0.1;
        src.connect(gain);
        gain.connect(ctx.destination);
        src.start(time);
    };

    // Schedule random clicks over 5 seconds
    for (let i = 0; i < 30; i++) {
        playClick(t + Math.random() * 5.0);
    }
};

/**
 * 2. SYSTEM CORRUPT ALERT
 * Concept: "Karplus-Strong Metallic Impact"
 * Sounds like a piece of metal snapping inside the hard drive.
 * Uses a short delay line to turn a noise burst into a metallic "clank".
 * UPDATED: Volume increased to 0.275, Sustain increased to cover blackout sequence.
 */
export const playSystemCorruptAlert = () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const t = ctx.currentTime;

    // Excitation burst (The "Hit")
    // Increased burst duration for more energy input
    const burst = createWhiteNoise(ctx, 0.05);
    const src = ctx.createBufferSource();
    src.buffer = burst;

    // Highpass to sharpen the attack
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 2000;

    // Karplus-Strong Delay Line (The "Metal String")
    const delay = ctx.createDelay();
    delay.delayTime.value = 0.005; // 1/0.005 = 200Hz fundamental tone (Metallic)

    // Feedback (Resonance)
    const feedback = ctx.createGain();
    // Increased feedback to sustain the ring for ~3 seconds
    feedback.gain.value = 0.99; 

    // Dampening (Material simulation)
    const dampening = ctx.createBiquadFilter();
    dampening.type = 'lowpass';
    dampening.frequency.value = 3000;

    // Connections: Source -> HP -> Delay -> Dampening -> Feedback -> Delay
    src.connect(hp);
    hp.connect(delay);
    delay.connect(dampening);
    dampening.connect(feedback);
    feedback.connect(delay); // Loop

    // Output
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.1, t); // CHANGED: Volume set to 0.1
    // Long decay to ensure sound persists until screen goes black (approx 2s later)
    masterGain.gain.exponentialRampToValueAtTime(0.001, t + 3.5);

    delay.connect(masterGain);
    masterGain.connect(ctx.destination);

    src.start(t);
};

/**
 * 3. TERMINATION PHASE 1: TURN AROUND
 * Concept: "The Glitch Stutter"
 * Sounds like the audio buffer itself is getting stuck/corrupted.
 * Rapid-fire repetition of a gritty texture.
 */
export const playTerminationWhisper = () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const t = ctx.currentTime;

    const buffer = createPinkNoise(ctx, 0.05); // Short segment
    
    // Play the same short segment repeatedly to mimic a computer freeze
    const startTime = t;
    const repeatCount = 12;
    const interval = 0.04; // 40ms interval

    for (let i = 0; i < repeatCount; i++) {
        const src = ctx.createBufferSource();
        src.buffer = buffer;
        
        // Vary the pitch slightly to sound organic/broken
        src.playbackRate.value = 0.8 + Math.random() * 0.4;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.2, startTime + i * interval);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + i * interval + 0.04);

        // Lowpass to make it sound muffled/behind
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 600;

        src.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        src.start(startTime + i * interval);
    }
};

/**
 * 4. TERMINATION PHASE 2: DO NOT TURN AROUND
 * REQUEST: Silence.
 */
export const playTerminationScream = () => {
    // Muted as per request.
};

export const playSirenSound = () => {}; // Deprecated
