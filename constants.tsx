import { 
  Cpu, 
  Database, 
  Gem, 
  ShieldAlert, 
  Skull, 
  Zap, 
  CircuitBoard 
} from 'lucide-react';
import { SlotSymbol, SymbolId } from './types';

export const GRID_SIZE = 4;
export const DEFAULT_BALANCE = 1000;
export const MIN_BET = 10;
export const MAX_BET = 500;

export const SYMBOLS: Record<SymbolId, SlotSymbol> = {
  [SymbolId.WILD]: {
    id: SymbolId.WILD,
    icon: CircuitBoard,
    color: 'text-cyber-neonPink',
    value: 0, // Special handling
    name: 'NEURAL LINK (WILD)'
  },
  [SymbolId.JACKPOT]: {
    id: SymbolId.JACKPOT,
    icon: Zap,
    color: 'text-cyber-neonYellow',
    value: 50,
    name: 'POWER SURGE'
  },
  [SymbolId.DIAMOND]: {
    id: SymbolId.DIAMOND,
    icon: Gem,
    color: 'text-cyber-neonCyan',
    value: 20,
    name: 'ENCRYPTED DATA'
  },
  [SymbolId.CPU]: {
    id: SymbolId.CPU,
    icon: Cpu,
    color: 'text-blue-400',
    value: 10,
    name: 'PROCESSOR'
  },
  [SymbolId.DATABASE]: {
    id: SymbolId.DATABASE,
    icon: Database,
    color: 'text-green-400',
    value: 5,
    name: 'SERVER NODE'
  },
  [SymbolId.SHIELD]: {
    id: SymbolId.SHIELD,
    icon: ShieldAlert,
    color: 'text-orange-400',
    value: 3,
    name: 'FIREWALL'
  },
  [SymbolId.TRASH]: {
    id: SymbolId.TRASH,
    icon: Skull,
    color: 'text-gray-500',
    value: 1,
    name: 'CORRUPTION'
  }
};

// Probability weights for RNG
export const SYMBOL_WEIGHTS: { id: SymbolId; weight: number }[] = [
  { id: SymbolId.WILD, weight: 5 },
  { id: SymbolId.JACKPOT, weight: 10 },
  { id: SymbolId.DIAMOND, weight: 25 },
  { id: SymbolId.CPU, weight: 40 },
  { id: SymbolId.DATABASE, weight: 60 },
  { id: SymbolId.SHIELD, weight: 80 },
  { id: SymbolId.TRASH, weight: 100 },
];

export const TOTAL_WEIGHT = SYMBOL_WEIGHTS.reduce((acc, s) => acc + s.weight, 0);

// Define valid paylines (Rows and Diagonals for a 4x4)
export const PAYLINES: [number, number][][] = [
  // Horizontal Rows
  [[0,0], [0,1], [0,2], [0,3]],
  [[1,0], [1,1], [1,2], [1,3]],
  [[2,0], [2,1], [2,2], [2,3]],
  [[3,0], [3,1], [3,2], [3,3]],
  // Diagonals
  [[0,0], [1,1], [2,2], [3,3]],
  [[3,0], [2,1], [1,2], [0,3]],
];