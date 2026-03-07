import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import InstructionsModal from './InstructionsModal';

describe('InstructionsModal', () => {
  it('does not render when closed', () => {
    const onClose = vi.fn();
    render(<InstructionsModal isOpen={false} onClose={onClose} />);
    expect(screen.queryByText(/SYSTEM_MANUAL/i)).toBeNull();
  });

  it('renders content and calls onClose when acknowledged', async () => {
    const onClose = vi.fn();
    render(<InstructionsModal isOpen={true} onClose={onClose} />);
    expect(screen.getByText(/SYSTEM_MANUAL/i)).toBeInTheDocument();
    const ackBtn = screen.getByRole('button', { name: /Acknowledge/i });
    await userEvent.click(ackBtn);
    expect(onClose).toHaveBeenCalled();
  });
});
