
import React, { useState, useEffect, useCallback } from 'react';
import { Settings, History, Activity, X, Save, RotateCcw, CheckCircle, AlertTriangle } from 'lucide-react';
import { GameSettings, GameStats, SpinHistoryItem } from '../types';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onUpdateSettings: (settings: GameSettings) => void;
  history: SpinHistoryItem[];
  stats: GameStats;
  onClearHistory: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  history,
  stats,
  onClearHistory
}) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'history' | 'stats'>('settings');
  const [localSettings, setLocalSettings] = useState<GameSettings>(settings);
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Sync local settings when the panel opens with new props
  useEffect(() => {
    if (isOpen) {
      setLocalSettings(settings);
    }
  }, [isOpen, settings]);

  // Check if there are unsaved changes
  const hasUnsavedChanges = useCallback(() => {
    return localSettings.winChance !== settings.winChance ||
           localSettings.maxWinCap !== settings.maxWinCap;
  }, [localSettings, settings]);

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdateSettings(localSettings);
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 2000);
  };

  const handleClose = () => {
    if (hasUnsavedChanges()) {
      setShowExitConfirm(true);
    } else {
      onClose();
    }
  };

  const handleConfirmExit = () => {
    setShowExitConfirm(false);
    setLocalSettings(settings); // revert changes
    onClose();
  };

  const handleCancelExit = () => {
    setShowExitConfirm(false);
  };

  const handleResetSettings = () => {
    const defaults = { winChance: 1, maxWinCap: 5000 };
    setLocalSettings(defaults);
    onUpdateSettings(defaults);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="bg-gray-900 border border-gray-700 w-full max-w-2xl rounded-xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden font-mono text-sm">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-950">
          <h2 className="text-lg font-bold text-gray-200 flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyber-neonPink" /> SYSTEM_ADMIN_CONSOLE
          </h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-800 bg-gray-900">
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-3 flex items-center justify-center gap-2 transition-colors ${activeTab === 'settings' ? 'bg-gray-800 text-cyber-neonCyan border-b-2 border-cyber-neonCyan' : 'text-gray-500 hover:bg-gray-800/50'}`}
          >
            <Settings size={16} /> CONTROLS
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 flex items-center justify-center gap-2 transition-colors ${activeTab === 'history' ? 'bg-gray-800 text-cyber-neonPink border-b-2 border-cyber-neonPink' : 'text-gray-500 hover:bg-gray-800/50'}`}
          >
            <History size={16} /> LOGS
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-3 flex items-center justify-center gap-2 transition-colors ${activeTab === 'stats' ? 'bg-gray-800 text-cyber-neonYellow border-b-2 border-cyber-neonYellow' : 'text-gray-500 hover:bg-gray-800/50'}`}
          >
            <Activity size={16} /> MONITOR
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-gray-900">
          
          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-gray-300 font-bold uppercase">Win Probability Modifier</label>
                  <span className="text-cyber-neonCyan">{localSettings.winChance.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="5.0"
                  step="0.1"
                  value={localSettings.winChance}
                  onChange={(e) => setLocalSettings({ ...localSettings, winChance: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyber-neonCyan"
                />
                <p className="text-xs text-gray-500">
                  <span className="text-red-400">Warning:</span> Adjusting this value overrides standard RNG protocols. 
                  <br/>Values &gt; 1.0 increase likelihood of matching high-value symbols.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-gray-300 font-bold uppercase">Max Win Cap (Credits)</label>
                </div>
                <div className="flex gap-2">
                   <input 
                     type="number" 
                     value={localSettings.maxWinCap}
                     onChange={(e) => setLocalSettings({ ...localSettings, maxWinCap: parseInt(e.target.value) || 0 })}
                     className="w-full bg-gray-800 border border-gray-700 p-2 rounded text-white focus:border-cyber-neonPink focus:outline-none"
                   />
                </div>
                <p className="text-xs text-gray-500">
                  Any spin result exceeding this amount will be forcibly re-rolled.
                </p>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-800">
                <button 
                  onClick={handleSave}
                  className="flex-1 bg-cyber-neonCyan/10 border border-cyber-neonCyan text-cyber-neonCyan py-2 rounded hover:bg-cyber-neonCyan/20 flex items-center justify-center gap-2"
                >
                  <Save size={16} /> APPLY CHANGES
                </button>
                <button 
                  onClick={handleResetSettings}
                  className="px-4 py-2 border border-gray-700 rounded hover:bg-gray-800 text-gray-400"
                  title="Reset to Defaults"
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>
          )}

          {/* HISTORY TAB */}
          {activeTab === 'history' && (
            <div className="space-y-4">
               <div className="flex justify-between items-center mb-2">
                  <h3 className="text-gray-400 text-xs uppercase tracking-widest">Recent Transactions</h3>
                  <button onClick={onClearHistory} className="text-xs text-red-500 hover:text-red-400 underline">Clear Logs</button>
               </div>
               
               <div className="overflow-hidden rounded border border-gray-800">
                 <table className="w-full text-left">
                   <thead className="bg-gray-800 text-gray-400 text-xs uppercase">
                     <tr>
                       <th className="p-3">Time</th>
                       <th className="p-3">Bet</th>
                       <th className="p-3">Outcome</th>
                       <th className="p-3 text-right">Net</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-800 text-xs">
                     {history.length === 0 ? (
                       <tr>
                         <td colSpan={4} className="p-8 text-center text-gray-600 italic">No data logs found.</td>
                       </tr>
                     ) : (
                       history.map((item) => (
                         <tr key={item.id} className="hover:bg-gray-800/50 transition-colors">
                           <td className="p-3 text-gray-500">{new Date(item.timestamp).toLocaleTimeString()}</td>
                           <td className="p-3 text-gray-300">{item.bet}</td>
                           <td className={`p-3 font-bold ${item.result === 'WIN' ? 'text-cyber-neonGreen' : 'text-gray-500'}`}>
                             {item.result}
                           </td>
                           <td className={`p-3 text-right font-mono ${item.totalWin > 0 ? 'text-cyber-neonGreen' : 'text-red-500'}`}>
                             {item.totalWin > 0 ? `+${item.totalWin}` : `-${item.bet}`}
                           </td>
                         </tr>
                       ))
                     )}
                   </tbody>
                 </table>
               </div>
            </div>
          )}

          {/* STATS TAB */}
          {activeTab === 'stats' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800/50 p-4 rounded border border-gray-700">
                 <span className="text-xs text-gray-500 uppercase block mb-1">Total Spins</span>
                 <span className="text-2xl text-white font-mono">{stats.totalSpins}</span>
              </div>
              <div className="bg-gray-800/50 p-4 rounded border border-gray-700">
                 <span className="text-xs text-gray-500 uppercase block mb-1">RTP (Return to Player)</span>
                 <span className={`text-2xl font-mono ${stats.rtp > 100 ? 'text-cyber-neonGreen' : stats.rtp < 90 ? 'text-red-400' : 'text-yellow-400'}`}>
                   {stats.rtp.toFixed(2)}%
                 </span>
              </div>
              <div className="bg-gray-800/50 p-4 rounded border border-gray-700">
                 <span className="text-xs text-gray-500 uppercase block mb-1">Total Wagered</span>
                 <span className="text-xl text-gray-300 font-mono">{stats.totalWagered}</span>
              </div>
              <div className="bg-gray-800/50 p-4 rounded border border-gray-700">
                 <span className="text-xs text-gray-500 uppercase block mb-1">Total Payout</span>
                 <span className="text-xl text-cyber-neonGreen font-mono">{stats.totalWon}</span>
              </div>
              
              <div className="md:col-span-2 bg-black/30 p-4 rounded border border-gray-800 mt-4">
                 <h4 className="text-xs text-gray-500 uppercase mb-2">Net Profit/Loss</h4>
                 <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden relative">
                    <div 
                      className={`h-full absolute top-0 left-0 transition-all duration-500 ${stats.totalWon >= stats.totalWagered ? 'bg-cyber-neonGreen' : 'bg-red-500'}`}
                      style={{ width: `${Math.min(100, (stats.totalWon / (stats.totalWagered || 1)) * 100)}%` }}
                    />
                 </div>
                 <div className="flex justify-between text-xs mt-2 text-gray-400 font-mono">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100% (Break Even)</span>
                    <span>+</span>
                 </div>
              </div>
            </div>
          )}

        </div>

        {/* Save Toast Notification */}
        {showSaveToast && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-cyber-neonGreen/10 border border-cyber-neonGreen text-cyber-neonGreen px-4 py-2 rounded-lg flex items-center gap-2 animate-pulse shadow-lg shadow-cyber-neonGreen/20">
            <CheckCircle size={16} />
            <span className="text-sm font-bold uppercase tracking-wider">Settings saved successfully</span>
          </div>
        )}
      </div>

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-sm w-full shadow-2xl font-mono text-sm space-y-4">
            <div className="flex items-center gap-2 text-yellow-400">
              <AlertTriangle size={20} />
              <h3 className="text-base font-bold uppercase">Unsaved Changes</h3>
            </div>
            <p className="text-gray-400 text-xs">
              You have unsaved modifications to the system parameters. Exiting now will discard all changes.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleConfirmExit}
                className="flex-1 bg-red-500/10 border border-red-500 text-red-400 py-2 rounded hover:bg-red-500/20 font-bold uppercase text-xs"
              >
                Discard & Exit
              </button>
              <button
                onClick={handleCancelExit}
                className="flex-1 bg-gray-800 border border-gray-600 text-gray-300 py-2 rounded hover:bg-gray-700 font-bold uppercase text-xs"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
