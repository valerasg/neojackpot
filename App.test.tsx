import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';


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

        // Check if modal title appears
        expect(screen.getByText(/SYSTEM_MANUAL/i)).toBeInTheDocument();

        // Close modal
        const closeButton = screen.getByText('Acknowledge');
        fireEvent.click(closeButton);

        // Wait for it to disappear
        expect(screen.queryByText(/SYSTEM_MANUAL/i)).not.toBeInTheDocument();
    });
});
