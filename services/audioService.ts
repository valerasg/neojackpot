/**
 * audioService.ts
 * Cyberpunk-style procedural audio via the Web Audio API.
 * Design goals: sub bass, distortion, detuned oscillators, dark minor tonality,
 * LFO modulation, glitchy transients — NOT arcade / cheerful.
 */

class AudioService {
    private ctx: AudioContext | null = null;

    private getCtx(): AudioContext {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') this.ctx.resume();
        return this.ctx;
    }

    /** Hard-clip distortion curve (amount: 0-400) */
    private makeDistortion(ctx: AudioContext, amount: number): WaveShaperNode {
        const shaper = ctx.createWaveShaper();
        const n = 256;
        const curve = new Float32Array(n);
        const k = amount;
        for (let i = 0; i < n; i++) {
            const x = (i * 2) / n - 1;
            curve[i] = ((Math.PI + k) * x) / (Math.PI + k * Math.abs(x));
        }
        shaper.curve = curve;
        shaper.oversample = '4x';
        return shaper;
    }

    /** Detuned dual-oscillator — classic synth thickness */
    private dualOsc(
        ctx: AudioContext,
        type: OscillatorType,
        freq: number,
        detuneCents: number,
        startTime: number,
        stopTime: number
    ): [OscillatorNode, OscillatorNode] {
        const o1 = ctx.createOscillator();
        const o2 = ctx.createOscillator();
        o1.type = type; o1.frequency.value = freq; o1.detune.value = -detuneCents / 2;
        o2.type = type; o2.frequency.value = freq; o2.detune.value = +detuneCents / 2;
        o1.start(startTime); o1.stop(stopTime);
        o2.start(startTime); o2.stop(stopTime);
        return [o1, o2];
    }

    /** Quick glitch tick — UI feedback */
    playButtonClick() {
        const ctx = this.getCtx();
        const now = ctx.currentTime;

        // Noise transient
        const bufSize = Math.floor(ctx.sampleRate * 0.025);
        const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) d[i] = Math.random() * 2 - 1;
        const src = ctx.createBufferSource();
        src.buffer = buf;

        const filt = ctx.createBiquadFilter();
        filt.type = 'bandpass';
        filt.frequency.value = 3200;
        filt.Q.value = 8;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

        src.connect(filt); filt.connect(gain); gain.connect(ctx.destination);
        src.start(now); src.stop(now + 0.025);

