import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Zap, Globe, Brain, BarChart3, Terminal, LayoutDashboard, HelpCircle 
} from 'lucide-react';
import { cn } from '../lib/utils';
import { MarketingSkill } from '../types';

interface AgentControlsProps {
  selectedSkill: MarketingSkill | null;
  useGrounding: boolean;
  setUseGrounding: (value: boolean) => void;
  setIsBrainOpen: (value: boolean) => void;
  isWorkspaceOpen: boolean;
  setIsWorkspaceOpen: (value: boolean) => void;
  isTerminalOpen: boolean;
  setIsTerminalOpen: (value: boolean) => void;
}

export function AgentControls({
  selectedSkill,
  useGrounding,
  setUseGrounding,
  setIsBrainOpen,
  isWorkspaceOpen,
  setIsWorkspaceOpen,
  isTerminalOpen,
  setIsTerminalOpen
}: AgentControlsProps) {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveTooltip(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="flex items-center justify-between p-4 md:px-8 border-b border-black/5 bg-white/50 backdrop-blur-sm sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-black/40">
            {selectedSkill ? `${selectedSkill.name} Pronto` : 'Sistema Pronto'}
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <div className="relative">
            <div className={cn(
              "flex items-center rounded-lg transition-all shadow-sm",
              useGrounding 
                ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-200" 
                : "text-black/40 hover:text-black/60 hover:bg-black/5"
            )}>
              <button 
                onClick={() => setUseGrounding(!useGrounding)}
                className="flex items-center gap-2 pl-4 pr-2 py-2 text-[10px] font-black uppercase tracking-widest"
              >
                <Globe className={cn("w-3.5 h-3.5", useGrounding && "animate-spin-slow")} />
                <span className="hidden sm:inline">Pesquisa</span>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setActiveTooltip(activeTooltip === 'pesquisa' ? null : 'pesquisa'); }}
                className="pr-3 pl-1 py-2 opacity-50 hover:opacity-100"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </div>
            <AnimatePresence>
              {activeTooltip === 'pesquisa' && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 p-2.5 bg-black text-white text-[10px] rounded-xl shadow-xl z-50 leading-relaxed text-center"
                >
                  <strong className="block text-emerald-400 mb-1">Pesquisa em Tempo Real</strong>
                  Conecta a IA à internet para buscar dados e referências atualizadas.
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="w-px h-6 bg-black/10 mx-1" />

        <div className="flex items-center gap-1.5">
          <div className="relative">
            <div className="flex items-center rounded-xl transition-all hover:bg-black/5 text-black/60">
              <button 
                onClick={() => setIsBrainOpen(true)}
                className="p-2.5 relative group"
              >
                <Brain className="w-5 h-5 group-hover:text-blue-600 transition-colors" />
                <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full border-2 border-white" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setActiveTooltip(activeTooltip === 'cerebro' ? null : 'cerebro'); }}
                className="pr-2.5 pl-1 py-2.5 opacity-50 hover:opacity-100"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </div>
            <AnimatePresence>
              {activeTooltip === 'cerebro' && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 p-2.5 bg-black text-white text-[10px] rounded-xl shadow-xl z-50 leading-relaxed text-center"
                >
                  <strong className="block text-blue-400 mb-1">Cérebro Sináptico</strong>
                  Gerencia a base de conhecimento e aprendizado contínuo do Enxame.
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="relative">
            <div className={cn(
              "flex items-center rounded-xl transition-all shadow-sm border",
              isTerminalOpen 
                ? "bg-black text-white border-black" 
                : "bg-white hover:bg-black/5 text-black/60 border-black/5"
            )}>
              <button 
                onClick={() => setIsTerminalOpen(!isTerminalOpen)}
                className="p-2.5"
              >
                <Terminal className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setActiveTooltip(activeTooltip === 'terminal' ? null : 'terminal'); }}
                className="pr-2.5 pl-1 py-2.5 opacity-50 hover:opacity-100"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </div>
            <AnimatePresence>
              {activeTooltip === 'terminal' && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 p-2.5 bg-black text-white text-[10px] rounded-xl shadow-xl z-50 leading-relaxed text-center"
                >
                  <strong className="block text-blue-400 mb-1">Terminal de Execução</strong>
                  Acompanhe o raciocínio e as ações dos agentes em tempo real.
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="relative">
            <div className={cn(
              "flex items-center rounded-xl transition-all shadow-sm border",
              isWorkspaceOpen 
                ? "bg-black text-white border-black" 
                : "bg-white hover:bg-black/5 text-black/60 border-black/5"
            )}>
              <button 
                onClick={() => setIsWorkspaceOpen(!isWorkspaceOpen)}
                className="p-2.5"
              >
                <LayoutDashboard className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setActiveTooltip(activeTooltip === 'workspace' ? null : 'workspace'); }}
                className="pr-2.5 pl-1 py-2.5 opacity-50 hover:opacity-100"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </div>
            <AnimatePresence>
              {activeTooltip === 'workspace' && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 p-2.5 bg-black text-white text-[10px] rounded-xl shadow-xl z-50 leading-relaxed text-center"
                >
                  <strong className="block text-gray-400 mb-1">Workspace</strong>
                  Abre o espaço de trabalho com os artefatos gerados.
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
