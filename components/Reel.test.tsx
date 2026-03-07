import React from 'react';
import { render } from '@testing-library/react';
import { vi } from 'vitest';
import Reel from './Reel';
import { SymbolId } from '../types';

describe('Reel component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('calls onStop with final symbol after spinDelay', () => {
    const onStop = vi.fn();
    render(
      <Reel
        symbolId={SymbolId.JACKPOT}
        isSpinning={true}
        spinDelay={120}
        onStop={onStop}
        highlight={false}
      />
    );

    vi.advanceTimersByTime(200);
    expect(onStop).toHaveBeenCalledWith(SymbolId.JACKPOT);
  });
});
