import React from 'react';
import { Play, Minus, Plus, Info } from 'lucide-react';
import { MIN_BET, MAX_BET } from '../constants';

interface ControlPanelProps {
  bet: number;
  setBet: (val: number) => void;
  balance: number;
  isSpinning: boolean;
  onSpin: () => void;
  onOpenRules: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  bet,
  setBet,
  balance,
  isSpinning,
  onSpin,
  onOpenRules
}) => {
  const adjustBet = (amount: number) => {
    if (isSpinning) return;
    const newBet = Math.max(MIN_BET, Math.min(MAX_BET, bet + amount));
    setBet(newBet);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-cyber-panel border border-cyber-dark p-4 rounded-xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden">
      {/* Decorative glow */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyber-neonPink to-transparent opacity-50" />

      <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
        <div className="flex flex-col">
           <span className="text-xs text-gray-500 font-mono uppercase">Current Bet</span>
           <div className="flex items-center gap-2 bg-black/40 p-1 rounded border border-gray-800">
             <button 
               onClick={() => adjustBet(-10)}
               disabled={isSpinning || bet <= MIN_BET}
               className="p-2 hover:bg-cyber-neonPink/20 rounded disabled:opacity-30 transition-colors text-cyber-neonPink"
             >
               <Minus size={16} />
             </button>
             <span className="text-xl font-bold font-mono w-16 text-center text-white">{bet}</span>
             <button 
               onClick={() => adjustBet(10)}
               disabled={isSpinning || bet >= MAX_BET}
               className="p-2 hover:bg-cyber-neonCyan/20 rounded disabled:opacity-30 transition-colors text-cyber-neonCyan"
             >
               <Plus size={16} />
             </button>
           </div>
        </div>

        <div className="flex flex-col text-right md:text-left">
            <span className="text-xs text-gray-500 font-mono uppercase">Credits</span>
            <span className={`text-2xl font-bold font-mono ${balance < bet ? 'text-red-500' : 'text-cyber-neonGreen'}`}>
              {balance.toFixed(0)}
            </span>
        </div>
      </div>

      <div className="flex gap-3 w-full md:w-auto">
        <button
          onClick={onOpenRules}
          className="p-4 rounded-lg border border-gray-700 hover:bg-gray-800 text-gray-400 transition-colors"
          title="Instructions"
        >
          <Info size={24} />
        </button>
        
        <button
          onClick={onSpin}
          disabled={isSpinning || balance < bet}
          className={`
            flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-bold text-lg uppercase tracking-wider transition-all
            ${isSpinning 
              ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700' 
              : 'bg-cyber-neonPink/10 hover:bg-cyber-neonPink/20 text-cyber-neonPink border border-cyber-neonPink box-glow-pink hover:scale-105 active:scale-95'}
          `}
        >
           <Play size={24} fill="currentColor" className={isSpinning ? '' : 'animate-pulse'} />
           {isSpinning ? 'Running...' : 'HACK'}
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;