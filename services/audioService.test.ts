import audioService from './audioService';
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';

// Minimal AudioContext mock to ensure methods run without throwing
class MockOscillator {
  type: any = 'sine';
  frequency = { value: 440, setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, linearRampToValueAtTime: () => {}, };
  detune = { value: 0 } as any;
  start() {}
  stop() {}
  connect() {}
}

class MockNode {
  gain = { value: 0, setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, linearRampToValueAtTime: () => {} };
  frequency = { value: 0, setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, linearRampToValueAtTime: () => {} };
  Q = { value: 0, setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, linearRampToValueAtTime: () => {} };
  connect() {}
}

class MockCtx {
  currentTime = 0;
  sampleRate = 44100;
  state = 'running';
  destination = {};
  createOscillator() { return new MockOscillator() as any; }
  createGain() { return new MockNode() as any; }
  createBiquadFilter() { return new MockNode() as any; }
  createWaveShaper() { return new MockNode() as any; }
  createBuffer() {
    return { getChannelData: () => new Float32Array(1024) } as any;
  }
  createBufferSource() { return { buffer: null, connect: () => {}, start: () => {}, stop: () => {} } as any; }
  resume() { return Promise.resolve(); }
}

describe('audioService', () => {
  let origAudioContext: any;
  beforeAll(() => {
    origAudioContext = (global as any).AudioContext;
    (global as any).AudioContext = MockCtx as any;
  });
  afterAll(() => {
    (global as any).AudioContext = origAudioContext;
  });

  it('exposes audio methods that do not throw', () => {
    expect(() => audioService.playButtonClick()).not.toThrow();
    expect(() => audioService.playSpinStart()).not.toThrow();
    expect(() => audioService.playReelStop()).not.toThrow();
    expect(() => audioService.playWin(50)).not.toThrow();
    expect(() => audioService.playBigWin()).not.toThrow();
    expect(() => audioService.playLose()).not.toThrow();
  });
});
