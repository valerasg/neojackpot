import React from 'react';
import { X, Cpu, Zap, Gem, CircuitBoard, Map } from 'lucide-react';
import { SYMBOLS } from '../constants';

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InstructionsModal: React.FC<InstructionsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-cyber-panel border border-cyber-neonCyan w-full max-w-lg rounded-xl shadow-[0_0_50px_rgba(0,255,255,0.2)] flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-black/40">
          <h2 className="text-xl font-bold text-cyber-neonCyan font-mono flex items-center gap-2">
            <CircuitBoard className="w-5 h-5" /> SYSTEM_MANUAL
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-gray-300">

          <section>
            <h3 className="text-white font-bold mb-2 uppercase text-xs tracking-widest border-l-2 border-cyber-neonPink pl-2">Objective</h3>
            <p>Hack the mainframe by matching symbols across the 4x4 Grid. Paylines run horizontally and diagonally.</p>
          </section>

          <section>
            <h3 className="text-white font-bold mb-3 uppercase text-xs tracking-widest border-l-2 border-cyber-neonPink pl-2">Paytable</h3>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center justify-between bg-black/30 p-2 rounded border border-gray-800">
                <div className="flex items-center gap-3">
                  <SYMBOLS.WILD.icon className="text-cyber-neonPink w-6 h-6" />
                  <span className="font-bold text-white">NEURAL LINK (WILD)</span>
                </div>
                <span className="text-xs text-gray-400">Substitutes all</span>
              </div>
              <div className="flex items-center justify-between bg-black/30 p-2 rounded border border-gray-800">
                <div className="flex items-center gap-3">
                  <SYMBOLS.JACKPOT.icon className="text-cyber-neonYellow w-6 h-6" />
                  <span className="font-bold text-white">POWER SURGE</span>
                </div>
                <span className="text-cyber-neonYellow font-mono">50x</span>
              </div>
              <div className="flex items-center justify-between bg-black/30 p-2 rounded border border-gray-800">
                <div className="flex items-center gap-3">
                  <SYMBOLS.DIAMOND.icon className="text-cyber-neonCyan w-6 h-6" />
                  <span className="font-bold text-white">ENCRYPTED DATA</span>
                </div>
                <span className="text-cyber-neonCyan font-mono">20x</span>
              </div>
              <div className="flex items-center justify-between bg-black/30 p-2 rounded border border-gray-800">
                <div className="flex items-center gap-3">
                  <SYMBOLS.CPU.icon className="text-blue-400 w-6 h-6" />
                  <span className="font-bold text-white">PROCESSOR</span>
                </div>
                <span className="text-blue-400 font-mono">10x</span>
              </div>
              <div className="flex items-center justify-between bg-black/30 p-2 rounded border border-gray-800">
                <div className="flex items-center gap-3">
                  <SYMBOLS.DATABASE.icon className="text-green-400 w-6 h-6" />
                  <span className="font-bold text-white">SERVER NODE</span>
                </div>
                <span className="text-green-400 font-mono">5x</span>
              </div>
              <div className="flex items-center justify-between bg-black/30 p-2 rounded border border-gray-800">
                <div className="flex items-center gap-3">
                  <SYMBOLS.SHIELD.icon className="text-orange-400 w-6 h-6" />
                  <span className="font-bold text-white">FIREWALL</span>
                </div>
                <span className="text-orange-400 font-mono">3x</span>
              </div>
              <div className="flex items-center justify-between bg-black/30 p-2 rounded border border-gray-800">
                <div className="flex items-center gap-3">
                  <SYMBOLS.TRASH.icon className="text-gray-500 w-6 h-6" />
                  <span className="font-bold text-white">CORRUPTION</span>
                </div>
                <span className="text-gray-500 font-mono">1x</span>
              </div>
            </div>
            <p className="text-xs text-cyber-neonPink mt-2 bg-cyber-neonPink/10 p-2 rounded border border-cyber-neonPink/30">
              * Matches require 3+ consecutive symbols starting from the left.
              <br />
              * <strong>4 Matches</strong> doubles the base value! (e.g. 4 Power Surges = 100x)
            </p>
          </section>

          <section>
            <h3 className="text-white font-bold mb-2 uppercase text-xs tracking-widest border-l-2 border-cyber-neonPink pl-2">Paylines</h3>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 border border-gray-600 grid grid-rows-4 gap-[1px] p-[1px]">
                  <div className="bg-cyber-neonCyan h-full w-full"></div>
                  <div className="bg-gray-800 h-full w-full"></div>
                  <div className="bg-gray-800 h-full w-full"></div>
                  <div className="bg-gray-800 h-full w-full"></div>
                </div>
                <span>Rows (x4)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 border border-gray-600 relative bg-gray-900">
                  <div className="absolute inset-0 border-t-2 border-l-2 border-transparent">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-transparent via-cyber-neonCyan to-transparent opacity-50"></div>
                  </div>
                </div>
                <span>Diagonals (x2)</span>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-white font-bold mb-2 uppercase text-xs tracking-widest border-l-2 border-cyber-neonPink pl-2">AI Integration</h3>
            <p className="text-gray-500 text-xs">Big wins trigger the Neural Net (Gemini AI) to generate a unique system breach log.</p>
          </section>
        </div>

        <div className="p-4 border-t border-gray-800 bg-black/40 text-center">
          <button
            onClick={onClose}
            className="bg-cyber-neonCyan/10 hover:bg-cyber-neonCyan/20 text-cyber-neonCyan border border-cyber-neonCyan px-8 py-2 rounded uppercase text-sm font-bold transition-all w-full"
          >
            Acknowledge
          </button>
        </div>

      </div>
    </div>
  );
};

export default InstructionsModal;