
// Web Audio API Utilities for Cyberpunk Sound Effects

// Singleton AudioContext to prevent running out of hardware contexts (limit is usually 6)
let audioCtx: AudioContext | null = null;
let ambienceNodes: { stop: () => void } | null = null;
let transitionLoopNodes: { stop: () => void } | null = null;

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

/**
 * Generates and plays a continuous server room ambience.
 * ONLY Fan Noise (Pink Noise). High-pitched whines and beeps have been removed.
 */
export const startAmbience = () => {
    if (ambienceNodes) return; // Already playing

    const ctx = getAudioContext();
    if (!ctx) return;

    // Safety resume
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});

    const nodes: any[] = [];

    // --- 1. Fan / Airflow (Pink Noise) ---
    // Creates the "Whoosh" of air conditioning and cooling fans
    const bufferSize = ctx.sampleRate * 2; // 2 seconds loop
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Pink noise generation algorithm
    let b0=0, b1=0, b2=0, b3=0, b4=0, b5=0, b6=0;
    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        data[i] *= 0.11; // Compensate for gain
        b6 = white * 0.115926;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    // Lowpass filter to muffle the harshness of digital noise, simulating air duct sound
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.value = 800; 

    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.06; // Slightly increased volume for presence since beeps are gone

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    
    noiseSource.start();
    nodes.push(noiseSource, noiseGain);

    // Store cleanup logic
    ambienceNodes = {
        stop: () => {
            const now = ctx.currentTime;
            // Fade out
            noiseGain.gain.linearRampToValueAtTime(0, now + 0.5);
            
            setTimeout(() => {
                nodes.forEach(node => {
                    try {
                        node.stop ? node.stop() : null;
                        node.disconnect();
                    } catch (e) {}
                });
            }, 500);
            ambienceNodes = null;
        }
    };
};

export const stopAmbience = () => {
    if (ambienceNodes) {
        ambienceNodes.stop();
    }
};

// "Threatening/Dangerous" Error Sound
// Updated: Tries to play '/errorsound.mp3' first. Fallback to Industrial/Buzz if missing.
export const playErrorSound = () => {
    // 1. Try to play the file from the public directory
    const audio = new Audio('/errorsound.mp3');
    audio.volume = 1.0; 
    
    // 2. Handle errors (File not found, autoplay blocked, format issues)
    audio.play().catch(() => {
        const ctx = getAudioContext();
        if (!ctx) return;
        if (ctx.state === 'suspended') ctx.resume().catch(() => {});

        const t = ctx.currentTime;
        // Fallback: Harsh Error
        const osc1 = ctx.createOscillator();
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(110, t); 
        osc1.frequency.linearRampToValueAtTime(50, t + 0.3);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

        osc1.connect(gain);
        gain.connect(ctx.destination);
        osc1.start(t);
        osc1.stop(t + 0.3);
    });
};

export const playAccessDeniedBeep = () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(1200, t); 
    
    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.15);
};

export const playSirenSound = () => {
    // Standard siren implementation kept for emergencies
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'square';
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.linearRampToValueAtTime(1200, now + 0.5);
    osc.frequency.linearRampToValueAtTime(600, now + 1.0);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.linearRampToValueAtTime(0, now + 1.0);
    osc.start();
    osc.stop(now + 1.0);
};

export const playDeathNoise = () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});

    const bufferSize = ctx.sampleRate * 2.0;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 100;
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.5, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 2.0);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
};

// [UPDATED] Secure Terminal Data Tick
// Replaces the "Game-like" random blip with a sterile, high-tech tick.
export const playDataBlip = () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state !== 'running') return; 

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // High frequency sine chirp (Clean, Precise)
    osc.type = 'sine';
    osc.frequency.setValueAtTime(3500, t); 

    // Ultra short, sharp envelope
    gain.gain.setValueAtTime(0.03, t); // Low volume
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.015); // 15ms duration

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.02);
};

// [NEW] Hacking/Breach Data Blip
// More aggressive, variable pitch for "hacking" feel
export const playHackingBlip = () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state !== 'running') return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square'; // Digital/8-bit feel
    // Random frequency range for chaotic data stream
    const freq = 1200 + Math.random() * 800; 
    osc.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(0.04, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.05);
};

// [UPDATED] Access Granted / Security Token Accepted
// Replaces melodic arpeggio with a serious "Permission Granted" swipe.
export const playAccessGranted = () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});

    const t = ctx.currentTime;

    // 1. Digital Swipe Up (Validation)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(2000, t + 0.2); // Fast swipe up

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.1, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.3);

    // 2. Sub-bass Confirmation (Weight)
    const bass = ctx.createOscillator();
    const bassGain = ctx.createGain();
    bass.type = 'triangle';
    bass.frequency.setValueAtTime(150, t);
    bass.frequency.exponentialRampToValueAtTime(50, t + 0.4); // Pitch drop

    bassGain.gain.setValueAtTime(0.4, t);
    bassGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    
    bass.connect(bassGain);
    bassGain.connect(ctx.destination);
    bass.start(t);
    bass.stop(t + 0.4);
};

