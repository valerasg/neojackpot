import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import AdminPanel from './AdminPanel';
import { GameSettings, GameStats, SpinHistoryItem } from '../types';

const baseSettings: GameSettings = { winChance: 1, maxWinCap: 5000 };
const baseStats: GameStats = { totalSpins: 0, totalWagered: 0, totalWon: 0, rtp: 95 };

describe('AdminPanel', () => {
  it('is not rendered when closed', () => {
    const onClose = vi.fn();
    const onUpdate = vi.fn();
    const onClear = vi.fn();
    render(
      <AdminPanel isOpen={false} onClose={onClose} settings={baseSettings} onUpdateSettings={onUpdate} history={[]} stats={baseStats} onClearHistory={onClear} />
    );

    expect(screen.queryByText(/SYSTEM_ADMIN_CONSOLE/i)).toBeNull();
  });

  it('renders tabs and allows clearing history', async () => {
    const onClose = vi.fn();
    const onUpdate = vi.fn();
    const onClear = vi.fn();
    render(
      <AdminPanel isOpen={true} onClose={onClose} settings={baseSettings} onUpdateSettings={onUpdate} history={[]} stats={baseStats} onClearHistory={onClear} />
    );

    expect(screen.getByText(/SYSTEM_ADMIN_CONSOLE/i)).toBeInTheDocument();
    const logsTab = screen.getByText(/LOGS/i);
    await userEvent.click(logsTab);

    expect(screen.getByText(/No data logs found./i)).toBeInTheDocument();

    const clearBtn = screen.getByText(/Clear Logs/i);
    await userEvent.click(clearBtn);
    expect(onClear).toHaveBeenCalled();
  });
});
