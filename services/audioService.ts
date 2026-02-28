/**
 * audioService.ts
 * Procedurally generated electronic sounds using the Web Audio API.
 * All sounds are synthesized — no audio files required.
 */

class AudioService {
    private ctx: AudioContext | null = null;

    private getCtx(): AudioContext {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        // Resume if suspended (browsers require user gesture)
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        return this.ctx;
    }

    /** Short UI tick — button press feedback */
    playButtonClick() {
        const ctx = this.getCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.05);

        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.08);
    }

    /** Electronic spin-up buzz — played when HACK is pressed */
    playSpinStart() {
        const ctx = this.getCtx();
        const now = ctx.currentTime;

        // White noise burst
        const bufferSize = ctx.sampleRate * 0.3;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.3;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(400, now);
        noiseFilter.frequency.exponentialRampToValueAtTime(2000, now + 0.3);
        noiseFilter.Q.value = 3;

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.5, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noise.start(now);
        noise.stop(now + 0.3);

        // Rising synth tone
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(80, now);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.25);
        oscGain.gain.setValueAtTime(0.2, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(oscGain);
        oscGain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
    }

    /** Sharp mechanical click — one per reel stopping */
    playReelStop() {
        const ctx = this.getCtx();
        const now = ctx.currentTime;

        // Pitched click
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.06);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.07);

        // Noise transient for texture
        const bufSize = Math.floor(ctx.sampleRate * 0.04);
        const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) d[i] = (Math.random() * 2 - 1);
        const noiseSrc = ctx.createBufferSource();
        noiseSrc.buffer = buf;
        const nGain = ctx.createGain();
        nGain.gain.setValueAtTime(0.15, now);
        nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        noiseSrc.connect(nGain);
        nGain.connect(ctx.destination);
        noiseSrc.start(now);
        noiseSrc.stop(now + 0.04);
    }

    /** Ascending arpeggio — normal win */
    playWin(amount: number = 0) {
        const ctx = this.getCtx();
        const now = ctx.currentTime;

        // Scale pitch slightly with win amount (capped)
        const pitchBoost = Math.min(1.5, 1 + amount / 500);
        const baseFreq = 330 * pitchBoost;

        // Major arpeggio: root, major 3rd, 5th, octave
        const ratios = [1, 1.25, 1.5, 2];
        ratios.forEach((r, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const t = now + i * 0.09;

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(baseFreq * r, t);

            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.25, t + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(t);
            osc.stop(t + 0.25);
        });
    }

    /** Multi-note synth fanfare — jackpot / big win */
    playBigWin() {
        const ctx = this.getCtx();
        const now = ctx.currentTime;

        const melody = [523, 659, 784, 1047, 784, 1047, 1047, 1319];
        const times = [0, 0.1, 0.2, 0.35, 0.5, 0.65, 0.75, 0.85];

        melody.forEach((freq, i) => {
            const t = now + times[i];

            // Lead synth
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.22, t + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(t);
            osc.stop(t + 0.3);

            // Sub bass support on downbeats
            if (i % 2 === 0) {
                const bass = ctx.createOscillator();
                const bassGain = ctx.createGain();
                bass.type = 'sine';
                bass.frequency.setValueAtTime(freq / 2, t);
                bassGain.gain.setValueAtTime(0.18, t);
                bassGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
                bass.connect(bassGain);
                bassGain.connect(ctx.destination);
                bass.start(t);
                bass.stop(t + 0.25);
            }
        });

        // Cymbal shimmer at end
        const shimmerT = now + 0.9;
        const bufSize = Math.floor(ctx.sampleRate * 0.4);
        const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) d[i] = Math.random() * 2 - 1;
        const shimmer = ctx.createBufferSource();
        shimmer.buffer = buf;
        const shimFilter = ctx.createBiquadFilter();
        shimFilter.type = 'highpass';
        shimFilter.frequency.value = 8000;
        const shimGain = ctx.createGain();
        shimGain.gain.setValueAtTime(0.2, shimmerT);
        shimGain.gain.exponentialRampToValueAtTime(0.001, shimmerT + 0.4);
        shimmer.connect(shimFilter);
        shimFilter.connect(shimGain);
        shimGain.connect(ctx.destination);
        shimmer.start(shimmerT);
        shimmer.stop(shimmerT + 0.4);
    }

    /** Short descending blip — loss */
    playLose() {
        const ctx = this.getCtx();
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.18);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
    }
}

// Export a singleton instance
const audioService = new AudioService();
export default audioService;