// [NEW] Transition Matrix Loop
// Plays a continuous data-processing stream sound (FM Synthesis)
export const startTransitionLoop = () => {
    if (transitionLoopNodes) return;
    
    const ctx = getAudioContext();
    if (!ctx) return;
    
    // FM Synthesis: Carrier (Sine) modulated by Modulator (Square)
    // Creates a rapid "Computing / Data Stream" sound
    const carrier = ctx.createOscillator();
    const modulator = ctx.createOscillator();
    const modGain = ctx.createGain();
    const outGain = ctx.createGain();

    carrier.type = 'sine';
    carrier.frequency.value = 600; // Carrier Frequency

    modulator.type = 'square';
    modulator.frequency.value = 16; // 16Hz Data Rate (Chatter speed)

    modGain.gain.value = 300; // Modulation Depth

    modulator.connect(modGain);
    modGain.connect(carrier.frequency);

    // Bandpass filter to make it sound "internal" or "displayed"
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 800;
    filter.Q.value = 1;

    carrier.connect(filter);
    filter.connect(outGain);
    outGain.connect(ctx.destination);

    outGain.gain.value = 0.05; // Background level

    carrier.start();
    modulator.start();

    transitionLoopNodes = {
        stop: () => {
            const now = ctx.currentTime;
            // Quick fade out
            outGain.gain.cancelScheduledValues(now);
            outGain.gain.setValueAtTime(outGain.gain.value, now);
            outGain.gain.linearRampToValueAtTime(0, now + 0.2);
            setTimeout(() => {
                carrier.stop();
                modulator.stop();
                carrier.disconnect();
                modulator.disconnect();
            }, 250);
            transitionLoopNodes = null;
        }
    };
};

export const stopTransitionLoop = () => {
    if (transitionLoopNodes) {
        transitionLoopNodes.stop();
    }
};

// [NEW] Access Completed (Final Unlock)
// Big cinematic impact + confirm tone
export const playAccessCompleted = () => {
    const ctx = getAudioContext();
    if (!ctx) return;

    const t = ctx.currentTime;

    // 1. High Tech "Ping" (Reverb-like tail)
    const ping = ctx.createOscillator();
    const pingGain = ctx.createGain();
    ping.type = 'sine';
    ping.frequency.setValueAtTime(2200, t);
    
    pingGain.gain.setValueAtTime(0.15, t);
    pingGain.gain.exponentialRampToValueAtTime(0.001, t + 1.5); // Long tail
    
    ping.connect(pingGain);
    pingGain.connect(ctx.destination);
    ping.start(t);
    ping.stop(t + 1.5);

    // 2. Heavy Lock Mechanism (Bass Drop)
    const lock = ctx.createOscillator();
    const lockGain = ctx.createGain();
    lock.type = 'sine';
    lock.frequency.setValueAtTime(100, t);
    lock.frequency.exponentialRampToValueAtTime(10, t + 1.0); // Deep drop to sub-bass
    
    lockGain.gain.setValueAtTime(0.6, t);
    lockGain.gain.exponentialRampToValueAtTime(0.001, t + 1.0);

    lock.connect(lockGain);
    lockGain.connect(ctx.destination);
    lock.start(t);
    lock.stop(t + 1.0);
};

// [NEW] Medical Monitor Sounds
let monitorNodes: { stop: () => void } | null = null;

export const stopMonitorSound = () => {
    if (monitorNodes) {
        monitorNodes.stop();
        monitorNodes = null;
    }
};

export const startHeartbeat = () => {
    stopMonitorSound();
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});

    let intervalId: number;

    const playBeep = () => {
        if (ctx.state === 'suspended') return;
        const t = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Medical monitor beep sound
        // Realistic approach: ~900Hz pure sine with clean envelope
        osc.type = 'sine';
        osc.frequency.setValueAtTime(900, t); 
        
        // Realistic Pulse Oximeter Envelope
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.1, t + 0.01); // Sharp attack
        gain.gain.setValueAtTime(0.1, t + 0.08); // Short sustain
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15); // Quick decay

        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(t);
        osc.stop(t + 0.16);
    };

    playBeep();
    // 1.5 seconds interval = 40 BPM (Slow, steady pulse)
    intervalId = window.setInterval(playBeep, 1500); 

    monitorNodes = {
        stop: () => {
            clearInterval(intervalId);
        }
    };
};

export const startFlatline = () => {
    stopMonitorSound();
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Matching frequency for the continuous tone
    osc.type = 'sine';
    osc.frequency.setValueAtTime(900, ctx.currentTime);

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();

    monitorNodes = {
        stop: () => {
            const t = ctx.currentTime;
            gain.gain.cancelScheduledValues(t);
            gain.gain.setTargetAtTime(0, t, 0.1);
            osc.stop(t + 0.2);
            setTimeout(() => {
                osc.disconnect();
                gain.disconnect();
            }, 250);
        }
    };
};
