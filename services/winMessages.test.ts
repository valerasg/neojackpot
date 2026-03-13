import { describe, it, expect } from 'vitest';
import { getWinMessage } from './winMessages';

describe('winMessages.getWinMessage', () => {
  it('returns a string', () => {
    const result = getWinMessage(500, 'POWER SURGE');
    expect(typeof result).toBe('string');
  });

  it('interpolates the credit amount into the message', () => {
    const result = getWinMessage(1234, 'PROCESSOR');
    expect(result).toContain('1234');
  });

  it('interpolates the symbol name into the message', () => {
    const result = getWinMessage(100, 'ENCRYPTED DATA');
    expect(result).toContain('ENCRYPTED DATA');
  });

  it('returns non-empty messages', () => {
    const result = getWinMessage(50, 'FIREWALL');
    expect(result.length).toBeGreaterThan(10);
  });

  it('can produce different messages across multiple calls (randomness)', () => {
    const results = new Set<string>();
    // Run 50 times — with 15 templates, very high probability of getting at least 2 distinct
    for (let i = 0; i < 50; i++) {
      results.add(getWinMessage(100, 'TEST'));
    }
    expect(results.size).toBeGreaterThan(1);
  });
});
