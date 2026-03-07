import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import ControlPanel from './ControlPanel';

describe('ControlPanel', () => {
  it('shows Running... when spinning and disables spin button', () => {
    const setBet = vi.fn();
    const onSpin = vi.fn();
    const onOpenRules = vi.fn();

    render(
      <ControlPanel
        bet={50}
        setBet={setBet}
        balance={100}
        isSpinning={true}
        onSpin={onSpin}
        onOpenRules={onOpenRules}
      />
    );

    expect(screen.getByText(/Running.../i)).toBeInTheDocument();
    const spinBtn = screen.getByRole('button', { name: /Running.../i });
    expect(spinBtn).toBeDisabled();
  });

  it('calls onOpenRules when info button clicked', async () => {
    const setBet = vi.fn();
    const onSpin = vi.fn();
    const onOpenRules = vi.fn();
    render(
      <ControlPanel
        bet={10}
        setBet={setBet}
        balance={100}
        isSpinning={false}
        onSpin={onSpin}
        onOpenRules={onOpenRules}
      />
    );

    const infoBtn = screen.getByTitle('Instructions');
    await userEvent.click(infoBtn);
    expect(onOpenRules).toHaveBeenCalled();
  });
});
