import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import AdminPanel from './AdminPanel';
import { GameSettings, GameStats, SpinHistoryItem } from '../types';

const baseSettings: GameSettings = { winChance: 1, maxWinCap: 5000 };
const baseStats: GameStats = { totalSpins: 0, totalWagered: 0, totalWon: 0, rtp: 95 };

const renderPanel = (overrides: Partial<{
  isOpen: boolean;
  settings: GameSettings;
  onClose: ReturnType<typeof vi.fn>;
  onUpdateSettings: ReturnType<typeof vi.fn>;
  onClearHistory: ReturnType<typeof vi.fn>;
  history: SpinHistoryItem[];
  stats: GameStats;
}> = {}) => {
  const props = {
    isOpen: true,
    onClose: vi.fn(),
    settings: baseSettings,
    onUpdateSettings: vi.fn(),
    history: [] as SpinHistoryItem[],
    stats: baseStats,
    onClearHistory: vi.fn(),
    ...overrides,
  };
  const result = render(
    <AdminPanel {...props} />
  );
  return { ...result, ...props };
};

describe('AdminPanel', () => {
  it('is not rendered when closed', () => {
    renderPanel({ isOpen: false });
    expect(screen.queryByText(/SYSTEM_ADMIN_CONSOLE/i)).toBeNull();
  });

  it('renders tabs and allows clearing history', async () => {
    const { onClearHistory } = renderPanel();

    expect(screen.getByText(/SYSTEM_ADMIN_CONSOLE/i)).toBeInTheDocument();
    const logsTab = screen.getByText(/LOGS/i);
    await userEvent.click(logsTab);

    expect(screen.getByText(/No data logs found./i)).toBeInTheDocument();

    const clearBtn = screen.getByText(/Clear Logs/i);
    await userEvent.click(clearBtn);
    expect(onClearHistory).toHaveBeenCalled();
  });

  it('calls onUpdateSettings when APPLY CHANGES is clicked', async () => {
    const { onUpdateSettings } = renderPanel();

    const saveBtn = screen.getByText(/APPLY CHANGES/i);
    await userEvent.click(saveBtn);

    expect(onUpdateSettings).toHaveBeenCalledWith(baseSettings);
  });

  it('shows save toast notification after saving', async () => {
    renderPanel();

    const saveBtn = screen.getByText(/APPLY CHANGES/i);
    await userEvent.click(saveBtn);

    expect(screen.getByText(/Settings saved successfully/i)).toBeInTheDocument();
  });

  it('closes immediately when there are no unsaved changes', async () => {
    const { onClose } = renderPanel();

    // Click X to close — no changes made, should close directly
    const closeButtons = screen.getAllByRole('button');
    // The X button is in the header
    const closeBtn = closeButtons.find(btn => btn.querySelector('svg.lucide-x'));
    if (closeBtn) await userEvent.click(closeBtn);

    expect(onClose).toHaveBeenCalled();
  });

  it('shows exit confirmation when closing with unsaved changes', async () => {
    renderPanel();

    // Change the max win cap to create unsaved changes
    const maxWinInput = screen.getByDisplayValue('5000');
    await userEvent.clear(maxWinInput);
    await userEvent.type(maxWinInput, '9999');

    // Click X to close
    const closeButtons = screen.getAllByRole('button');
    const closeBtn = closeButtons.find(btn => btn.querySelector('svg.lucide-x'));
    if (closeBtn) await userEvent.click(closeBtn);

    // Should show confirmation dialog instead of closing
    expect(screen.getByText(/Unsaved Changes/i)).toBeInTheDocument();
    expect(screen.getByText(/Discard & Exit/i)).toBeInTheDocument();
    expect(screen.getByText(/Go Back/i)).toBeInTheDocument();
  });

  it('discards changes and closes when confirming exit', async () => {
    const { onClose } = renderPanel();

    // Make a change
    const maxWinInput = screen.getByDisplayValue('5000');
    await userEvent.clear(maxWinInput);
    await userEvent.type(maxWinInput, '9999');

    // Try to close
    const closeButtons = screen.getAllByRole('button');
    const closeBtn = closeButtons.find(btn => btn.querySelector('svg.lucide-x'));
    if (closeBtn) await userEvent.click(closeBtn);

    // Confirm exit
    const discardBtn = screen.getByText(/Discard & Exit/i);
    await userEvent.click(discardBtn);

    expect(onClose).toHaveBeenCalled();
  });

  it('returns to panel when canceling exit', async () => {
    const { onClose } = renderPanel();

    // Make a change
    const maxWinInput = screen.getByDisplayValue('5000');
    await userEvent.clear(maxWinInput);
    await userEvent.type(maxWinInput, '9999');

    // Try to close
    const closeButtons = screen.getAllByRole('button');
    const closeBtn = closeButtons.find(btn => btn.querySelector('svg.lucide-x'));
    if (closeBtn) await userEvent.click(closeBtn);

    // Cancel exit
    const goBackBtn = screen.getByText(/Go Back/i);
    await userEvent.click(goBackBtn);

    // Should still be open, confirmation should be gone
    expect(screen.getByText(/SYSTEM_ADMIN_CONSOLE/i)).toBeInTheDocument();
    expect(screen.queryByText(/Unsaved Changes/i)).toBeNull();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('resets settings to defaults when reset button is clicked', async () => {
    const { onUpdateSettings } = renderPanel({
      settings: { winChance: 3.0, maxWinCap: 9999 }
    });

    // Click the reset button (RotateCcw icon button)
    const resetBtn = screen.getByTitle('Reset to Defaults');
    await userEvent.click(resetBtn);

    expect(onUpdateSettings).toHaveBeenCalledWith({ winChance: 1, maxWinCap: 5000 });
  });

  it('displays history items in the logs tab', async () => {
    const historyItem: SpinHistoryItem = {
      id: 'test-1',
      timestamp: Date.now(),
      bet: 50,
      totalWin: 250,
      result: 'WIN',
    };

    renderPanel({ history: [historyItem] });

    // Switch to logs tab
    const logsTab = screen.getByText(/LOGS/i);
    await userEvent.click(logsTab);

    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('WIN')).toBeInTheDocument();
    expect(screen.getByText('+250')).toBeInTheDocument();
  });

  it('displays stats in the monitor tab', async () => {
    renderPanel({
      stats: { totalSpins: 42, totalWagered: 2100, totalWon: 1800, rtp: 85.71 },
    });

    // Switch to monitor tab
    const monitorTab = screen.getByText(/MONITOR/i);
    await userEvent.click(monitorTab);

    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('85.71%')).toBeInTheDocument();
    expect(screen.getByText('2100')).toBeInTheDocument();
    expect(screen.getByText('1800')).toBeInTheDocument();
  });
});