        // Glitch tone
        const osc = ctx.createOscillator();
        const og = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(1800, now);
        osc.frequency.linearRampToValueAtTime(900, now + 0.02);
        og.gain.setValueAtTime(0.1, now);
        og.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
        osc.connect(og); og.connect(ctx.destination);
        osc.start(now); osc.stop(now + 0.02);
    }

    /** Deep industrial spin-up — sub rumble + LFO-modulated noise */
    playSpinStart() {
        const ctx = this.getCtx();
        const now = ctx.currentTime;
        const duration = 0.6;

        // --- Sub bass thump ---
        const sub = ctx.createOscillator();
        const subGain = ctx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(55, now);
        sub.frequency.exponentialRampToValueAtTime(30, now + 0.15);
        subGain.gain.setValueAtTime(0.7, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        sub.connect(subGain); subGain.connect(ctx.destination);
        sub.start(now); sub.stop(now + 0.2);

        // --- Gritty rising saw (detuned pair) ---
        const [o1, o2] = this.dualOsc(ctx, 'sawtooth', 60, 20, now, now + duration);
        const sawFilter = ctx.createBiquadFilter();
        sawFilter.type = 'lowpass';
        sawFilter.frequency.setValueAtTime(200, now);
        sawFilter.frequency.exponentialRampToValueAtTime(2400, now + duration);
        sawFilter.Q.value = 6;

        const dist = this.makeDistortion(ctx, 180);
        const sawGain = ctx.createGain();
        sawGain.gain.setValueAtTime(0.0, now);
        sawGain.gain.linearRampToValueAtTime(0.3, now + 0.05);
        sawGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        for (const o of [o1, o2]) { o.connect(sawFilter); }
        sawFilter.connect(dist); dist.connect(sawGain); sawGain.connect(ctx.destination);

        // --- LFO-modulated noise sweep ---
        const nBufSize = Math.floor(ctx.sampleRate * duration);
        const nBuf = ctx.createBuffer(1, nBufSize, ctx.sampleRate);
        const nData = nBuf.getChannelData(0);
        for (let i = 0; i < nBufSize; i++) nData[i] = Math.random() * 2 - 1;
        const nSrc = ctx.createBufferSource();
        nSrc.buffer = nBuf;

        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.value = 18;
        lfoGain.gain.value = 1200;
        const nFilter = ctx.createBiquadFilter();
        nFilter.type = 'bandpass';
        nFilter.frequency.value = 800;
        nFilter.Q.value = 2;
        lfo.connect(lfoGain); lfoGain.connect(nFilter.frequency);

        const nGain = ctx.createGain();
        nGain.gain.setValueAtTime(0.08, now);
        nGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        nSrc.connect(nFilter); nFilter.connect(nGain); nGain.connect(ctx.destination);
        lfo.start(now); lfo.stop(now + duration);
        nSrc.start(now); nSrc.stop(now + duration);
    }

    /** Heavy industrial clank — each reel locking in */
    playReelStop() {
        const ctx = this.getCtx();
        const now = ctx.currentTime;

        // Sub impact
        const sub = ctx.createOscillator();
        const subG = ctx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(90, now);
        sub.frequency.exponentialRampToValueAtTime(40, now + 0.08);
        subG.gain.setValueAtTime(0.55, now);
        subG.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
        sub.connect(subG); subG.connect(ctx.destination);
        sub.start(now); sub.stop(now + 0.09);

        // Metallic ring (detuned high oscs with distortion)
        const [r1, r2] = this.dualOsc(ctx, 'square', 440, 30, now, now + 0.12);
        const rFilt = ctx.createBiquadFilter();
        rFilt.type = 'bandpass';
        rFilt.frequency.value = 1600;
        rFilt.Q.value = 12;
        const rDist = this.makeDistortion(ctx, 120);
        const rGain = ctx.createGain();
        rGain.gain.setValueAtTime(0.18, now);
        rGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        for (const o of [r1, r2]) { o.connect(rFilt); }
        rFilt.connect(rDist); rDist.connect(rGain); rGain.connect(ctx.destination);

        // Short noise crack
        const cBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.03), ctx.sampleRate);
        const cD = cBuf.getChannelData(0);
        for (let i = 0; i < cD.length; i++) cD[i] = Math.random() * 2 - 1;
        const cSrc = ctx.createBufferSource(); cSrc.buffer = cBuf;
        const cGain = ctx.createGain();
        cGain.gain.setValueAtTime(0.2, now);
        cGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
        cSrc.connect(cGain); cGain.connect(ctx.destination);
        cSrc.start(now); cSrc.stop(now + 0.03);
    }

    /** Dark Phrygian arpeggio — minor, tense win */
    playWin(amount: number = 0) {
        const ctx = this.getCtx();
        const now = ctx.currentTime;

        // Phrygian-flavoured minor: root, b2, b3, 5th — tense & dark
        const pitchBoost = Math.min(1.4, 1 + amount / 1000);
        const base = 110 * pitchBoost;
        const steps = [1, 1.067, 1.189, 1.5]; // root, ♭2, ♭3, 5th

        steps.forEach((r, i) => {
            const t = now + i * 0.1;
            const [o1, o2] = this.dualOsc(ctx, 'sawtooth', base * r, 12, t, t + 0.3);

            const filt = ctx.createBiquadFilter();
            filt.type = 'lowpass';
            filt.frequency.setValueAtTime(800, t);
            filt.frequency.exponentialRampToValueAtTime(2800, t + 0.15);
            filt.Q.value = 4;

            const dist = this.makeDistortion(ctx, 80);
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.22, t + 0.015);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

            for (const o of [o1, o2]) { o.connect(filt); }
            filt.connect(dist); dist.connect(gain); gain.connect(ctx.destination);
        });
    }

    /** Industrial dark fanfare — big win */
    playBigWin() {
        const ctx = this.getCtx();
        const now = ctx.currentTime;

        // Dark minor melody (Am pentatonic flavour with tritone)
        const melody = [110, 130.8, 146.8, 110, 164.8, 196, 220, 311.1];
        const times = [0, 0.1, 0.22, 0.35, 0.46, 0.58, 0.72, 0.88];

        melody.forEach((freq, i) => {
            const t = now + times[i];
            const [o1, o2] = this.dualOsc(ctx, 'sawtooth', freq, 18, t, t + 0.35);

            const filt = ctx.createBiquadFilter();
            filt.type = 'lowpass';
            filt.frequency.setValueAtTime(500 + i * 100, t);
            filt.frequency.exponentialRampToValueAtTime(3000, t + 0.2);
            filt.Q.value = 5;

            const dist = this.makeDistortion(ctx, 200);
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.2, t + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

            for (const o of [o1, o2]) { o.connect(filt); }
            filt.connect(dist); dist.connect(gain); gain.connect(ctx.destination);

            // Sub bass on first 4 notes
            if (i < 4) {
                const bass = ctx.createOscillator();
                const bassGain = ctx.createGain();
                bass.type = 'sine';
                bass.frequency.value = freq / 2;
                bassGain.gain.setValueAtTime(0.35, t);
                bassGain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
                bass.connect(bassGain); bassGain.connect(ctx.destination);
                bass.start(t); bass.stop(t + 0.28);
            }
        });

        // Glitchy stutter burst at the end
        const stutterStart = now + 1.0;
        for (let s = 0; s < 6; s++) {
            const st = stutterStart + s * 0.04;
            const bSize = Math.floor(ctx.sampleRate * 0.025);
            const b = ctx.createBuffer(1, bSize, ctx.sampleRate);
            const bd = b.getChannelData(0);
            for (let j = 0; j < bSize; j++) bd[j] = Math.random() * 2 - 1;
            const bSrc = ctx.createBufferSource(); bSrc.buffer = b;
            const bFilt = ctx.createBiquadFilter(); bFilt.type = 'highpass'; bFilt.frequency.value = 5000;
            const bGain = ctx.createGain();
            bGain.gain.setValueAtTime(0.15, st);
            bGain.gain.exponentialRampToValueAtTime(0.001, st + 0.025);
            bSrc.connect(bFilt); bFilt.connect(bGain); bGain.connect(ctx.destination);
            bSrc.start(st); bSrc.stop(st + 0.025);
        }
    }

    /** Descending tritone drop — loss / access denied */
    playLose() {
        const ctx = this.getCtx();
        const now = ctx.currentTime;

        // Tritone — the "devil's interval", very cyberpunk
        const freqs = [220, 155.6]; // A3 → Eb3 (tritone)
        freqs.forEach((freq, i) => {
            const t = now + i * 0.12;
            const [o1, o2] = this.dualOsc(ctx, 'sawtooth', freq, 15, t, t + 0.22);

            const filt = ctx.createBiquadFilter();
            filt.type = 'lowpass';
            filt.frequency.setValueAtTime(1200, t);
            filt.frequency.exponentialRampToValueAtTime(300, t + 0.22);
            filt.Q.value = 3;

            const dist = this.makeDistortion(ctx, 150);
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.25, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.24);

            for (const o of [o1, o2]) { o.connect(filt); }
            filt.connect(dist); dist.connect(gain); gain.connect(ctx.destination);
        });

        // Sub groan
        const sub = ctx.createOscillator();
        const subG = ctx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(70, now);
        sub.frequency.exponentialRampToValueAtTime(40, now + 0.35);
        subG.gain.setValueAtTime(0.3, now);
        subG.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        sub.connect(subG); subG.connect(ctx.destination);
        sub.start(now); sub.stop(now + 0.35);
    }
}

const audioService = new AudioService();
export default audioService;
