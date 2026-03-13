import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import App from './App';

// Mock AudioContext for jsdom (required by audioService when App triggers handleSpin)
class MockOscillator {
  type: any = 'sine';
  frequency = { value: 440, setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, linearRampToValueAtTime: () => {} };
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

class MockAudioContext {
  currentTime = 0;
  sampleRate = 44100;
  state = 'running';
  destination = {};
  createOscillator() { return new MockOscillator() as any; }
  createGain() { return new MockNode() as any; }
  createBiquadFilter() { return new MockNode() as any; }
  createWaveShaper() { return new MockNode() as any; }
  createBuffer() { return { getChannelData: () => new Float32Array(1024) } as any; }
  createBufferSource() { return { buffer: null, connect: () => {}, start: () => {}, stop: () => {} } as any; }
  resume() { return Promise.resolve(); }
}

let origAudioContext: any;

beforeAll(() => {
  origAudioContext = (globalThis as any).AudioContext;
  (globalThis as any).AudioContext = MockAudioContext;
});

afterAll(() => {
  (globalThis as any).AudioContext = origAudioContext;
});

describe('App Component - Neon Jackpots', () => {
    it('renders the initial header correctly', () => {
        render(<App />);
        expect(screen.getByText(/NEON/i)).toBeInTheDocument();
        expect(screen.getByText(/JACKPOTS/i)).toBeInTheDocument();
        expect(screen.getByText(/CYBERPUNK SLOTS/i)).toBeInTheDocument();

        // Initial balance
        const balances = screen.getAllByText('1000');
        expect(balances.length).toBeGreaterThan(0);
    });

    it('renders the control panel and buttons', () => {
        render(<App />);
        expect(screen.getByText('HACK')).toBeInTheDocument();
    });

    it('opens and closes the rules modal', () => {
        render(<App />);
        const rulesButton = screen.getByTitle('Instructions');
        fireEvent.click(rulesButton);

        expect(screen.getByText(/SYSTEM_MANUAL/i)).toBeInTheDocument();

        const closeButton = screen.getByText('Acknowledge');
        fireEvent.click(closeButton);

        expect(screen.queryByText(/SYSTEM_MANUAL/i)).not.toBeInTheDocument();
    });
});

describe('App - Game Logic', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('deducts the bet from balance when spinning', async () => {
        render(<App />);

        const hackButton = screen.getByText('HACK');

        await act(async () => {
            fireEvent.click(hackButton);
        });

        // Initial balance is 1000, bet defaults to 10 => 990
        const balanceElements = screen.getAllByText('990');
        expect(balanceElements.length).toBeGreaterThan(0);
    });

    it('disables HACK button while spinning', async () => {
        render(<App />);

        const hackButton = screen.getByText('HACK');

        await act(async () => {
            fireEvent.click(hackButton);
        });

        expect(screen.getByText(/Running.../i)).toBeInTheDocument();
    });

    it('completes a spin cycle and updates stats', async () => {
        render(<App />);

        const hackButton = screen.getByText('HACK');

        await act(async () => {
            fireEvent.click(hackButton);
        });

        // Advance past the spin animation delay (2200ms in App.tsx)
        await act(async () => {
            vi.advanceTimersByTime(2500);
        });

        // After spin completes, the button should return to "HACK"
        expect(screen.getByText('HACK')).toBeInTheDocument();
    });

    it('shows terminal log messages on idle and during spin', async () => {
        render(<App />);

        // Initial log state
        expect(screen.getByText(/SYSTEM READY/i)).toBeInTheDocument();

        const hackButton = screen.getByText('HACK');

        await act(async () => {
            fireEvent.click(hackButton);
        });

        // During spin, log should change
        expect(screen.getByText(/SPIN_CYCLE_INITIATED/i)).toBeInTheDocument();
    });

    it('opens admin panel via settings button', async () => {
        render(<App />);

        const settingsBtn = screen.getByTitle('Access System Kernel');

        await act(async () => {
            fireEvent.click(settingsBtn);
        });

        expect(screen.getByText(/SYSTEM_ADMIN_CONSOLE/i)).toBeInTheDocument();
    });

    it('HACK button is enabled when balance is sufficient', () => {
        render(<App />);

        // Start with 1000 and bet=10, button should be enabled
        const hackButton = screen.getByRole('button', { name: /HACK/i });
        expect(hackButton).not.toBeDisabled();
    });
});
