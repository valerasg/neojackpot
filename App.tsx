
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Terminal, Wallet, Zap, Settings as SettingsIcon } from 'lucide-react';
import Reel from './components/Reel';
import ControlPanel from './components/ControlPanel';
import InstructionsModal from './components/InstructionsModal';
import AdminPanel from './components/AdminPanel';
import { generateWinLog } from './services/geminiService';
import { 
  GRID_SIZE, 
  DEFAULT_BALANCE, 
  MIN_BET, 
  SYMBOLS, 
  SYMBOL_WEIGHTS, 
  TOTAL_WEIGHT, 
  PAYLINES 
} from './constants';
import { SymbolId, WinLine, GameSettings, SpinHistoryItem, GameStats } from './types';

// Helper to get weighted random
const getWeightedRandom = (weights: {id: SymbolId, weight: number}[], totalWeight: number): SymbolId => {
  const rand = Math.random() * totalWeight;
  let sum = 0;
  for (const s of weights) {
    sum += s.weight;
    if (rand <= sum) {
      return s.id;
    }
  }
  return SymbolId.TRASH;
};

const App: React.FC = () => {
  // State
  const [balance, setBalance] = useState(DEFAULT_BALANCE);
  const [bet, setBet] = useState(MIN_BET);
  
  // Settings & Admin
  const [showAdmin, setShowAdmin] = useState(false);
  const [settings, setSettings] = useState<GameSettings>({
    winChance: 1.0, // Default 1.0 (Normal)
    maxWinCap: 5000 // Default cap
  });
  
  // History & Stats
  const [history, setHistory] = useState<SpinHistoryItem[]>([]);
  const [stats, setStats] = useState<GameStats>({
    totalSpins: 0,
    totalWagered: 0,
    totalWon: 0,
    rtp: 0
  });

  // Initial Grid Generation needs to use default weights initially, or we define it in a useEffect?
  // To keep hydration happy, we'll just use standard generation for the very first render.
  const generateGrid = useCallback((customSettings?: GameSettings): SymbolId[][] => {
     const currentSettings = customSettings || settings;
     
     // Adjust weights based on winChance
     // If winChance > 1, increase weights of good symbols (everything except TRASH/SHIELD)
     // If winChance < 1, decrease weights of good symbols
     let activeWeights = [...SYMBOL_WEIGHTS];
     
     if (currentSettings.winChance !== 1.0) {
        activeWeights = activeWeights.map(s => {
           if (s.id === SymbolId.TRASH || s.id === SymbolId.SHIELD) {
              // Decrease bad symbols if chance is high, Increase if chance is low
              // Actually, easier to just Scale Good symbols.
              return s;
           }
           return { ...s, weight: s.weight * currentSettings.winChance };
        });
     }
     
     const activeTotalWeight = activeWeights.reduce((acc, s) => acc + s.weight, 0);

     const grid: SymbolId[][] = [];
     for (let r = 0; r < GRID_SIZE; r++) {
       const row: SymbolId[] = [];
       for (let c = 0; c < GRID_SIZE; c++) {
         row.push(getWeightedRandom(activeWeights, activeTotalWeight));
       }
       grid.push(row);
     }
     return grid;
  }, [settings]);

  const [grid, setGrid] = useState<SymbolId[][]>(() => {
    // Initial grid without modifiers
    const g: SymbolId[][] = [];
    for(let r=0; r<GRID_SIZE; r++) {
      const row: SymbolId[] = [];
      for(let c=0; c<GRID_SIZE; c++) {
        const rand = Math.random() * TOTAL_WEIGHT;
        let sum = 0;
        let selected = SymbolId.TRASH;
        for (const s of SYMBOL_WEIGHTS) {
          sum += s.weight;
          if (rand <= sum) {
            selected = s.id;
            break;
          }
        }
        row.push(selected);
      }
      g.push(row);
    }
    return g;
  });

  const [isSpinning, setIsSpinning] = useState(false);
  const [winLines, setWinLines] = useState<WinLine[]>([]);
  const [lastWinAmount, setLastWinAmount] = useState(0);
  const [aiLog, setAiLog] = useState<string | null>("SYSTEM READY... WAITING FOR INPUT");
  const [showRules, setShowRules] = useState(false);
  const [spinCounter, setSpinCounter] = useState(0);

  // Win Evaluation Logic
  const evaluateGrid = useCallback((currentGrid: SymbolId[][], currentBet: number) => {
    const wins: WinLine[] = [];
    let totalWin = 0;

    PAYLINES.forEach((line, index) => {
      const lineSymbols = line.map(([r, c]) => currentGrid[r][c]);
      const firstNonWild = lineSymbols.find(s => s !== SymbolId.WILD);
      const matchTarget = firstNonWild || SymbolId.JACKPOT;

      let matchCount = 0;
      const winningCoords: [number, number][] = [];

      for (let i = 0; i < lineSymbols.length; i++) {
        if (lineSymbols[i] === matchTarget || lineSymbols[i] === SymbolId.WILD) {
          matchCount++;
          winningCoords.push(line[i]);
        } else {
           break; 
        }
      }

      if (matchCount >= 3) {
        const symbolDef = SYMBOLS[matchTarget];
        let multiplier = symbolDef.value;
        if (matchCount === 4) multiplier *= 2;
        const winAmount = currentBet * multiplier * (matchCount / 4);
        
        totalWin += winAmount;
        wins.push({
          lineIndex: index,
          symbol: matchTarget,
          count: matchCount,
          amount: winAmount,
          coords: winningCoords
        });
      }
    });

    return { wins, totalWin };
  }, []);

  const handleSpin = async () => {
    if (balance < bet || isSpinning) return;

    setBalance(prev => prev - bet);
    setIsSpinning(true);
    setWinLines([]);
    setLastWinAmount(0);
    setAiLog("EXECUTING_PROTOCOL: SPIN_CYCLE_INITIATED...");

    // Generate Result with safeguards
    let nextGrid = generateGrid();
    let result = evaluateGrid(nextGrid, bet);
    let attempts = 0;

    // Max Win Cap Enforcement
    // If win exceeds cap, reroll up to 5 times, then force a losing grid if still too high? 
    // Or just reroll until under cap.
    while (result.totalWin > settings.maxWinCap && attempts < 10) {
       nextGrid = generateGrid();
       result = evaluateGrid(nextGrid, bet);
       attempts++;
    }
    
    // If still over cap after 10 attempts (rare unless cap is tiny), force a dead spin (all trash)
    if (result.totalWin > settings.maxWinCap) {
       nextGrid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(SymbolId.TRASH));
       result = { wins: [], totalWin: 0 };
       setAiLog("SYSTEM ALERT: PAYOUT_LIMIT_EXCEEDED // TRANSACTION_VOIDED");
    }
    
    const finalGrid = nextGrid;
    const { wins, totalWin } = result;

    // Animation delay
    setTimeout(async () => {
      setGrid(finalGrid);
      setIsSpinning(false);
      setSpinCounter(prev => prev + 1);
      
      // Update Stats & History
      const newStats = {
        totalSpins: stats.totalSpins + 1,
        totalWagered: stats.totalWagered + bet,
        totalWon: stats.totalWon + totalWin,
        rtp: 0
      };
      newStats.rtp = (newStats.totalWon / newStats.totalWagered) * 100;
      setStats(newStats);

      const historyItem: SpinHistoryItem = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        bet: bet,
        totalWin: totalWin,
        result: totalWin > 0 ? 'WIN' : 'LOSS'
      };
      setHistory(prev => [historyItem, ...prev].slice(0, 50)); // Keep last 50

      if (totalWin > 0) {
        setBalance(prev => prev + totalWin);
        setLastWinAmount(totalWin);
        setWinLines(wins);
        
        const topSymbol = wins.sort((a,b) => b.amount - a.amount)[0].symbol;
        const topSymbolName = SYMBOLS[topSymbol].name;

        if (totalWin >= bet * 5) {
          setAiLog("ANALYZING BREACH PATTERN...");
          const log = await generateWinLog(totalWin, topSymbolName);
          setAiLog(log);
        } else {
          setAiLog(`SUCCESS: ${totalWin.toFixed(0)} CREDITS EXTRACTED.`);
        }
      } else {
        setAiLog("ACCESS DENIED. RETRY CONNECTION.");
      }

    }, 2200);
  };

  // Check if a cell is highlighted
  const isHighlighted = (row: number, col: number) => {
    if (isSpinning) return false;
    return winLines.some(line => 
      line.coords.some(([r, c]) => r === row && c === col)
    );
  };

  return (
    <div className="min-h-screen bg-cyber-black bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyber-dark via-cyber-black to-black font-sans text-white selection:bg-cyber-neonPink selection:text-white relative">
      
      {/* Grid Background effect */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      
      <main className="relative z-10 container mx-auto px-4 py-8 flex flex-col items-center min-h-screen max-w-4xl">
        
        {/* Header */}
        <header className="w-full flex flex-col md:flex-row items-center justify-between mb-8 border-b border-gray-800 pb-4">
           <div className="flex items-center gap-3 mb-4 md:mb-0">
             <div className="p-2 bg-cyber-neonPink/10 rounded-lg border border-cyber-neonPink shadow-[0_0_15px_rgba(255,0,255,0.3)]">
               <Zap className="text-cyber-neonPink w-8 h-8" />
             </div>
             <div>
               <h1 className="text-3xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                 NEON<span className="text-cyber-neonPink">JACKPOTS</span>
               </h1>
               <p className="text-xs text-cyber-neonCyan tracking-[0.2em] font-mono">CYBERPUNK SLOTS v2.5</p>
             </div>
           </div>
           
           <div className="flex items-center gap-6">
              <div className="hidden md:flex flex-col items-end">
                 <span className="text-[10px] text-gray-500 uppercase tracking-wider">Session ID</span>
                 <span className="text-xs font-mono text-gray-400">0x{Math.random().toString(16).slice(2, 10).toUpperCase()}</span>
              </div>
              <div className="bg-cyber-panel px-4 py-2 rounded border border-gray-700 flex items-center gap-2">
                 <Wallet className="w-4 h-4 text-cyber-neonGreen" />
                 <span className="text-cyber-neonGreen font-bold font-mono">{balance.toFixed(0)}</span>
              </div>
           </div>
        </header>

        {/* Main Game Area */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          
          {/* Left: The Reels */}
          <div className="lg:col-span-8 bg-black/50 p-4 rounded-2xl border border-gray-800 shadow-2xl relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyber-neonPink via-cyber-neonCyan to-cyber-neonPink rounded-2xl opacity-20 blur-lg group-hover:opacity-30 transition duration-1000"></div>
            
            <div className="relative bg-cyber-dark p-4 rounded-xl grid grid-cols-4 gap-2 md:gap-4 overflow-hidden">
               {grid.map((row, rIndex) => (
                 <React.Fragment key={`row-${rIndex}`}>
                   {row.map((symbolId, cIndex) => (
                     <Reel 
                       key={`${rIndex}-${cIndex}`}
                       symbolId={symbolId}
                       isSpinning={isSpinning}
                       spinDelay={1000 + (cIndex * 300)} 
                       onStop={() => {}}
                       highlight={isHighlighted(rIndex, cIndex)}
                     />
                   ))}
                 </React.Fragment>
               ))}
            </div>

            <div className="absolute top-1/2 -left-4 -translate-y-1/2 flex flex-col gap-4 opacity-30 hidden md:flex">
               {[1,2,3,4].map(i => <div key={i} className="w-2 h-2 bg-cyber-neonCyan rounded-full"></div>)}
            </div>
            <div className="absolute top-1/2 -right-4 -translate-y-1/2 flex flex-col gap-4 opacity-30 hidden md:flex">
               {[1,2,3,4].map(i => <div key={i} className="w-2 h-2 bg-cyber-neonCyan rounded-full"></div>)}
            </div>
          </div>

          {/* Right: Info & Log */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            
            {/* Win Display */}
            <div className="bg-cyber-panel border border-gray-800 rounded-xl p-6 text-center relative overflow-hidden min-h-[120px] flex flex-col justify-center">
              {lastWinAmount > 0 ? (
                <div className="animate-in zoom-in duration-300">
                  <h3 className="text-gray-400 text-sm uppercase tracking-widest mb-1">Hack Successful</h3>
                  <div className="text-4xl md:text-5xl font-black text-cyber-neonGreen drop-shadow-[0_0_10px_rgba(57,255,20,0.5)] font-mono">
                    +{lastWinAmount}
                  </div>
                  <div className="text-xs text-cyber-neonGreen/70 mt-2 uppercase animate-pulse">
                    Credits Transferred
                  </div>
                </div>
              ) : (
                <div className="text-gray-600">
                   <h3 className="text-sm uppercase tracking-widest mb-2">Status</h3>
                   <p className="text-xs font-mono">{isSpinning ? "BRUTE FORCING..." : "SYSTEM IDLE"}</p>
                </div>
              )}
            </div>

            {/* Terminal Log */}
            <div className="flex-1 bg-black rounded-xl border border-gray-800 p-4 font-mono text-xs text-green-500 overflow-hidden flex flex-col relative">
               <div className="absolute top-0 left-0 w-full h-6 bg-gray-900 flex items-center px-3 gap-2 border-b border-gray-800">
                 <Terminal size={12} className="text-gray-500" />
                 <span className="text-gray-500 uppercase text-[10px]">SysLog.log</span>
               </div>
               <div className="mt-6 h-full overflow-y-auto space-y-2 opacity-80">
                  <p className="text-gray-500">Loading modules...</p>
                  <p className="text-gray-500">Connecting to mainframe...</p>
                  {spinCounter > 0 && <p className="text-blue-400">>> Spin Cycle #{spinCounter} Complete</p>}
                  {aiLog && (
                    <div className="typing-effect border-l-2 border-cyber-neonPink pl-2 py-1">
                       <span className="text-cyber-neonPink">>> AI_ANALYSIS:</span> {aiLog}
                    </div>
                  )}
               </div>
            </div>

          </div>
        </div>

        {/* Control Panel */}
        <ControlPanel 
          bet={bet}
          setBet={setBet}
          balance={balance}
          isSpinning={isSpinning}
          onSpin={handleSpin}
          onOpenRules={() => setShowRules(true)}
        />

        {/* Footer / Admin Trigger */}
        <footer className="mt-8 w-full flex justify-center">
          <button 
            onClick={() => setShowAdmin(true)}
            className="text-[10px] text-gray-800 hover:text-cyber-neonCyan transition-colors uppercase tracking-widest flex items-center gap-1"
          >
            <SettingsIcon size={10} /> Access System Kernel
          </button>
        </footer>

      </main>

      <InstructionsModal isOpen={showRules} onClose={() => setShowRules(false)} />
      <AdminPanel 
        isOpen={showAdmin} 
        onClose={() => setShowAdmin(false)} 
        settings={settings}
        onUpdateSettings={setSettings}
        history={history}
        stats={stats}
        onClearHistory={() => { setHistory([]); setStats({...stats, totalSpins:0, totalWagered:0, totalWon:0, rtp:0 }); }}
      />
      
    </div>
  );
};

export default App;
