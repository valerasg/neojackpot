import React, { useEffect, useState } from 'react';
import { SymbolId } from '../types';
import { SYMBOLS, TOTAL_WEIGHT, SYMBOL_WEIGHTS } from '../constants';

interface ReelProps {
  symbolId: SymbolId;
  isSpinning: boolean;
  spinDelay: number; // Delay before this reel stops spinning
  onStop: (finalSymbol: SymbolId) => void;
  highlight: boolean; // If this reel cell is part of a win
}

const Reel: React.FC<ReelProps> = ({ symbolId, isSpinning, spinDelay, onStop, highlight }) => {
  const [displaySymbol, setDisplaySymbol] = useState<SymbolId>(symbolId);
  const [internalSpinning, setInternalSpinning] = useState(false);

  // Helper to get a random symbol based on weights
  const getRandomSymbol = (): SymbolId => {
    const rand = Math.random() * TOTAL_WEIGHT;
    let sum = 0;
    for (const s of SYMBOL_WEIGHTS) {
      sum += s.weight;
      if (rand <= sum) return s.id;
    }
    return SymbolId.TRASH;
  };

  useEffect(() => {
    if (isSpinning) {
      setInternalSpinning(true);
      const interval = setInterval(() => {
        setDisplaySymbol(getRandomSymbol());
      }, 80); // Speed of symbol switching during spin

      // Schedule the stop
      const timeout = setTimeout(() => {
        clearInterval(interval);
        setInternalSpinning(false);
        // The final symbol is determined by the parent passed via props `symbolId`, 
        // but usually slots determine result upfront. 
        // However, for effect, we ensure we land on what the parent said.
        // Wait... Parent determines result `symbolId` BEFORE `isSpinning` becomes false? 
        // Or parent passes the target symbol.
        // In this implementation: Parent generates grid, sets isSpinning=true. 
        // We should wait `spinDelay` then show `symbolId`.

        setDisplaySymbol(symbolId); // Snap to the determined result
        onStop(symbolId);
      }, spinDelay);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    } else {
      // Ensure we are showing the correct static symbol if not spinning
      setDisplaySymbol(symbolId);
      setInternalSpinning(false);
    }
  }, [isSpinning, symbolId, spinDelay, onStop]);

  const SymbolConfig = SYMBOLS[displaySymbol];
  const Icon = SymbolConfig.icon;

  return (
    <div className={`
      relative h-20 w-full md:h-24 bg-cyber-panel border-2 rounded-lg flex items-center justify-center
      transition-all duration-300
      ${highlight ? 'border-cyber-neonGreen box-glow-cyan scale-105 z-10' : 'border-gray-800 opacity-90'}
      ${internalSpinning ? 'blur-[1px]' : ''}
    `}>
      <div className={`flex flex-col items-center transition-transform ${internalSpinning ? 'animate-pulse' : ''}`}>
        <Icon
          className={`w-10 h-10 md:w-12 md:h-12 ${SymbolConfig.color} ${highlight ? 'animate-bounce' : ''}`}
          strokeWidth={highlight ? 2.5 : 1.5}
        />
        {!internalSpinning && (
          <span className="text-[10px] md:text-xs text-gray-500 mt-1 uppercase tracking-widest font-mono">
            {SymbolConfig.name.split(' ')[0]}
          </span>
        )}
      </div>

      {/* Scanline overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-20 pointer-events-none bg-[length:100%_4px,6px_100%] opacity-20"></div>
    </div>
  );
};

export default React.memo(Reel);