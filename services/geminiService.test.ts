import { generateWinLog } from './geminiService';
import { vi } from 'vitest';

describe('geminiService.generateWinLog', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns generated log from backend when fetch succeeds', async () => {
    const fake = { ok: true, json: async () => ({ log: 'AI_LOG_OK' }) } as any;
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(fake));

    const res = await generateWinLog(100, 'JACKPOT');
    expect(res).toBe('AI_LOG_OK');
  });

  it('falls back to offline message when backend fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')));
    const res = await generateWinLog(250, 'DIAMOND');
    expect(res).toContain('OFFLINE_MODE');
    expect(res).toContain('250');
  });
});
