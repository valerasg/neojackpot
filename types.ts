
import { LucideIcon } from 'lucide-react';

export enum SymbolId {
  WILD = 'WILD',
  JACKPOT = 'JACKPOT',
  DIAMOND = 'DIAMOND',
  CPU = 'CPU',
  DATABASE = 'DATABASE',
  SHIELD = 'SHIELD',
  TRASH = 'TRASH'
}

export interface SlotSymbol {
  id: SymbolId;
  icon: LucideIcon;
  color: string;
  value: number; // Multiplier base
  name: string;
}

export interface WinLine {
  lineIndex: number;
  symbol: SymbolId;
  count: number;
  amount: number;
  coords: [number, number][]; // [row, col] pairs
}

export interface GameState {
  balance: number;
  bet: number;
  lastWin: number;
  isSpinning: boolean;
  grid: SymbolId[][];
  winLines: WinLine[];
  statusMessage: string;
  aiLog: string | null;
}

export interface SpinHistoryItem {
  id: string;
  timestamp: number;
  bet: number;
  totalWin: number;
  result: 'WIN' | 'LOSS';
}

export interface GameSettings {
  winChance: number; // Multiplier 0.1 to 5.0
  maxWinCap: number;
}

export interface GameStats {
  totalSpins: number;
  totalWagered: number;
  totalWon: number;
  rtp: number;
}
